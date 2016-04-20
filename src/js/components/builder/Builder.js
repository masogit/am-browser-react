import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as BuilderActions from '../../actions';
import MetaData from './MetaData';
import Sidebar from 'grommet/components/Sidebar';

export default class Builder extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
    this.props.dispatch(BuilderActions.metadataLoad());
  }

  _onClick(id) {
    this.props.dispatch(BuilderActions.metadataLoadDetail(id));
  }

  _onItemClick(node) {
    node.checked = !node.checked;
  }

  render() {
    let item = this.props.rows;
    let { dispatch } = this.props;
    let boundActionCreators = bindActionCreators(BuilderActions, dispatch);
    console.log(boundActionCreators);
    return (
      <div className="example">
        <Sidebar primary={true} pad="small" size="large">
          <MetaData rows={item} {...boundActionCreators}/>
        </Sidebar>
      </div>
    );
  }
}

Builder.propTypes = {
  rows: PropTypes.array.isRequired
};

let select = (state, props) => {
  return {
    rows: state.metadata.rows
  };
};

export default connect(select)(Builder);
