import React, {Component, PropTypes} from 'react';
import {
  ListItem
} from 'grommet';

export default class GroupListItem extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  render() {
    return (
      <ListItem {...this.props} pad={{vertical: 'small'}} separator='none'>
        {this.props.children}
      </ListItem>
    );
  }
}

GroupListItem.propTypes = {
  groupby: PropTypes.string.isRequired,
  search: PropTypes.string
};
