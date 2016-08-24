import React, {Component/*, PropTypes*/} from 'react';
import history from '../../RouteHistory';
import Anchor from 'grommet/components/Anchor';
import SideBar from '../commons/SideBar';
import Builder from './Builder';
import Add from 'grommet/components/icons/base/Add';
import Close from 'grommet/components/icons/base/Close';
import Edit from 'grommet/components/icons/base/Edit';
import {dropCurrentPop, monitorEdit, stopMonitorEdit} from '../../actions/system';
import emptyViewDef from '../../reducers/EmptyViewDef.json';

export default class ViewsDefList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editView: null,
      schema: '',
      linkNames: []
    };
  }

  _editView(sqlname) {
    this.setState({
      editView: true,
      schema: sqlname
    });
  }

  _newView() {
    this.setState({
      editView: true,
      linkNames: []
    });
    this.props.newSelectedView();
    history.push(`/views/`);
    monitorEdit(_.cloneDeep(emptyViewDef), 'views.selectedView');
  }

  _closeEdit() {
    this.dropCurrentPop('Back to view list', () => {
      this.props.clearSelectedView();
      stopMonitorEdit();
      this.setState({
        editView: null,
        schema: '',
        linkNames: []
      });
      history.push(`/views/`);
    });
  }

  dropCurrentPop(title, onConfirm) {
    const selectedView = this.props.selectedView;
    const originView = this.props.views.filter(view => selectedView._id == view._id)[0];

    dropCurrentPop(originView, selectedView, emptyViewDef, title, onConfirm);
  }

  render() {
    const {views, selectedView} = this.props;
    let toolbar, contents, focus;

    if (this.state.editView) {
      toolbar = <Anchor href="#" icon={<Close />} label="Close" onClick={this._closeEdit.bind(this)} className='fontNormal'/>;
      contents = this.state.editView &&
        <Builder schemaToLoad={this.state.schema} linkNames={this.state.linkNames} ref='builder'/>;
    } else {
      toolbar = <Anchor href="#" icon={<Add />} label="New" onClick={this.dropCurrentPop.bind(this, 'Create a view?', this._newView.bind(this))} className='fontNormal'/>;
      contents = views.map((view, key) => ({
        key: view._id,
        groupby: view.category,
        onClick: () => {
          if (!selectedView) {
            history.push(`/views/${view._id}`);
          } else if (view._id != selectedView._id) {
            this.dropCurrentPop(`Open ${view.name}`, () => history.push(`/views/${view._id}`));
          }
        },
        search: view.name,
        child: view.name,
        icon: (
          <span onClick={(event) => {
            event.stopPropagation();
            if (view._id == selectedView._id) {
              this._editView(view.body.sqlname);
            } else {
              this.dropCurrentPop(`Edit ${view.name}`, this._editView.bind(this, view.body.sqlname));
            }
            if (!selectedView._id) {
              this.props.setSelectedView(view._id, view);
            }
          }}>
            <Edit />
          </span>
        )
      }));
      focus = {expand: selectedView ? selectedView.category : false, selected: selectedView ? selectedView._id: ""};
    }

    return (
      <SideBar title={`Views Builder (${views.length})`} toolbar={toolbar} contents={contents} focus={focus}/>
    );
  }
}
