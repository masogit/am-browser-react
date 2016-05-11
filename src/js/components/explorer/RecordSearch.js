import React, {Component} from 'react';
import * as ExplorerAction from '../../actions/explorer';
import {
  Tiles,
  Tile,
  Header,
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
    this._search();
  }

  componentWillReceiveProps(nextProps) {
    // this._search();
  }

  _search() {
    if (this.props.keyword)
      ExplorerAction.loadViews((views) => {
        if (views instanceof Array) {
          views.forEach((view) => {
            ExplorerAction.loadRecordsByKeyword(view.body, this.props.keyword, (data) => {
              if (data) {
                var results = this.state.results;
                results.push({view: view, records: data.entities});
                console.log("results");
                console.log(results);
                this.setState({
                  results: results
                });
              }
            });
          });
        }
      });
  }

  render() {
    var tileComponent = this.state.results.map((result, index) => {
      return <Tile key={index}>
        <Header>{result.view.name}</Header>
        {
          result.records.map((record) => {
            return <p><Anchor href="#" label={record.self} primary={true}/></p>;
          })
        }

      </Tile>;
    });
    return (
      <Tiles fill={true} flush={true}>
        {tileComponent}
      </Tiles>
    );
  }
}
