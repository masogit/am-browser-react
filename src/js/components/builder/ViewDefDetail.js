import React, {Component, PropTypes} from 'react';
import {Box, Form, FormField, Header, CheckBox, Menu, Table, Anchor, Title, Split} from 'grommet';
import Close from 'grommet/components/icons/base/Close';
import Play from 'grommet/components/icons/base/Play';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import Duplicate from 'grommet/components/icons/base/Duplicate';
import Download from 'grommet/components/icons/base/Download';
import Mail from 'grommet/components/icons/base/Mail';
import _ from 'lodash';
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
  }

  componentWillReceiveProps(nextProps) {
  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillUnmount() {
  }

  _onChange(event, value) {
    let path = event.target.name; // why not 'event.target.id'? because of radio button.
    if (event.target.type == "checkbox") {
      this.props.onValueChange(path.substring(2), event.target.checked ? (value ? value : true) : (value ? "" : false));
    } else {
      this.props.onValueChange(path.substring(2), event.target.value);
    }
  }

  _onDownload(obj) {
    var content = "data:application/json;charset=utf-8,";
    var encodedUri = encodeURI(content + JSON.stringify(obj));
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", (obj.name || obj.body.sqlname || 'view') + ".json");
    link.click();
  }

  _onMail(view) {
    let br = "%0D%0A";
    let subject = `AM Browser View: ${view.name}`;
    let url = window.location.origin + '/explorer/' + view._id;
    let content = `URL: ${url}${br}Description: ${view.desc}`;
    window.open(`mailto:test@example.com?subject=${subject}&body=${content}`, '_self');
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
            <td colSpan={8}>
              <Header size="small">
                {link.sqlname}
              </Header>

              <table key={"table_" + link.sqlname}>
                <tbody>
                <tr>
                  <th>Field</th>
                  <th>Alias</th>
                  <th>Search</th>
                  <th>Group</th>
                  <th>Sum</th>
                  <th>Order</th>
                  <th>Del</th>
                </tr>
                <tr>
                  <td colSpan={8}>
                    <textarea type="text" placeholder="Input AQL as filter" id={`v.${currentPath}.body.filter`}
                              name={`v.${currentPath}.body.filter`} onChange={this._onChange}
                              value={link.body.filter}
                              style={{width: '100%', margin: 0,outline: 0,borderWidth: 1,borderStyle: 'hidden'}}/>
                  </td>
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
              key={`${currentPath}_${selfView.body.sqlname}_${field.sqlname}_${index}_row`}>
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
              <CheckBox id={`v.${currentPath}body.fields.${index}.searchable`}
                        name={`v.${currentPath}body.fields.${index}.searchable`} checked={field.searchable}
                        disabled={(selfView.body.fields.filter(field => field.searchable == true).length >= 2) && !field.searchable}
                        onChange={this._onChange}/>
            </td>
            <td>
              <CheckBox id={`v.${currentPath}body.groupby`} name={`v.${currentPath}body.groupby`}
                        value={field.sqlname} checked={selfView.body.groupby==field.sqlname?true:false}
                        disabled={(selfView.body.groupby&&selfView.body.groupby!=field.sqlname)?true:false}
                        onChange={
                          (event) => {
                            this._onChange(event, field.sqlname);
                          }}/>
            </td>
            <td>
              <CheckBox id={`v.${currentPath}body.sum`} name={`v.${currentPath}body.sum`}
                        value={field.sqlname} checked={selfView.body.sum==field.sqlname?true:false}
                        disabled={(selfView.body.sum&&selfView.body.sum!=field.sqlname)?true:false}
                        onChange={
                          (event) => {
                            this._onChange(event, field.sqlname);
                          }}/>
            </td>
            <td>
              <CheckBox id={`v.${currentPath}body.orderby`} name={`v.${currentPath}body.orderby`}
                        value={field.sqlname} checked={selfView.body.orderby==field.sqlname?true:false}
                        disabled={(selfView.body.orderby&&selfView.body.orderby!=field.sqlname)?true:false}
                        onChange={
                          (event) => {
                            this._onChange(event, field.sqlname);
                          }}/>
            </td>
            <td>
              <a id={`${currentPath}body.fields.${index}.del`} name={`${currentPath}body.fields.${index}`}
                 onClick={this.props.onDeleteTableRow}><Close /></a>
            </td>
          </tr>
          : null
      );
    }).filter(field => field != null);
    let links = [];
    if (selfView.body.links && selfView.body.links.length > 0) {
      links = this.renderLinks(links, selfView, currentPath + "body.links");
    }
    return fields.concat(links);
  }

  renderMasterHeader(selectedView) {
    return (
      <Header size="small">
        {selectedView.body.label && `${selectedView.body.label} (${selectedView.body.sqlname})`}
      </Header>
    );
  }

  render() {
    let {selectedView, closeAlertForm, onDeleteViewDef, onSaveSuccess} = this.props;
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

    let p = "input";
    let tableHeader = (
      <tr>
        <th>Field</th>
        <th>Alias</th>
        <th>Search</th>
        <th>Group</th>
        <th>Sum</th>
        <th>Order</th>
        <th>Del</th>
      </tr>
    );

    return (
      <Box>
        <Header justify="between" size="small" pad={{'horizontal': 'small'}}>
          <Title>View Builder</Title>
          <Menu direction="row" align="center" responsive={false}>
            <Anchor link="#" icon={<Play />} onClick={this.props.openPreview}>Query</Anchor>
            <Anchor link="#" icon={<Checkmark />} onClick={this.props.onSubmit}>Save</Anchor>
            <Anchor link="#" icon={<Close />} onClick={this.props.deleteViewDef}>Delete</Anchor>
            <Anchor link="#" icon={<Duplicate />} onClick={this.props.onDuplicateViewDef}>Duplicate</Anchor>
            {
              selectedView._id &&
              <Anchor link="#" icon={<Mail />} onClick={this._onMail.bind(this, selectedView)}>Mail</Anchor>
            }
            <Anchor link="#" icon={<Download />} onClick={this._onDownload.bind(this, selectedView)}>Download</Anchor>
          </Menu>
        </Header>

        <Box>
          <Split flex="left">

            {
              selectedView && !_.isEmpty(selectedView) &&
              <Box>
                {selectedView.body && selectedView.body.fields && this.renderMasterHeader(selectedView)}
                <Table>
                  <tbody>
                  {tableHeader}
                  <tr>
                    <td colSpan={8}>
                      <textarea id="v.body.filter" name="v.body.filter" value={selectedView.body.filter}
                                placeholder="Input AQL as filter" onChange={this._onChange}
                                style={{width: '100%', margin: 0,outline: 0,borderWidth: 1,borderStyle: 'hidden'}}>
                      </textarea>
                    </td>
                  </tr>
                  {selectedView.body && selectedView.body.fields && this.renderTemplateTable(selectedView, true)}
                  </tbody>
                </Table>
              </Box>
            }


            {
              selectedView && !_.isEmpty(selectedView) &&
              <Box pad="small">
                <Header>Attributes</Header>
                <Form onSubmit={this.props.onSubmit} compact={this.props.compact}>
                  <FormField label="Name" htmlFor={p + "item1"}>
                    <input id="v.name" name="v.name" type="text" onChange={this._onChange}
                           value={selectedView.name}/>
                  </FormField>
                  <FormField label="Description" htmlFor={p + "item2"}>
                    <textarea id="v.desc" name="v.desc" value={selectedView.desc} onChange={this._onChange}></textarea>
                  </FormField>
                  <FormField label="Category" htmlFor={p + "item3"}>
                    <input id="v.category" name="v.category" type="text" onChange={this._onChange}
                           value={selectedView.category}/>
                  </FormField>
                </Form>
              </Box>
            }

            {alertForms[this.props.alertForm]}

          </Split>
        </Box>
      </Box>
    );
  }
}

ViewDefDetail.propTypes = {
  onValueChange: PropTypes.func.isRequired
};
