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

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyword !== this.props.keyword)
      this._search(nextProps.keyword);
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
      results: []
    });
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

  render() {

    return (
      <div>
        {
          this.props.keyword &&
          <Box full="horizontal">
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
                    Object.keys(this.state.messages).map((key) => {
                      return (<TableRow justify="between">
                        <td>{key}</td>
                        <td>{(this.state.messages[key].timeEnd) ? (this.state.messages[key].timeEnd - this.state.messages[key].timeStart) : ''}</td>
                        <td>{this.state.messages[key].num}</td>
                      </TableRow>);
                    })
                  }
                  </tbody>
                </Table>
              </Box>
              <Tiles flush={false} justify="center" colorIndex="light-2" full="horizontal">
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
                          </Box>
                          <Footer justify="between">
                            Table: {result.view.body.sqlname}
                          </Footer>
                        </Tile>);
                    });
                  })
                }
              </Tiles>
            </Split>
          </Box>
        }
        {
          this.state.record &&
          <RecordDetail body={this.state.view.body} record={this.state.record} onClose={this._onClose.bind(this)}/>
        }
      </div>
    );
  }
}
