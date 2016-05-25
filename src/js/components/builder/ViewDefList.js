import React, {Component/*, PropTypes*/} from 'react';
// import {Link} from 'react-router';
import history from '../../RouteHistory';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import GroupList from './../commons/GroupList';
import GroupListItem from './../commons/GroupListItem';
import Sidebar from '../commons/Sidebar';
import Builder from './Builder';
import Edit from 'grommet/components/icons/base/Edit';
import Add from 'grommet/components/icons/base/Add';
import Close from 'grommet/components/icons/base/Close';

export default class ViewsDefList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      editView: null
    };
  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUpdate(nextProps, nextState) {
  }

  _editView(sqlname) {
    var editView = (<Builder filterEntities={sqlname}/>);
    this.setState({
      editView: editView
    });
  }

  _newView() {
    var editView = (<Builder />);
    this.setState({
      editView: editView
    });
    this.props.newSelectedView();
  }

  _closeEdit() {
    this.setState({
      editView: null
    });
  }

  _goView(id) {
    history.push(`/views/${id}`);
  }

  render() {
    const {views} = this.props;
    let menu, contents;
    if (this.state.editView) {
      menu = <Anchor href="#" icon={<Close />} label="Close" onClick={this._closeEdit.bind(this)}/>;
      contents = this.state.editView;
    } else {
      menu = <Anchor href="#" icon={<Add />} label="New" onClick={this._newView.bind(this)}/>;
      contents = (
        <GroupList pad={{vertical: 'small'}} searchable={true} selectable={true}>
          {
            views.map((view, key) => {
              return (
                <GroupListItem key={view._id} groupby={view.category} search={view.name}
                               pad="small" justify="between" onClick={this._goView.bind(this, view._id)}>
                  {view.name}
                  <Box onClick={this._editView.bind(this, view.body.sqlname)}>
                    <Edit size="small"/>
                  </Box>
                </GroupListItem>
              );
            })
          }
        </GroupList>
      );
    }

    return (
      <Sidebar title={`Views Builder (${views.length})`} menu={menu} contents={contents}/>
    );
  }
}
