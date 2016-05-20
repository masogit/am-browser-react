/**
 * Created by huling on 5/3/2016.
 */

import Split from 'grommet/components/Split';
import React from 'react';
var Status = require('grommet/components/icons/Status');
var Sidebar = require('grommet/components/Sidebar');
var Menu = require('grommet/components/Menu');
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import { Link } from 'react-router';
import {statusAdapter} from '../../constants/StatusAdapter.js';


const MenuItem = ({
  name,
  status,
  onMenuClick,
  linkTo
  }) => {
  return (
    <Link to={linkTo} activeClassName="active" onClick={onMenuClick}>
      <Status value={status}/>
      <span>{name}</span>
    </Link>
  );
};

export const PointListContainer = ({
  dataError,
  data,
  tabName,
  onMenuClick
  }) => {
  if (dataError) {
    return (<div>{dataError}</div>);
  }
  return (
    <Menu primary={true}>
      {
        data.map(adapter => (
          <MenuItem key={adapter.name}
                    status={statusAdapter[adapter.status].status}
                    name={adapter.name}
                    linkTo={`/ucmdbAdapter/${adapter.name}/${tabName}`}
                    onMenuClick={() => onMenuClick(adapter.name, tabName)}/>
        ))
      }
    </Menu>
  );
};


export const UCMDBAdapterContainerTemplate = ({dataError, pointList, jobList, jobItemList}) => {
  if (dataError) {
    return (<div>{dataError}</div>);
  }

  return (
    <Split flex="right" separator={true} priority="left" fixed={false}>
      <Sidebar colorIndex="light-2" className="adapterSideBar">
        <Header pad="medium" justify="between">
          <Title>Integration Point</Title>
        </Header>
        {pointList}
      </Sidebar>
      {jobList}
      {jobItemList}
    </Split>
  );
};
