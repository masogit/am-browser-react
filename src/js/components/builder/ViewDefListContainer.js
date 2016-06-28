import React, {Component /*, PropTypes*/} from 'react';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import ViewDefDetail from './ViewDefDetail';
import ViewDefList from './ViewDefList';
import ViewDefPreview from './ViewDefPreview';
import * as ViewDefActions from '../../actions/views';
import * as MetadataActions from '../../actions/system';
import store from '../../store';
import history from '../../RouteHistory';
import Box from 'grommet/components/Box';

class ViewDefListContainer extends Component {

  constructor(props) {
    super(props);
    this.onValueChange = this.onValueChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onSaveSuccess = this.onSaveSuccess.bind(this);
    this.onDeleteTableRow = this.onDeleteTableRow.bind(this);
    this.onDuplicateViewDef = this.onDuplicateViewDef.bind(this);
    this.onDeleteViewDef = this.onDeleteViewDef.bind(this);
    this.onClosePreview = this.onClosePreview.bind(this);
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
        this.props.actions.setSelectedView(nextId, selectedView);
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
  }

  onValueChange(path, newValue) {
    //console.log("ViewDefListContainer - onValueChange - path: ");
    //console.log(path);
    //console.log("ViewDefListContainer - onValueChange - newValue: ");
    //console.log(newValue);
    this.props.actions.updateSelectedView(this.props.selectedView, path, newValue);
  }

  onSubmit() {
    this.props.actions.saveViewDef(this.props.selectedView).then((id) => {
      //this.props.actions.updateViewDefList(updatedView);
      //history.push("/views/" + id);
      //this.props.actions.loadViews(id, this.props.location.pathname);
      this.onSaveSuccess();
    }, (err) => console.log("onSubmit - err: " + err));
  }

  onSaveSuccess() {
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

  onDeleteTableRow(event) {
    event.preventDefault();
    this.props.actions.deleteTableRow(this.props.selectedView, event.currentTarget.name);
  }

  onDuplicateViewDef(event) {
    this.props.actions.duplicateViewDef(this.props.selectedView);
  }

  onDeleteViewDef() {
    this.props.actions.confirmDeleteViewDef(this.props.selectedView, (id) => {
      if (!this.props.selectedViewId) { // all records deleted
        history.push("/views");
      }
    });
  }

  onClosePreview() {

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
    let boundActionCreators2 = bindActionCreators(MetadataActions, dispatch);
    return (
      <Box direction="row" flex={true}>
        <ViewDefList views={views} isFetchingViewList={isFetchingViewList} ref='viewDefList'
                     selectedView={selectedView} {...boundActionCreators} {...boundActionCreators2}/>

        <ViewDefDetail selectedView={selectedView} onValueChange={this.onValueChange}
                       onSubmit={this.onSubmit} onSaveSuccess={this.onSaveSuccess}
                       onDeleteTableRow={this.onDeleteTableRow} compact={true}
                       onDuplicateViewDef={this.onDuplicateViewDef}
                       onDeleteViewDef={this.onDeleteViewDef}
                       onClickTableTitle={this._onClickTableTitle}
                       {...boundActionCreators}/>

        <ViewDefPreview active={preview} selectedView={selectedView} {...boundActionCreators}/>
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
