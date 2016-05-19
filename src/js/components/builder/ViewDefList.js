import React, {Component/*, PropTypes*/} from 'react';
import {Link} from 'react-router';
import Anchor from 'grommet/components/Anchor';
// import Box from 'grommet/components/Box';
import GroupList from './../commons/GroupList';
import GroupListItem from './../commons/GroupListItem';
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

  render() {
    const {views} = this.props;
    return (
      <Sidebar primary={true} pad="small" fixed={false} full={false}>
        {
          !this.state.editView &&
          <Anchor href="#" icon={<Add />} label="New" onClick={this._newView.bind(this)} />
        }
        {
          this.state.editView &&
          <Anchor href="#" icon={<Close />} label="Close" onClick={this._closeEdit.bind(this)} />
        }
        {
          !this.state.editView &&
          <GroupList pad={{vertical: 'small'}} searchable={true} selectable={true}>
            {
              views.map((view, key) => {
                return (
                  <GroupListItem key={view._id} groupby={view.category} search={view.name}
                                 pad={{horizontal: 'small', vertical: 'none'}} justify="between">
                    <Link to={`/views/${view._id}`} key={key}>{view.name}</Link>
                    <Anchor href="#" icon={<Edit size="small"/>}
                            onClick={this._editView.bind(this, view.body.sqlname)}/>
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
