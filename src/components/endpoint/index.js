import _ from 'lodash';
import React from 'react';

import { BaseComponent } from '../base';
import { compileSchema, traverseSchema } from '../utils';

import Commonmark from '../commonmark';
import Controller from '../controller';
import Interactive from '../interactive';

import style from './style.css';


export default class Endpoint extends BaseComponent {
  scrollIntoView(...args) {
    this.element.scrollIntoView(...args);
  }

  render() {
    const controllerProps = Object.assign({
      style: style.endpoint.controller,
    }, this.props);

    const { description } = this.props.model;

    return (
      <div ref={(c) => { this.element = c; }} className={style.endpoint}>
        <div className={style.endpoint.header}>
          <Controller {...controllerProps} />
          <Commonmark className={style.endpoint.description} >
            { description }
          </Commonmark>
        </div>
        <EndpointDefinition {...this.props} />
      </div>
    );
  }
}

class EndpointDefinition extends BaseComponent {
  render() {
    return (
      <div className={style.endpoint.definition}>
        <ParameterSelection type="path" {...this.props} />
        <ParameterSelection type="query" {...this.props} />
        <ParameterSelection type="header" {...this.props} />
        <RequestBody {...this.props} />
        <Responses {...this.props} />
      </div>
    );
  }
}

class ParameterSelection extends BaseComponent {
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
      <div className={style.endpoint.parameter_selection}>
        <header className={style.endpoint.parameter_selection.header}>
          { _.capitalize(type) } parameters
        </header>
        <div className={style.endpoint.parameter_selection.content}>
          { elements }
        </div>
      </div>
    );
  }
}

class Parameter extends BaseComponent {
  render() {
    const { model, level = 0 } = this.props;
    const { name, description, required } = model;

    return (
      <div className={`${style.endpoint.parameter} ${style.endpoint.parameter[`level${level}`]}`}>
        <div className={style.endpoint.parameter.name}>{ name }</div>
        <ParameterType model={model} />
        <div className={style.endpoint.parameter.description}>{ description }</div>
        <div className={style.endpoint.parameter.spacer} />
        { !required && <div className={style.endpoint.parameter.optional}>optional</div>}
      </div>
    );
  }
}

class ParameterType extends BaseComponent {
  render() {
    const { type, items } = this.props.model;

    return (
      <div className={`${style.endpoint.parameter.type} ${style.endpoint.parameter.type[type]}`}>
        { type }{ items && items.type && `[${items.type}]`}
      </div>
    );
  }
}

class RequestBody extends BaseComponent {
  renderChild(model, prefix) {
    const children = traverseSchema(model, prefix);

    return children.map(props => <Parameter {...props} />);
  }

  render() {
    const { model: { parameters = [] } } = this.props;

    const body = parameters.find(parameter => parameter.in === 'body');

    if (!body) {
      return false;
    }

    const { description } = body;

    const model = compileSchema(body.schema);
    const { properties = [], required = [] } = model;

    const elements = this.renderChild({ properties, required });

    return (
      <div className={style.endpoint.parameter_selection}>
        <header className={style.endpoint.parameter_selection.header}>
          Request body
        </header>
        <Commonmark className={style.endpoint.parameter_selection.description} >
          { description }
        </Commonmark>
        <div className={style.endpoint.parameter_selection.content}>
          <div className={style.endpoint.parameter_selection.type}>
            <ParameterType model={model} />
          </div>
          { elements }
        </div>
      </div>
    );
  }
}

class Responses extends BaseComponent {
  defaultSchema = {
    type: 'null'
  }

  state = {}

  handleStatusChange(e, currentStatus) {
    return this.setState({ currentStatus });
  }

  renderStatus({ status }) {
    const { model } = this.props;
    const { currentStatus } = this.state;

    const isSelected = (currentStatus || Object.keys(model.responses)[0]) === status;

    return (
      <Interactive
        type="radio"
        key={status}
        checked={isSelected}
        className={`${style.endpoint.responses.status} ${isSelected && style.endpoint.responses.status.selected}`}
        onChange={e => this.handleStatusChange(e, status)}
      >
        { status }
      </Interactive>
    );
  }

  renderChild(model, prefix) {
    const children = traverseSchema(model, prefix);

    return children.map(props => <Parameter {...props} />);
  }

  render() {
    const { model } = this.props;
    const { currentStatus = Object.keys(model.responses)[0] } = this.state;

    const { schema = this.defaultSchema, description } = model.responses[currentStatus];

    return (
      <div className={style.endpoint.parameter_selection}>
        <header className={style.endpoint.parameter_selection.header}>
          Responses
        </header>
        <div className={style.endpoint.responses.statuses}>
          {
            Object.keys(model.responses).map(status => this.renderStatus({ status }))
          }
        </div>
        <Commonmark className={style.endpoint.parameter_selection.description} >
          { description }
        </Commonmark>
        <div className={style.endpoint.parameter_selection.content}>
          <div className={style.endpoint.parameter_selection.type}>
            <ParameterType model={schema} />
          </div>
          {
            _.map(model.responses[currentStatus], m => this.renderChild(m))
          }
        </div>
      </div>
    );
  }
}
