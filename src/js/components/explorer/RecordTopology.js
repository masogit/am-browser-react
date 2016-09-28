import React, {Component, PropTypes} from 'react';
import TopologyDetail from './TopologyDetail';
import {Box, Anchor, Topology, Map, Columns}from 'grommet';
const Part = Topology.Part;
const Label = Topology.Label;
import More from 'grommet/components/icons/base/More';
//import Cluster from 'grommet/components/icons/base/Cluster';
import ComputerPersonal from 'grommet/components/icons/base/ComputerPersonal';
import {bodyToMapData} from '../../util/util';

const splitLine = (records, maxNum) => {
  return (
    <Columns masonry={true} maxCount={maxNum} className='justify-around'>{
      records.map((record, index) => (
        <Box key={index} colorIndex='light-2' margin="small">
          {record}
        </Box>
      ))
    }
    </Columns>);
};

export default class MyPC extends Component {
  componentWillMount() {
    this.state = {
      body: this.props.body,
      record: this.props.record,
      param: {
        offset: 0,
        limit: 30,
        groupby: '',
        filters: []
      }
    };
    this.updateDetail = this.props.updateDetail;
  }

  renderTopology(records = this.props.records) {
    if (!records || records.length == 0) {
      return;
    }

    const parts = records.map((record, index) => (
        <Part demarcate={false} align="center" key={index} justify='start'>
          <Box onClick={() => this.updateDetail(this.props.body, record)} direction="row">
            <ComputerPersonal/>
            <Label>{record.self}</Label>
          </Box>
        </Part>
      ));


    return (
      <Topology className='autoScroll'>
        {splitLine(parts, 3)}
        {this.props.numTotal > records.length &&
          <Box align='end'>
            <Anchor icon={<More/>} onClick={this.props.getMoreRecords} />
          </Box>
        }
      </Topology>
    );
  }

  render() {
    const {record, body, children : legend} = this.props;

    if (record) {
      return (
        <Box flex={true} pad={{horizontal: 'medium'}} align='center' justify='center' className='grid autoScroll' style={{minWidth: '1000px',width: '100%'}}>
          {legend}
          <TopologyDetail record={record} body={body} onClick={this.updateDetail}/>
        </Box>
      );
    } else {
      return (
        <Box flex={true}>
          <Box pad='small' flex={false}>
            {this.props.body.links.length > 0 && <Map vertical={true} className='hiddenScroll grid' data={bodyToMapData(this.props.body)} />}
          </Box>
          {this.renderTopology()}
        </Box>
      );
    }
  }
}

MyPC.propTypes = {
  body: PropTypes.object.isRequired
};
