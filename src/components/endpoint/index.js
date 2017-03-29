import _ from 'lodash';
import React from 'react';
import CommonMark from 'commonmark';
import CommonMarkReactRenderer from 'commonmark-react-renderer';

import { BaseComponent } from '../base';
import { compileSchema } from '../utils';

import Controller from '../controller';

import style from './style.css';


const commonmarkParser = new CommonMark.Parser();
const commonmarkRenderer = new CommonMarkReactRenderer();


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

    const ast = commonmarkParser.parse(description);
    const elements = commonmarkRenderer.render(ast);

    return (
      <div className={style.endpoint.description} >
        { elements }
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
  renderChild({ properties = [], required = [] }, prefix = []) {
    return _.flatMap(properties, (model, name) => {
      const extendedModel = _.assign({}, model, { name, required: !!~required.indexOf(name) });
      const key = prefix.concat(name);

      if (model.type === 'object') {
        return [<Parameter key={key.join('.')} level={key.length} model={extendedModel} />]
          .concat(this.renderChild(model, key));
      }

      return <Parameter key={key.join('.')} level={key.length} model={extendedModel} />;
    });
  }

  render() {
    const { model: { parameters = [] } } = this.props;

    const body = parameters.find(parameter => parameter.in === 'body');

    if (!body) {
      return false;
    }

    const model = compileSchema(body.schema);
    const { properties = [], required = [] } = model;

    const elements = this.renderChild({ properties, required });

    return (
      <div className={style.endpoint.parameter_selection}>
        <header className={style.endpoint.parameter_selection.header}>
          Request body
        </header>
        <RequestBodyDescription model={body} />
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

class RequestBodyDescription extends BaseComponent {
  render() {
    const { description } = this.props.model;

    const ast = commonmarkParser.parse(description);
    const elements = commonmarkRenderer.render(ast);

    return (
      <div className={style.endpoint.parameter_selection.description} >
        { elements }
      </div>
    );
  }
}
