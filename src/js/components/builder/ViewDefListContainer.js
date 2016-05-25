import React, {Component /*, PropTypes*/} from 'react';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Box from 'grommet/components/Box';
//import Header from 'grommet/components/Header';
//import Split from 'grommet/components/Split';
//import Footer from 'grommet/components/Footer';
//import Title from 'grommet/components/Title';
//import Menu from 'grommet/components/Menu';
//import CloseIcon from 'grommet/components/icons/Clear';
//import Search from 'grommet/components/Search';
//import Gravatar from 'react-gravatar';
//import Article from 'grommet/components/Article';
//import Section from 'grommet/components/Section';
//import { Link } from 'react-router';
//import Tabs from 'grommet/components/Tabs';
//import Tab from 'grommet/components/Tab';
//import {loadViews/*, loadTemplateTable, setSelectedView*/} from '../../actions/views';
import ViewDefDetail from './ViewDefDetail';
import ViewDefList from './ViewDefList';
import ViewDefPreview from './ViewDefPreview';
import * as ViewDefActions from '../../actions/views';
import store from '../../store';
import history from '../../RouteHistory';

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
      if (!currentId && !nextId) { // Click navigation link, no id param.
        this.props.actions.setSelectedView(views[0]._id, views[0]);
      } else if (nextId && nextId != currentId) { // Click item in the list, with link like '/views/2', '2' is the id param.
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

  render() {
    const {views, isFetchingViewList, selectedView, preview} = this.props;
    let {dispatch} = store;
    let boundActionCreators = bindActionCreators(ViewDefActions, dispatch);
    return (
      <div>
        <div style={{display: "flex"}}>
          <ViewDefList views={views} isFetchingViewList={isFetchingViewList} {...boundActionCreators}/>

          <div style={{width: "90%"}}>
            <Box pad={{horizontal: 'small'}}>
              <ViewDefDetail selectedView={selectedView} onValueChange={this.onValueChange}
                             onSubmit={this.onSubmit} onSaveSuccess={this.onSaveSuccess}
                             onDeleteTableRow={this.onDeleteTableRow}
                             onDuplicateViewDef={this.onDuplicateViewDef}
                             onDeleteViewDef={this.onDeleteViewDef}
                             alertForm={this.props.alertForm} {...boundActionCreators}/>
            </Box>
          </div>
        </div>
        <ViewDefPreview active={preview} selectedView={selectedView} {...boundActionCreators}/>
      </div>
    );
  }
}

let mapStateToProps = (state) => {
  return {
    views: state.views.views,  // see store-dev.js or store-prod.js
    selectedView: state.views.selectedView,
    selectedViewId: state.views.selectedViewId,
    templateTable: state.views.templateTable,
    preview: state.views.preview,
    alertForm: state.views.alertForm
  };
};

let mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ViewDefActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ViewDefListContainer);
