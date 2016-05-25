/**
 * Created by huling on 5/25/2016.
 */

import React from 'react';
import { Title, Header, Sidebar, Menu } from 'grommet';

export default ({title, menu, contents}) => {
  return (
    <Sidebar primary={true} pad={{horizontal: 'medium'}} fixed={false} separator="right">
      <Header justify="between">
        <Title>{title}</Title>
        {menu &&
        <Menu direction="row" align="center" responsive={false}>
          {menu}
        </Menu>
        }
      </Header>
      {contents}
    </Sidebar>
  );
};

