import React, { Component, PropTypes } from 'react';
import { Layer, Box, Header } from 'grommet';
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
            <Header size="small">
              <h3>{this.props.selectedView.name}</h3>
            </Header>
            <RecordList body={this.props.selectedView.body}/>
          </Box>
        </Layer>
      )
      : (<span/>);
  }
}

ViewDefPreview.propTypes = {
  active: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  selectedView: PropTypes.object
};
