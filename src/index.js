/* eslint-env browser */

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import yaml from 'js-yaml';

import Controller from './components/controller';
import { BaseComponent } from './components/base';
import { makeEntityLink } from './components/utils';

import style from './style.css';

class Interactive extends BaseComponent {
  uid = _.uniqueId('radio');

  handleKeyDown(e) {
    if (e.keyCode !== 13 && e.keyCode !== 32) {
      return;
    }
    // If `enter` or `space` are pressed
    e.preventDefault();

    this.props.onChange(e);
    // We intentionally don't return the promise.
  }

  render() {
    const { type, className, checked, onChange } = this.props;
    return (
      <label // eslint-disable-line jsx-a11y/no-static-element-interactions
        className={`${className} ${style.interactive}`}
        htmlFor={this.uid}
        tabIndex={0}
        onKeyDown={e => this.handleKeyDown(e)}
      >
        <input
          type={type}
          checked={checked}
          id={this.uid}
          onChange={onChange}
        />
        { this.props.children }
      </label>
    );
  }
}

class Service extends BaseComponent {
  state = {
    version: 'v1',
    hidden: false,
  }

  handleToggle() {
    const { hidden } = this.state;
    return this.setState({ hidden: !hidden });
  }

  handleVersionChange(e, version) {
    return this.setState({ version });
  }

  renderVersion({ version }) {
    const { service } = this.props;

    const isSelected = this.state.version === version;

    return (
      <Interactive
        type="radio"
        key={version}
        checked={isSelected}
        className={`${style.service.version} ${isSelected && style.service.version.selected}`}
        onChange={e => this.handleVersionChange(e, version)}
      >
        { version }
      </Interactive>
    );
  }

  renderChild({ model, entity }) {
    const { service } = this.props;
    const { version } = this.state;

    const props = {
      key: entity,
      service,
      version,
      entity,
      model,
    };

    return <Entity {...props} />;
  }

  render() {
    const { service, model } = this.props;
    const { version, hidden } = this.state;

    return (
      <div className={style.service}>
        <header className={style.service.header}>
          <Interactive
            type="checkbox"
            checked={hidden}
            className={style.service.header.toggle}
            onChange={e => this.handleToggle(e)}
          >
            { service }
          </Interactive>
          <div className={style.service.versions}>
            {
              _.map(model, (entites, version) => this.renderVersion({ version, entites }))
            }
          </div>
        </header>
        <div className={`${style.service.content} ${hidden && style.service.content.hidden}`}>
          {
            _.map(model[version], (model, entity) => this.renderChild({ model, entity }))
          }
        </div>
      </div>
    );
  }
}

class Entity extends BaseComponent {
  renderChild({ model, method, action }) {
    const { service, version, entity } = this.props;

    const props = {
      key: `${method} ${action}`,
      style: style.controller,
      service,
      version,
      entity,
      action,
      method,
      model,
    };

    return <Controller {...props} />;
  }

  render() {
    const { entity, model } = this.props;

    return (
      <div className={style.entity}>
        <header className={style.entity.header}>
          <Link to={makeEntityLink(this.props)}>
            { entity || '/' }
          </Link>
        </header>
        <div className={style.entity.content}>
          {
            _.map(model, (methods, action) =>
              _.map(methods, (model, method) =>
                this.renderChild({ model, method, action })
              )
            )
          }
        </div>
      </div>
    );
  }
}

class Chapter extends BaseComponent {
  renderChild({ model, method, action }) {
    const { service, version, entity } = this.props;

    const props = {
      key: `${method} ${action}`,
      service,
      version,
      entity,
      action,
      method,
      model,
    };

    return <Endpoint {...props} />;
  }

  render() {
    const { entity, version, model } = this.props;

    return (
      <div>
        <header className={style.chapter.header}>
          <span className={style.chapter.header.version}>{ version }</span>
          <span className={style.chapter.header.entity}>{ entity || '/' }</span>
        </header>
        {
          _.map(model, (methods, action) =>
            _.map(methods, (model, method) =>
              this.renderChild({ model, method, action })
            )
          )
        }
      </div>
    );
  }
}

class Endpoint extends BaseComponent {
  render() {
    const controllerProps = Object.assign({
      style: style.endpoint.controller,
    }, this.props);

    return (
      <div className={style.endpoint}>
        <div className={style.endpoint.header}>
          <Controller {...controllerProps} />
          <EndpointDescription {...this.props} />
        </div>
        <EndpointDefinition {...this.props} />
      </div>
    );
  }
}

class EndpointDescription extends BaseComponent {
  render() {
    const { description } = this.props.model;

    return (
      <div className={style.endpoint.description} >
        { description }
      </div>
    );
  }
}

class EndpointDefinition extends BaseComponent {
  render() {
    return (
      <div className={style.endpoint.definition}>
        definition
      </div>
    );
  }
}

class ApiDocs extends BaseComponent {
  constructor(props) {
    super(props);

    this.state = {
      tree: null,
    };

    this.parseSpec();
  }

  async parseSpec() {
    const resp = await fetch('/openapi.yaml');
    const yamlString = await resp.text();
    const spec = yaml.safeLoad(yamlString);

    const tree = Object.entries(spec.paths)
      .reduce((acc, [url, endpoint]) => {
        const [, service, version, entity, ...rest] = url.split('/');

        return _.set(acc, [service, version, entity, rest.join('/')], endpoint);
      }, {})
      ;

    await this.setState({ tree });
  }

  matchChapter({ match }) {
    if (!this.state.tree) {
      return null;
    }

    const [service, version, entity] = match.params.url.split('/');

    const props = {
      service,
      version,
      entity,
      model: this.state.tree[service][version][entity || '']
    };

    return <Chapter {...props} />;
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
    const { tree } = this.state;

    return (
      <div className={style.root}>
        <div className={style.toc}>
          {
            _.map(tree, (model, service) => this.renderService({ model, service }))
          }
        </div>
        <div className={style.content}>
          <Route exact path="/" render={() => <div>Welcome</div>} />
          <Route path="/:url+" render={ctx => this.matchChapter(ctx)} />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Router><ApiDocs /></Router>, document.getElementById('app'));
