// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import React, {PropTypes} from 'react';
import {Box, Tab} from 'grommet';

export default class ActionTab extends Tab {
  constructor() {
    super();
    this.state = {
      editing: false,
      title: ''
    };
  }

  componentDidMount() {
    this.setState({
      title: this.props.title
    });
  }

  componentWillReceiveProps(nextProps) {
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

  _toggleEdit() {
    let canUpdate = true;
    if (this.state.editing && this.state.title != this.props.title) {
      if (this.props.onDoubleClick)
        canUpdate = this.props.onDoubleClick(this.state.title);
    }

    this.setState({
      editing: !this.state.editing,
      title: canUpdate ? this.state.title : (this.lastTitle || this.props.title)
    }, () => {
      this.lastTitle = this.state.title;
    });
  }

  _onChange(event) {
    if (event.keyCode === 13) {
      this._toggleEdit();
    } else {
      this.setState({
        title: event.target.value.trim()
      });
    }
  }

  render() {
    if (this.props.onEdit) {
      return (
        <Box className={this.props.active ? 'grommetux-tab--active' : ''} pad={{horizontal: 'small'}}>
          <Box direction='row' className='grommetux-tab__label' style={{display: 'flex'}}>
            {this.state.editing ?
              <input autoFocus={true} ref='input' value={this.state.title} onBlur={this._toggleEdit.bind(this)}
                     onChange={this._onChange.bind(this)} onKeyDown={this._onChange.bind(this)}/> :
              <label onClick={this._onClickTab} onDoubleClick={this._toggleEdit.bind(this)}>{this.state.title}</label>}
          </Box>
        </Box>
      );
    } else {
      return super.render();
    }
  }
}

ActionTab.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool
};
