import _ from 'lodash';
import React from 'react';

import { BaseComponent } from '../base';

import style from './style.css';

export default class Interactive extends BaseComponent {
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
