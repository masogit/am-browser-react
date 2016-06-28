import React, {Component} from 'react';
import MetaData from './MetaData';
import BreadCrumb from './BreadCrumb';
import Box from 'grommet/components/Box';

export default class Builder extends Component {

  constructor() {
    super();
    this._clearFilter = this._clearFilter.bind(this);
    this.state = {
      elements: [],
      rows: {},
      linkNames: []
    };
  }

  componentDidMount() {
    if (this.props.linkNames.length > 0) {
      this.setState({
        linkNames: this.props.linkNames
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.linkNames.length > 0) {
      this.setState({
        elements: [],
        rows: this.refs.metaData.refs.wrappedInstance.allRows || {},
        linkNames: nextProps.linkNames
      });
    }
  }

  _clearFilter() {
    this.refs.metaData.refs.wrappedInstance.setState({
      searchText: ''
    });
  }

  updateData(elements, rows) {
    const linkNames = elements && elements.map((element) => element.sqlname);
    this.setState({
      elements: elements || this.state.elements,
      rows: rows || this.state.rows,
      linkNames: linkNames || this.state.linkNames
    });
  }

  render() {
    return (
      <Box pad={{horizontal: 'small'}} className='fixMinSizing' flex={true}>
        <BreadCrumb elements={this.state.elements} clearFilter={this._clearFilter}
                    updateData={this.updateData.bind(this)}/>
        <MetaData ref='metaData' clearFilter={this._clearFilter} elements={this.state.elements} rows={this.state.rows}
                  updateData={this.updateData.bind(this)} linkNames={this.state.linkNames}
                  schemaToLoad={this.props.schemaToLoad}/>
      </Box>
    );
  }
}
