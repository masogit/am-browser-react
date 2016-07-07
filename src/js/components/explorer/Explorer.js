import React, {Component} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import RecordList from './RecordList';
import Box from 'grommet/components/Box';
import SideBar from '../commons/SideBar';

export default class Explorer extends Component {

  constructor() {
    super();
    this.state = {
      view: null
    };
  }

  componentDidMount() {
    if (this.props.params.id)
      ExplorerActions.loadView(this.props.params.id, (view) => {
        this.setState({
          view: view
        });
      });
    else
      ExplorerActions.loadViews((views) => {
        this.setState({
          viewNavigation: this._getViewNavigation(views)
        });
      });
  }

  _getViewNavigation(views) {
    const contents = views.map((view, key) => ({
      key: view._id,
      groupby: view.category,
      onClick: this._queryView.bind(this, view),
      search: view.name,
      child: view.name
    }));

    return <SideBar title={`Views Navigation (${views.length})`} contents={contents}/>;
  }

  _queryView(view) {
    this.setState({
      view: null
    }, ()=> {
      this.setState({
        view: view
      });
    });

  }

  render() {
    let content;
    if (this.state.view) {
      content = <RecordList body={this.state.view.body} title={this.state.view.name}/>;
    } else {
      content = (
        <Box pad={{horizontal: 'medium'}} flex={true} justify='center' align="center">
          <Box size="medium" colorIndex="light-2" pad={{horizontal: 'large', vertical: 'medium'}} align='center'>
            Select an item to query.
          </Box>
        </Box>
      );
    }

    return (
      <Box direction="row" flex={true}>
        {this.state.viewNavigation}
        {content}
      </Box>
    );
  }
}

