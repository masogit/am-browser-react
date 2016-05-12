import React, {Component} from 'react';
import * as ExplorerAction from '../../actions/explorer';
import RecordDetail from './RecordDetail';
import {
  Anchor,
  Box,
  Header,
  Footer,
  Tiles,
  Tile
} from 'grommet';

export default class RecordSearch extends Component {

  constructor() {
    super();
    this.state = {
      results: [],
      record: null,
      view: null
    };
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keyword !== this.props.keyword)
      this._search(nextProps.keyword);
  }

  _search(keyword) {
    this.setState({
      results: []
    });
    if (keyword)
      ExplorerAction.loadViews((views) => {
        if (views instanceof Array) {
          views.forEach((view) => {
            ExplorerAction.loadRecordsByKeyword(view.body, keyword, (data) => {
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
    var records = this.state.results.map((result, i) => {
      return result.records.map((record, j) => {
        // var id = record['ref-link'].split('/')[2];
        return (
          <Tile key={`${i}.${j}`} align="start" separator="top" colorIndex="light-1">
            <Header tag="h4" size="small" pad={{horizontal: 'small'}}>
              <strong>{result.view.name}</strong>
            </Header>
            <Anchor href="#" primary={true} onClick={this._onClick.bind(this, result.view, record)}>
              {record.self}
            </Anchor>
            <Box pad="small">
              <p>{result.view.body.desc}</p>
            </Box>
            <Footer justify="between">
              Table: {result.view.body.sqlname}
            </Footer>
          </Tile>);
      });
    });

    return (
      <div>
        {
          this.state.results.length > 0 &&
          <Box full="horizontal" pad="medium">
            <h4>Search Result:</h4>
            <Tiles flush={false} justify="center" colorIndex="light-2" full="horizontal" size="large">
              {records}
            </Tiles>
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
