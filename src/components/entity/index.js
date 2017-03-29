import React from 'react';
import { Link } from 'react-router-dom';

import { BaseComponent } from '../base';
import { makeEntityLink } from '../utils';

import Controller from '../controller';

import style from './style.css';

export default class Entity extends BaseComponent {
  renderChild({ model, method, action }) {
    const { service, version, entity, filter } = this.props;

    const props = {
      key: `${method} /${service}/${version}/${entity && `${entity}/`}${action}`,
      style: style.entity.controller,
      service,
      version,
      entity,
      action,
      method,
      model,
    };

    if (filter && !~props.key.indexOf(filter)) {
      return false;
    }

    return <Controller {...props} />;
  }

  render() {
    const { entity, model } = this.props;

    const elements = Object.keys(model).map(action =>
      Object.keys(model[action]).map(method =>
        this.renderChild({ model: model[action][method], method, action })
      ).filter(Boolean)
    ).filter(e => e.length);

    if (!elements.length) {
      return false;
    }

    return (
      <div className={style.entity}>
        <header className={style.entity.header}>
          <Link to={makeEntityLink(this.props)}>
            { entity || '/' }
          </Link>
        </header>
        <div className={style.entity.content}>
          { elements }
        </div>
      </div>
    );
  }
}
