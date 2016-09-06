import React, {PropTypes} from 'react';
import ComponentBase from '../commons/ComponentBase';
import {Box, Form, FormField, Header, CheckBox, Menu, Table, Anchor, Title, Split, Map} from 'grommet';
import Close from 'grommet/components/icons/base/Close';
import Up from 'grommet/components/icons/base/LinkUp';
import Down from 'grommet/components/icons/base/LinkDown';
import Ascend from 'grommet/components/icons/base/Ascend';
import Descend from 'grommet/components/icons/base/Descend';
import Play from 'grommet/components/icons/base/Play';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import Duplicate from 'grommet/components/icons/base/Duplicate';
import Download from 'grommet/components/icons/base/Download';
import CaretPrevious from 'grommet/components/icons/base/CaretPrevious';
import More from 'grommet/components/icons/base/More';
import Mail from 'grommet/components/icons/base/Mail';
import _ from 'lodash';
import AlertForm from '../../components/commons/AlertForm';
import EditLayer from '../../components/commons/EditLayer';
import ContentPlaceHolder from '../../components/commons/ContentPlaceHolder';
import FieldTypes from '../../constants/FieldTypes';
import {saveAs} from 'file-saver';
import SearchInput from '../commons/SearchInput';
import {bodyToMapData} from '../../util/util';

const _onMail = (view) => {
  if (view._id) {
    let br = "%0D%0A";
    let subject = `AM Browser View: ${view.name}`;
    if (!window.location.origin) {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    }
    let url = window.location.origin + '/explorer/' + view._id;
    let content = `URL: ${url}${br}Description: ${view.desc}`;
    window.open(`mailto:test@example.com?subject=${subject}&body=${content}`, '_self');
  }
};

const _onDownload = (view) => {
  if (view._id) {
    let blob = new Blob([JSON.stringify(view)], {type: "data:application/json;charset=utf-8"});
    saveAs(blob, (view.name || view.body.sqlname || 'view') + ".json");
  }
};

const isNumber = (field) => {
  return FieldTypes.number.indexOf(field.type) > -1 && !field.user_type;
};



export default class ViewDefDetail extends ComponentBase {

  constructor(props) {
    super(props);
    this.renderTemplateTable = this.renderTemplateTable.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.renderLinks = this.renderLinks.bind(this);
    this._onChange = this._onChange.bind(this);
    this.openAlert = this.openAlert.bind(this);
    this.closeAlertForm = this.closeAlertForm.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onDuplicate = this._onDuplicate.bind(this);
    this._onDelete = this._onDelete.bind(this);
    this._setCategory = this._setCategory.bind(this);
    this.state = {
      mainFilter: false,
      alertForm: null
    };
  }

  _onChange(event, value) {
    let path = event.target.name; // why not 'event.target.id'? because of radio button.
    if (event.target.type == "checkbox") {
      this.props.onValueChange(path.substring(2), value ? event.target.checked && value || '' : event.target.checked);
    } else {
      this.props.onValueChange(path.substring(2), event.target.value);
    }
  }

  _onGroupby(event, field, groupby) {
    let path = event.target.name;
    let fields = groupby ? groupby.split('|') : [];
    let pos = fields.indexOf(field);

    if (pos > -1)
      fields.splice(pos, 1);
    else
      fields.push(field);

    this.props.onValueChange(path.substring(2), fields.join('|'));
  }

  _posGroupby(groupby, field) {
    if (groupby && groupby.split('|').indexOf(field) > -1)
      return groupby.split('|').indexOf(field) + 1;
  }

  _setCategory(event) {
    this.props.onValueChange(event.target.name.substring(2), event.suggestion);
  }

  _onTripleStateChange(event, value) {
    let path = event.currentTarget.name;
    this.props.onValueChange(path.substring(2), value);
  }

  openAlert(type) {
    this.setState({
      alertForm: type
    });
  }

  closeAlertForm() {
    this.setState({
      alertForm: null
    });
  }

  _onSubmit() {
    this.props.onSubmit();
    this.closeAlertForm();
  }

