import React from 'react';

import { BaseComponent } from '../base';

import Commonmark from '../commonmark';

import style from './style.css';


export default class Welcome extends BaseComponent {
  render() {
    const { info } = this.props.model;

    return (
      <div className={style.welcome}>
        <header className={style.welcome.header}>{ info.title }</header>
        <div>
          <Commonmark>
            { info.description }
          </Commonmark>
        </div>
      </div>
    );
  }
}
