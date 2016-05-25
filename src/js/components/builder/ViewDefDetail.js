import React, { Component, PropTypes } from 'react';
//import { connect } from 'react-redux';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
//import Sidebar from 'grommet/components/Sidebar';
import { Box, Form, FormFields, FormField, Header, CheckBox, Menu, Table, Anchor, Title } from 'grommet';
//import Button from 'grommet/components/Button';
//import Add from 'grommet/components/icons/base/Add';
import Close from 'grommet/components/icons/base/Close';
import Play from 'grommet/components/icons/base/Play';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import Duplicate from 'grommet/components/icons/base/Duplicate';
//import MDSave from 'react-icons/lib/md/save';
import _ from 'lodash';
//import InlineEdit from 'react-inline-edit';
//import store from '../../store';
//import { setSelectedView, loadTemplateTable } from '../../actions/views';
//import GrommetTableTest from '../GrommetTable';
import AlertForm from '../../components/commons/AlertForm';

export default class ViewDefDetail extends Component {

  constructor(props) {
    super(props);
    this.renderTemplateTable = this.renderTemplateTable.bind(this);
    this.renderLinks = this.renderLinks.bind(this);
    this.renderMasterHeader = this.renderMasterHeader.bind(this);
    this._onChange = this._onChange.bind(this);
  }

  componentWillMount() {
  }