  _onDuplicate() {
    this.props.onDuplicateViewDef();
    this.closeAlertForm();
  }

  _onDelete() {
    this.props.onDeleteViewDef();
    this.closeAlertForm();
  }

  hasLinks(links) {
    if (links) {
      for (let i = 0; i < links.length; i++) {
        if (links[i].body.fields && links[i].body.fields.length > 0) {
          return true;
        }
        if (links[i].body.links) {
          return this.hasLinks(links[i].body.links);
        }
      }
    }
    return false;
  }


  renderLinks(links, table, path, key) {
    links = table.body.links.map((link, index) => {
      if (link.body && ((link.body.fields && link.body.fields.length > 0) || this.hasLinks(link.body.links))) {
        let currentPath = path + "." + index;
        const textareaId = `v.${currentPath}.body.filter`;
        const filter = {
          id: textareaId,
          name: `v.${currentPath}.body.filter`,
          value: link.body.filter,
          onChange: this._onChange,
          show: this.state[textareaId]
        };

        const title = {
          label: link.sqlname,
          onClick: () => {
            const temp = {};
            temp[textareaId] = !this.state[textareaId];
            this.setState(temp);
          }
        };
        return this.renderTable(title, filter, link.body.fields && link, false, currentPath, `${key}_${link.sqlname}`);
      }
      return null;
    });
    return links;
  }

  renderTemplateTable(selectedView, root, path) {
    let currentPath = root ? "" : path + ".";
    let selfView = selectedView;
    // map, then filter out null elements, the index is correct; filter out PK fields, then map, the index is wrong.
    return selfView.body.fields.map((field, index) => {
      return (
        <tr id={`${currentPath}_${selfView.body.sqlname}_${field.sqlname}_${index}_row`}
            key={`${currentPath}_${selfView.body.sqlname}_${field.sqlname}_${index}_row`}>
          <td>
            {index == 0 &&
            <Up className='icon-empty2'/>
            }
            {index != 0 &&
            <a id={`${currentPath}body.fields.${index}.up`} name={`${currentPath}body.fields.${index}`}
               onClick={this.props.onMoveRowUp}><Up size="small" style={{color: "#666"}}/></a>
            }
            {index != selfView.body.fields.length - 1 &&
            <a id={`${currentPath}body.fields.${index}.down`} name={`${currentPath}body.fields.${index}`}
               onClick={this.props.onMoveRowDown}><Down size="small" type="status" style={{color: "#666"}}/></a>
            }
          </td>
          <td>{field.sqlname}</td>
          <td>
            <input id={`v.${currentPath}body.fields.${index}.alias`}
                   name={`v.${currentPath}body.fields.${index}.alias`}
                   type="text"
                   placeholder="Add alias here..."
                   value={field.alias}
                   onChange={this._onChange}
                   style={{display: 'inline-block',margin: 0,padding: 0,outline: 0,borderWidth: 0,borderStyle: 'hidden'}}
            />
          </td>
          <td>
            <CheckBox id={`v.${currentPath}body.fields.${index}.searchable`} value={field.sqlname}
                      name={`v.${currentPath}body.fields.${index}.searchable`} checked={field.searchable}
                      disabled={(selfView.body.fields.filter(field => field.searchable == true).length >= 2) && !field.searchable}
                      onChange={this._onChange}/>
          </td>
          <td>
            <CheckBox id={`v.${currentPath}body.groupby`} name={`v.${currentPath}body.groupby`}
                      value={field.sqlname} checked={this._posGroupby(selfView.body.groupby, field.sqlname) > 0}
                      onChange={
                        (event) => {
                          this._onGroupby(event, field.sqlname, selfView.body.groupby);
                        }}/>
            {this._posGroupby(selfView.body.groupby, field.sqlname)}
          </td>
          <td>
            <CheckBox id={`v.${currentPath}body.sum`} name={`v.${currentPath}body.sum`}
                      value={field.sqlname} checked={selfView.body.sum==field.sqlname}
                      disabled={(!!selfView.body.sum&&selfView.body.sum!=field.sqlname) || !isNumber(field) || !selfView.body.groupby}
                      onChange={
                        (event) => {
                          this._onChange(event, field.sqlname);
                        }}/>
          </td>
          <td>
            {(!selfView.body.orderby || selfView.body.orderby.trim() == "" || !_.startsWith(selfView.body.orderby, field.sqlname)) &&
            <CheckBox id={`v.${currentPath}body.orderby`} name={`v.${currentPath}body.orderby`}
                      value={field.sqlname}
                      checked={!!selfView.body.orderby && _.startsWith(selfView.body.orderby, field.sqlname)}
                      disabled={!!selfView.body.orderby && !_.startsWith(selfView.body.orderby, field.sqlname)}
                      onChange={
                        (event) => {
                          this._onTripleStateChange(event, field.sqlname);
                        }}/>
            }
            {selfView.body.orderby && selfView.body.orderby == field.sqlname &&
            <a name={`v.${currentPath}body.orderby`}
               onClick={
                        (event) => {
                          this._onTripleStateChange(event, `${field.sqlname} desc`);
                        }}>
              <Ascend size="small"/>
            </a>
            }
            {selfView.body.orderby && selfView.body.orderby == `${field.sqlname} desc` &&
            <a name={`v.${currentPath}body.orderby`}
               onClick={
                        (event) => {
                          this._onTripleStateChange(event, "");
                        }}>
              <Descend size="small"/>
            </a>
            }
          </td>
          <td>
            <a id={`${currentPath}body.fields.${index}.del`} name={`${currentPath}body.fields.${index}`}
               onClick={this.props.onDeleteTableRow}><Close /></a>
          </td>
        </tr>
      );
    }).filter(field => field != null);
  }

