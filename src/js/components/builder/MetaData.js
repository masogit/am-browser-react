import React from 'react';
import ComponentBase from '../commons/ComponentBase';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import ListItem from 'grommet/components/ListItem';
import SearchInput from 'grommet/components/SearchInput';
import Notes from 'grommet/components/icons/base/Notes';
import Spinning from 'grommet/components/icons/Spinning';

import {metadataLoadDetail, metadataLoad} from '../../actions/system';
import {syncSelectedView} from '../../actions/views';
import _ from 'lodash';
import {connect} from 'react-redux';

const createReverse = (reverse) => {
  var obj = {
    sqlname: reverse.sqlname,
    label: reverse.label,
    src_field: reverse.src_field,
    dest_field: reverse.dest_field,
    body: {
      sqlname: reverse.body_sqlname,
      label: reverse.body_label,
      fields: [],
      links: []
    }
  };
  return obj;
};

const generateFieldsLinks = (body, elements, row) => {
  // initialize variable sqlname
  var sqlname = "";
  // check current row if it is one2one link
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    sqlname += ((i == 0) ? "" : ".") + element.sqlname;
    if (!element.card11) {
      if (!body.links) {
        body.links = [];
      }
      var filterLinks = body.links.filter(link => link.sqlname == sqlname);
      var link = {};
      var isLinkNotExisted = filterLinks && filterLinks.length == 0;
      // check loop one2many link if exists in current links array
      if (isLinkNotExisted) {
        // create a new link with body
        var reverse = _.cloneDeep(element);
        // set reverse sqlname
        reverse.sqlname = sqlname;
        // set relative_path
        var position = sqlname.lastIndexOf(".");
        var prefix = "";
        if (position != -1) {
          prefix = sqlname.substring(0, position);
        }
        reverse.src_field.relative_path = prefix;
        // create a reverse link
        link = createReverse(reverse);
      } else {
        // get first match
        link = filterLinks[0];
      }
      // generate fields
      if (i == elements.length - 1) {
        if (!link.body.fields) {
          link.body.fields = [];
        }
        link.body.fields.push(row);
      } else {
        generateFieldsLinks(link.body, elements.slice(i + 1), row);
      }
      // push new link to links
      if (isLinkNotExisted) {
        body.links.push(link);
      }
      // one2many links will break the loop
      break;
    } else {
      // one2one links will be pushed into body fields
      if (i == elements.length - 1) {
        if (!body.fields) {
          body.fields = [];
        }
        var newRow = _.cloneDeep(row);
        newRow.sqlname = sqlname + "." + row.sqlname;
        var filterFields = body.fields.filter(field => field.sqlname == newRow.sqlname);
        // current field can only be pushed once
        if (filterFields && filterFields.length == 0) {
          body.fields.push(newRow);
        } else {
          console.log("Current one2one field exists on table:" + body.sqlname);
        }
      }
    }
  }
};

const updateView = (elements, row, selectedView) => {
  // temp logic only for function works
  // will refactor later
  var clonedView = _.cloneDeep(selectedView);

  var body = clonedView.body;
  var elemLength = elements.length;
  // 1) create a new view: body.sqlname is empty
  // 2) update an existed view: body.sqlname should be equal to root table
  if (elemLength > 0 && (!body.sqlname || body.sqlname == elements[0].sqlname)) {
    // new a view
    if (!body.sqlname) {
      body.sqlname = elements[0].sqlname;
      body.label = elements[0].label;
      console.log("Created a new by sqlname:" + body.sqlname);
    }
    // fields
    if (elemLength == 1) {
      // check first level fields if exists
      if (!body.fields) {
        body.fields = [];
      }
      var filterFields = body.fields.filter(field => field.sqlname == row.sqlname);
      // current field can only be pushed once
      if (filterFields && filterFields.length == 0) {
        body.fields.push(row);
      } else {
        console.log("Current field exists on table:" + body.sqlname);
      }
    } else {
      // for loop to generate links
      generateFieldsLinks(body, elements.slice(1), row);
    }
  }
  return clonedView;
};

const sortSqlName = (a, b) => {
  var nameA = a.sqlname.toLowerCase();
  var nameB = b.sqlname.toLowerCase();
  if (nameA < nameB) //sort string ascending
    return -1;
  if (nameA > nameB)
    return 1;
  return 0; //default return value (no sorting)
};

const findItem = (links, name) => {
  return links.filter((row) => {
    if (row.sqlname == name) {
      return {
        label: row.label,
        sqlname: row.sqlname,
        url: row.dest_table["ref-link"],
        card11: row.card11,
        src_field: row.src_field,
        dest_field: row.dest_field
      };
    }
  });
};

