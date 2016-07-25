import React, {Component} from 'react';
import MetaData from './MetaData';
import BreadCrumb from './BreadCrumb';
import Box from 'grommet/components/Box';

export default class Builder extends Component {

  constructor() {
    super();
    this._clearFilter = this._clearFilter.bind(this);
  }

  _clearFilter() {
    this.refs.metaData.refs.wrappedInstance.setState({
      searchText: ''
    });
  }

  render() {
    return (
      <Box pad={{horizontal: 'small'}} className='fixMinSizing' flex={true}>
        <BreadCrumb clearFilter={this._clearFilter}/>
        <MetaData ref='metaData' clearFilter={this._clearFilter} linkNames={this.props.linkNames}
                  schemaToLoad={this.props.schemaToLoad}/>
      </Box>
    );
  }
}
