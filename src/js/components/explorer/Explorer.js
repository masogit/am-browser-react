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
    });
  }

  componentWillMount() {
  }

  render() {
    return (
      this.state.view &&
      <RecordList body={this.state.view.body}/>
    );
  }
}

