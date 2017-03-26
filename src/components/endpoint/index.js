import React from 'react';

import { BaseComponent } from '../base';

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
        definition
      </div>
    );
  }
}
