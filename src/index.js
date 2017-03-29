/* eslint global-require:off */

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import yaml from 'js-yaml';
import $RefParser from 'json-schema-ref-parser';

import { BaseComponent } from './components/base';

import Page from './components/page';
import Service from './components/service';

import style from './style.css';


if (window.serverRender) {
  ReactDOM.render = window.serverRender;
}

if (!window.fetch) {
  console.warn('No Fetch API. Polyfilling.');
  require('whatwg-fetch');
}


class ApiDocs extends BaseComponent {
  matchPage({ match, location }) {
    if (!this.props.tree) {
      return null;
    }

    const [service, version, entity] = match.params.url.split('/');
    const { hash } = location;

    const props = {
      service,
      version,
      entity,
      hash,
      model: this.props.tree[service][version][entity || ''],
    };

    return <Page {...props} />;
  }

  renderService({ model, service }) {
    const props = {
      key: service,
      service,
      model,
    };

    return <Service {...props} />;
  }

  render() {
    const { tree } = this.props;

    return (
      <div className={style.root}>
        <div className={style.toc}>
          {
            _.map(tree, (model, service) => this.renderService({ model, service }))
          }
        </div>
        <div className={style.content}>
          <Route exact path="/" render={() => <div>Welcome</div>} />
          <Route path="/:url+" render={ctx => this.matchPage(ctx)} />
        </div>
      </div>
    );
  }
}

Promise.resolve()
  .then(() => fetch('/openapi.yaml'))
  .then(resp => resp.text())
  .then(yamlString => yaml.safeLoad(yamlString))
  .then(spec => $RefParser.dereference(spec))
  .then(fullSpec => Object.keys(fullSpec.paths)
    .reduce((acc, url) => {
      const [, service, version, entity, ...rest] = url.split('/');

      return _.set(acc, [service, version, entity, rest.join('/')], fullSpec.paths[url]);
    }, {})
  )
  .then((tree) => {
    ReactDOM.render(<Router><ApiDocs tree={tree} /></Router>, document.getElementById('app'));
  });
