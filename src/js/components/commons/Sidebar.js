/**
 * Created by huling on 5/25/2016.
 */

import React, {Component, PropTypes}  from 'react';
import {Title, Header, Sidebar, Menu, Box} from 'grommet';
import GroupList from './GroupList';
import GroupListItem from './GroupListItem';
import EmptyIcon from './EmptyIcon';

export default class SideBar extends Component {

  constructor() {
    super();
  }

  render() {

    return (
      <Sidebar primary={true} pad={{horizontal: 'medium'}} separator="right" {...this.props}>
        <Header justify="between">
          <Title>{this.props.title}</Title>
          <Menu direction="row" align="center" responsive={false}>
            {this.props.toolbar}
          </Menu>
        </Header>

        <GroupList pad={{vertical: 'small'}} selectable={true} searchable={true} focus={this.props.focus}>
          {
            this.props.contents.map((listItem, index) => (
              <GroupListItem key={listItem.key || index} {...listItem}>
                <EmptyIcon />
                <Box justify='between' direction="row" full='horizontal' pad='none'>
                  {listItem.child}
                  {listItem.icon}
                </Box>
              </GroupListItem>
            ))
          }
        </GroupList>

      </Sidebar>
    );
  }
}

SideBar.propTypes = {
  title: PropTypes.string,
  toolbar: PropTypes.object,
  contents: PropTypes.array,
  focus: PropTypes.object
};


