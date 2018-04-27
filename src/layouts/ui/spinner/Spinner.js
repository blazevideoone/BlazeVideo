// buy video dialog file
import React, { PureComponent } from 'react';
import './spinner.css';
export default class Spinner extends PureComponent {
  render() {
    return (
      <div className="spinner">
        <div className="rect1"></div>
        <div className="rect2"></div>
        <div className="rect3"></div>
        <div className="rect4"></div>
        <div className="rect5"></div>
        Loading...
      </div>
    );
  }
}
