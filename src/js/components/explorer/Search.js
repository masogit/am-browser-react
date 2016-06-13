import React, {Component} from 'react';
import history from '../../RouteHistory';
import * as ExplorerActions from '../../actions/explorer';
import * as AQLActions from '../../actions/aql';
import * as UCMDBAdapterActions from '../../actions/ucmdbAdapter';
import {Title, Box, Tiles, Headline, Meter, Tile} from 'grommet';
import Graph from '../commons/Graph';

export default class Search extends Component {

  constructor() {
    super();
    this.state = {
      viewNavigation: null,
      ucmdbAdapter: {
        ready: false,
        popJobs: [],
        pushJobs: []
      }
    };
    this._isUnmount = false;
  }

  componentDidMount() {
    this._isUnmount = false;
    ExplorerActions.loadViews((views)=> {
      if (!this._isUnmount) {
        this.setState({
          viewSeries: this._filterFirst7(this._getSeries(views, 'category'))
        });
      }
    });
    AQLActions.loadAQLs((aqls)=> {
      if (!this._isUnmount) {
        this.setState({
          aqlSeries: this._filterFirst7(this._getSeries(aqls, 'category'))
        });
      }
    });

    if (this._isUCMDBAdpaterSupported()) {
      UCMDBAdapterActions.getIntegrationPoint((points) => {
        if (points.length > 0) {
          let count = 1;
          points.map((point) => {
            if (point.populationSupported) {
              UCMDBAdapterActions.getIntegrationJob(point.name, 'populationJobs', (popJobs) => {
                if (point.pushSupported) {
                  UCMDBAdapterActions.getIntegrationJob(point.name, 'pushJobs', (pushJobs) => {
                    if (!this._isUnmount) {
                      this.setState({
                        ucmdbAdapter: {
                          ready: count++ === points.length,
                          pushJobs: this.state.ucmdbAdapter.pushJobs.concat(pushJobs),
                          popJobs: this.state.ucmdbAdapter.popJobs.concat(popJobs)
                        }
                      });
                    }
                  });
                } else {
                  if (!this._isUnmount) {
                    this.setState({
                      ucmdbAdapter: {
                        ready: count++ === points.length,
                        pushJobs: this.state.ucmdbAdapter.pushJobs,
                        popJobs: this.state.ucmdbAdapter.popJobs.concat(popJobs)
                      }
                    });
                  }
                }
              });
            } else if (point.pushSupported) {
              UCMDBAdapterActions.getIntegrationJob(point.name, 'pushJobs', (pushJobs) => {
                if (!this._isUnmount) {
                  this.setState({
                    ucmdbAdapter: {
                      ready: count++ === points.length,
                      pushJobs: this.state.ucmdbAdapter.pushJobs.concat(pushJobs),
                      popJobs: this.state.ucmdbAdapter.popJobs
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  }

  componentWillUnmount() {
    // should replace this by promise
    this._isUnmount = true;
  }

  _isUCMDBAdpaterSupported() {
    if (this.state.ucmdbAdapter.supported === undefined) {
      const route = this.props.routes[1].childRoutes.filter((item)=> item.path.indexOf('ucmdbAdapter') > -1);
      this.state.ucmdbAdapter.supported = route.length > 0;
    }
    return this.state.ucmdbAdapter.supported;
  }

  _filterFirst7(objs) {
    return objs.length > 7 ? objs.filter((item, index) => index < 7) : objs;
  }

  _onEnter(event) {
    if ((event.keyCode === 13))
      this._goRecordSearch(event.target.value.trim());
  }

  _onSearch(event) {
    if (event.target.value.toLowerCase().trim() === '')
      this.setState({
        keyword: ''
      });
  }

  _getSeries(children, groupby) {
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

  _getChartValues(children, groupby) {
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

  _fillData(rows, ...children) {
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

  _getUcmdbGraph() {
    let pushJobs, popJobs, rows;
    popJobs = this._getChartValues(this.state.ucmdbAdapter.popJobs, 'status');
    pushJobs = this._getChartValues(this.state.ucmdbAdapter.pushJobs, 'status');
    rows = [];
    this._fillData(rows, pushJobs, popJobs);

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

  _goExplorer() {
    history.push(`/explorer`);
  }

  _goAQL() {
    history.push(`/aql`);
  }

  _goUCMDB() {
    history.push(`/ucmdbAdapter`);
  }

  _goRecordSearch(keyword) {
    history.push(`/search/${keyword}`);
  }

  render() {
    const tiles = [{
      title: 'Browser Views',
      onClick: this._goExplorer,
      graph: this.state.viewSeries && <Meter legend={{"total": true}} series={this.state.viewSeries} vertical={true}/>
    }, {
      title: 'AQL Graphs',
      onClick: this._goAQL,
      graph: this.state.aqlSeries &&
      <Meter legend={{"placement": "inline"}} series={this.state.aqlSeries} a11yTitle="meter-title-12"/>
    }];

    if (this._isUCMDBAdpaterSupported()) {
      tiles.push({
        title: 'UCMDB Adapter Jobs Status',
        onClick: this._goUCMDB,
        graph: this.state.ucmdbAdapter.ready && (
          <Meter
            series={this._getSeries(this.state.ucmdbAdapter.popJobs.concat(this.state.ucmdbAdapter.pushJobs), 'status')}
            max={8} legend={{"placement": "inline"}}/>
        )
      });
    }

    return (
      <Box align="center" flex={true} justify="center">
        <Headline size="large" flex={false}>
          Asset Manager Browser
        </Headline>
        <Box direction="row" pad={{vertical: 'medium'}} flex={false}>
          <input type="search" inline={true} className="flex" placeholder="Global Record search..."
                 onKeyDown={this._onEnter.bind(this)} onChange={this._onSearch.bind(this)} size="120"
                 responsive={true}/>
        </Box>
        <Tiles flush={false} justify="center" size="large" flex={false}>
          {
            tiles.map(tile => (
              <Tile key={tile.title} className='box-shadow' onClick={tile.onClick}>
                <Box pad={{vertical: 'small'}}><Title>{tile.title}</Title></Box>
                {tile.graph}
              </Tile>
            ))
          }
        </Tiles>
      </Box>
    );
  }
}
