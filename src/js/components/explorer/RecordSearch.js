import React, {Component} from 'react';
import * as ExplorerAction from '../../actions/explorer';
import RecordDetail from './RecordDetail';
import RecordList from './RecordList';
import history from '../../RouteHistory';
import {
  Anchor,
  Box,
  Header,
  Footer,
  Layer,
  Split,
  Table,
  TableRow,
  Tiles,Title,
  Tile, Form
} from 'grommet';

export default class RecordSearch extends Component {

  constructor() {
    super();
    this.state = {
      messages: {},
      results: [],
      record: null,
      view: null
    };
    this._setMessage.bind(this);
  }

  componentDidMount() {
    this._search(this.props.params.keyword);
  }

  componentWillReceiveProps(nextProps) {
  }

  _setMessage(view, time, num) {
    var messages = this.state.messages;
    if (messages[view._id]) {
      messages[view._id].timeEnd = time;
      messages[view._id].num = num;
    } else {
      messages[view._id] = {view: view, timeStart: time, num: num};
    }
    this.setState({
      messages: messages
    });
  }

  _search(keyword) {
    this.setState({
      messages: {},
      results: [],
      keyword: keyword
    }, () => {
      if (keyword)
        ExplorerAction.loadViews((views) => {
          if (views instanceof Array) {
            views.forEach((view) => {
              // check searchable
              var aql = view.body.fields.filter((field) => {
                return field.searchable;
              });
              if (aql.length > 0) {
                ExplorerAction.getBodyByKeyword(view.body, keyword);
                this._setMessage(view, Date.now(), 0);
                ExplorerAction.loadRecordsByBody(view.body, (data) => {
                  this._setMessage(view, Date.now(), data.count);
                  if (data && data.entities.length > 0) {
                    var results = this.state.results;
                    results.push({view: view, records: data.entities});
                    this.setState({
                      results: [...results]
                    });
                  }
                });
              }
            });
          }
        });
    });
  }

  _getContent(view, record) {
    return view.body.fields.map((field, index)=> {
      if (field.searchable) {
        var index = record[field.sqlname].toLocaleLowerCase().indexOf(this.state.keyword.toLocaleLowerCase().trim());
        if (index > -1) {
          var length = this.state.keyword.toLocaleLowerCase().trim().length;
          var pre_str = record[field.sqlname].substr(0, index);
          var key_str = record[field.sqlname].substr(index, length);
          var suf_str = record[field.sqlname].substr(length, record[field.sqlname].length);
          const title = pre_str + key_str + suf_str;
          return (
            <Box key={field.sqlname + index} direction='row'>
              <span className='text-ellipsis' title={title}>{
                `${field.sqlname}: ${pre_str}`
              }<span className='background-color-index-brand'>{
                key_str
              }</span>{
                suf_str
              }</span>
            </Box>
          );
        }
      }
    });
  }

  _onClose(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({record: null, layer: null});
  }

  _onClick(view, record) {
    this.setState({
      view: view,
      record: record
    });
  }

  _onEnter(event) {
    if ((event.keyCode === 13)) {
      history.push(`/search/${event.target.value.trim()}`);
      this.setState({
        keyword: event.target.value.trim()
      });
      this._search(event.target.value.trim());
    }
  }

  _showViewRecords(view) {
    var layer = (
      <Layer onClose={this._onClose.bind(this)} closer={true} flush={true} align="center">
        <Box full={true} pad="large">
          <RecordList body={view.body} title={view.name}/>
        </Box>
      </Layer>
    );

    this.setState({
      layer: layer
    });
  }

  render() {
    var messages = Object.keys(this.state.messages).map((key) => {
      return {
        _id: key,
        view: this.state.messages[key].view,
        timeEnd: this.state.messages[key].timeEnd,
        timeStart: this.state.messages[key].timeStart,
        num: this.state.messages[key].num
      };
    }).sort((a, b)=> {
      return b.num - a.num;
    });

    return (
      <Box full="horizontal" pad={{horizontal: 'small'}}>
        <Box direction="row" pad={{vertical: 'medium'}} flex={false}>
          <input type="search" inline={true} className="flex" placeholder="Global Record search..."
                 onKeyDown={this._onEnter.bind(this)} defaultValue={this.props.params.keyword}/>
        </Box>
        <Split flex="right" fixed={false}>
          <Box pad={{horizontal: 'small'}} flex={true}>
            <Title>Search Result:</Title>
            <Table>
              <thead>
              <tr>
                <th>View</th>
                <th>Time (ms)</th>
                <th>Count</th>
              </tr>
              </thead>
              <tbody>
              {
                messages.map((msg) => {
                  return (<TableRow key={msg._id} justify="between">
                    <td>{msg.view.name}</td>
                    <td>{msg.timeEnd ? (msg.timeEnd - msg.timeStart) : ''}</td>
                    <td>
                      {
                        msg.num > 0 ?
                          <Anchor onClick={this._showViewRecords.bind(this, msg.view)} label={msg.num}/> : msg.num
                      }
                    </td>
                  </TableRow>);
                })
              }
              </tbody>
            </Table>
          </Box>
          <Tiles flush={false} size="large" className='autoScroll'>
            {
              this.state.results.map((result, i) => {
                return result.records.map((record, j) => {
                  // var id = record['ref-link'].split('/')[2];
                  return (
                    <Tile key={`${i}.${j}`} align="start" className='box-shadow'>
                      <Header tag="h4" size="small" pad={{horizontal: 'small'}}>
                        {result.view.name}
                      </Header>
                      <Form>
                        <Box pad="small">
                          <Anchor onClick={this._onClick.bind(this, result.view, record)}
                                  className='text-ellipsis'>
                            <span title={record.self}><b>{record.self}</b></span>
                          </Anchor>
                          {this._getContent(result.view, record)}
                        </Box>
                        <Footer pad={{horizontal:'small'}}>
                          {'Table: ' + result.view.body.sqlname}
                        </Footer>
                      </Form>
                    </Tile>);
                });
              })
            }
          </Tiles>
        </Split>
        {
          this.state.record &&
          <RecordDetail body={this.state.view.body} record={this.state.record} onClose={this._onClose.bind(this)}/>
        }
        {this.state.layer}
      </Box>
    );
  }
}
