import React, { Component/*, PropTypes*/ } from 'react';
//import { connect } from 'react-redux';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
//import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import Form from 'grommet/components/Form';
import FormFields from 'grommet/components/FormFields';
import FormField from 'grommet/components/FormField';
import Header from 'grommet/components/Header';
//import CheckBox from 'grommet/components/CheckBox';
import RadioButton from 'grommet/components/RadioButton';
//import SearchInput from 'grommet/components/SearchInput';
//import Calendar from 'grommet/components/Calendar';
//import NumberInput from 'grommet/components/NumberInput';
import Section from 'grommet/components/Section';
//import Menu from 'grommet/components/Menu';
import Table from 'grommet/components/Table';
//import TableRow from 'grommet/components/TableRow';
import Anchor from 'grommet/components/Anchor';
//import Button from 'grommet/components/Button';
import Add from 'grommet/components/icons/base/Add';
import Delete from 'grommet/components/icons/base/Close.js';
import Right from 'grommet/components/icons/base/Play';
import _ from 'lodash';
//import store from '../../store';
//import { setSelectedView, loadTemplateTable } from '../../actions/views';
//import GrommetTableTest from '../GrommetTable';

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
  }

  _onChange(event) {
    console.log('!!! FullForm changed', event.target, 'to', event.target.value);
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

  renderLinks(links, table) {
    let selfTable = table;
    links = selfTable.body.links.map((link) => {
      return (
        <tr key={"link_" + link.sqlname}>
          <td colSpan={4}>
            <Header size="small">
              <h3>{link.sqlname}</h3>
            </Header>
            <Table>
              <thead>
              <tr>
                <th>Field</th>
                <th>Alias</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              {link.body && link.body.fields && this.renderTemplateTable(link, false)}
              </tbody>
            </Table>
          </td>
        </tr>
      );
    });
    return links;
  }

  renderTemplateTable(table, root) {
    let selfTable = table;
    let fields = selfTable.body.fields.map((field) => {
      return (
        <tr key={selfTable.body.sqlname + "_" + field.sqlname}>
          <td>{field.sqlname}</td>
          <td>{field.label}</td>
          {root && <td>{"search"}</td>}
          <td><Anchor tag="span" className="tbBtnIcon"><Delete /></Anchor></td>
        </tr>
      );
    });
    let links = [];
    if (selfTable.body.links && selfTable.body.links.length > 0) {
      links = this.renderLinks(links, selfTable);
    }
    return fields.concat(links);
  }

  render() {
    const { selectedView } = this.props;
    let p = "input";
    let tableHeader = (
      <thead>
      <tr>
        <th>Field</th>
        <th>Alias</th>
        <th>Search</th>
        <th></th>
      </tr>
      </thead>
    );

    return (
      <Split flex="right">
        <Box>
          {
            _.isEmpty(selectedView) &&
            <p>Loading....
            </p>
          }
          {selectedView &&
          <Box direction="row">
            <Form onSubmit={this.props.onSubmit} compact={this.props.compact}>
              <FormFields>
                <fieldset>
                  <FormField label="Name" htmlFor={p + "item1"}>
                    <input id={p + "item1"} name="item-1" type="text" onChange={this._onChange}
                           value={selectedView.name}/>
                  </FormField>
                  <FormField label="Description" htmlFor={p + "item2"}>
                    <textarea id={p + "item2"} name="item-2" value={selectedView.desc}
                              onChange={this._onChange}></textarea>
                  </FormField>
                  <FormField label="Category" htmlFor={p + "item3"}>
                    <select id={p + "item3"} name="item-7">
                      <option>Assets</option>
                    </select>
                  </FormField>
                  <FormField label="Chart">
                    <Box direction="row" justify="start" className="formfieldRadios">
                      <RadioButton id={p + "item4-1"} name="item-4" label="Line"
                                   onChange={this._onChange}/>
                      <RadioButton id={p + "item4-2"} name="item-4" label="Bar"
                                   onChange={this._onChange}/>
                      <RadioButton id={p + "item4-3"} name="item-4" label="Pie"
                                   onChange={this._onChange}/>
                    </Box>
                  </FormField>
                  <FormField label="Aggregate">
                    <Box direction="row" justify="start" className="formfieldRadios">
                      <RadioButton id={p + "item5-1"} name="item-5" label="Count"
                                   onChange={this._onChange}/>
                      <RadioButton id={p + "item5-2"} name="item-5" label="Sum"
                                   onChange={this._onChange}/>
                      <select id={p + "item7"} name="item-7" onChange={this._onChange}>
                        <option>fQty</option>
                      </select>

                    </Box>
                  </FormField>
                </fieldset>
              </FormFields>
            </Form>
            <Box>
              <Anchor tag="span"><Add /></Anchor>
              <Anchor tag="span"><Delete /></Anchor>
              <Anchor tag="span"><Right /></Anchor>
            </Box>
          </Box>
          }
        </Box>

        {selectedView &&
        <Section>
          <Table>
            {tableHeader}
            <tbody>
            {selectedView.body && selectedView.body.fields && this.renderTemplateTable(selectedView, true)}
            </tbody>
          </Table>
        </Section>
        }
      </Split>
    );
  }
}