  componentDidMount() {
    //console.log("ViewDefDetail - componentDidMount()");
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  _onChange(event) {
    let path = event.target.name; // why not 'event.target.id'? because of radio button.
    if (event.target.type == "checkbox") {
      this.props.onValueChange(path.substring(2), event.target.checked ? true : false);
    } else {
      this.props.onValueChange(path.substring(2), event.target.value);
    }
  }

  hasLinks(links) {
    if (links) {
      for (let i = 0; i < links.length; i++) {
        if (links[i].body.fields && links[i].body.fields.length > 0) {
          return true;
        }
        if (links[i].body.links) {
          return hasLinks(links[i].body.links);
        }
      }
    }
    return false;
  }

  renderLinks(links, table, path) {
    let selfTable = table;
    links = selfTable.body.links.map((link, index) => {
      if (link.body && ((link.body.fields && link.body.fields.length > 0) || this.hasLinks(link.body.links))) {
        let currentPath = path + "." + index;
        return (
          <tr key={"link_" + link.sqlname + "_" + index}>
            <td colSpan={4}>
              <Header size="small">
                <h3>{link.sqlname}</h3>
              </Header>

              <Header size="small">
                <Box direction="row">
                  <FormField label="Filter" htmlFor={`v.${currentPath}.body.filter`}>
                    <input id={`v.${currentPath}.body.filter`} name={`v.${currentPath}.body.filter`} type="text"
                           onChange={this._onChange}
                           value={link.body.filter} placeholder="Filter" className="header-form-field"/>
                  </FormField>
                  <FormField label="Order by" htmlFor={`v.${currentPath}.body.orderby`}>
                    <input id={`v.${currentPath}.body.orderby`} name={`v.${currentPath}.body.orderby`} type="text"
                           onChange={this._onChange}
                           value={link.body.orderby} placeholder="Order by" className="header-form-field"/>
                  </FormField>
                  <FormField label="Group by" htmlFor={`v.${currentPath}.body.count`}>
                    <input id={`v.${currentPath}.body.groupby`} name={`v.${currentPath}.body.groupby`} type="text"
                           onChange={this._onChange}
                           value={link.body.groupby} placeholder="Group by" className="header-form-field"/>
                  </FormField>
                  <FormField label="Sum" htmlFor={`v.${currentPath}.body.sum`}>
                    <input id={`v.${currentPath}.body.sum`} name={`v.${currentPath}.body.sum`} type="text"
                           onChange={this._onChange}
                           value={link.body.sum} placeholder="Sum" className="header-form-field"/>
                  </FormField>
                </Box>
              </Header>
              <table key={"table_" + link.sqlname}>
                <tbody>
                <tr>
                  <th>Field</th>
                  <th>Alias</th>
                  <th></th>
                </tr>
                {link.body && link.body.fields && this.renderTemplateTable(link, false, currentPath)}
                </tbody>
              </table>
            </td>
          </tr>
        );
      }
      return null;
    });
    return links;
  }

  renderTemplateTable(selectedView, root, path) {
    let currentPath = root ? "" : path + ".";
    let selfView = selectedView;
    // map, then filter out null elements, the index is correct; filter out PK fields, then map, the index is wrong.
    let fields = selfView.body.fields.map((field, index) => {
      return (
        !field.PK ?
          <tr id={`${currentPath}_${selfView.body.sqlname}_${field.sqlname}_${index}_row`}
              key={`${currentPath}_${selfView.body.sqlname}_${field.sqlname}_${index}_row`}
              onMouseOver={() => {
                document.getElementById(`${currentPath}body.fields.${index}.del`).style.display = "inline-block";
              }}
              onMouseOut={() => {
                document.getElementById(`${currentPath}body.fields.${index}.del`).style.display = "none";
              }}>
            <td style={{width: "35%"}}>{field.sqlname}</td>
            <td style={{width: "35%"}}>
              <input id={"v." + currentPath + "body.fields." + index + ".alias"}
                     name={`v.${currentPath}body.fields.${index}.alias`}
                     type="text"
                     placeholder="Add alias here..."
                     value={field.alias}
                     onChange={this._onChange}
                     style={{display: 'inline-block',margin: 0,padding: 0,outline: 0,borderWidth: 1,borderStyle: 'hidden'}}
                />
            </td>

            {root &&
            <td>
              <CheckBox id={`v.${currentPath}body.fields.${index}.searchable`}
                        name={`v.${currentPath}body.fields.${index}.searchable`} checked={field.searchable}
                        disabled={ (selfView.body.fields.filter(field => field.searchable == true).length >= 2) && !field.searchable }
                        onChange={this._onChange}/></td>}
            <td><a id={`${currentPath}body.fields.${index}.del`} name={`${currentPath}body.fields.${index}`}
                   style={{display: "none"}}
                   onClick={this.props.onDeleteTableRow}><Close /></a></td>
          </tr>
          : null
      );
    }).filter(field => field != null);
    let links = [];
    if (selfView.body.links && selfView.body.links.length > 0) {
      //console.log("selfView.body.links.length" + selfView.body.links.length);
      links = this.renderLinks(links, selfView, currentPath + "body.links");
    }
    return fields.concat(links);
  }

  renderMasterHeader(selectedView) {
    return (
      <Header size="small">
        <h3>{selectedView.body.label} ({selectedView.body.sqlname})</h3>
      </Header>
    );
  }

  renderMasterHeaderConditions(selectedView) {
    //let conditionsPath = "v.body.conditions".replace(/\./g, "_");
    return (
      <Header size="small">
        <Box direction="row">
          <FormField label="Filter" htmlFor="v.body.filter">
            <input id="v.body.filter" name="v.body.filter" type="text" onChange={this._onChange}
                   value={selectedView.body.filter} placeholder="Add filter here..." className="header-form-field"/>
          </FormField>
          <FormField label="Order by" htmlFor="v.body.orderby">
            <input id="v.body.orderby" name="v.body.orderby" type="text" onChange={this._onChange}
                   value={selectedView.body.orderby} placeholder="Add filter here..." className="header-form-field"/>
          </FormField>
          <FormField label="Group by" htmlFor="v.body.groupby">
            <input id={`v.body.groupby`} name={`v.body.groupby`} type="text"
                   onChange={this._onChange}
                   value={selectedView.body.groupby} placeholder="Group by" className="header-form-field"/>
          </FormField>
          <FormField label="Sum" htmlFor="v.body.sum">
            <input id={`v.body.sum`} name={`v.body.sum`} type="text"
                   onChange={this._onChange}
                   value={selectedView.body.sum} placeholder="Sum" className="header-form-field"/>
          </FormField>
        </Box>
      </Header>
    );
  }

  render() {
    let { selectedView, closeAlertForm, onDeleteViewDef, onSaveSuccess } = this.props;
    let alertForms = selectedView ? {
      save: <AlertForm onClose={closeAlertForm}
                       title={"Save view definition"}
                       desc={"'" + selectedView.name + "' saved successfully."}
                       onConfirm={onSaveSuccess}/>,
      duplicate: <AlertForm onClose={closeAlertForm}
                            title={"Duplicate view definition"}
                            desc={"View definition duplicated as '" + selectedView.name + "'."}
                            onConfirm={closeAlertForm}/>,
      delete: <AlertForm onClose={closeAlertForm}
                         title={'Delete view definition'}
                         desc={"You're about to delete '" + selectedView.name + "', continue?"}
                         onConfirm={onDeleteViewDef}/>
    } : {};

    //console.log("alertForms[this.props.alertForm]:");
    //console.log(this.props.alertForm);
    let p = "input";
    let tableHeader = (
      <tr>
        <th>Field</th>
        <th>Alias</th>
        <th>Search</th>
        <th></th>
      </tr>
    );

    return (
      <Box>
        <Header justify="between" size="small" pad={{'horizontal': 'small'}}>
          <Title>Builder</Title>
          <Menu direction="row" align="center" responsive={false}>
            <Anchor link="#" icon={<Checkmark />} onClick={this.props.onSubmit}>Save</Anchor>
            <Anchor link="#" icon={<Duplicate />} onClick={this.props.onDuplicateViewDef}>Duplicate</Anchor>
            <Anchor link="#" icon={<Close />} onClick={this.props.deleteViewDef}>Delete</Anchor>
            <Anchor link="#" icon={<Play />} onClick={this.props.openPreview}>Query</Anchor>
          </Menu>
        </Header>

        <div style={{display: "flex"}}>
          {selectedView && !_.isEmpty(selectedView) &&
          <div style={{width: "75%"}}>
            <Box>
              {selectedView.body && selectedView.body.fields && this.renderMasterHeader(selectedView)}
              {selectedView.body && selectedView.body.fields && this.renderMasterHeaderConditions(selectedView)}
              <Table>
                <tbody>
                {tableHeader}
                {selectedView.body && selectedView.body.fields && this.renderTemplateTable(selectedView, true)}
                </tbody>
              </Table>
            </Box>
          </div>
          }

          {selectedView && !_.isEmpty(selectedView) &&
          <div>
            <Box pad="small">
              <Form onSubmit={this.props.onSubmit} compact={this.props.compact}>
                <FormFields>
                  <fieldset>
                    <FormField label="Name" htmlFor={p + "item1"}>
                      <input id="v.name" name="v.name" type="text" onChange={this._onChange}
                             value={selectedView.name}/>
                    </FormField>
                    <FormField label="Description" htmlFor={p + "item2"}>
                    <textarea id="v.desc" name="v.desc" value={selectedView.desc}
                              onChange={this._onChange}></textarea>
                    </FormField>
                    <FormField label="Category" htmlFor={p + "item3"}>
                      <input id="v.category" name="v.category" type="text" onChange={this._onChange}
                             value={selectedView.category}/>
                    </FormField>
                  </fieldset>
                </FormFields>
              </Form>
            </Box>
          </div>
          }
          {alertForms[this.props.alertForm]}
        </div>
      </Box>
    );
  }
}

ViewDefDetail.propTypes = {
  onValueChange: PropTypes.func.isRequired
};
