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
    var props = Object.assign({pad: {horizontal: 'medium'}, separator: "none"}, this.props);

    return (
      <ListItem {...props}>
        {this.props.children}
      </ListItem>
    );
  }
}

GroupListItem.propTypes = {
  groupby: PropTypes.string.isRequired
};
