// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import Tab from '../../../../node_modules/grommet/components/Tab';
import {PropTypes} from 'react';
export default class ActionTab extends Tab {
  constructor() {
    super();
  }

  componentWillReceiveProps() {
    if (this.props.disabled) {
      //TODO: set disabled style
      this._onClickTab = () => {
      };
    } else {
      let clickHandler = this.props.onClick;
      if (typeof clickHandler === 'function') {
        let originalClick = Tab.prototype._onClickTab.bind(this);
        if (originalClick) {
          this._onClickTab = (event) => {
            originalClick(event);
            clickHandler();
          };
        }
      }
    }
  }
}

ActionTab.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};
