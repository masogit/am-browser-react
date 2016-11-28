import React, {Component, PropTypes} from 'react';
import {
  ListItem
} from 'grommet';

export default class GroupListItem extends Component {
  render() {
    const { onClick, children } = this.props;
    return (
      <ListItem onClick={onClick} pad='small' separator='none'>
        {children}
      </ListItem>
    );
  }
}

GroupListItem.propTypes = {
  onClick: PropTypes.func
};
