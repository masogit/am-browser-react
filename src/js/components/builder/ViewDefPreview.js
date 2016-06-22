import React, {Component, PropTypes} from 'react';
import {Layer, Box} from 'grommet';
import RecordList from '../explorer/RecordList';

export default class ViewDefPreview extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return this.props.active && this.props.selectedView && this.props.selectedView.body ?
      (
        <Layer onClose={this.props.closePreview} closer={true} flush={true} align="center">
          <Box full={true} pad="large">
            <RecordList body={this.props.selectedView.body} title={this.props.selectedView.name}/>
          </Box>
        </Layer>
      )
      : (<span/>);
  }
}

ViewDefPreview.propTypes = {
  active: PropTypes.bool.isRequired,
  selectedView: PropTypes.object
};
