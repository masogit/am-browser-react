// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import Tab from '../../../../node_modules/grommet/components/Tab';
import React, {PropTypes} from 'react';
import Edit from 'grommet/components/icons/base/Edit';
import Close from 'grommet/components/icons/base/Close';
import { Box, Anchor } from 'grommet';

export default class ActionTab extends Tab {
  constructor() {
    super();
    this.state = {
      editing: false,
      title: ''
    };
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
    if (this.state.editing && this.state.title && this.state.title != this.props.title) {
      canUpdate = this.props.onEdit(this.state.title);
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
      const title = this.state.title || this.props.title;
      return (
        <Box className={this.props.active ? 'tab--active' : ''} pad={{horizontal: 'small'}}>
          <Box direction='row' className='tab__label' style={{display: 'flex'}}>
            {this.state.editing ?
              <input autoFocus={true} ref='input' value={title} onBlur={this._toggleEdit.bind(this)}
                     onChange={this._onChange.bind(this)} onKeyDown={this._onChange.bind(this)}/> :
              <label onClick={this._onClickTab}>{title}</label>}
            <Box direction='row' style={{paddingLeft: '12px', display: 'inline-flex'}}>
              {!this.state.editing && <Anchor icon={<Edit/>} className='small' onClick={this._toggleEdit.bind(this)}/>}
              {!this.state.editing && <Anchor icon={<Close/>} className='small' onClick={this.props.onRemove}/>}
            </Box>
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
