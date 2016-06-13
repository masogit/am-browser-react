/**
 * Created by huling on 5/25/2016.
 */

import React from 'react';
import { Title, Header, Sidebar, Menu, Box } from 'grommet';
import GroupList from './GroupList';
import GroupListItem from './GroupListItem';
import EmptyIcon from './EmptyIcon';

export default ({title, toolbar, contents, focus}) => {
  if (contents instanceof Array) {
    contents = (
      <GroupList pad={{vertical: 'small'}} selectable={true} searchable={true} focus={focus}>
        {
          contents.map((listItem, index) => (
            <GroupListItem key={listItem.key || index} {...listItem} responsive={false}>
              <EmptyIcon />
              <Box justify='between' direction="row" full='horizontal' pad='none' responsive={false}>
                {listItem.child}
                {listItem.icon}
              </Box>
            </GroupListItem>
          ))
        }
      </GroupList>
    );
  }

  return (
    <Sidebar primary={true} pad={{horizontal: 'medium'}} fixed={true} separator="right" full={false}>
      <Header justify="between">
        <Title>{title}</Title>
        {toolbar &&
        <Menu direction="row" align="center" responsive={false}>
          {toolbar}
        </Menu>
        }
      </Header>
      {contents}
    </Sidebar>
  );
};

