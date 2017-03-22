import React from 'react';
import { Link } from 'react-router-dom';

import { BaseComponent } from '../base';
import { makeEntityLink, makeAnchor } from '../utils';

export default class Controller extends BaseComponent {
  render() {
    const { service, version, entity, action, method } = this.props;

    const path = [];

    if (entity) {
      path.push(entity);

      if (action) {
        path.push(action);
      }
    }

    return (
      <div className={this.props.style}>
        <Link to={`${makeEntityLink(this.props)}#${makeAnchor(this.props)}`}>
          <span className={`${this.props.style.method} ${this.props.style.method[method]}`}>
            { method }
          </span>
          <span className={this.props.style.path}>
            /{service}/{version}/{path.join('/')}
          </span>
        </Link>
      </div>
    );
  }
}
