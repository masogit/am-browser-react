import React, { Component, PropTypes } from 'react';
//import { connect } from 'react-redux';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
//import Sidebar from 'grommet/components/Sidebar';
import { Split, Box, Form, FormFields, FormField, Header, Footer, CheckBox, Menu, RadioButton, Table, Anchor } from 'grommet';
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
//import ReactSelect from 'react-select';

export default class ViewDefDetail extends Component {

  constructor(props) {
    super(props);
    //this.unsubscribe = null;
    //this.viewsWatcher = () => {
    //  let {views} = store.getState();
    //  if (views.views.length > 0) {
    //    //console.log("viewsWatcher - views loaded.");
    //    this.unsubscribe();
    //    //console.log("viewsWatcher - this.props.params.id: " + this.props.params.id);
    //    let views = store.getState().views.views;
    //    if (views && this.props.params.id) {
    //      let view = views.filter(view => view.$loki == this.props.params.id);
    //      this.props.dispatch(setSelectedView(this.props.params.id, view));
    //    }
    //  }
    //};
    //this.componentMounted = false;
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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
    //console.log("ViewDefDetail - componentWillReceiveProps()");
    //console.log("ViewDefDetail - nextProps:");
    //console.log(nextProps);
    //console.log("this.props.params.id: " + this.props.params.id);
    //console.log("View - componentWillReceiveProps() - this.props.params.id:" + this.props.params.id);
    //console.log("View - componentWillReceiveProps() - nextProps.params.id:" + nextProps.params.id);
    //console.log("View - componentWillReceiveProps() - this.props.selectedViewId: " + this.props.selectedViewId);
    //console.log("View - componentWillReceiveProps() - nextProps.selectedViewId: " + nextProps.selectedViewId);
    //console.log("View - componentWillReceiveProps() -  views:");
    //console.log(store.getState().views.views);
    //let views = store.getState().views.views;
    // if this.props.params.id && (this.props.params.id != nextProps.selectedViewId), dispatch to setSelectedView
    // if nextProps.selectedViewId && (nextProps.selectedViewId != this.props.selectedViewId), dispatch to loadTemplateTable

    //let views = store.getState().views.views;
    //// setSelectedView - if already clicked a link in the views list
    //if (views && nextProps.selectedViewId && ( nextProps.selectedViewId == this.props.selectedViewId)
    //  && nextProps.params.id && (nextProps.params.id != this.props.params.id)) {
    //  let view = views.filter(view => view.$loki == nextProps.params.id);
    //  this.props.dispatch(setSelectedView(nextProps.params.id, view));
    //}
    //// load template table after setSelectedView
    //if (views && nextProps.selectedViewId && ( nextProps.selectedViewId != this.props.selectedViewId)) { // first click
    //  let view = views.filter(view => view.$loki == nextProps.selectedViewId);
    //  this.props.dispatch(loadTemplateTable(nextProps.selectedViewId, view));
    //}
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
    let fields = selfView.body.fields.map((field, index) => {
      return (
        <tr key={currentPath + "_" + selfView.body.sqlname + "_" + field.sqlname + "_" + index}>
          <td style={{width: "35%"}}>{field.sqlname}</td>
          <td style={{width: "35%"}}>
            <input id={"v." + currentPath + "body.fields." + index + ".alias"}
                   name={`v.${currentPath}body.fields.${index}.alias`}
                   placeholder="Add alias here..."
                   value={field.alias}
                   onChange={this._onChange}
                   style={{
                     minWidth: 150,
                     display: 'inline-block',
                     margin: 0,
                     padding: 0,
                     outline: 0,
                     borderWidth: 1,
                     borderStyle: 'hidden'
                   }}
              />
          </td>

          {root &&
          <td>{!field.PK &&
          <CheckBox id={`v.${currentPath}body.fields.${index}.searchable`}
                    name={`v.${currentPath}body.fields.${index}.searchable`} checked={field.searchable}
                    onChange={this._onChange}/>}</td>}
          <td><a name={`${currentPath}body.fields.${index}`} className="tbBtnIcon"
                 onClick={this.props.onDeleteTableRow}><Close /></a></td>
        </tr>
      );
    });
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

  renderAggregateOptions(selectedView) {
    let selfView = selectedView;
    let fields = selfView.body.fields.filter(view => !view.PK);
    let options = fields.map((field) => {
      return (
        <option key={"agg_" + field.sqlname} value={field.sqlname}>{field.sqlname}</option>
      );
    });
    return options;
  }

  render() {
    const { selectedView } = this.props;
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
      <Split flex="left">
        {selectedView && !_.isEmpty(selectedView) &&
        <Box>
          {selectedView.body && selectedView.body.fields && this.renderMasterHeader(selectedView)}
          <Table>
            <tbody>
            {tableHeader}
            {selectedView.body && selectedView.body.fields && this.renderTemplateTable(selectedView, true)}
            </tbody>
          </Table>
        </Box>
        }

        {selectedView && !_.isEmpty(selectedView) &&
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
                {
                  selectedView.chart && selectedView.chart.type &&
                  <FormField label="Chart">
                    <Box direction="row" justify="start" className="formfieldRadios">
                      <RadioButton id={p + "item4-1"} name="v.chart.type" label="Line" value="line"
                                   checked={selectedView.chart.type == 'line'}
                                   onChange={this._onChange}/>
                      <RadioButton id={p + "item4-2"} name="v.chart.type" label="Bar" value="bar"
                                   checked={selectedView.chart.type == 'bar'}
                                   onChange={this._onChange}/>
                      <RadioButton id={p + "item4-3"} name="v.chart.type" label="Pie" value="pie"
                                   checked={selectedView.chart.type == 'pie'}
                                   onChange={this._onChange}/>
                    </Box>
                  </FormField>
                }
                {
                  selectedView.chart && selectedView.chart.aggregate &&
                  <FormField label="Aggregate">
                    <Box direction="row" justify="start" className="formfieldRadios">
                      <RadioButton id={p + "item5-1"} name="v.chart.aggregate" label="Count" value="count"
                                   checked={selectedView.chart.aggregate == 'count'}
                                   onChange={this._onChange}/>
                      <RadioButton id={p + "item5-2"} name="v.chart.aggregate" label="Sum" value="sum"
                                   checked={selectedView.chart.aggregate == 'sum'}
                                   onChange={this._onChange}/>
                      <select id="v.chart.groupby" name="v.chart.groupby" value={selectedView.chart.groupby}
                              onChange={this._onChange} title={selectedView.chart.groupby}
                              placeholder="" style={{maxWidth: 200, minWidth: 200}}>
                        <option value=""></option>
                        {selectedView.body && selectedView.body.fields && this.renderAggregateOptions(selectedView)}
                      </select>
                    </Box>
                  </FormField>
                }
              </fieldset>
            </FormFields>
            <Footer pad={{vertical: 'medium'}}>
              <Menu direction="row" align="center" responsive={false}>
                <Anchor link="#" icon={<Checkmark />} onClick={this.props.onSubmit}>Save</Anchor>
                <Anchor link="#" icon={<Duplicate />} onClick={this.props.onDuplicateViewDef}>Duplicate</Anchor>
                <Anchor link="#" icon={<Close />} onClick={this.props.onDeleteViewDef}>Delete</Anchor>
                <Anchor link="#" icon={<Play />} onClick={this.props.openPreview}>Query</Anchor>
              </Menu>
            </Footer>
          </Form>
        </Box>
        }

      </Split>
    );
  }
}

ViewDefDetail.propTypes = {
  onValueChange: PropTypes.func.isRequired
};
