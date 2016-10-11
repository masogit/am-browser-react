import React, {Component} from 'react';
import history from '../../RouteHistory';
import * as ExplorerActions from '../../actions/explorer';
import * as AQLActions from '../../actions/aql';
import {getJobList} from '../../actions/ucmdbAdapter';
import {getOnlineUser} from '../../actions/system';
import {Header, Box, Tiles, Meter, Tile, List, ListItem} from 'grommet';
import Graph from '../commons/Graph';
import UCMDBAdapterContainer from '../ucmdbAdapter/UCMDBAdapterPoint';
import AQL from '../aql/AQL';
import Spinning from 'grommet/components/icons/Spinning';
import {LongSearchInput} from '../commons/SearchInput';

export default class Search extends Component {

  constructor() {
    super();
    this.state = {
      viewNavigation: null,
      ucmdbAdapter: {
        ready: false,
        popJobs: [],
        pushJobs: [],
        errorMsg: ''
      },
      onlineUsers: []
    };
    this._isUnmount = false;
  }

  componentDidMount() {
    this._isUnmount = false;
    ExplorerActions.loadViews().then(views=> {
      if (!this._isUnmount) {
        this.setState({
          viewSeries: this.filter(this.getSeries(views, 'category'), 5)
        });
      }
    });
    if (this.isAQLSupported()) {
      AQLActions.loadAQLs().then((aqls)=> {
        if (!this._isUnmount) {
          this.setState({
            aqlSeries: this.filter(this.getSeries(aqls, 'category'), 7)
          });
        }
      });
    }

    if (this.isUCMDBAdpaterSupported()) {
      getJobList()
        .then(({pushJobs, popJobs}) => {
          if (!this._isUnmount) {
            this.setState({
              ucmdbAdapter: {
                ready: true,
                pushJobs: pushJobs,
                popJobs: popJobs
              }
            });
          }
        })
        .catch((error) => {
          if (!this._isUnmount) {
            this.setState({
              ucmdbAdapter: {
                ready: true,
                errorMsg: error.message
              }
            });
          }
        });
    }
    getOnlineUser().then(onlineUsers => {
      this.setState({onlineUsers})
    });
  }

  componentWillUnmount() {
    // should replace this by promise
    this._isUnmount = true;
  }

  isAQLSupported() {
    if (this.aql_supported === undefined) {
      this.aql_supported = this.props.routes[1].childRoutes.filter((item)=> item.path.indexOf('aql') > -1 && item.component == AQL).length > 0;
    }
    return this.aql_supported;
  }

  isUCMDBAdpaterSupported() {
    if (this.state.ucmdbAdapter.supported === undefined) {
      const route = this.props.routes[1].childRoutes.filter((item)=> item.path.indexOf('ucmdbAdapter') > -1 && item.component == UCMDBAdapterContainer);
      this.state.ucmdbAdapter.supported = route.length > 0;
    }
    return this.state.ucmdbAdapter.supported;
  }

  filter(objs, num) {
    return objs.length > num ? objs.filter((item, index) => index < num) : objs;
  }

  getSeries(children, groupby) {
    const grouped = {};
    children.forEach((child) => {
      if (grouped[child[groupby]]) {
        grouped[child[groupby]].push(child);
      } else {
        grouped[child[groupby]] = [child];
      }
    });
    return Object.keys(grouped).map((key)=> ({
      label: key,
      value: grouped[key].length
    }));
  }

  getChartValues(children, groupby) {
    const grouped = {};
    children.forEach((child) => {
      if (grouped[child[groupby]]) {
        grouped[child[groupby]].push(child);
      } else {
        grouped[child[groupby]] = [child];
      }
    });

    return Object.keys(grouped).map((key, index)=> {
      return {key, value: grouped[key].length};
    });
  }

