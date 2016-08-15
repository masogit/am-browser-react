import React, {Component} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import RecordList from './RecordList';
import Box from 'grommet/components/Box';
import SideBar from '../commons/SideBar';

export default class Explorer extends Component {

  constructor() {
    super();
    this.state = {
      view: null,
      navigation: null
    };
  }

  componentWillMount() {
    const id = this.props.params.id;
    if (id) {
      ExplorerActions.loadView(id).then((view) => {
        this.setState({view: view});
      });
    } else {
      ExplorerActions.loadViews().then(views => {
        if (views) {
          const content = views.map((view, key) => ({
            key: view._id,
            groupby: view.category,
            onClick: this.queryView.bind(this, view),
            search: view.name,
            child: view.name
          }));
          this.setState({navigation: content});
        }
      });
    }
  }

  queryView(view) {
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
      <Box direction="row" flex={true}>
        {this.state.navigation &&
          <SideBar title={`Views Navigation (${this.state.navigation.length})`}
                   contents={this.state.navigation}
                   focus ={{expand: this.state.view ? this.state.view.category : false, selected: this.state.view ? this.state.view._id: ""}}/>}
        {this.state.view ? <RecordList body={this.state.view.body} title={this.state.view.name} root={true}/> :
          <Box pad={{horizontal: 'medium'}} flex={true} justify='center' align="center">
            <Box size="medium" colorIndex="light-2" pad={{horizontal: 'large', vertical: 'medium'}} align='center'>
              Select an item to query.
            </Box>
          </Box>
        }
      </Box>
    );
  }
}

