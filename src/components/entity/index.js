import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';

import { BaseComponent } from '../base';
import { makeEntityLink } from '../utils';

import Controller from '../controller';

import style from './style.css';

export default class Entity extends BaseComponent {
  renderChild({ model, method, action }) {
    const { service, version, entity } = this.props;

    const props = {
      key: `${method} ${action}`,
      style: style.entity.controller,
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
              _.map(methods, (m, method) =>
                this.renderChild({ model: m, method, action })
              )
            )
          }
        </div>
      </div>
    );
  }
}