  fillData(rows, ...children) {
    children.map((child, index) => {
      child.map(data => {
        let exists = false;
        rows.map(row => {
          if (row[0] === data.key) {
            exists = true;
            row[index + 1] = data.value;
          }
        });
        if (exists === false) {
          const row = [data.key];
          row[index + 1] = data.value;
          rows.push(row);
        }
      });
    });

    rows.map((row) => {
      for (let i = 1; i <= children.length; i++) {
        if (!row[i]) {
          row[i] = 0;
        }
      }
    });
  }

  getUcmdbGraph() {
    let pushJobs, popJobs, rows;
    popJobs = this.getChartValues(this.state.ucmdbAdapter.popJobs, 'status');
    pushJobs = this.getChartValues(this.state.ucmdbAdapter.pushJobs, 'status');
    rows = [];
    this.fillData(rows, pushJobs, popJobs);

    const data = {
      header: [{Name: 'status'}, {Name: 'pushJobs'}, {Name: 'popJobs'}],
      rows: rows
    };
    const config = {
      xAxis: {placement: 'bottom'},
      xAxis_col: '0',
      series_col: ['1', '2'],
      series: [pushJobs, popJobs],
      legend: {position: 'after'}
    };
    return <Graph type="chart" data={data} config={config}/>;
  }

  goExplorer() {
    history.push(`/explorer`);
  }

  goAQL() {
    history.push(`/aql`);
  }

  goUCMDB() {
    history.push(`/ucmdbAdapter`);
  }

  goRecordSearch(keyword) {
    history.push(`/search/${encodeURI(keyword)}`);
  }

  renderOnlineUser() {
    return (
      <Box flex={true} className='autoScroll'>
        <List>
          <ListItem justify="between" pad='none'>
            <span>User Name</span>
            <Box pad={{horizontal: 'medium'}}/>
            <span className="secondary">Count</span>
          </ListItem>
          {
            this.state.onlineUsers.map((user, index) => {
              return (
                <ListItem key={index} justify="between" separator='none' pad='none'>
                  <span>
                    {user.name}
                  </span>
                  <Box pad={{horizontal: 'medium'}}/>
                  <span className="secondary">
                    {user.count}
                  </span>
                </ListItem>
              );
            })
          }
        </List>
      </Box>
    );
  }

  render() {
    const tiles = [{
      title: 'Browser Views',
      onClick: this.goExplorer,
      graph: this.state.viewSeries && <Meter legend={{"total": true}} series={this.state.viewSeries} vertical={true}/>
    }];

    if (this.isAQLSupported()) {
      tiles.push({
        title: 'AQL Graphs',
        onClick: this.goAQL,
        graph: this.state.aqlSeries &&
        <Meter legend={{"placement": "inline"}} series={this.state.aqlSeries} a11yTitle="meter-title-12"/>
      });

      tiles.push({
        title: 'Online Users',
        graph: this.renderOnlineUser()
      });
    }

    if (this.isUCMDBAdpaterSupported()) {
      tiles.push({
        title: 'UCMDB Adapter Jobs Status',
        onClick: this.goUCMDB,
        graph: this.state.ucmdbAdapter.ready ? (
        this.state.ucmdbAdapter.errorMsg || (
          <Meter
            series={this.getSeries(this.state.ucmdbAdapter.popJobs.concat(this.state.ucmdbAdapter.pushJobs), 'status')}
            max={8} legend={{"placement": "inline"}}/>
        )) : <Spinning />
      });
    }

    return (
      <Box align="center" justify="center" style={{flexShrink: 0, flexGrow: 1}}>
        <LongSearchInput onSearch={this.goRecordSearch.bind(this)} direction='column'/>
        <Tiles flush={false} justify="center" size="large" flex={false}>
          {
            tiles.map(tile => (
              <Tile key={tile.title} onClick={tile.onClick} colorIndex="light-2">
                <Header size='small' justify='center'>{tile.title}</Header>
                {tile.graph}
              </Tile>
            ))
          }
        </Tiles>
      </Box>
    );
  }
}
