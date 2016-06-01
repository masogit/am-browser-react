import React, {Component} from 'react';
import * as ExplorerAction from '../../actions/explorer';
import RecordDetail from './RecordDetail';
import {
  Anchor,
  Box,
  Header,
  Footer,
  Split,
  Table,
  TableRow,
  Tiles,
  Tile
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

  _setMessage(name, time, num) {
    var messages = this.state.messages;
    if (messages[name]) {
      messages[name].timeEnd = time;
      messages[name].num = num;
    } else {
      messages[name] = {timeStart: time, num: num};
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
              this._setMessage(view.name, Date.now(), 0);
              ExplorerAction.loadRecordsByKeyword(view.body, keyword, (data) => {
                this._setMessage(view.name, Date.now(), data.count);
                if (data && data.entities.length > 0) {
                  var results = this.state.results;
                  results.push({view: view, records: data.entities});
                  this.setState({
                    results: [...results]
                  });
                }
              });
            });
          }
        });
    });
  }

  _getContent(view, record) {
    return view.body.fields.map((field)=> {
      if (field.searchable) {
        var index = record[field.sqlname].toLocaleLowerCase().indexOf(this.state.keyword.toLocaleLowerCase().trim());
        if (index > -1) {
          var length = this.state.keyword.toLocaleLowerCase().trim().length;
          var pre_str = <Box>{record[field.sqlname].substr(0, index)}</Box>;
          var key_str = <Box colorIndex="graph-4">{record[field.sqlname].substr(index, length)}</Box>;
          var suf_str = <Box>{record[field.sqlname].substr(length, record[field.sqlname].length)}</Box>;
          return (<Box direction="row" pad={{horizontal: 'medium'}}>
            {`${field.sqlname}: `}
            <Box direction="row">{pre_str}{key_str}{suf_str}</Box>
          </Box>);
        }
      }
    });
  }

  _onClose(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({record: null});
  }

  _onClick(view, record) {
    this.setState({
      view: view,
      record: record
    });
  }

  _onEnter(event) {
    if ((event.keyCode === 13)) {
      this.setState({
        keyword: event.target.value.trim()
      });
      this._search(event.target.value.trim());
    }
  }


  render() {
    var messages = Object.keys(this.state.messages).map((key) => {
      return {
        view: key,
        timeEnd: this.state.messages[key].timeEnd,
        timeStart: this.state.messages[key].timeStart,
        num: this.state.messages[key].num
      };
    }).sort((a, b)=> {
      return b.num - a.num;
    });

    console.log(messages);
    return (
      <Box full="horizontal" pad={{horizontal: 'small'}}>
        <Box direction="row" pad={{vertical: 'medium'}}>
          <input type="search" inline={true} className="flex" placeholder="Global Record search..."
                 onKeyDown={this._onEnter.bind(this)} defaultValue={this.props.params.keyword}/>
        </Box>
        <Split flex="right">
          <Box pad={{horizontal: 'small'}}>
            <h4>Search Result:</h4>
            <Table>
              <thead>
              <th>View</th>
              <th>Time (ms)</th>
              <th>Count</th>
              </thead>
              <tbody>
              {
                messages.map((msg) => {
                  return (<TableRow justify="between">
                    <td>{msg.view}</td>
                    <td>{msg.timeEnd ? (msg.timeEnd - msg.timeStart) : ''}</td>
                    <td>{msg.num}</td>
                  </TableRow>);
                })
              }
              </tbody>
            </Table>
          </Box>
          <Box>
            <Tiles flush={false} justify="center" colorIndex="light-2" size="large">
              {
                this.state.results.map((result, i) => {
                  return result.records.map((record, j) => {
                    // var id = record['ref-link'].split('/')[2];
                    return (
                      <Tile key={`${i}.${j}`} align="start" separator="top" colorIndex="light-1">
                        <Header tag="h4" size="small" pad={{horizontal: 'small'}}>
                          {result.view.name}
                        </Header>
                        <Box pad="small">
                          <Anchor href="#" primary={true} onClick={this._onClick.bind(this, result.view, record)}>
                            {record.self}
                          </Anchor>
                          {this._getContent(result.view, record)}
                        </Box>
                        <Footer justify="between">
                          Table: {result.view.body.sqlname}
                        </Footer>
                      </Tile>);
                  });
                })
              }
            </Tiles>
          </Box>
        </Split>
        {
          this.state.record &&
          <RecordDetail body={this.state.view.body} record={this.state.record} onClose={this._onClose.bind(this)}/>
        }
      </Box>
    );
  }
}
