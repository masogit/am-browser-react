import React, {PropTypes} from 'react';

import {Box, Form, FormField, CheckBox, Table, Anchor, Map, Icons} from 'grommet';
const {Close, LinkUp: Up, LinkDown: Down, Ascend, Descend, CaretPrevious} = Icons.Base;
import {isEmpty, isEqual} from 'lodash';
import {AlertForm, EditLayer, ContentPlaceHolder, SearchInput, ComponentBase, AMHeader } from '../commons';
import { forSum } from '../../constants/FieldTypes';
import {bodyToMapData} from '../../util/util';
import PDFDesigner from './../reports/PDFDesigner';
import {toggleSidebar, onMail, onDownload} from '../../actions/system';
import {posOrderby} from '../../actions/explorer';

const isValidateView = json => json.name && json.category && json.body;

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
    this.printPdf = this.printPdf.bind(this);
    this.uploadJson = this.uploadJson.bind(this);
    this.state = {
      mainFilter: false,
      alertForm: null
    };
  }

  _onChange(event, value) {
    let eTarget = event.target ? event.target : event;
    let path = eTarget.name; // why not 'event.target.id'? because of radio button.
    let type = eTarget.type;
    let eventValue = eTarget.value;

    if (type == "checkbox") {
      this.props.onValueChange(path.substring(2), value ? eTarget.checked && value || '' : eTarget.checked);
    } else {
      this.props.onValueChange(path.substring(2), eventValue);
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

  _onTripleStateChange(event, value, orderby='') {
    let path = event.currentTarget.name;
    let fields = orderby.split(',');
    let pos = (fields.indexOf(value + ' desc') > -1) ? fields.indexOf(value + ' desc') : fields.indexOf(value);

    if (!_.isEmpty(orderby) && value.indexOf('desc') > -1) {
      pos = _.indexOf(fields, value.substring(0, value.indexOf(' desc')));
      fields.push(value);
    }
    if (pos > -1)
      fields.splice(pos, 1);
    else
      fields.push(value);

    this.props.onValueChange(path.substring(2), fields.filter(field => !(field == '')).join(','));
  }

  _onDefaultStateChange(event, value, orderby, field) {
    if (_.isEmpty(value))
      this._onTripleStateChange(event, field, orderby);
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

  renderTemplateTable(selectedView, root, path, key) {
    let currentPath = root ? "" : path + ".";
    let selfView = selectedView;
    let orderbyArray = selfView.body.orderby ? selfView.body.orderby.split(',') : [];
    // map, then filter out null elements, the index is correct; filter out PK fields, then map, the index is wrong.
    return selfView.body.fields.map((field, index) => {
      let fieldName = field.sqlname;
      const pointIndex = fieldName.lastIndexOf('.');
      if (pointIndex > 0) {
        const link = fieldName.substr(0, pointIndex);
        fieldName = (
          <Box direction='row'>
            <Anchor onClick={this._onClickTableTitle.bind(this, key + '.' + link)} label={link}/>
            {fieldName.substr(pointIndex)}
          </Box>
      );
      }
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
          <td>{fieldName}</td>
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
                      disabled={(!!selfView.body.sum&&selfView.body.sum!=field.sqlname) || !forSum(field) || !selfView.body.groupby}
                      onChange={
                        (event) => {
                          this._onChange(event, field.sqlname);
                        }}/>
          </td>
          <td>
            {(!selfView.body.orderby || _.indexOf(selfView.body.orderby, [""]) > -1 || !_.includes(orderbyArray, field.sqlname)) && !_.includes(orderbyArray, `${field.sqlname} desc`) && !_.includes(orderbyArray, field.sqlname) &&
              <CheckBox id={`v.${currentPath}body.orderby`} name={`v.${currentPath}body.orderby`}
                      value={field.sqlname}
                      checked={!!selfView.body.orderby && _.includes(orderbyArray, field.sqlname)}
                      disabled={!_.isEmpty(selfView.body.orderby) && orderbyArray.length >= 3}
                      onChange={
                        (event) => {
                          this._onTripleStateChange(event, field.sqlname, selfView.body.orderby);
                        }}/>
            }
            {selfView.body.orderby && _.includes(orderbyArray, field.sqlname) &&
              !_.includes(orderbyArray,`${field.sqlname} desc`) &&
            <a name={`v.${currentPath}body.orderby`}
               onClick={
                        (event) => {
                          this._onTripleStateChange(event, `${field.sqlname} desc`, selfView.body.orderby);
                        }}>
              <Ascend size="small"/>
            </a>
            }
            {selfView.body.orderby && _.includes(orderbyArray, `${field.sqlname} desc`) &&
            <a name={`v.${currentPath}body.orderby`}
               onClick={
                        (event) => {
                          this._onDefaultStateChange(event, "", selfView.body.orderby, field.sqlname);
                        }}>
              <Descend size="small"/>
            </a>
            }
            {posOrderby(selfView.body.orderby, field.sqlname)}
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
        <th/>
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

    //const filter = <Anchor icon={<Filter />} reverse={true} label={title.label} onClick={title.onClick}/>;

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
            <td/>
            <td colSpan={8}>
              <textarea id={filter.id} name={filter.name} value={filter.value}
                        placeholder="Input AQL as filter" onChange={filter.onChange}
                        className='textarea'/>
            </td>
          </tr>
          }
          {this.renderTemplateTable(selectedView, root, path, key)}
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
        <EditLayer value={this.props.selectedView.desc}
          label='Description' name='v.desc'
          onClose={this._onClose.bind(this)}
          onConfirm={event => {
            this._onClose();
            this._onChange(event);
          }} />
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

  printPdf(pdfSettings) {
    this.setState({pdfSettings});
    toggleSidebar(false);
  }

  uploadJson(result, closeMenu) {
    let json = JSON.parse(result);
    if (isValidateView(json)) {
      if (json._id)
        json._id = null;

      this.props.setSelectedView('', json);
      this.props.uploadViewSuccess();
      closeMenu();
    } else {
      this.props.uploadViewFailed();
    }
  }

  renderHeader(selectedView, enablePlay) {
    const editMode = !isEqual(selectedView, this.props.originView);
    const buttons = [
      { id: 'Query', onClick: this.props.openPreview, enable: enablePlay },
      {
        id: 'Save',
        onClick: this.openAlert,
        args: 'save',
        enable: selectedView.name && selectedView.category
      },
      { id: 'Delete', onClick: this.openAlert, args: 'delete', enable: selectedView._id }
    ];

    const subMenuButtons = [
      { id: 'Duplicate', onClick: this.openAlert, args: 'duplicate', enable: selectedView._id},
      {
        id: 'Mail', onClick: () => onMail(selectedView, 'View', 'explorer', `Description: ${selectedView.desc}`),
        args: selectedView, enable: selectedView._id, hide: !selectedView._id
      },
      {
        id: 'Download',
        onClick: () => !editMode && onDownload(selectedView, selectedView.name || selectedView.body.sqlname || 'view'),
        args: selectedView,
        enable: selectedView._id && !editMode
      }
    ];

    const uploadProps = {
      enable: !selectedView._id,
      accept: '.json',
      onChange: this.uploadJson
    };

    return <AMHeader title='View Builder' buttons={buttons} subMenuButtons={subMenuButtons} uploadProps={uploadProps}/>;
  }

  render() {
    const {selectedView, onSubmit} = this.props;
    const categories = this.props.categories ? this.props.categories.sort() : [];

    if (isEmpty(selectedView)) {
      toggleSidebar(true);
      return <ContentPlaceHolder/>;
    }

    const {layer, alertForm, pdfSettings} = this.state;

    if (pdfSettings) {
      return <PDFDesigner {...pdfSettings} back={() => this.setState({pdfSettings: null})}/>;
    }

    let table;

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
      <Box flex={true}>
        {this.getLayer(layer)}
        {this.renderHeader(selectedView, table)}
        <Box pad={{horizontal: 'medium'}} direction="row" className='autoScroll'>
          <Box flex={true}>
            {
              selectedView.body.sqlname &&
              <Map vertical={true} className='grid' data={bodyToMapData(selectedView.body)}/>
            }
            <Box pad={{vertical: 'small'}}>{table}</Box>
          </Box>
          <Box pad={{horizontal: 'small', vertical: 'none'}}>
            <Form onSubmit={onSubmit} compact={true}>
              <FormField label="Name">
                <input id="v.name" name="v.name" type="text" onChange={this._onChange}
                       value={selectedView.name}/>
              </FormField>
              <FormField label="Description">
                  <textarea value={selectedView.desc} onClick={() => this.setState({layer: 'description'})}
                            onChange={() => this.setState({layer: 'description'})}/>
              </FormField>
              <FormField label="Category">
                <SearchInput id="v.category" name="v.category" value={selectedView.category}
                             suggestions={categories} onDOMChange={this._onChange}
                             onSelect={this._setCategory}/>
              </FormField>
            </Form>
            <Box pad="small" style={{width: '235px'}}>
              <p>All views under <strong>My Assets</strong> Category will replace Out-Of-Box My Assets module</p>
            </Box>
          </Box>
          {selectedView && selectedView.name && this.getAlertLayer(alertForm, selectedView.name)}
        </Box>
      </Box>
    );
  }
}

ViewDefDetail.propTypes = {
  onValueChange: PropTypes.func.isRequired
};
