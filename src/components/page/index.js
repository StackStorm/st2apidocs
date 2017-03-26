import _ from 'lodash';
import React from 'react';

import { BaseComponent } from '../base';
import { makeAnchor } from '../utils';

import Endpoint from '../endpoint';

import style from './style.css';


export default class Page extends BaseComponent {
  hashes = []

  renderChild({ model, method, action }) {
    const { service, version, entity } = this.props;

    const props = {
      key: `${method} ${action}`,
      ref: (c) => { this.hashes[`#${makeAnchor({ model })}`] = c; },
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
        <header
          className={style.page.header}
          ref={(c) => { this.hashes[''] = c; }}
        >
          <span className={style.page.header.version}>{ version }</span>
          <span className={style.page.header.entity}>{ entity || '/' }</span>
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

  componentDidMount() {
    const { hash } = this.props;

    this.hashes[hash].scrollIntoView();
  }

  componentDidUpdate(prevProps) {
    const { hash } = this.props;

    if (hash === prevProps.hash) { return; }

    this.hashes[hash].scrollIntoView();
  }
}
