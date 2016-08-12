import React, {Component /*, PropTypes*/} from 'react';
import _ from 'lodash';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import ViewDefDetail from './ViewDefDetail';
import ViewDefList from './ViewDefList';
import RecordListLayer from '../explorer/RecordListLayer';
import * as ViewDefActions from '../../actions/views';
import * as SystemActions from '../../actions/system';
import store from '../../store';
import history from '../../RouteHistory';
import Box from 'grommet/components/Box';

class ViewDefListContainer extends Component {
  constructor(props) {
    super(props);
    this._onValueChange = this._onValueChange.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onSaveSuccess = this._onSaveSuccess.bind(this);
    this._onDeleteTableRow = this._onDeleteTableRow.bind(this);
    this._onDuplicateViewDef = this._onDuplicateViewDef.bind(this);
    this._onDeleteViewDef = this._onDeleteViewDef.bind(this);
    this._onMoveRowUp = this._onMoveRowUp.bind(this);
    this._onMoveRowDown = this._onMoveRowDown.bind(this);
    this._onClickTableTitle = this._onClickTableTitle.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
    // Initialize list data, called only once.
    this.props.actions.loadViews(this.props.params.id, this.props.location.pathname).then(urlOfFirstRecord => {
      if (urlOfFirstRecord) {
        history.push(urlOfFirstRecord);  // display the first record
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    //console.log("ViewDefListContainer - nextProps");
    //console.log(nextProps);
    let currentId = this.props.params.id;
    let nextId = nextProps.params.id;
    let {views} = nextProps;
    if (views && views.length > 0) {
      if (nextId && nextId != currentId) { // Click item in the list, with link like '/views/2', '2' is the id param.
        let selectedView = views.filter(view => view._id == nextId)[0];

        SystemActions.monitorEdit(selectedView, 'views.selectedView');
        this.props.actions.setSelectedView(nextId, selectedView);
      }

      if(!this.categories) {
        this.categories = _.uniq(views.map((view) => view.category));
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentWillUnmount() {
    this.props.actions.clearSelectedView();
  }

  _onValueChange(path, newValue) {
    this.props.actions.updateSelectedView(this.props.selectedView, path, newValue);
  }

  _onSubmit() {
    this.props.actions.saveViewDef(this.props.selectedView).then((id) => {
      this._onSaveSuccess();
    }, (err) => console.log("onSubmit - err: " + err));
  }

  _onSaveSuccess() {
    let {selectedViewId} = this.props;
    if (selectedViewId) {
      //history.push("/views/" + selectedViewId);
      this.props.actions.loadViews(selectedViewId, this.props.location.pathname).then((res) => {
        history.push("/views/" + selectedViewId);
      }, (err) => {
        console.log("onSaveSuccess - err: " + err);
      });
    }
  }

  _onMoveRowUp(event) {
    event.preventDefault();
    this.props.actions.moveRow(this.props.selectedView, event.currentTarget.name, true);
  }

  _onMoveRowDown(event) {
    event.preventDefault();
    this.props.actions.moveRow(this.props.selectedView, event.currentTarget.name);
  }

  _onDeleteTableRow(event) {
    event.preventDefault();
    this.props.actions.deleteTableRow(this.props.selectedView, event.currentTarget.name);
  }

  _onDuplicateViewDef(event) {
    this.props.actions.duplicateViewDef(this.props.selectedView);
  }

  _onDeleteViewDef() {
    this.props.actions.confirmDeleteViewDef(this.props.selectedView).then(() => {
      history.push("/views");
    });
  }

  _onClickTableTitle(nameList) {
    this.refs.viewDefList.setState({
      editView: true,
      linkNames: nameList,
      schema: ''
    });
  }

  render() {
    const {views, isFetchingViewList, selectedView, preview} = this.props;
    let {dispatch} = store;
    let boundActionCreators = bindActionCreators(ViewDefActions, dispatch);
    let boundActionCreators2 = bindActionCreators(SystemActions, dispatch);
    return (
      <Box direction="row" flex={true}>
        <ViewDefList views={views} isFetchingViewList={isFetchingViewList} ref='viewDefList'
                     selectedView={selectedView} {...boundActionCreators} {...boundActionCreators2}/>

        <ViewDefDetail selectedView={selectedView} categories={this.categories} compact={true}
                       onValueChange={this._onValueChange}
                       onSubmit={this._onSubmit}
                       onSaveSuccess={this._onSaveSuccess}
                       onMoveRowUp={this._onMoveRowUp}
                       onMoveRowDown={this._onMoveRowDown}
                       onDeleteTableRow={this._onDeleteTableRow}
                       onDuplicateViewDef={this._onDuplicateViewDef}
                       onDeleteViewDef={this._onDeleteViewDef}
                       onClickTableTitle={this._onClickTableTitle}
                       {...boundActionCreators}/>
        {preview && selectedView && selectedView.body &&
        <RecordListLayer onClose={boundActionCreators.closePreview.bind(this)} body={selectedView.body} title={selectedView.name}/>}
      </Box>
    );
  }
}

let mapStateToProps = (state) => {
  return {
    views: state.views.views,  // see store-dev.js or store-prod.js
    selectedView: state.views.selectedView,
    selectedViewId: state.views.selectedViewId,
    templateTable: state.views.templateTable,
    preview: state.views.preview
  };
};

let mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ViewDefActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewDefListContainer);
