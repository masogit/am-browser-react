// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, { Component } from 'react';
import Split from 'grommet/components/Split';
import { connect } from 'react-redux';
import { getIntegrationPoint, adapterSideBarClick } from '../../actions';
var Status = require('grommet/components/icons/Status');
var Sidebar = require('grommet/components/Sidebar');
var Menu = require('grommet/components/Menu');
import { Link } from 'react-router';
import Header from 'grommet/components/Header';
import Title from 'grommet/components/Title';
import history from '../../RouteHistory';
import {statusAdapter} from '../../constants/StatusAdapter.js';

let firstStart = true;

const MenuItem = ({
    linkTo,
    onClick,
    status,
    name
  }) => (
  <Link to={linkTo} activeClassName="active" onClick={onClick}>
    <Status value={status}/>
    <span>{name}</span>
  </Link>
);

const menuState = (state, ownProps) => {
  return {
    status: statusAdapter[ownProps.data.status],
    linkTo: `/ucmdbAdapter/${state.ucmdbAdapter.tabName}/${ownProps.data.name}`,
    name: ownProps.data.name
  }
};

const menuAction = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(adapterSideBarClick(ownProps.data.name));
    }
  }
};

const MenuItemsComponent = connect(menuState, menuAction)(MenuItem);

const UCMDBMenu = ({
  adapters
}) => {
  return (
    <Menu primary={true}> {
      adapters.map(adapter => (
        <MenuItemsComponent key={adapter.name} data={adapter}/>
      ))
    }
    </Menu>
  );
};

const UCMDBAdapterContainer = ({
    dataError,
    adapters,
    children
  }) => (
  <Split flex="right" separator={true} priority="left" fixed={false}>
    {!dataError &&
    <Sidebar colorIndex="light-2" className="adapterSideBar">
      <Header pad="medium" justify="between">
        <Title>Integration Point</Title>
      </Header>
      <UCMDBMenu adapters={adapters}/>
    </Sidebar>
    }
    {dataError && dataError}
    {children}
  </Split>
);

class ucmdbAdapter extends Component {
  constructor () {
    super();
  }

  componentDidMount() {
    const {dispatch} = this.props;
    dispatch(getIntegrationPoint());
    this.integrationPointInterval = setInterval(() => {
      dispatch(getIntegrationPoint());
    },60*1000);
  }

  componentWillReceiveProps(nextProps) {
    if (firstStart && nextProps.data.length > 0) {
      this.props.dispatch(adapterSideBarClick(nextProps.data[0].name));
      history.pushState(null, `/ucmdbAdapter/populationJobs/${nextProps.data[0].name}`);
      firstStart = false;
    }
  }

  componentWillUnmount () {
    firstStart = true;
    clearInterval(this.integrationPointInterval);
  }

  render () {
    const {data, dataError, children} = this.props;
    return (
        <UCMDBAdapterContainer
          dataError={dataError}
          adapters={data}
          children={children}/>
    );
  }
}
let select = (state) => {
  return {
    data: state.ucmdbAdapter.data,
    dataError: state.ucmdbAdapter.dataError
  };
};

export default connect(select)(ucmdbAdapter);
