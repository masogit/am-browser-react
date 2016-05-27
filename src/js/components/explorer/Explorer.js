import React, {Component} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import RecordList from './RecordList';
import Box from 'grommet/components/Box';
import Sidebar from '../commons/Sidebar';
import {Container, Content} from '../commons/Split';

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

    return <Sidebar title={`Views Navigation (${views.length})`} contents={contents}/>;
  }

  _toggleViewNavigation() {
    if (this.state.viewNavigation)
      this.setState({
        viewNavigation: null
      });
    else
      ExplorerActions.loadViews((views)=> {
        this.setState({
          viewNavigation: this._getViewNavigation(views)
        });
      });
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
      content = (
        <Content>
          <RecordList body={this.state.view.body} title={this.state.view.name}/>
        </Content>
      );
    } else {
      content = (
        <Content justify='center' align="center">
          <Box size="large" colorIndex="light-2" pad={{horizontal: 'large', vertical: 'medium'}}>
            Select an item to query.
          </Box>
        </Content>
      );
    }

    return (
      <Container>
        {this.state.viewNavigation}
        {content}
      </Container>
    );
  }
}

