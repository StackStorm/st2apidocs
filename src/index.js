/* eslint global-require:off */

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';
import { StickyContainer, Sticky } from '@stackstorm/react-sticky';
import yaml from 'js-yaml';
import $RefParser from 'json-schema-ref-parser';

import { BaseComponent } from './components/base';

import Logo from './components/logo';
import Page from './components/page';
import Service from './components/service';
import Welcome from './components/welcome';

import style from './style.css';


if (window.serverRender) {
  ReactDOM.render = window.serverRender;
}

if (!window.fetch) {
  console.warn('No Fetch API. Polyfilling.');
  require('whatwg-fetch');
}


class ApiDocs extends BaseComponent {
  state = {}

  handleSearchChange(e) {
    const filter = e.target.value;
    return this.setState({ filter });
  }

  matchPage({ match, location }) {
    if (!this.props.model) {
      return false;
    }

    const { services } = this.props.model;

    const [service, version = '', entity = ''] = (match.params.url || '').split('/');
    const { hash } = location;

    if (service === '' || service === 'index.html') {
      return <Welcome model={this.props.model} />;
    }

    const props = {
      service,
      version,
      entity,
      hash,
      model: services[service][version][entity || ''],
    };

    return <Page {...props} />;
  }

  renderService({ model, service }) {
    const { filter } = this.state;

    const props = {
      key: service,
      service,
      model,
      filter,
    };

    return <Service {...props} />;
  }

  render() {
    const { services } = this.props.model;

    return (
      <div className={style.root}>
        <StickyContainer className={style.toc}>
          <Link to="/" className={style.toc.logo} >
            <Logo />
          </Link>
          <Sticky className={style.toc.search} useContainerEvents >
            <input type="search" placeholder="Search" onChange={e => this.handleSearchChange(e)} />
          </Sticky>
          {
            _.map(services, (model, service) => this.renderService({ model, service }))
          }
        </StickyContainer>
        <div className={style.content}>
          <Route path="/:url*" render={ctx => this.matchPage(ctx)} />
        </div>
      </div>
    );
  }
}

Promise.resolve()
  .then(() => fetch('openapi.yaml'))
  .then(resp => resp.text())
  .then(yamlString => yaml.safeLoad(yamlString))
  .then(spec => $RefParser.dereference(spec))
  .then(fullSpec => Object.keys(fullSpec.paths)
    .reduce((acc, url) => {
      const [, service, version, entity, ...rest] = url.split('/');

      _.set(acc.services, [service, version, entity, rest.join('/')], fullSpec.paths[url]);

      return acc;
    }, {
      info: fullSpec.info,
      services: {}
    })
  )
  .then((model) => {
    const routerProps = {};
    const baseElement = document.querySelector('base');

    if (baseElement && baseElement.href) {
      routerProps.basename = baseElement.attributes.href.value;
    }

    ReactDOM.render(<Router {...routerProps}><ApiDocs model={model} /></Router>, document.getElementById('app'));
  });