  renderTable(title, filter, selectedView, root, path, key) {
    const header = (
      <thead>
      <tr>
        <th></th>
        <th>Field</th>
        <th>Alias</th>
        <th>Search</th>
        <th>Group</th>
        <th>Sum</th>
        <th>Order</th>
        <th>Del</th>
      </tr>
      </thead>
    );

    //TODO: fix the onClick issue, so we can use an icon to toggle the textarea
    filter.show = true;

    //const filter = <Anchor icon={<Filter />} className='fontNormal' reverse={true} label={title.label} onClick={title.onClick}/>;

    const currentPath = root ? "" : path + ".";
    const tableLayer = currentPath.length / 10;
    const style = {
      marginLeft: 20 * tableLayer + 'px'
    };

    return (
      <Box className='table' key={key} style={style} flex={false}>
        <Anchor icon={<CaretPrevious />} onClick={this._onClickTableTitle.bind(this, key)} label={title.label}/>
        <Table>
          {header}
          <tbody>
          {filter.show &&
          <tr>
            <td></td>
            <td colSpan={8}>
              <textarea id={filter.id} name={filter.name} value={filter.value}
                        placeholder="Input AQL as filter" onChange={filter.onChange}
                        className='textarea'/>
            </td>
          </tr>
          }
          {this.renderTemplateTable(selectedView, root, path)}
          </tbody>
        </Table>
        {selectedView.body.links && selectedView.body.links.length > 0 && this.renderLinks([], selectedView, currentPath + "body.links", key)}
      </Box>
    );
  }

  _onClickTableTitle(nameList) {
    this.props.onClickTableTitle(nameList.split('.'));
  }

  _onClose() {
    this.setState({
      layer: null
    });
  }

  getLayer(type) {
    if (type == 'description') {
      return (
        <EditLayer
          onChange={this._onChange.bind(this)}
          value={this.props.selectedView.desc}
          label='Description' name='v.desc'
          onClose={this._onClose.bind(this)} />
      );
    }
  }

  getAlertLayer(type, viewName) {
    let title, onConfirm;
    switch (type) {
      case 'save': {
        title = `Save '${viewName}'?`;
        onConfirm = this._onSubmit;
        break;
      }
      case 'duplicate': {
        title = `Duplicate view definition '${viewName}'?"`;
        onConfirm = this._onDuplicate;
        break;
      }
      case 'delete': {
        title = `You're about to delete '${viewName}', continue?`;
        onConfirm = this._onDelete;
        break;
      }
    }

    return title && <AlertForm onClose={this.closeAlertForm} title={title} onConfirm={onConfirm}/>;
  }

