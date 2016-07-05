/**
 * Created by huling on 5/25/2016.
 */

import React, {Component} from 'react';
import { Title, Header, Sidebar, Menu, Box, Footer } from 'grommet';
import GroupList from './GroupList';
import GroupListItem from './GroupListItem';
import EmptyIcon from './EmptyIcon';

export default class SideBar extends Component {

  render() {
    const {title, toolbar, contents, focus, footer} = this.props;
    // 1) Show group list
    // 2) Show table schema
    let sidebarContent;
    if (contents instanceof Array) {
      sidebarContent = (
        <GroupList selectable={true} searchable={true} focus={focus}>
          {
            contents.map((listItem, index) => (
              <GroupListItem key={listItem.key || index} {...listItem} responsive={false}>
                <EmptyIcon />
                <Box justify='between' direction="row" full='horizontal' responsive={false}>
                  {listItem.child}
                  {listItem.icon}
                </Box>
              </GroupListItem>
            ))
          }
        </GroupList>
      );
    } else {
      sidebarContent = contents;
    }

    return (
      <Sidebar fixed={true} separator="right" full={false} style={{minHeight: '100%'}} colorIndex="light-2">
        <Box style={{overflow: 'visible'}} className='fixMinSizing'>
          <Header justify="between" size="small" pad='small'>
            <Title>{title}</Title>
            {toolbar &&
            <Menu direction="row" align="center" responsive={false}>
              {toolbar}
            </Menu>
            }
          </Header>
          {sidebarContent}
          <Footer separator="top" justify="center">
            {footer ? footer : (new Date()).toLocaleString()}
          </Footer>
        </Box>
      </Sidebar>
    );
  }
}