export default class MetaData extends ComponentBase {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    this.state = {
      searchText: '',
      schemaToLoad: '',
      elements: []
    };
    this.loading = '';
  }

  componentWillMount() {
    this.getAllRows().then(() => {
      this.setState({
        schemaToLoad: this.props.schemaToLoad,
        elements: this.props.elements
      });
    });
  }

  getAllRows() {
    if (!this.getAllRowsPromise) {
      this.loading += 'getAllRows';
      this.getAllRowsPromise = metadataLoad().then((rows) => {
        this.loading = this.loading.replace('getAllRows', '');
        this.allRows = rows;
        this.props.updateData(undefined, rows);
      });
    }
    return this.getAllRowsPromise;
  }

  _onSearch(event) {
    let rows = this.props.rows;
    const searchText = event.target.value.toLowerCase().trim();

    const filter = (obj) => obj.sqlname.toLowerCase().indexOf(searchText) !== -1;
    const entities = rows.entities ? rows.entities.filter(filter) : [];
    const links = rows.links ? rows.links.filter(filter) : [];
    const fields = rows.fields ? rows.fields.filter(filter) : [];

    this.setState({
      filtered: {entities, links, fields}, searchText
    });
  }

  _onClick(obj) {
    if (!this.acquireLock()) {
      return;
    }
    this.props.clearFilter();
    this.metadataLoadDetail(obj, this.props.elements);
  }

  metadataLoadDetail(obj, eles, callback) {
    metadataLoadDetail(obj, eles).then(({rows, elements}) => {
      if (rows.sqlname != this.state.schemaToLoad || eles.length == 0) {
        eles = elements;
      }
      this.props.updateData(eles, rows);
    });
  }

  _onChange(obj) {
    this.props.dispatch(syncSelectedView(updateView(this.props.elements, obj, this.props.selectedView)));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.linkNames.join('') != this.props.linkNames.join('')) {
      const diff = nextProps.elements.filter((element, index) => element.sqlname != nextProps.linkNames[index]);
      if (nextProps.elements.length == 0 || diff.length > 0) {
        this.generateSidebar(nextProps.linkNames);
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !nextProps.rows.sqlname || nextProps.rows.sqlname != this.props.rows.sqlname || this.state.searchText != nextState.searchText;
  }

  linkSort(links) {
    return links.sort(this._sortSqlName).map((row, index) => {
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
  }

  updateState(elements) {
    this.loading = this.loading.replace('generateSidebar', '');
    this.setState({
      schemaToLoad: elements.length > 1 ? elements[elements.length - 1].dest_table.sqlname : elements[0].sqlname,
      elements: elements
    });
  }

  getLink(nameList, links, bread) {
    let items = findItem(links, nameList[0]);
    if (items.length > 0) {
      let parent = items[0];
      parent.url = parent.dest_table["ref-link"];
      bread.push(parent);

      if (nameList.length > 1) {
        metadataLoadDetail({
          label: parent.label,
          sqlname: parent.sqlname,
          url: parent.dest_table["ref-link"]
        }, bread).then(({rows}) => {
          this.getLink(nameList.slice(1), rows.links, bread);
        });
      } else {
        this.updateState(bread);
      }
    }
  }

  generateSidebar(linkNameList) {
    const linkNames = [];
    if (linkNameList) {
      linkNameList.forEach(name => linkNames.push(...name.split('_')));
    }

    if (linkNames && linkNames.length > 0 && linkNames.join('_') != this.schemaName) {
      this.loading += 'generateSidebar';
      this.schemaName = linkNameList.join('&');
      this.getAllRows().then(() => {
        const root = this.allRows.entities.filter(obj => linkNames[0] == obj.sqlname)[0];
        let bread, links = [];

        metadataLoadDetail({
          label: root.label,
          sqlname: root.sqlname,
          url: root["ref-link"]
        }, []).then(({rows, elements}) => {
          bread = elements;
          links = rows.links;

          if (linkNames.length > 1) {
            this.getLink(linkNames.slice(1), links, bread);
          } else {
            this.updateState(bread);
          }
        });
      });
    }
  }

  render() {
    if (this.loading) {
      return <Spinning />;
    }

    let {filterEntities, rows} = this.props;
    const elements = this.state.elements;
    const schemaToLoad = this.state.schemaToLoad;

    let rowsState = this.state.searchText && this.state.filtered ? this.state.filtered : rows;

    let entities = [];
    if (rowsState.entities) {
      if (schemaToLoad) {
        entities = rowsState.entities.filter((obj) => obj.sqlname == schemaToLoad);
        if (entities.length > 0) {
          this.metadataLoadDetail({
            label: entities[0].label,
            sqlname: entities[0].sqlname,
            url: entities[0]["ref-link"]
          }, elements);
          return null;
        }
      } else if (filterEntities) {
        entities = rowsState.entities.filter((obj) => obj.sqlname.toLowerCase().indexOf(filterEntities.toLowerCase().trim()) !== -1);
      } else {
        entities = rowsState.entities;
      }
    }

    let links = rowsState.links ? rowsState.links : [];
    let fields = rowsState.fields ? rowsState.fields : [];
    // let LinkNext = require('grommet/components/icons/base/LinkNext');
    let entitiesComponents = entities.sort(sortSqlName).map((row, index) => {
      return (
        <ListItem separator="none" key={index} pad="none" flex={false}>
          <Anchor href="#" key={index} primary={true} label={row.sqlname}
                  onClick={this._onClick.bind(this, {label: row.label, sqlname: row.sqlname, url: row["ref-link"]})}/>
        </ListItem>
      );
    });
    //
    let linksComponents = this.linkSort(links.filter((obj) => obj.card11 == true));
    let m2mLinksComponents = this.linkSort(links.filter((obj) => obj.card11 != true));
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
      <Box flex={true} className='fixMinSizing fixIEScrollBar'>
        <SearchInput value={this.state.searchText} placeHolder="Search fields and links..."
                     onDOMChange={this._onSearch}/>
        <Box pad={{vertical: 'small'}} className='fixMinSizing autoScroll'>
          {entitiesComponents}
          {entitiesComponents.length == 0 && !rows.entities &&
            <Tabs justify="start" flex={true}>
              <Tab title={`1-M Links (${m2mLinksComponents.length})`}>
                {m2mLinksComponents}
              </Tab>
              <Tab title={`1-1 Links (${linksComponents.length})`}>
                {linksComponents}
              </Tab>
              <Tab title={`Fields (${fieldsComponents.length})`}>
                {fieldsComponents}
              </Tab>
            </Tabs>
          }
        </Box>
      </Box>
    );
  }
}

let select = (state, props) => {
  return {
    selectedView: state.views.selectedView
  };
};

export default connect(select)(MetaData);
