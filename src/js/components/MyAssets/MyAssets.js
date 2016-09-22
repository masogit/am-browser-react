/**
 * Created by huling on 9/5/2016.
 */
import React, {Component} from 'react';
import {Box, Tiles, Tile, Title, Header} from 'grommet';
import MyPC from './MyPC';
import MyPCData from './MyPCMockData.json';
import MyOrganizationPCData from './MyOrganizationPCMockData.json';
import MyRequest from './MyRequestMockData.json';
import MySoftware from './MySoftwareMockData.json';


export default class MyAsset extends Component {
  componentWillMount() {
    this.state = {
      type: 'PC'
    };
  }

  setType(type) {
    this.setState({
      type
    });
  }

  getSummary() {
    return (
      <Tiles flush={false} className='justify-around' colorIndex='light-2'>
        <Tile colorIndex='light-1'>
          <Header tag="h4" size="small" pad={{"horizontal": "small"}}>
            <strong>
              PC
            </strong>
          </Header>
          <Box pad="small">
            <p>
              Tile summary content. One or two lines. Tile summary content.	            One or two lines.
            </p>
          </Box>
        </Tile>
        <Tile colorIndex='light-1'>
          <Header tag="h4" size="small" pad={{"horizontal": "small"}}>
            <strong>
              Software
            </strong>
          </Header>
          <Box pad="small">
            <p>
              Tile summary content. One or two lines. Tile summary content.	            One or two lines.
            </p>
          </Box>
        </Tile>
      </Tiles>
    );
  }

  getPC() {
    return <MyPC body={MyPCData}/>;
  }

  getSoftware() {
    return <MyPC body={MySoftware}/>;
  }

  getOrganization() {
    return <MyPC body={MyOrganizationPCData}/>;
  }

  getRequest() {
    return <MyPC body={MyRequest}/>;
  }

  render() {
    const navs = [
      {key: 'Summary'},
      {key: 'PC'},
      {key: 'Software'},
      {key: 'Organization'},
      {key: 'Request'}
    ];

    return (
      <Box flex={true} direction='row'>
        <Box align="center" flex={false} separator='right' style={{width: '125px'}}>
          <Header pad={{"horizontal": "small"}}>
            <Title>My Assets</Title>
          </Header>
          {
            navs.map((nav, index) => {
              return <Box tag='h3' onClick={this.setType.bind(this, nav.key)} className={this.state.type == nav.key ? 'active' : ''} key={index}>{nav.label || nav.key}</Box>;
            })
          }
        </Box>
        <Box flex={true} align='center' justify='center' style={{minWidth: '90vw'}}>
          {
            this.state.type && this[`get${this.state.type}`]()
          }
        </Box>
      </Box>
    );
  }
}