  render() {
    let {selectedView} = this.props;

    let p = "input", table;

    if (selectedView && selectedView.body && (selectedView.body.fields.length > 0 || selectedView.body.links.length > 0)) {
      const title = {
        label: selectedView.body.label && `${selectedView.body.label} (${selectedView.body.sqlname})`,
        onClick: () => this.setState({mainFilter: !this.state.mainFilter})
      };

      const filter = {
        id: 'v.body.filter',
        name: 'v.body.filter',
        value: selectedView.body.filter,
        onChange: this._onChange,
        show: this.state.mainFilter
      };

      table = this.renderTable(title, filter, selectedView, true, '', selectedView.body.sqlname);
    }

    return (
      !_.isEmpty(selectedView) ?
        <Box flex={true}>
          {this.getLayer(this.state.layer)}
          <Header justify="between" pad={{horizontal: 'medium'}}>
            <Title>View Builder</Title>
            <Menu direction="row" align="center" responsive={true}>
              <Anchor icon={<Play />} onClick={() => table && this.props.openPreview()} label="Query" disabled={!table}/>
              <Anchor icon={<Checkmark />}
                      onClick={() => selectedView.name && selectedView.category && this.openAlert("save")} label="Save"
                      disabled={!selectedView.name || !selectedView.category}/>
              <Anchor icon={<Close />} onClick={() => selectedView._id && this.openAlert("delete")} label="Delete"
                      disabled={!selectedView._id}/>
              <Menu icon={<More />} dropAlign={{ right: 'right', top: 'top' }}>
                <Anchor link="#" icon={<Duplicate />} onClick={() => selectedView._id && this.openAlert("duplicate")}
                        label="Duplicate"
                        disabled={!selectedView._id}/>
                {selectedView._id &&
                <Anchor icon={<Mail />} onClick={() => _onMail(selectedView)} label="Mail"
                        disabled={!selectedView._id}/>}
                <Anchor icon={<Download />} onClick={() => _onDownload(selectedView)} label="Download"
                        disabled={!selectedView._id}/>
              </Menu>
            </Menu>
            {/* upload form
             <form method="post" encType="multipart/form-data" action="http://localhost:8080/coll/view">
             <input type="hidden" name="_csrf" value={cookies.get('csrf-token')}/>
             <input type="file" name="docFile" accept=".json" />
             <input type="submit" />
             </form>
             */}
          </Header>
          <Box className='hiddenScroll fixIEScrollBar' pad={{horizontal: 'medium'}}>
            <Split flex="left" fixed={false} className='fixMinSizing'>
              <Box flex={true}>
                {
                  selectedView.body.sqlname && <Map vertical={true} data={bodyToMapData(selectedView.body)} />
                }
                <Box className='autoScroll'>
                {table}
                </Box>
              </Box>
              <Box pad={table ? 'small' : 'none'}>
                <Form onSubmit={this.props.onSubmit} compact={this.props.compact}>
                  <FormField label="Name" htmlFor={p + "item1"}>
                    <input id="v.name" name="v.name" type="text" onChange={this._onChange}
                           value={selectedView.name}/>
                  </FormField>
                  <FormField label="Description">
                    <textarea value={selectedView.desc} onClick={() => this.setState({layer: 'description'})}
                              onChange={() => this.setState({layer: 'description'})}/>
                  </FormField>
                  <FormField label="Category" htmlFor={p + "item3"}>
                    <SearchInput id="v.category" name="v.category" value={selectedView.category}
                                 suggestions={this.props.categories} onDOMChange={this._onChange}
                                 onSelect={this._setCategory}/>
                  </FormField>
                </Form>
              </Box>
              {selectedView && selectedView.name && this.getAlertLayer(this.state.alertForm, selectedView.name)}
            </Split>
          </Box>
        </Box>
        : <ContentPlaceHolder/>
    );
  }
}

ViewDefDetail.propTypes = {
  onValueChange: PropTypes.func.isRequired
};
