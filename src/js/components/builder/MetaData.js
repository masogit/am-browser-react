import React, {PropTypes} from 'react';
import ComponentBase from '../commons/ComponentBase';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import ListItem from 'grommet/components/ListItem';
import SearchInput from 'grommet/components/SearchInput';
import Notes from 'grommet/components/icons/base/Notes';

export default class MetaData extends ComponentBase {

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
    if (!this.acquireLock()) {
      return;
    }
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
    let {filterEntities, schemaToLoad} = this.props;
    let filterValue = document.getElementById("metadataFilter") ? document.getElementById("metadataFilter").value : "";
    let rowsState = this.state && this.state.filtered && (filterValue && filterValue != "") ? this.state.filtered : rows;
    let entities = rowsState.entities ?
      (schemaToLoad ?
        rowsState.entities.filter((obj) => obj.sqlname == schemaToLoad)
          :
        (filterEntities ?
        rowsState.entities.filter((obj) => obj.sqlname.toLowerCase().indexOf(filterEntities.toLowerCase().trim()) !== -1)
        : rowsState.entities)
      )
      : [];
    if(schemaToLoad && entities.length > 0) {
      this.props.metadataLoadDetail({label: entities[0].label, sqlname: entities[0].sqlname, url: entities[0]["ref-link"]}, this.props.elements);
      return null;
    }
    let links = rowsState.links ? rowsState.links : [];
    let fields = rowsState.fields ? rowsState.fields : [];
    // let LinkNext = require('grommet/components/icons/base/LinkNext');
    let entitiesComponents = entities.sort(this._sortSqlName).map((row, index) => {
      return (
        <ListItem separator="none" key={index} pad="none" flex={false}>
          <Anchor href="#" key={index} primary={true} label={row.sqlname}
                  onClick={this._onClick.bind(this, {label: row.label, sqlname: row.sqlname, url: row["ref-link"]})}/>
        </ListItem>
      );
    });
    let linksComponents = links.sort(this._sortSqlName).map((row, index) => {
      let newRow = {
        label: row.label,
        sqlname: row.sqlname,
        url: row.dest_table["ref-link"],
        card11: row.card11,
        src_field: row.src_field,
        dest_field: row.dest_field
      };
      return (
        <ListItem separator="none" key={index} pad="none">
          <Anchor href="#" key={index} primary={true} onClick={this._onClick.bind(this, newRow)} label={row.sqlname}/>
        </ListItem>
      );
    });
    //let fieldsComponents = fields.sort().map((row, index) => {
    //  return <TableRow key={index}><td><CheckBox key={index} id={`checkbox_${row.sqlname}`} checked={row.checked} onChange={this._onChange.bind(this, row)}/><Notes/>{row.sqlname}</td></TableRow>;
    //});
    let fieldsComponents = fields.sort(this._sortSqlName).map((row, index) => {
      return (
        <ListItem separator="none" key={index} pad="none">
          <Anchor href="#" key={index} icon={<Notes />} onClick={this._onChange.bind(this, row)} label={row.sqlname}/>
        </ListItem>
      );
    });
    return (
      <Box flex={true} className='fixMinSizing'>
        <SearchInput id="metadataFilter" placeHolder="Search fields and links..." onDOMChange={this._onSearch}/>
        <Box pad={{vertical: 'small'}} className='fixMinSizing'>
          <Box className='autoScroll'>
          {entitiesComponents}
          {
            entitiesComponents.length == 0 &&
            <Tabs justify="start" flex={true}>
              <Tab title={`Links (${linksComponents.length})`}>
                {linksComponents}
              </Tab>
              <Tab title={`Fields (${fieldsComponents.length})`}>
                {fieldsComponents}
              </Tab>
            </Tabs>
          }
          </Box>
        </Box>
      </Box>
    );
  }
}

MetaData.propTypes = {
  rows: PropTypes.object.isRequired,
  elements: PropTypes.array.isRequired
};
