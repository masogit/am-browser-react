import React from 'react';
import * as AQLActions from '../../actions/aql';
import * as ExplorerActions from '../../actions/explorer';
import {showWarning, monitorEdit} from '../../actions/system';
import * as Format from '../../util/RecordFormat';
import history from '../../RouteHistory';
import RecordListLayer from '../explorer/RecordListLayer';
import AlertForm from '../commons/AlertForm';
import Graph from '../commons/Graph';
import ComponentBase  from '../commons/ComponentBase';
import ActionTab from '../commons/ActionTab';
import {Anchor, Box, Button, CheckBox, Header, Menu, Table, TableRow, Layer, Carousel, RadioButton, Tabs, Icons} from 'grommet';
const { Add, Close, Attachment, Checkmark, Search, Shift, More, Group } = Icons.Base;
import AMSideBar from '../commons/AMSideBar';
import AQL from './AQL';
import _ from 'lodash';

import cookies from 'js-cookie';

let tabIdMap = {};
export default class Insight extends ComponentBase {

  constructor() {
    super();
    const tabs = [{
      name: 'default',
      box: {
        direction: 'row',
        child: null
      }
    }];
    this.state = {
      showPublic: true,
      publicTabs: [],
      focusTab: tabs[0],
      focusIndex: 0,
      wall: {tabs},
      edit: false,
      carousel: false,
      aqls: [],
      tabs,
      data: {}
    };

    this._buildBox.bind(this);
    this._buildActions.bind(this);
    this._addBox.bind(this);
    this._deleteBox.bind(this);
    this._toggleDirection.bind(this);
    this._attachAQL.bind(this);
    this._toggleShowPublic.bind(this);
    this._onPublic.bind(this);
  }

  componentDidMount() {
    if (this.props.params.id) {
      this.addPromise(AQLActions.loadAQL(this.props.params.id).then((aql)=> {
        this._queryData(aql);
      }));
    } else {
      this._loadAQLs();
      this._loadWall();
    }
  }

  _setFocusTab(tab, index) {
    this.setState({
      focusIndex: index,
      focusTab: tab
    });
  }

  _findAqls(box) {
    if (box.child && box.child._id) {
      this.addPromise(AQLActions.loadAQL(box.child._id).then((aql)=> {
        if (!this.state.data[aql._id]) {
          this._queryData(aql);
        }
      }));
    } else if (box.child && box.child instanceof Array) {
      box.child.forEach((child)=> {
        this._findAqls(child);
      });
    }
  }

  _findTabAqls(tabs) {
    tabs.forEach(tab => {
      this._findAqls(tab.box);
    });
  }

  _loadAQLs() {
    this.addPromise(AQLActions.loadAQLs().then((data) => {
      this.setState({
        aqls: data
      });
    }));
  }

  _queryData(aql) {
    const data = this.state.data;
    this.addPromise(AQLActions.queryAQL(aql.str).then(result => {
      if (result) {
        data[aql._id] = {
          aql: aql,
          data: result
        };
        this.setState({data});
      }
    }));
  }

  _getPublicTabs(walls) {
    var publicTabs = [];
    walls.forEach((wall) => {
      wall.tabs.forEach((tab) => {
        if (tab.public) {
          tab.user = wall.user;
          // look up duplicated tab name
          publicTabs.forEach((publicTab) => {
            if (publicTab.name == tab.name) {
              publicTab.name += ` (${publicTab.user})`;
              tab.name += ` (${tab.user})`;
            }
          });
          publicTabs.push(tab);
        }
      });
    });
    this._findTabAqls(publicTabs);
    this.setState({
      publicTabs
    });
  }

  _loadWall() {
    this.setState({data: {}});
    this.addPromise(AQLActions.loadWalls(cookies.get("user")).then(walls => {
      if (walls) {
        var userWall = walls.filter((wall) => {
          return wall.user == cookies.get("user");
        })[0];
        this._getPublicTabs(walls);
        if (userWall) {
          this.wall = _.cloneDeep(userWall);
          this.setState({
            wall: userWall,
            tabs: userWall.tabs
          }, () => {
            this._findTabAqls(userWall.tabs);
            monitorEdit(this.wall, this.state.wall);
          });
        } else {
          const wall =  { tabs: this.state.tabs };
          this.wall = _.cloneDeep(wall);
          this.setState({ wall }, () => {
            monitorEdit(this.wall, this.state.wall);
          });
        }
      }
    }));
  }

  checkAdmin() {
    if (this.isAdmin === undefined) {
      this.isAdmin = this.props.routes[1].childRoutes.filter((item)=> item.path.indexOf('aql') > -1 && item.component == AQL).length > 0;
    }
    return this.isAdmin;
  }

  _toggleEdit() {
    this.setState({
      edit: !this.state.edit
    });
  }

