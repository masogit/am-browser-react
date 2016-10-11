/**
 * Created by huling on 9/5/2016.
 */
import React, {Component} from 'react';
import {Box, Tiles, Tile, Title, Header} from 'grommet';
import RecordList from '../explorer/RecordList';
import PCData from './MyPCMockData.json';
import OrganizationData from './MyOrganizationPCMockData.json';
import RequestData from './MyRequestMockData.json';
import SoftwareData from './MySoftwareMockData.json';
import * as ExplorerActions from '../../actions/explorer';
import * as AQLActions from '../../actions/aql';
import Graph from '../commons/Graph';

const config = {
  series_col: "1",
  label: "0",
  size: 'small',
  legendTotal: false,
  full: true,
  units: "",
  total: true
};

const navs = [
  {key: 'PC'},
  {key: 'Software'},
  {key: 'Organization'},
  {key: 'Request'}
];

const getData = (type) => {
  switch(type) {
    case 'PC': return PCData;
    case 'Software': return SoftwareData;
    case 'Organization': return OrganizationData;
    case 'Request': return RequestData;
  }
};

export default class MyAsset extends Component {
  componentWillMount() {
    this.state = {
      type: 'Summary'
    };

    navs.map((nav, index) => {
      const body = getData(nav.key);
      body.groupby = body.groupby.split('|')[0];
      AQLActions.queryAQL(ExplorerActions.getGroupByAql(body)).then((data)=> {
        this.state[nav.key + 'Data'] = (!data || data.rows.length == 0) ? 'No data' : data;
        this.setState(this.state);
      });
    });
  }

  setType(type) {
    this.setState({
      type
    });
  }

  render() {
    const recordBody = getData(this.state.type);

    const summary = navs.map((obj, index) => {
      const dataName = obj.key + 'Data';
      const data = this.state[dataName];

      return (
        <Tile colorIndex='light-2' key={index}>
          <Header size='small' justify='center'>{obj.key}</Header>
          {(data && typeof data == 'string') ? data :
          <Graph type='legend' data={this.state[dataName]} config={config} onClick={() => this.setState({type: obj.key})}/>}
        </Tile>
      );
    });

    return (
      <Box flex={true} direction='row'>
        <Box align="center" flex={false} colorIndex='light-2' style={{width: '125px'}}>
          <Header pad={{"horizontal": "small"}}>
            <Title>My Assets</Title>
          </Header>
          <Box tag='h3' onClick={this.setType.bind(this, 'Summary')} className={this.state.type == 'Summary' ? 'active' : ''}>Summary</Box>{
            navs.map((nav, index) => {
              return <Box tag='h3' onClick={this.setType.bind(this, nav.key)} className={this.state.type == nav.key ? 'active' : ''} key={index}>{nav.label || nav.key}</Box>;
            })
          }
        </Box>
        <Box full='horizontal' pad={{horizontal: 'small'}} justify='center'>
          {
            recordBody ? <RecordList body={recordBody} noCache={true} showTopology={true}/>
              : <Tiles flush={false} className='justify-around' colorIndex='light-1'>{summary}</Tiles>
          }
        </Box>
      </Box>
    );
  }
}
