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

    return (
      <Box align="center" full={true} justify="center">
        <Headline size="large">
          Asset Manager Browser
        </Headline>
        <Box direction="row" pad={{vertical: 'medium'}}>
          <input type="search" inline={true} className="flex" placeholder="Global Record search..."
                 onKeyDown={this._onEnter.bind(this)} onChange={this._onSearch.bind(this)} size="100"/>
        </Box>
        <Tiles flush={false} colorIndex="light-2" justify="center" size="large">
          <Tile align="center" separator="top" colorIndex="light-1" onClick={this._goExplorer}>
            <Title>Browser Views</Title>
            {
              this.state.viewSeries &&
              <Meter legend={{"total": true}} series={this.state.viewSeries} vertical={true}
                     a11yTitleId="meter-title-13" a11yDescId="meter-desc-13"/>
            }
          </Tile>
          <Tile align="center" separator="top" colorIndex="light-1" onClick={this._goAQL}>
            <Title>AQL Graphs</Title>
            {
              this.state.aqlSeries &&
              <Meter legend={{"placement": "inline"}} series={this.state.aqlSeries} a11yTitleId="meter-title-12"
                     a11yDescId="meter-desc-12"/>
            }
          </Tile>
          <Tile align="center" separator="top" colorIndex="light-1" onClick={this._goUCMDB}>
            <Title>UCMDB Adapter Jobs Status</Title>
            <Meter type="spiral" series={[
                  {"label": "OK", "value": 70, "colorIndex": "ok"},
                  {"label": "Warning", "value": 15, "colorIndex": "warning"},
                  {"label": "Error", "value": 5, "colorIndex": "error"}
            ]} max={90} a11yTitleId="meter-title-17" a11yDescId="meter-desc-17"/>
          </Tile>
        </Tiles>
      </Box>
    );
  }
}