  _toggleCarousel() {
    this.setState({
      carousel: !this.state.carousel
    });
  }

  _toggleShowPublic() {
    this.setState({
      showPublic: !this.state.showPublic
    });
  }

  _toggleDirection(box, parent) {
    if (box.direction === 'row')
      box.direction = 'column';
    else
      box.direction = 'row';
    this.setState({
      box: parent
    });
  }

  _getID() {
    return (Math.random() + 1).toString(36).substring(7);
  }

  _addBox(box, parent) {
    if (!box.child)
      box.child = [{
        key: this._getID(),
        direction: 'row',
        child: null
      }, {
        key: this._getID(),
        direction: 'row',
        child: null
      }];
    else if (box.child instanceof Array)
      box.child.push({
        key: this._getID(),
        direction: 'row',
        child: null
      });
    else {
      var child = box.child;
      box.child = [{
        key: this._getID(),
        direction: 'row',
        child: child
      }, {
        key: this._getID(),
        direction: 'row',
        child: null
      }];
    }
    this.setState({
      box: parent
    });
  }

  _deleteBox(box, parent) {
    if (box.child) {
      box.child = null;
    } else if (parent.key != box.key) {
      this._removeFromParent(box.key, parent, parent);
    }
    // For render parent
    this.setState({
      box: parent
    });
  }

  _removeFromParent(key, box, parent) {
    if (box.child && box.child instanceof Array) {
      let removed = _.remove(box.child, child => {
        return child.key == key;
      });

      if (box.child.length == 0)
        box.child = null;

      if (removed.length == 0)
        box.child.forEach(child => {
          this._removeFromParent(key, child, parent);
        });
    }
  }

  _onClose() {
    this.setState({
      layer: null
    });
  }

  _getAQLLayer(box, parent) {
    const contents = this.state.aqls.map((aql) => ({
      key: aql._id,
      groupby: aql.category,
      onClick: this._attachAQL.bind(this, aql, box, parent),
      search: aql.name,
      child: aql.name
    }));

    return (
      <Layer onClose={this._onClose.bind(this)} closer={true} align="left" flush={true}>
        <AMSideBar title='Graph Selector' contents={contents} colorIndex='light-1' toggle={false}/>
      </Layer>
    );
  }

  _attachAQL(aql, box, parent) {
    box.child = {_id: aql._id};
    this._findAqls(box);
    this.setState({
      box: parent
    }, this._onClose(this));
  }

  _buildBox(box, parent, tabName) {
    let child;

    // Handle old box no key or number key
    if (!box.key || !isNaN(box.key))
      box.key = this._getID();

    if (box.child) {
      if (box.child instanceof Array) {
        child = (
          <Box justify="center" direction={box.direction} flex={false}>{
            box.child.map((child) => this._buildBox(child, parent, tabName))
          }</Box>
        );
      } else if (box.child._id && this.state.data[box.child._id]) {
        const dataMap = this.state.data[box.child._id];
        if (!tabIdMap[tabName]) {
          tabIdMap[tabName] = {dataIds: []};
        }

        tabIdMap[tabName].dataIds.push(box.child._id);
        child = (
          <Box justify="center" pad="medium" flex={true} className='box-graph'>
            <Header>
              <Anchor icon={<Search />} label={dataMap.aql.name}
                      onClick={this._showAQLDetail.bind(this, dataMap.aql._id)}/>
            </Header>
            <Graph type={dataMap.aql.type} data={dataMap.data} config={dataMap.aql.form}
                   onClick={(filter) => this._showViewRecords(filter, dataMap.aql.view)}/>
          </Box>
        );
      }
    } else if (this.state.edit) {
      child = (
        <Box direction="row" justify="center" pad="large">
          <Anchor href="#" icon={<Attachment />} label="Attach a Graph"
                  onClick={() => this.setState({
                    layer: {
                      name: 'AQL',
                      args: [box, parent]
                    }
                  })}/>
        </Box>
      );
    }

    return (
      <Box key={box.key} direction="column" separator={this.state.edit?'all':'none'} colorIndex="light-2" flex={true}>
        {this._buildActions(box, parent)}
        {child}
      </Box>
    );
  }

  _buildActions(box, parent) {
    if (this.state.edit)
      return (
        <Header justify="center">
          <Menu icon={<More />} closeOnClick={false} inline={true} direction="row">
            <CheckBox id={box.key} label={box.direction==='row'?'Column':'Row'} checked={box.direction!=='column'}
                      onChange={this._toggleDirection.bind(this, box, parent)} toggle={true}/>
            <Button icon={<Shift className={box.direction==='column'?'icon_rotate90':''}/>}
                    onClick={this._addBox.bind(this, box, parent)}/>
            {
              !(box.child instanceof Array && box.child.length > 0) &&
              <Button icon={<Close />} onClick={this._deleteBox.bind(this, box, parent)}/>
            }
          </Menu>
        </Header>
      );
  }

