import React, { Component, PropTypes } from 'react';
import Anchor from 'grommet/components/Anchor';
import Header from 'grommet/components/Header';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import CheckBox from 'grommet/components/CheckBox';

export default class MetaData extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
  }

  componentDidMount() {
  }

  _onSearch(event) {
    let rows = this.props.rows;
    let entities = rows.entities ? rows.entities : [];
    let links = rows.links ? rows.links : [];
    let fields = rows.fields ? rows.fields : [];
    entities = entities.filter((obj) => obj.sqlname.toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1);
    links = links.filter((obj) => obj.sqlname.toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1);
    fields = fields.filter((obj) => obj.sqlname.toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1);
    this.setState({
      filtered: {
        "entities": entities,
        "links": links,
        "fields": fields
      }
    });
  }

  _onClick(obj) {
    this.props.clearFilter();
    this.props.metadataLoadDetail(obj, this.props.elements);
  }

  _onChange(row) {
    row.checked = !row.checked;
    console.log(row);
  }

  render() {
    let rows = this.props.rows;
    let filterValue = document.getElementById("metadataFilter")? document.getElementById("metadataFilter").value : "";
    let rowsState = this.state && this.state.filtered && (filterValue && filterValue != "") ? this.state.filtered : rows;
    let entities = rowsState.entities ? rowsState.entities : [];
    let links = rowsState.links ? rowsState.links : [];
    let fields = rowsState.fields ? rowsState.fields : [];
    var entitiesComponents = entities.map((row, index) => {
      return <TableRow key={index}><td><Anchor key={index} onClick={this._onClick.bind(this, {label: row.label, url: row["ref-link"]})}>{row.sqlname}</Anchor></td></TableRow>;
    });
    var linksComponents = links.map((row, index) => {
      return <TableRow key={index}><td><Anchor key={index} onClick={this._onClick.bind(this, {label: row.label, url: row.dest_table["ref-link"]})}>{row.sqlname}</Anchor></td></TableRow>;
    });
    var fieldsComponents = fields.map((row, index) => {
      return <TableRow key={index}><td><CheckBox key={index} id={`checkbox_${row.sqlname}`} checked={row.checked} onChange={this._onChange.bind(this, row)}/>{row.sqlname}</td></TableRow>;
    });
    return (
      <div>
        <Header large={true} flush={false}>
          <input id="metadataFilter" className="sidebarsearch" type="text" placeholder="Search fields and links..." onChange={this._onSearch}/>
        </Header>
        <Table>
          <tbody>
            {entitiesComponents}
            {linksComponents}
            {fieldsComponents}
          </tbody>
        </Table>
      </div>
    );
  }
}

MetaData.propTypes = {
  rows: PropTypes.object.isRequired,
  elements: PropTypes.array.isRequired
};
