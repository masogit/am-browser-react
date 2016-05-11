import React, {Component} from 'react';
import * as ExplorerAction from '../../actions/explorer';
import {
  Anchor
} from 'grommet';

export default class RecordSearch extends Component {

  constructor() {
    super();
    this.state = {
      results: []
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


  render() {
    var records = this.state.results.map((result, i) => {
      return result.records.map((record, j) => {
        // var id = record['ref-link'].split('/')[2];
        return (<Anchor key={`${i}.${j}`} href="#" primary={true}>
          {`${result.view.name}: ${record.self}`}
        </Anchor> );
      });
    });

    return (
      <div>
        {records}
      </div>
    );
  }
}
