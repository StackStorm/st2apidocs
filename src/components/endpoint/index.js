import _ from 'lodash';
import React from 'react';

import { BaseComponent } from '../base';
import { compileSchema } from '../utils';

import Controller from '../controller';

import style from './style.css';


export default class Endpoint extends BaseComponent {
  scrollIntoView(...args) {
    this.element.scrollIntoView(...args);
  }

  render() {
    const controllerProps = Object.assign({
      style: style.endpoint.controller,
    }, this.props);

    return (
      <div ref={(c) => { this.element = c; }} className={style.endpoint}>
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
        <ParameterType type="path" {...this.props} />
        <ParameterType type="query" {...this.props} />
        <ParameterType type="header" {...this.props} />
        <RequestBody {...this.props} />
      </div>
    );
  }
}

class ParameterType extends BaseComponent {
  render() {
    const { type, model: { parameters = [] } } = this.props;

    const elements = parameters
      .filter(parameter => parameter.in === type)
      .map(model => <Parameter key={model.name} model={model} />)
      ;

    if (!elements.length) {
      return false;
    }

    return (
      <div className={style.endpoint.parameter_type}>
        <header className={style.endpoint.parameter_type.header}>
          { _.capitalize(type) } parameters
        </header>
        <div className={style.endpoint.parameter_type.content}>
          { elements }
        </div>
      </div>
    );
  }
}

class Parameter extends BaseComponent {
  render() {
    const { name, type, description, required } = this.props.model;

    return (
      <div className={style.endpoint.parameter}>
        <div className={style.endpoint.parameter.name}>{ name }</div>
        <div className={`${style.endpoint.parameter.type} ${style.endpoint.parameter.type[type]}`}>
          { type }
        </div>
        <div className={style.endpoint.parameter.description}>{ description }</div>
        <div className={style.endpoint.parameter.spacer} />
        { !required && <div className={style.endpoint.parameter.optional}>optional</div>}
      </div>
    );
  }
}

class RequestBody extends BaseComponent {
  render() {
    const { model: { parameters = [] } } = this.props;

    const body = parameters.find(parameter => parameter.in === 'body');

    if (!body) {
      return false;
    }

    const { description } = body;
    const { type, properties = [], required = [] } = compileSchema(body.schema);

    const elements = _.map(properties, (model, name) => {
      const extendedModel = _.assign({}, model, { name, required: !!~required.indexOf(name) });
      return <Parameter key={name} model={extendedModel} />;
    });

    return (
      <div className={style.endpoint.parameter_type}>
        <header className={style.endpoint.parameter_type.header}>
          Request body
        </header>
        <div className={style.endpoint.parameter_type.description} >
          <p>{ description }</p>
        </div>
        <div className={style.endpoint.parameter_type.content}>
          { elements }
        </div>
      </div>
    );
  }
}
