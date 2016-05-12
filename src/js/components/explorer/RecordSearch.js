import React, {Component} from 'react';
import * as ExplorerAction from '../../actions/explorer';
import RecordDetail from './RecordDetail';
import {
  Anchor
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
        return (<Anchor key={`${i}.${j}`} href="#" primary={true} onClick={this._onClick.bind(this, result.view, record)}>
          {`${result.view.name}: ${record.self}`}
        </Anchor> );
      });
    });

    return (
      <div>
        {records}
        {
          this.state.record &&
          <RecordDetail body={this.state.view.body} record={this.state.record} onClose={this._onClose.bind(this)} />
        }
      </div>
    );
  }
}