  _buildCarousel(tab) {
    // disable animation, so Chart can be rendered correctly
    setTimeout(()=> {
      if (this.refs.carousel) {
        this.refs.carousel.refs.carousel.className = this.refs.carousel.refs.carousel.className.replace('disable_animation', '');
      }
    }, 1000);

    if(!tabIdMap[tab.name] || !tabIdMap[tab.name].dataIds) { // prevent console error: cannot get dataIds of undefined.
      return null;
    }
    const dataIds = tabIdMap[tab.name].dataIds;
    return (
      <Carousel ref='carousel' className='disable_animation no-flex'>
        {
          // dataIds contains a lot duplicated ids, and the last unique ids is the right order
          dataIds.slice(-_.uniq(dataIds).length).map((key, index)=> {
            const dataMap = this.state.data[key];
            return (
              dataMap ? // fix console error: cannot get aql of undefined.
                <Box pad="large" key={index} className='box-graph'>
                  <Header>
                    <Anchor icon={<Search />} label={dataMap.aql.name}
                            onClick={this._showAQLDetail.bind(this, dataMap.aql._id)}/>
                  </Header>
                  <Box pad="large" align={(dataMap.aql.type=='meter')?'center':null}>
                    <Graph key={dataMap.aql._id} type={dataMap.aql.type} data={dataMap.data} config={dataMap.aql.form}
                           onClick={(filter) => this._showViewRecords(filter, dataMap.aql.view)}/>
                  </Box>
                </Box>
                :
                null
            );
          })
        }
      </Carousel>
    );
  }

  _getViewLayer(body, title) {
    return <RecordListLayer onClose={this._onClose.bind(this)} body={body} title={title}/>;
  }

  _showViewRecords(filter, viewInAQL) {
    if (viewInAQL && viewInAQL._id)
      ExplorerActions.loadView(viewInAQL._id).then((view) => {
        var body = view.body;
        var newFitler = Format.getFilterFromField(view.body.fields, filter);
        body.filter = (body.filter) ? `(${body.filter} AND ${newFitler})` : newFitler;
        this.setState({
          layer: {
            name: 'View',
            args: [body, view.name]
          }});
      });
  }

  _showAQLDetail(id) {
    history.push(`/insight/${id}`);
  }

  _renderSingleAQL(graph) {
    const {aql, data} = graph;
    const header = data.header.map((col) => <th key={col.Index}>{col.Name}</th>);
    const rows = data.rows.map((row, index) => (
      <TableRow key={index}>{
        row.map((col, i) => {
          return (<td key={i}>{col}</td>);
        })
      }</TableRow>
    ));
    return (
      <Box pad="large" colorIndex="light-2" flex={false}>
        <Header>{aql.name}</Header>
        {aql.form instanceof Object &&
          <Box key={aql._id} pad="large" align={(aql.type=='meter')?'center':null}>
            <Graph type={aql.type} data={data} config={aql.form}
                  onClick={(filter) => this._showViewRecords(filter, aql.view)}/>
          </Box>
        }
        <Table>
          <thead>
          <tr>{header}</tr>
          </thead>
          <tbody>
          {rows}
          </tbody>
        </Table>
      </Box>
    );
  }

  _onSave() {
    var alert = (<AlertForm onClose={this._closeAlert.bind(this)}
                            title={'Insight Dashboard modification'}
                            desc={`Save Insight's layout and graph(s).`}
                            onConfirm={this._onSaveWall.bind(this)}/>);
    this.setState({
      alert: alert
    });
  }

  _onSaveWall() {
    var wall = this.state.wall;
    wall.tabs = this.state.tabs;
    wall.user = cookies.get('user');
    AQLActions.saveWall(wall).then(data => {
      if (data)
        this._loadWall();
    });
  }

  _closeAlert() {
    this.setState({
      alert: null
    });
  }

  showBack() {
    return this.props.routes[1].childRoutes.filter((route) => route.path == 'insight' && route.component == Insight).length > 0;
  }

  _addTab() {
    let namePrefix = 'Tab_';
    let maxIndex = 1;
    this.state.tabs.forEach(tab => {
      if (tab.name.indexOf(namePrefix) == 0) {
        let index = tab.name.substr(namePrefix.length) / 1;
        // if index == NaN, will always return false
        if (index > maxIndex)
          maxIndex = index;
      }
    });

    const name = `${namePrefix}${maxIndex + 1}`;
    const focusTab = {
      name: name,
      box: {
        direction: 'row',
        child: null
      }
    };
    this.state.tabs.push(focusTab);
    this.state.wall.tabs = this.state.tabs;
    this.state.focusTab = focusTab;
    this.state.focusIndex = this.state.tabs.length - 1;

    this.setState(this.state);
  }

