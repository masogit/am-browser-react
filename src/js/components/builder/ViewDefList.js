import React, {Component/*, PropTypes*/} from 'react';
// import {Link} from 'react-router';
import history from '../../RouteHistory';
import Anchor from 'grommet/components/Anchor';
import SideBar from '../commons/SideBar';
import Builder from './Builder';
import Add from 'grommet/components/icons/base/Add';
import Close from 'grommet/components/icons/base/Close';
import Edit from 'grommet/components/icons/base/Edit';

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
    history.push(`/views/`);
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
    const {views, selectedView} = this.props;
    let toolbar, contents, focus;

    if (this.state.editView) {
      toolbar =
        <Anchor href="#" icon={<Close />} label="Close" onClick={this._closeEdit.bind(this)} className='fontNormal'/>;
      contents = this.state.editView;
    } else {
      toolbar = <Anchor href="#" icon={<Add />} label="New" onClick={this._newView.bind(this)} className='fontNormal'/>;
      contents = views.map((view, key) => ({
        key: view._id,
        groupby: view.category,
        onClick: this._goView.bind(this, view._id),
        search: view.name,
        child: view.name,
        icon: (
          <span onClick={this._editView.bind(this, view.body.sqlname)}>
            <Edit />
          </span>
        )
      }));
      focus = {expand: selectedView.category, selected: selectedView._id};
    }

    return (
      <SideBar title={`Views Builder (${views.length})`} toolbar={toolbar} contents={contents} focus={focus}/>
    );
  }
}
