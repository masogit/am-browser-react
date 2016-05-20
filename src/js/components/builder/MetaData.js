import React, {Component, PropTypes} from 'react';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import SearchInput from 'grommet/components/SearchInput';

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
        entities: entities,
        links: links,
        fields: fields
      }
    });
  }

  _onClick(obj) {
    this.props.clearFilter();
    this.props.metadataLoadDetail(obj, this.props.elements);
  }

  _onChange(obj) {
    this.props.syncSelectedView(this.props.elements, obj);
  }

  _sortSqlName(a, b) {
    var nameA = a.sqlname.toLowerCase();
    var nameB = b.sqlname.toLowerCase();
    if (nameA < nameB) //sort string ascending
      return -1;
    if (nameA > nameB)
      return 1;
    return 0; //default return value (no sorting)
  }

  render() {
    let rows = this.props.rows;
    let filterEntities = this.props.filterEntities;
    let filterValue = document.getElementById("metadataFilter") ? document.getElementById("metadataFilter").value : "";
    let rowsState = this.state && this.state.filtered && (filterValue && filterValue != "") ? this.state.filtered : rows;
    let entities = rowsState.entities ? ((filterEntities ? rowsState.entities.filter((obj) => obj.sqlname.toLowerCase().indexOf(filterEntities.toLowerCase().trim()) !== -1) : rowsState.entities)) : [];
    let links = rowsState.links ? rowsState.links : [];
    let fields = rowsState.fields ? rowsState.fields : [];
    // let LinkNext = require('grommet/components/icons/base/LinkNext');
    let Notes = require('grommet/components/icons/base/Notes');
    let entitiesComponents = entities.sort(this._sortSqlName).map((row, index) => {
      return (
        <TableRow key={index}>
          <td><Anchor href="#" key={index} primary={true} label={row.sqlname}
                      onClick={this._onClick.bind(this, {label: row.label, sqlname: row.sqlname, url: row["ref-link"]})}/>
          </td>
        </TableRow>
      );
    });
    let linksComponents = links.sort(this._sortSqlName).map((row, index) => {
      let newRow = {
        label: row.label,
        sqlname: row.sqlname,
        url: row.dest_table["ref-link"],
        card11: row.card11,
        reverse: row.reverse,
        reversefield: row.src_field.sqlname
      };
      return (
        <TableRow key={index}>
          <td><Anchor href="#" key={index} primary={true} onClick={this._onClick.bind(this, newRow)} label={row.sqlname}/>
          </td>
        </TableRow>
      );
    });
    //let fieldsComponents = fields.sort().map((row, index) => {
    //  return <TableRow key={index}><td><CheckBox key={index} id={`checkbox_${row.sqlname}`} checked={row.checked} onChange={this._onChange.bind(this, row)}/><Notes/>{row.sqlname}</td></TableRow>;
    //});
    let fieldsComponents = fields.sort(this._sortSqlName).map((row, index) => {
      return (
        <TableRow key={index}>
          <td><Anchor href="#" key={index} icon={<Notes />} onClick={this._onChange.bind(this, row)} label={row.sqlname}/>
          </td>
        </TableRow>
      );
    });
    return (
      <Box full="horizontal">
        <SearchInput id="metadataFilter" placeHolder="Search fields and links..." onDOMChange={this._onSearch}/>
        <Table>
          <tbody>
          {entitiesComponents}
          {linksComponents}
          {fieldsComponents}
          </tbody>
        </Table>
      </Box>
    );
  }
}

MetaData.propTypes = {
  rows: PropTypes.object.isRequired,
  elements: PropTypes.array.isRequired
};
