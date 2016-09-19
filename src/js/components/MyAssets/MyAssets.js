/**
 * Created by huling on 9/5/2016.
 */
import React, {Component} from 'react';
import {Box, Tiles, Tile, Anchor, Header} from 'grommet';
import AMSideBar from '../commons/AMSideBar';
import MyPC from './MyPC';
import MyPCData from './MyPCMockData.json';


export default class MyAsset extends Component {
  componentWillMount() {
    this.state = {
      type: 'PC'
    };
  }

  setType(type) {
    this.setState({type});
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
    const body = MyPCData;
    return <MyPC body={body} title='PC'/>;
  }

  render() {
    const content = (
      <Box align="center" flex={true}>
        <Anchor href='#' onClick={this.setType.bind(this, 'Summary')}>
          <Box tag='h3'>Summary</Box>
        </Anchor>
        <Anchor onClick={this.setType.bind(this, 'PC')}>
          <Box tag='h3'>PC</Box>
        </Anchor>
        <Anchor onClick={this.setType.bind(this, 'Software')}>
          <Box tag='h3'>Software</Box>
        </Anchor>
      </Box>
    );

    return (
      <Box flex={true} direction='row'>
        <AMSideBar contents={content} toggle={false} title='My Assets' colorIndex='light-1' style={{maxWidth: '10vw'}}/>
        <Box flex={true} align='center' justify='center' style={{width: '90vw'}}>
          {this.state.type == 'Summary' && this.getSummary()}
          {this.state.type == 'PC' && this.getPC()}
          {this.state.type == 'Software' && <div>Software</div>}
        </Box>
      </Box>
    );
  }
}
