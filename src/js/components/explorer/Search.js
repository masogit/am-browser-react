import React, {Component} from 'react';
// import {Link} from 'react-router';
import history from '../../RouteHistory';
import * as ExplorerActions from '../../actions/explorer';
import * as AQLActions from '../../actions/aql';
// import Anchor from 'grommet/components/Anchor';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
// import Footer from 'grommet/components/Footer';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import Headline from 'grommet/components/Headline';
// import Header from 'grommet/components/Header';
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
    ExplorerActions.loadViews((views)=> {
      this.setState({
        viewSeries: this._getSeries(views, 'category')
      });
    });
    AQLActions.loadAQLs((aqls)=> {
      this.setState({
        aqlSeries: this._getSeries(aqls, 'category')
      });
    });
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
    var grouped = {};
    children.forEach((child) => {
      if (grouped[child[groupby]]) {
        grouped[child[groupby]].push(child);
      } else {
        grouped[child[groupby]] = [child];
      }
    });
    var series = Object.keys(grouped).map((key)=> {
      return {
        label: key,
        value: grouped[key].length
      };
    });

    return series;
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
    }, {
      title: 'UCMDB Adapter Jobs Status',
      onClick: this._goUCMDB,
      graph: (
        <Meter type="spiral" series={[
          {"label": "OK", "value": 70, "colorIndex": "ok"},
          {"label": "Warning", "value": 15, "colorIndex": "warning"},
          {"label": "Error", "value": 5, "colorIndex": "error"}
        ]} max={90} a11yTitle="meter-title-17"/>
      )
    }];

    return (
      <Box align="center" full={true} justify="center">
        <Headline size="large">
          Asset Manager Browser
        </Headline>
        <Box direction="row" pad={{vertical: 'medium'}}>
          <input type="search" inline={true} className="flex" placeholder="Global Record search..."
                 onKeyDown={this._onEnter.bind(this)} onChange={this._onSearch.bind(this)} size="163"
                 responsive={true}/>
        </Box>
        <Tiles flush={false} justify="center" size="large">
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
