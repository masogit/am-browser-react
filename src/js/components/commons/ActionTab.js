// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import React, {PropTypes, Component} from 'react';
import {Button} from 'grommet';

export default class ActionTab extends Component {
  componentWillMount() {
    this.state = {
      editing: false,
      title: this.props.title
    };
    this._onClickTab = this._onClickTab.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.title && nextProps.title != this.state.title) {
      this.setState({
        title: nextProps.title
      });
    }
  }

  _onClickTab(event) {
    if (!this.props.disabled) {
      if (event) {
        event.preventDefault();
      }
      this.props.onRequestForActive();
      this.props.onClick();
    }
  }

  _toggleEdit() {
    const {editing, title} = this.state;
    const {title: propTitle, onDoubleClick} = this.props;
    let canUpdate = true;
    if (editing && title != propTitle && onDoubleClick) {
      canUpdate = onDoubleClick(title);
    }

    this.setState({
      editing: !editing,
      title: canUpdate ? title : (this.lastTitle || propTitle)
    }, () => {
      this.lastTitle = title;
    });
  }

  _onChange(event) {
    if (event.keyCode === 13) {
      this._toggleEdit();
    } else {
      this.setState({
        title: event.target.value
      });
    }
  }

  render() {
    const { title, editing } = this.state;
    const {onEdit, active, className, leftIcon, rightIcon} = this.props;

    return (
      <li className={`grommetux-tab action-tab ${active ? 'grommetux-tab--active' : ''} ${className}`}>
        {leftIcon}
        <Button role='tab' onClick={this._onClickTab} plain
                onDoubleClick={onEdit ? this._toggleEdit.bind(this) : null}>
          <label className='grommetux-tab__label'>
            {editing
              ? <input autoFocus={true} ref='input' value={title} onBlur={this._toggleEdit.bind(this)}
                       style={{padding: 0}}
                       onChange={this._onChange.bind(this)} onKeyDown={this._onChange.bind(this)}/>
              : title}
          </label>
        </Button>
        {rightIcon}
      </li>
    );
  }
}

ActionTab.propTypes = {
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onEdit: PropTypes.bool,
  disabled: PropTypes.bool,
  leftIcon: PropTypes.element,
  rightIcon: PropTypes.element,
  className: PropTypes.string
};
