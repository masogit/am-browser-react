import React, {Component} from 'react';
// import {Link} from 'react-router';
import * as ExplorerActions from '../../actions/explorer';
import RecordSearch from './RecordSearch';
import RecordList from './RecordList';
import GroupList from './../commons/GroupList';
import GroupListItem from './../commons/GroupListItem';
// import Anchor from 'grommet/components/Anchor';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
// import Footer from 'grommet/components/Footer';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import Headline from 'grommet/components/Headline';
// import Header from 'grommet/components/Header';
import Sidebar from 'grommet/components/Sidebar';
import Meter from 'grommet/components/Meter';
// import SelectLeft from 'grommet/components/icons/base/SelectLeft';
// import Close from 'grommet/components/icons/base/Close';


export default class Search extends Component {

  constructor() {
    super();
    this.state = {
      viewNavigation: null
    };
  }

  componentDidMount() {
  }

  _getViewNavigation(views) {
    return (
      <Sidebar primary={true} pad="small" fixed={false} full={false} separator="right">
        <Box pad={{vertical: 'medium'}}><Title>Views Navigation ({views.length})</Title></Box>
        <GroupList pad={{vertical: 'small'}} searchable={true} selectable={true}>
          {
            views.map((view, key) => {
              return (
                <GroupListItem key={view._id} groupby={view.category} search={view.name} pad="small"
                               onClick={this._queryView.bind(this, view)}>
                  {view.name}
                </GroupListItem>
              );
            })
          }
        </GroupList>
      </Sidebar>);
  }

  _toggleViewNavigation() {
    if (this.state.viewNavigation)
      this.setState({
        viewNavigation: null
      });
    else
      ExplorerActions.loadViews((views)=> {
        this.setState({
          viewNavigation: this._getViewNavigation(views)
        });
      });
  }

  _onEnter(event) {
    if ((event.keyCode === 13))
      this.setState({
        keyword: event.target.value.trim()
      });
  }

  _onSearch(event) {
    if (event.target.value.toLowerCase().trim() === '')
      this.setState({
        keyword: ''
      });
  }

  _queryView(view) {
    var recordList = (
      <Box full={true} pad="small">
        <RecordList body={view.body} title={view.name}/>
      </Box>
    );
    this.setState({
      recordList: recordList
    });
  }

  render() {

    return (
      <Box direction="row" full={true}>
        {this.state.viewNavigation}
        {
          !this.state.recordList &&
          <Box align="center" full={true} justify="center">
            {
              !this.state.keyword &&
              <Headline size="large">
                Asset Manager Browser
              </Headline>
            }
            <Box direction="row" pad={{vertical: 'medium'}}>
              <input type="search" inline={true} className="flex" placeholder="Global Record search..."
                     onKeyDown={this._onEnter.bind(this)} onChange={this._onSearch.bind(this)} size="100"/>
            </Box>
            <Tiles flush={false} colorIndex="light-2" justify="center" size="large">
              <Tile align="center" separator="top" colorIndex="light-1" onClick={this._toggleViewNavigation.bind(this)}>
                <Title>Browser Views</Title>
                <Meter legend={{"total": true}} series={[
                  {"label": "Gen 7", "value": 50, "colorIndex": "graph-1"},
                  {"label": "Gen 8", "value": 200, "colorIndex": "graph-2"},
                  {"label": "Gen 9", "value": 100, "colorIndex": "graph-3"},
                  {"label": "Gen 10", "value": 300, "colorIndex": "graph-4"}
                ]} vertical={true} a11yTitleId="meter-title-13" a11yDescId="meter-desc-13"/>
              </Tile>
              <Tile align="center" separator="top" colorIndex="light-1">
                <Title>AQL Graphs</Title>
                <Meter legend={{"placement": "inline"}} series={[
                  {"label": "Gen 7", "value": 50, "colorIndex": "graph-1"},
                  {"label": "Gen 8", "value": 200, "colorIndex": "graph-2"},
                  {"label": "Gen 9", "value": 100, "colorIndex": "graph-3"},
                  {"label": "Gen 10", "value": 300, "colorIndex": "graph-4"}
                ]} a11yTitleId="meter-title-12" a11yDescId="meter-desc-12" />
              </Tile>
              <Tile align="center" separator="top" colorIndex="light-1">
                <Title>UCMDB Adapter Jobs Status</Title>
                <Meter type="spiral" series={[
                  {"label": "OK", "value": 70, "colorIndex": "ok"},
                  {"label": "Warning", "value": 15, "colorIndex": "warning"},
                  {"label": "Error", "value": 5, "colorIndex": "error"}
                ]} max={90} a11yTitleId="meter-title-17" a11yDescId="meter-desc-17"/>
              </Tile>
            </Tiles>
            <RecordSearch keyword={this.state.keyword}/>
          </Box>
        }
        {this.state.recordList}
      </Box>
    );
  }
}
