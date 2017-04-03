import React from 'react';
import CommonMark from 'commonmark';
import CommonMarkReactRenderer from 'commonmark-react-renderer';

import { BaseComponent } from '../base';

import './style.css';

const commonmarkParser = new CommonMark.Parser();
const commonmarkRenderer = new CommonMarkReactRenderer();

export default class Commonmark extends BaseComponent {
  render() {
    const { className, children } = this.props;

    if (!children) {
      return false;
    }

    const ast = commonmarkParser.parse(children);
    const elements = commonmarkRenderer.render(ast);

    return (
      <div className={className} >
        { elements }
      </div>
    );
  }
}
