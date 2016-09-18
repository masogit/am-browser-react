import React, {Component, PropTypes} from 'react';
import RecordList from './RecordList';
import {Layer, Box}from 'grommet';

export default class RecordListLayer extends Component {
  render() {
    return (
      <Layer onClose={this.props.onClose} closer={!!this.props.onClose} flush={true} align="center">
        <Box full={true} pad="large" style={{minHeight: '90vh'}}>
          <RecordList body={this.props.body} title={this.props.title}/>
        </Box>
      </Layer>
    );
  }
}

RecordList.propTypes = {
  title: PropTypes.string,
  body: PropTypes.object.isRequired,
  onClose: PropTypes.func
};
