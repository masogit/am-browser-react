import React, {Component, PropTypes} from 'react';
import RecordList from './RecordList';
import {Layer, Box}from 'grommet';

export default class RecordListLayer extends Component {
  render() {
    const {onClose, body, title, editMode} = this.props;
    return (
      <Layer onClose={onClose} closer={!!onClose} flush={true} align="center">
        <Box full={true} pad="large">
          <RecordList body={body} title={title} editMode={editMode}/>
        </Box>
      </Layer>
    );
  }
}

RecordList.propTypes = {
  title: PropTypes.string,
  body: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  editMode: PropTypes.bool
};
