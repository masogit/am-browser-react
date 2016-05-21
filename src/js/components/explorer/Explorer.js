import React, {Component} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import RecordList from './RecordList';
import Box from 'grommet/components/Box';
import GroupList from './../commons/GroupList';
import GroupListItem from './../commons/GroupListItem';
import Sidebar from 'grommet/components/Sidebar';
import Title from 'grommet/components/Title';

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
    return (
      <Sidebar primary={true} pad="small" fixed={false} full={false} separator="right">
        <Box pad={{vertical: 'medium'}}><Title>Views Navigation ({views.length})</Title></Box>
        <GroupList pad={{vertical: 'small'}} searchable={true} selectable={true}>
          {
            views.map((view, key) => {
              return (
                <GroupListItem key={view._id} groupby={view.category} search={view.name} pad="small"
                               onClick={this._queryView.bind(this, view)}>
                  {view.name}
                </GroupListItem>
              );
            })
          }
        </GroupList>
      </Sidebar>);
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
    return (
      <Box direction="row" full={true}>
        {this.state.viewNavigation}
        {
          this.state.view &&
          <Box pad={{horizontal: 'small'}} full="horizontal">
            <RecordList body={this.state.view.body} title={this.state.view.name}/>
          </Box>
        }
      </Box>
    );
  }
}

