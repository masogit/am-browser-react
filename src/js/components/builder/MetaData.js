import React, { Component, PropTypes } from 'react';
import Anchor from 'grommet/components/Anchor';
import Header from 'grommet/components/Header';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

export default class MetaData extends Component {

  constructor() {
    super();
    this.state = {};
    this._onSearch = this._onSearch.bind(this);
  }

  componentDidMount() {
  }

  _onSearch(event) {
    this.setState({
      filtered: this.props.rows.filter((obj) => obj.id.toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1)
    });
  }

  _onClick(id) {
    console.log(id);
    this.props.metadataLoadDetail(id);
  }

  render() {
    var rows = this.props.rows;
    var rowsState = (typeof (this.state.filtered) != 'undefined') ? this.state.filtered : rows;
    var rowComponents = rowsState.map((row, index) => {
      return <TableRow key={index}><td><Anchor key={index} onClick={this._onClick.bind(this, row.id)}>{row.id}-{row.name}</Anchor></td></TableRow>;
    });
    return (
      <div>
        <Header large={true} flush={false}>
          <input className="sidebarsearch" type="text" placeholder="Search fields and links..." onChange={this._onSearch}/>
        </Header>
        <Table>
          <tbody>
            {rowComponents}
          </tbody>
        </Table>
      </div>
    );
  }
}

MetaData.propTypes = {
  rows: PropTypes.array.isRequired
};
