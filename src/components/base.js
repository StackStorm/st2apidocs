/* eslint import/prefer-default-export:off */
import React from 'react';

export class BaseComponent extends React.Component {
  setState(nextState) {
    return new Promise((resolve) => {
      super.setState(nextState, resolve);
    });
  }
}