  _onUpdateTitle(tab, name) {
    name = name.trim();
    if (name) {
      const sameNameTabs = this.state.tabs.filter(tab => tab.name == name);
      if (sameNameTabs.length > 0) {
        showWarning('Tab name already exists');
        return false;
      } else {
        tab.name = name;
        return true;
      }
    } else {
      showWarning('Tab name can not be empty');
    }
  }

  _onRemove(targetTab) {
    var alert = (<AlertForm onClose={this._closeAlert.bind(this)}
                            title={'Confirm to remove'}
                            desc={`Remove this tab: ${targetTab.name}?`}
                            onConfirm={this._onRemoveTab.bind(this, targetTab)}/>);
    this.setState({
      alert: alert
    });
  }

  _onRemoveTab(targetTab) {
    let focusIndex = -1;
    let tabs = this.state.tabs;
    let leftTabs = tabs.filter((tab, index) => {
      if (tab.name != targetTab.name) {
        return tab;
      } else {
        focusIndex = index;
      }
    });
    focusIndex = (focusIndex + 1) % tabs.length;
    let focusTab = tabs[focusIndex];
    this.state.tabs = leftTabs;
    this.state.wall.tabs = leftTabs;
    this.state.focusIndex = focusIndex > 0 ? focusIndex -1 : focusIndex;
    this.state.focusTab = focusTab;
    this.setState(this.state);
  }

  _onPublicTab(targetTab) {
    targetTab.public = !targetTab.public;
    this.setState(this.state);
  }

  render() {
    const {tabs, data, carousel, edit, layer, alert} = this.state;
    let showedTabs = this.state.showPublic ? this.state.publicTabs : tabs;
    const id = this.props.params.id;
    let content;
    if (id) {
      content = data && data[id] && this._renderSingleAQL(data[id]);
    } else {
      content = (
        <Tabs justify='center' className='flex' activeIndex={this.state.focusIndex} initialIndex={this.state.focusIndex}>{
          showedTabs.map((tab, index) => (
            <ActionTab ref={tab.name} title={tab.name} key={tab.name} onClick={this._setFocusTab.bind(this, tab, index)}
                       onEdit={edit} onDoubleClick={this.state.edit ? this._onUpdateTitle.bind(this, tab) : null}>
              {carousel && !edit ? this._buildCarousel(tab) : this._buildBox(tab.box, tab.box, tab.name)}
            </ActionTab>
          ))
        }
        </Tabs>
      );
    }

    return (
      <Box full="horizontal">
        <Header justify="between" pad={{'horizontal': 'medium'}}>
          <Box>Insight</Box>
          {
            !id &&
            <Menu direction="row" align="center" responsive={true}>
              {
                !edit &&
                <Menu direction="row" inline={true}>
                  <RadioButton id="carousel" name="choice" label="Carousel" onChange={this._toggleCarousel.bind(this)}
                            checked={carousel} disabled={edit}/>
                  <RadioButton id="dashboard" name="choice" label="Deck" onChange={this._toggleCarousel.bind(this)}
                              checked={!carousel || edit}/>
                  <CheckBox label={`Public Tabs(${this.state.publicTabs.length})`} toggle={true} checked={this.state.showPublic}
                            onChange={this._toggleShowPublic.bind(this)}/>
                </Menu>
              }
              {
                edit &&
                <Menu direction="row" inline={true}>
                  <Anchor icon={<Checkmark />} onClick={this._onSave.bind(this)} label="Save"/>
                  <Anchor icon={<Add />} onClick={this._addTab.bind(this)} label="Add Tab"/>
                  <Anchor icon={<Close />} onClick={() => this.state.tabs.length > 1 && this._onRemove(this.state.focusTab)} label="Delete Tab" disabled={this.state.tabs.length <= 1}/>
                  { this.checkAdmin() && <Anchor icon={<Group colorIndex={this.state.tabs[this.state.focusIndex].public ? '' : 'grey-4'} />} label="Public"
                          onClick={this._onPublicTab.bind(this, this.state.tabs[this.state.focusIndex])}/> }
                </Menu>
              }
              <CheckBox id="edit" label="Edit" checked={edit} onChange={this._toggleEdit.bind(this)}
                        disabled={this.state.showPublic} toggle={true}/>
            </Menu>
          }
          {
            id && this.showBack() && <Anchor icon={<Close />} label="Close" onClick={() => {
              history.push('/insight');
              this._loadAQLs();
              this._loadWall();
            }}/>
          }
        </Header>
        <Box className={edit || carousel ? '' : 'autoScroll'} flex={true}>
          {content}
          {layer && this[`_get${layer.name}Layer`](...layer.args)}
          {alert}
        </Box>
      </Box>
    );
  }
}
