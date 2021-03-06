import React from 'react';
import * as AQLActions from '../../actions/aql';
import * as ExplorerActions from '../../actions/explorer';
import { showWarning, monitorEdit } from '../../actions/system';
import Spinning from 'grommet/components/icons/Spinning';
import history from '../../RouteHistory';
import RecordListLayer from '../explorer/RecordListLayer';
import { AlertForm, ComponentBase, AMSideBar, Graph, ActionTab } from '../commons';
import { Anchor, Box, Button, CheckBox, Header, Title, Menu, Table, TableRow, Layer,
         Carousel, Tabs, Icons, Label } from 'grommet';
const { Close, Attachment, Checkmark, Shift, More, Group, Expand, Edit } = Icons.Base;
import AQL from './AQL';
import _ from 'lodash';

import cookies from 'js-cookie';


const getID = () => (Math.random() + 1).toString(36).substring(7);

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
  }

  componentWillMount() {
    this.acquireLock();
  }

  componentDidMount() {
    if (this.props.params.id) {
      this.addPromise(AQLActions.loadAQL(this.props.params.id).then((aql)=> {
        this._queryData(aql);
        this.releaseLock();
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
          if (!aql[aql.type]) {
            aql[aql.type] = aql.form; //handle old data
          }
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

    // Pub tabs should sort by name
    this.setState({
      publicTabs: publicTabs.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        // a must be equal to b
        return 0;
      })
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
          const wall = {tabs: this.state.tabs};
          this.wall = _.cloneDeep(wall);
          this.setState({wall}, () => {
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

  _addBox(box, parent) {
    if (!box.child)
      box.child = [{
        key: getID(),
        direction: 'row',
        child: null
      }, {
        key: getID(),
        direction: 'row',
        child: null
      }];
    else if (box.child instanceof Array)
      box.child.push({
        key: getID(),
        direction: 'row',
        child: null
      });
    else {
      var child = box.child;
      box.child = [{
        key: getID(),
        direction: 'row',
        child: child
      }, {
        key: getID(),
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

  renderGraphBox({boxProps, graphStyle, dataMap}) {
    return (
      <Box {...boxProps} className='box-graph' colorIndex="light-1" flex={true}>
        <Box justify="between" direction="row">
          <Box pad={{horizontal: 'medium'}} className='left-border' justify="center">
            <Label margin='none'>{dataMap.aql.name}</Label>
          </Box>
          <Box pad='small' onClick={this._showAQLDetail.bind(this, dataMap.aql._id)}><Expand /></Box>
        </Box>
        <Box {...graphStyle}>
          <Graph type={dataMap.aql.type} data={dataMap.data} config={dataMap.aql[dataMap.aql.type]} condition={dataMap.aql.condition}
                 onClick={(filter) => this._showViewRecords(filter, dataMap.aql.view)}/>
        </Box>
      </Box>
    );
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

  _buildBox(box, parent, tabName, idMap) {
    let child;
    let mapOfTabId = idMap || [];

    // Handle old box no key or number key
    if (!box.key || !isNaN(box.key))
      box.key = getID();

    if (box.child) {
      if (box.child instanceof Array) {
        child = (
          <Box justify="center" direction={box.direction} flex={true}>{
            box.child.map((child) => this._buildBox(child, parent, tabName, mapOfTabId))
          }</Box>
        );
      } else if (box.child._id && this.state.data[box.child._id]) {
        const dataMap = this.state.data[box.child._id];
        if (!mapOfTabId[tabName]) {
          mapOfTabId[tabName] = {dataIds: []};
        }
        mapOfTabId[tabName].dataIds.push(box.child._id);

        child = this.renderGraphBox({
          boxProps: {flex: true},
          graphStyle: {pad: "small", flex: true, justify: "center"},
          dataMap
        });
      }
      tabIdMap[tabName] = mapOfTabId[tabName];
    } else if (this.state.edit) {
      child = (
        <Box direction="row" justify="center" align="center" flex={true} pad="large">
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
      <Box key={box.key} direction="column" separator={this.state.edit?'all':'none'} flex={true}
           pad={(box.child instanceof Array) ? "none" : "small"}>
        {this._buildActions(box, parent)}
        {child}
      </Box>
    );
  }

  _buildActions(box, parent) {
    if (this.state.edit)
      return (
        <Box justify="center" align="center">
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
        </Box>
      );
  }

  _buildCarousel(tab) {

    if (!tabIdMap[tab.name] || !tabIdMap[tab.name].dataIds) { // prevent console error: cannot get dataIds of undefined.
      return null;
    }
    const dataIds = tabIdMap[tab.name].dataIds;
    return (
      <Carousel ref='carousel' className='flex'>
        {

          dataIds.map((key, index)=> {
            const dataMap = this.state.data[key] || false;
            return dataMap && // fix console error: cannot get aql of undefined.
              (
                <Box pad="medium" key={index} flex={true}>
                  {this.renderGraphBox({
                    graphStyle: {
                      flex: true,
                      pad: "large",
                      align: (dataMap.aql.type == 'meter') ? 'center' : null
                    }, dataMap
                  })}
                </Box>
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
    ExplorerActions.showViewRecords(filter, viewInAQL, (body, name) => {
      this.setState({
        layer: {
          name: 'View',
          args: [body, name]
        }
      });
    });
  }

  _showAQLDetail(id) {
    history.push(`/insight/${id}`);
  }

  _renderSingleAQL(graph) {
    const id = this.props.params.id;
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
      <Box pad="large">
        <Header justify="between" pad="large">
          <Title>{aql.name}</Title>
          {
            id && this.showBack() &&
            <Anchor icon={<Close />} label="Close" onClick={() => {
              history.push('/insight');
              this._loadAQLs();
              this._loadWall();
            }}/>
          }
        </Header>
        {aql[aql.type] instanceof Object &&
        <Box key={aql._id} pad="large" align={(aql.type=='meter')?'center':null} flex={false}>
          <Graph type={aql.type} data={data} config={aql[aql.type]} condition={aql.condition}
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
      if (data) {
        this._toggleEdit();
        this._loadWall();
      }
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
    let maxIndex = 0;
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
    this.state.focusIndex = focusIndex > 0 ? focusIndex - 1 : focusIndex;
    this.state.focusTab = focusTab;
    this.setState(this.state);
  }

  _onPublicTab(targetTab) {
    targetTab.public = !targetTab.public;
    this.setState(this.state);
  }

  renderHeader() {
    const { carousel, edit, showPublic, tabs, publicTabs } = this.state;
    let editAnchor = edit && !showPublic;
    return (
      <Header justify="between" pad={{'horizontal': 'medium'}}>
        <Menu align="center" inline={true} direction="row">
          { !edit && <Button label={`Public(${publicTabs.length})`} primary={showPublic}
                  plain={true} onClick={this._toggleShowPublic.bind(this)}/> }
          { !edit && <Button label={`Self(${tabs.length})`} primary={!showPublic}
                  plain={true} onClick={this._toggleShowPublic.bind(this)}/> }
          { edit && <Button label="Editing mode" plain={true}/> }
        </Menu>
        <Menu direction="row">
          { !edit &&
          <CheckBox label="Carousel" toggle={true} checked={carousel} onChange={this._toggleCarousel.bind(this)}/> }
          { !showPublic && !edit &&
          <Box justify='center'><Anchor icon={<Edit />} onClick={() => this._toggleEdit()} label="Edit"/></Box> }
          { editAnchor &&
          <Box justify='center'><Anchor icon={<Checkmark />} onClick={() => !showPublic && this._onSave()} label="Save"/></Box>
          }
          { editAnchor &&
          <Box justify='center'><Anchor icon={<Close />} onClick={() => !showPublic && this._toggleEdit()} label="Cancel"/></Box>
          }
        </Menu>
      </Header>
    );
  }

  render() {
    const {tabs, data, carousel, edit, layer, alert, showPublic, publicTabs, focusIndex, focusTab} = this.state;
    let showedTabs = showPublic ? publicTabs : tabs;
    const id = this.props.params.id;
    let content;

    if (this.locked)
      return <Box flex={true} align="center" justify="center"><Spinning /></Box>;

    if (id) {
      content = data && data[id] && this._renderSingleAQL(data[id]);
    } else {
      const displayTabs = showedTabs.map((tab, index) => (
        <ActionTab ref={tab.name} title={tab.name} key={index} className={(tab.public && !showPublic) ? 'public-tab' : ''}
                   onClick={this._setFocusTab.bind(this, tab, index)}
                   leftIcon={edit && this.checkAdmin() ? <Group onClick={this._onPublicTab.bind(this, tab)}/> : null}
                   rightIcon={edit ? <Close onClick={() => tabs.length > 1 && this._onRemove(focusTab)}/> : null}
                   onEdit={edit} onDoubleClick={edit ? this._onUpdateTitle.bind(this, tab) : null}>
          {carousel && !edit ? this._buildCarousel(tab) : this._buildBox(tab.box, tab.box, tab.name)}
        </ActionTab>
      ));
      if (edit) {
        displayTabs.push(<ActionTab onClick={this._addTab.bind(this)} title={<b>+</b>} key='new'/>);
      }
      content = (
        <Tabs justify='center' className='flex' activeIndex={focusIndex}>{displayTabs}</Tabs>
      );
    }

    return (
      <Box full="horizontal">
        { !id && this.renderHeader(edit) }
        <Box className={carousel ? '' : 'autoScroll'} style={{marginTop: -60}} flex={true}>
          {content}
          {layer && this[`_get${layer.name}Layer`](...layer.args)}
          {alert}
        </Box>
      </Box>
    );
  }
}
