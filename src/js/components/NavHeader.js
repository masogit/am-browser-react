// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import React, {Component} from 'react';
import {Link} from 'react-router';
import * as ExplorerActions from '../actions/explorer';
import Header from 'grommet/components/Header';
import Box from 'grommet/components/Box';
import Title from 'grommet/components/Title';
import Layer from 'grommet/components/Layer';
import SearchInput from 'grommet/components/SearchInput';
import Logo from './Logo'; // './HPELogo';
//import UserSettingsIcon from 'grommet/components/icons/base/UserSettings';
import Anchor from 'grommet/components/Anchor';
import Menu from 'grommet/components/Menu';
import SessionMenu from './SessionMenu';
import GroupList from './commons/GroupList';
import GroupListItem from './commons/GroupListItem';

class NavHeader extends Component {

  constructor() {
    super();
    this.state = {
      views: null
    };
  }

  componentDidMount() {
  }

  _onClose() {
    this.setState({
      layer: null,
      filteredViews: null
    });
  }

  _onClick() {
    ExplorerActions.loadViews((views) => {
      this.setState({
        views: views,
        layer: true
      });
    });
  }

  _onSearch(keyword) {
    var keyword = keyword.toLowerCase().trim();
    if (keyword) {
      var filteredViews = this.state.views.filter((view) => {
        return view.name.toLowerCase().indexOf(keyword) > -1 || view.category.toLowerCase().indexOf(keyword) > -1;
      });
      this.setState({
        filteredViews: filteredViews
      });
    } else
      this.setState({
        filteredViews: null
      });
  }

  render() {
    var listViews = this.state.filteredViews || this.state.views;
    return (

      <Header fixed={true} size="small">
        {
          this.state.layer &&
          <Layer onClose={this._onClose.bind(this)} closer={true} align="left">
            <Box full="vertical" justify="center">
              <SearchInput placeHolder="Search views..." onChange={this._onSearch.bind(this)}/>
              <GroupList pad={{vertical: 'small'}}>
                {
                  listViews.map((view) => {
                    return (
                      <GroupListItem key={view._id} groupby={view.category} pad={{horizontal: 'medium', vertical: 'small'}}>
                        <Anchor href={`/explorer/${view._id}`}>{view.name}</Anchor>
                      </GroupListItem>
                    );
                  })
                }
              </GroupList>
            </Box>
          </Layer>
        }
        <Box full="horizontal" direction="row" justify="between" colorIndex="neutral-1" pad={{vertical: 'small'}}>
          <Title onClick={this._onClick.bind(this)}><Logo /> AM Browser</Title>
          <Menu direction="row" align="center" responsive={false}>
            <Link key="0" to="/home" activeClassName="active link-disabled">
              Search
            </Link>
            <Link key="4" to="/wall" activeClassName="active link-disabled">
              Insight
            </Link>
            <Link key="1" to="/views" activeClassName="active link-disabled">
              Views
            </Link>
            <Link key="2" to="/aql" activeClassName="active link-disabled">
              AQL
            </Link>
            <Link key="3" to="/ucmdbAdapter" activeClassName="active link-disabled">
              Adapter
            </Link>
            <SessionMenu />
          </Menu>
        </Box>
      </Header>
    );
  }
}

export default NavHeader;
