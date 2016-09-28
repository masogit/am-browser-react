import React, {Component, PropTypes} from 'react';
import RecordList from '../explorer/RecordList';
import PCDetail from './PCDetail';
import {Box, Anchor, Header, Topology, ListItem, List}from 'grommet';
const Parts = Topology.Parts;
const Part = Topology.Part;
const Label = Topology.Label;
import More from 'grommet/components/icons/base/More';
import Close from 'grommet/components/icons/base/Close';
import Cluster from 'grommet/components/icons/base/Cluster';
import Previous from 'grommet/components/icons/base/Previous';
import ComputerPersonal from 'grommet/components/icons/base/ComputerPersonal';
import * as ExplorerActions from '../../actions/explorer';
import Graph from '../commons/Graph';
import {getFilterFromField} from '../../util/RecordFormat';
import * as AQLActions from '../../actions/aql';

export default class MyPC extends Component {
  componentWillMount() {
    this.state = {
      body: this.props.body,
      record: null,
      showTopology: false,
      topologyRecords: null,
      locked: false,
      records: [],
      graphData: null,
      param: {
        offset: 0,
        limit: 30,
        groupby: '',
        filters: []
      }
    };
    this._getRecords(this.state.param);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      body: null,
      param: {
        offset: 0,
        limit: 30,
        groupby: '',
        filters: []
      }
    }, () => {
      this.setState({
        body: nextProps.body
      });
      this._getRecords();
    });
  }

  splitLine(records, num = 10) {
    const parts = [];
    const group = new Array(Math.ceil(records.length/num));
    records.map((record, index) => {
      const i = Math.floor(index / num);
      if (!group[i]) {
        group[i] = [];
      }
      group[i].push(record);
      if ((index + 1 )% num == 0 || index == records.length - 1) {
        parts.push(
          <Parts direction="row" key={index} className='line'>
            {group[i]}
          </Parts>
        );
      }
    });
    return parts;
  }

  _getMoreRecords() {
    if (this.state.numTotal > this.state.records.length) {
      var param = Object.assign({}, this.state.param);
      param.offset = this.state.records.length;
      this._getRecords(param);  // sync pass param to query, then records append
    } else {
      return null;
    }
  }

  _getRecords(param) {
    if (!this.state.locked) {
      this.setState({locked: true});
      var body = Object.assign({}, this.props.body, {param: param || this.state.param});
      ExplorerActions.loadRecordsByBody(body).then((data) => {
        const records = this.state.records;
        this.setState({
          numTotal: data.count,
          records: param ? records.concat(data.entities) : data.entities, // if sync pass param to query, then records append
          locked: false
        });
      });
      this._getGroupByData();
    }
  }

  renderAQLFilter() {
    if (this.props.body.groupby.indexOf('|') > -1) {
      const filterClear = (index) => {
        var param = this.state.param;
        param.filters.splice(index, 1);

        // Find previous groupby from pre-defined body
        let groupby = param.groupby || '';
        let groups = this.props.body.groupby ? this.props.body.groupby.split('|') : [];
        let pos = groups.indexOf(groupby);
        if (pos > 0)
          groupby = groups[pos - 1];

        param.groupby = groupby;
        this.setState({
          param: param
        }, this._getRecords);
      };

      return (
        <span>
        {this.state.param.filters.map((filter, index) => {
          return (
            <span key={index}>
              <Anchor href="#" icon={<Close />} onClick={() => filterClear(index)} label={filter}/>
            </span>
          );
        })}
      </span>
      );
    }
  }

  _getGroupByData(groupby = this.state.param.groupby) {
    const bodyGroupBy = this.props.body.groupby;
    let body = this.props.body;
    if (bodyGroupBy.indexOf('|') > -1) {
      const groups = bodyGroupBy.split('|');
      const pos = groups.indexOf(groupby);
      if (pos < groups.length - 1) {
        groupby = groups[pos + 1];
      }

      body = Object.assign({}, this.props.body);
      body.groupby = groupby;
    }
    AQLActions.queryAQL(ExplorerActions.getGroupByAql(body)).then((data)=> {
      this.state.param.groupby = groupby;
      this.setState({
        param: this.state.param,
        graphData: (data && data.rows.length > 0) ? data : null
      });
    });
  }

  renderGraph() {
    var config = {
      series_col: "1",
      label: "0",
      size: "small",
      legendTotal: false,
      full: true,
      units: "",
      total: true
    };
    return (
      <Graph type='legend' data={this.state.graphData} config={config}
             className={this.state.locked ? 'disabled' : ''}
             onClick={(filter) => {
               if (!this.state.locked) {
                 const param = this.state.param;
                 param.filters.push(getFilterFromField(this.props.body.fields, filter));
                 this.setState({
                   record: null,
                   param: param
                 }, this._getRecords);
               }
             }}/>
    );
  }

  renderTopology(records = this.state.records) {
    if (!records || records.length == 0) {
      return;
    }

    const parts = records.map((record, index) => (
        <Part demarcate={false} align="center" key={index}>
          <Box onClick={() => this.setState({record: record})} direction="row">
            <ComputerPersonal/>
            <Label>{record.self}</Label>
          </Box>
        </Part>
      ));


    return (
      <Topology className='autoScroll'>
        {this.splitLine(parts, 5)}
        {this.state.numTotal > records.length &&
          <Box align='end'>
            <Anchor icon={<More/>} onClick={() => this._getMoreRecords()} />
          </Box>
        }
      </Topology>
    );
  }

  renderDetail() {
    const fields = this.state.body.fields;
    const record = this.state.record;
    if (record) {
      return (
        <List>
          <ListItem><Header>{this.state.body.label}</Header></ListItem>
          {
          fields.map((field, index) => {
            let value = record[field.sqlname];
            if (value && typeof value == 'object') {
              value = value[0];
            }
            return (
              <ListItem key={index} justify="between">
                <span>
                  {field.label}
                </span>
                <Box pad={{horizontal: 'medium'}}/>
                <span className="secondary">
                  {value}
                </span>
              </ListItem>
            );
          })
        }
        </List>
      );
    }
  }

  updateDetail(body, record) {
    this.setState({
      body, record
    });
  }

  render() {
    const {record, showTopology, body} = this.state;

    let content;
    if (record) {
      content = (
        <Box direction='row' flex={true} pad='small'>
          <Box flex={false} pad={{horizontal: 'medium'}}>
            {this.renderGraph()}
          </Box>
          <Box flex={true} pad={{horizontal: 'medium'}}  align='center' justify='center' separator='all' className='grid autoScroll' style={{width: '1000px'}}>
            <PCDetail record={record} body={body} onClick={this.updateDetail.bind(this)}/>
          </Box>
          <Box flex={false}  align='center' justify='center' pad={{horizontal: 'small'}} colorIndex='light-2'>
            {this.renderDetail()}
          </Box>
        </Box>
      );
    } else {
      if (showTopology) {
        content = (
          <Box direction='row' flex={true} pad='small'>
            <Box flex={false} pad={{horizontal: 'medium'}}>
              {this.renderAQLFilter()}
              {this.renderGraph()}
            </Box>
            <Box flex={true} pad='medium' separator='all'>
              {this.renderTopology()}
            </Box>
          </Box>
        );
      } else if (body) {
        content =(
          <Box pad='none'>
            <RecordList body={body} showMap={false} noCache={true} showHeader={false} />
          </Box>
        );
      }
    }

    return (
      <Box style={{width: '100%'}} flex={true}>
        <Header size='small' pad='medium'>
          <Anchor icon={showTopology ? <Previous /> : <Cluster />}
                  label={showTopology ? 'List' : 'Topology'}
                  onClick={() => {
                    if (showTopology) {
                      this.state.param.groupby = '';
                      this.setState({
                        showTopology: false,
                        record: null,
                        param: this.state.param
                      });
                    } else {
                      this.setState({showTopology: true});
                    }
                  }}/>
        </Header>
        {content}
      </Box>
    );
  }
}

MyPC.propTypes = {
  body: PropTypes.object.isRequired
};