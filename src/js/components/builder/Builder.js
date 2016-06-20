import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as BuilderActions from '../../actions';
import * as ViewDefActions from '../../actions/views';
import MetaData from './MetaData';
import BreadCrumb from './BreadCrumb';
import Box from 'grommet/components/Box';

export default class Builder extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
    this.props.dispatch(BuilderActions.metadataLoad());
  }

  _clearFilter() {
    document.getElementById("metadataFilter").value = "";
  }

  render() {
    let item = this.props.rows;
    let elements = this.props.elements;
    let {dispatch} = this.props;
    let boundActionCreators = bindActionCreators(BuilderActions, dispatch);
    let boundActionCreators_views = bindActionCreators(ViewDefActions, dispatch);
    return (
      <Box>
        <BreadCrumb elements={elements} {...boundActionCreators} clearFilter={this._clearFilter}/>
        <MetaData elements={elements} rows={item} {...boundActionCreators} {...boundActionCreators_views}
                  clearFilter={this._clearFilter} {...this.props}/>
      </Box>
    );
  }
}

Builder.propTypes = {
  rows: PropTypes.object.isRequired,
  elements: PropTypes.array.isRequired
};

let select = (state, props) => {
  return {
    rows: state.metadata.rows,
    elements: state.metadata.elements
  };
};

export default connect(select)(Builder);
