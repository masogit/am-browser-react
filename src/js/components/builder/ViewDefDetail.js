import React, { Component /*, PropTypes*/ } from 'react';
import { connect } from 'react-redux';
//import PureRenderMixin from 'react-addons-pure-render-mixin';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';
import Box from 'grommet/components/Box';
import Form from 'grommet/components/Form';
import FormFields from 'grommet/components/FormFields';
import FormField from 'grommet/components/FormField';
import Header from 'grommet/components/Header';
import CheckBox from 'grommet/components/CheckBox';
import RadioButton from 'grommet/components/RadioButton';
//import SearchInput from 'grommet/components/SearchInput';
//import Calendar from 'grommet/components/Calendar';
//import NumberInput from 'grommet/components/NumberInput';
import Section from 'grommet/components/Section';
import Menu from 'grommet/components/Menu';
import Button from 'grommet/components/Button';
import Add from 'grommet/components/icons/base/Add';
import Delete from 'grommet/components/icons/base/Trash';
import Right from 'grommet/components/icons/base/Play';
import _ from 'lodash';
import store from '../../store';
import { setSelectedView, loadTemplateTable } from '../../actions/views';

class View extends Component {

  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.viewsWatcher = () => {
      let {views} = store.getState();
      if (views.views.length > 0) {
        //console.log("viewsWatcher - views loaded.");
        this.unsubscribe();
        //console.log("viewsWatcher - this.props.params.id: " + this.props.params.id);
        let views = store.getState().views.views;
        if (views && this.props.params.id) {
          let view = views.filter(view => view.$loki == this.props.params.id);
          this.props.dispatch(setSelectedView(this.props.params.id, view));
        }
      }
    };
    this.componentMounted = false;
    //this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  _onChange(event) {
    // console.log('!!! FullForm changed', event.target, 'to', event.target.value);
  }

  componentWillMount() {
    //const {dispatch} = this.props
    //let { userId } = this.props.params || props.params
    //dispatch(fetchPersonById(userId))
    //console.info('userId in will mount: ', userId)
  }

  componentDidMount() {
    //console.log("View - componentDidMount() - this.props.params.id:" + this.props.params.id);
    //console.log("View - componentDidMount() -  views:");
    //console.log(store.getState().views.views);
    if (store.getState().views.views.length == 0) {
      this.unsubscribe = store.subscribe(this.viewsWatcher);
      //console.log("after unsubscribe - store:");
      //console.log(store);
    }
    // setSelectedView on first click in the views list
    let views = store.getState().views.views;
    if (views && !this.props.selectedViewId) {
      let view = views.filter(view => view.$loki == this.props.params.id);
      this.props.dispatch(setSelectedView(this.props.params.id, view));
    }
  }

  componentWillReceiveProps(nextProps) {
    //console.log("nextState:");
    //console.log(nextState);
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

    let views = store.getState().views.views;
    // setSelectedView - if already clicked a link in the views list
    if (views && nextProps.selectedViewId && ( nextProps.selectedViewId == this.props.selectedViewId)
      && nextProps.params.id && (nextProps.params.id != this.props.params.id)) {
      let view = views.filter(view => view.$loki == nextProps.params.id);
      this.props.dispatch(setSelectedView(nextProps.params.id, view));
    }
    // load template table after setSelectedView
    if (views && nextProps.selectedViewId && ( nextProps.selectedViewId != this.props.selectedViewId)) { // first click
      let view = views.filter(view => view.$loki == nextProps.selectedViewId);
      this.props.dispatch(loadTemplateTable(nextProps.selectedViewId, view));
    }
  }

  componentWillUpdate(nextProps, nextState) {
    console.log("View - componentDidMount() - this.props.params.id:" + this.props.params.id);
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("View - componentDidUpdate() - this.props.params.id:" + this.props.params.id);
  }

  componentWillUnmount() {
    console.log("View - componentWillUnmount()");
  }

  render() {
    const { selectedView } = this.props;
    //console.log("View - render() - this.props.params.id:" + this.props.params.id);
    //console.log("View - render() - this.props.selectedViewId: " + this.props.selectedViewId);
    let p = "input";
    return (
      <Split flex="right">
        <Sidebar primary={true} pad="small" size="large">
          {
            _.isEmpty(selectedView) &&
            <p>Loading....
            </p>
          }
          {selectedView && selectedView[0] &&
            //<ul style={{listStyle:"none"}}>
            //  <li>Name: {view[0].name}</li>
            //  <li>Description: {view[0].description}</li>
            //  <li>Group: {view[0].group}</li>
            //</ul>
          <Form onSubmit={this.props.onSubmit} compact={this.props.compact}>
            <FormFields>
              <fieldset>
                <FormField label="Name" htmlFor={p + "item1"}>
                  <input id={p + "item1"} name="item-1" type="text" onChange={this._onChange}
                         value={selectedView[0].name}/>
                </FormField>
                <FormField label="Description" htmlFor={p + "item2"}>
                  <input id={p + "item2"} name="item-2" type="text" onChange={this._onChange}
                         value={selectedView[0].description}/>
                </FormField>
                <FormField label="Group" htmlFor={p + "item3"}>
                  <input id={p + "item3"} name="item-3" type="text" onChange={this._onChange}
                         value={selectedView[0].group}/>
                </FormField>
                <FormField label="Chart" htmlFor={p + "item7"}>
                  <select id={p + "item7"} name="item-7">
                    <option></option>
                    <option>first</option>
                    <option>second</option>
                    <option>third</option>
                  </select>
                </FormField>
                <FormField>
                  <Box direction="row" justify="end">
                    <RadioButton id={p + "item4-1"} name="item-4" label="Line"
                                 onChange={this._onChange}/>
                    <RadioButton id={p + "item4-2"} name="item-4" label="Bar"
                                 onChange={this._onChange}/>
                    <RadioButton id={p + "item4-3"} name="item-4" label="Pie"
                                 onChange={this._onChange}/>
                  </Box>
                </FormField>
              </fieldset>
            </FormFields>
          </Form>
          }
          {selectedView && selectedView[0] &&
          <Section>
            <Header justify="between">
              <CheckBox id={p + "item5-1"} label="Show Label" toggle={true} onChange={this._onChange}/>
              <Menu direction="row" size="small" justify="end">
                <Button icon={<Add />} plain={true} />
                <Button icon={<Delete />} plain={true} />
                <Button icon={<Right />} plain={true} />
              </Menu>
            </Header>

            <p>
            </p>
          </Section>
          }
        </Sidebar>

        <div>

        </div>
      </Split>
    );
  }
}

let mapStateToProps = (state, props) => {
  return {
    views: state.views.views,  // see store-dev.js or store-prod.js
    selectedView: state.views.selectedView,
    selectedViewId: state.views.selectedViewId,
    templateTable: state.views.templateTable
  };
};

export default connect(mapStateToProps)(View);
