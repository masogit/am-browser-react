import React, {Component} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import RecordList from './RecordList';

export default class Explorer extends Component {

  constructor() {
    super();
    this.state={
      view: null
    };
  }

  componentDidMount() {
    ExplorerActions.loadView(this.props.params.id, (view) => {
      this.setState({
        view: view
      });

      // save time count and visit
      ExplorerActions.updateViewLast(view);
    });
  }

  render() {
    return (
      this.state.view &&
      <RecordList body={this.state.view.body} title={this.state.view.name} />
    );
  }
}

