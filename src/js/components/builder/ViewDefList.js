import React, {Component/*, PropTypes*/} from 'react';
import {Link} from 'react-router';
import history from '../../RouteHistory';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Title from 'grommet/components/Title';
import GroupList from './../commons/GroupList';
import GroupListItem from './../commons/GroupListItem';
import Menu from 'grommet/components/Menu';
import Header from 'grommet/components/Header';
import Sidebar from 'grommet/components/Sidebar';
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
    return (
      <Sidebar primary={true} pad="small" fixed={false} full={false} direction="column" separator="right">
        <Header justify="between">
          <Title>Views Builder ({views.length})</Title>
          <Menu direction="row" align="center" responsive={false}>
            {
              !this.state.editView &&
              <Anchor href="#" icon={<Add />} label="New" onClick={this._newView.bind(this)}/>
            }
            {
              this.state.editView &&
              <Anchor href="#" icon={<Close />} label="Close" onClick={this._closeEdit.bind(this)}/>
            }
          </Menu>
        </Header>
        {
          !this.state.editView &&
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
        }
        {this.state.editView}
      </Sidebar>
    );
  }
}
