import React, {Component} from 'react';
import * as AQLActions from '../../actions/aql';
import AlertForm from '../commons/AlertForm';
import Add from 'grommet/components/icons/base/Add';
import Close from 'grommet/components/icons/base/Close';
import Attachment from 'grommet/components/icons/base/Attachment';
import DocumentPdf from 'grommet/components/icons/base/DocumentPdf';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import Graph from './../commons/Graph';
import {
  Anchor,
  Box,
  CheckBox,
  Header,
  Menu,
  Title,
  Layer,
  Carousel
} from 'grommet';
import GroupList from '../commons/GroupList';
import GroupListItem from '../commons/GroupListItem';

export default class Wall extends Component {

  constructor() {
    super();
    this.state = {
      edit: false,
      carousel: true,
      aqls: [],
      box: {
        direction: 'row',
        child: null
      },
      data: {}
    };
    this._buildBox.bind(this);
    this._buildActions.bind(this);
    this._addBox.bind(this);
    this._deleteBox.bind(this);
    this._toggleDirection.bind(this);
    this._attachAQL.bind(this);
    this._selectAQL.bind(this);
  }

  componentWillMount() {
    this._loadAQLs();
    this._loadWall();
  }

  _findAqls(box) {
    console.log(box);
    if (box.child && box.child._id) {
      AQLActions.loadAQL(box.child._id, (aql)=> {
        this._queryData(aql);
        console.log("aql: " + aql.name);
      });
    } else if (box.child && box.child instanceof Array) {
      box.child.forEach((child)=> {
        this._findAqls(child);
      });
    }
  }

  _loadAQLs() {
    AQLActions.loadAQLs((data) => {
      this.setState({
        aqls: data
      });
    });
  }

  _queryData(aql) {
    const data = this.state.data;
    AQLActions.queryAQL(aql.str, (result) => {
      console.log(result);
      if (result) {
        data[aql._id] = {
          aql: aql,
          data: result
        };
        this.setState({data});
      }
    });
  }

  _loadWall() {
    AQLActions.loadWall((data) => {
      if (data) {
        this.setState({
          box: data
        }, this._findAqls(data));
      }
    });
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
        direction: 'row',
        child: null
      }, {
        direction: 'row',
        child: null
      }];
    else if (box.child instanceof Array)
      box.child.push({
        direction: 'row',
        child: null
      });
    else {
      var child = box.child;
      box.child = [{
        direction: 'row',
        child: child
      }, {
        direction: 'row',
        child: null
      }];
    }
    this.setState({
      box: parent
    });
  }

  _deleteBox(box, parent) {
    if (box.child instanceof Array && box.child.length > 0) {
      box.child.splice(box.child.length - 1, 1);
      if (box.child.length === 0)
        box.child = null;
    } else
      box.child = null;

    this.setState({
      box: parent
    });
  }

  _selectAQL(box, parent) {
    this.setState({
      layer: this._getLayer(box, parent)
    });
  }

  _onClose() {
    this.setState({
      layer: null
    });
  }

  _getLayer(box, parent) {
    return (
      <Layer onClose={this._onClose.bind(this)} closer={true} align="left">
        <Box full="vertical" justify="center">
          <Box pad={{vertical: 'medium'}}><Title>Graph Selector ({this.state.aqls.length})</Title></Box>
          <GroupList pad={{vertical: 'small'}} searchable={true}>
            {
              this.state.aqls.map((aql) => {
                return (
                  <GroupListItem key={aql._id} groupby={aql.category} search={aql.name}
                                 pad={{horizontal: 'medium', vertical: 'small'}}>
                    <Anchor href="#" onClick={this._attachAQL.bind(this, aql, box, parent)}>{aql.name}</Anchor>
                  </GroupListItem>
                );
              })
            }
          </GroupList>
        </Box>
      </Layer>
    );
  }

  _attachAQL(aql, box, parent) {
    box.child = {_id: aql._id};
    this.setState({
      box: parent
    }, this._onClose(this));
  }

  _buildBox(box, parent) {
    let child;
    if (box.child) {
      if (box.child instanceof Array) {
        child = (
          <Box justify="center" {...box}>{
            box.child.map((child, i) => {
              child.key = i;
              return this._buildBox(child, parent);
            })
          }</Box>
        );
      } else if (box.child._id && this.state.data[box.child._id]) {
        const dataMap = this.state.data[box.child._id];
        child = (
          <Box justify="center" {...box} direction="column" pad="medium">
            <Header>{dataMap.aql.name}</Header>
            {<Graph type={dataMap.aql.type} data={dataMap.data}
                    config={dataMap.aql.form} onClick={(filter) => console.log(filter.key + '=' + filter.value)}/>}
          </Box>
        );
      }
    } else if (this.state.edit) {
      child = (
        <Box direction="row" justify="center" pad="large">
          <Anchor href="#" icon={<Attachment />} label="Attach AQL" onClick={this._selectAQL.bind(this, box, parent)}/>
        </Box>
      );
    }

    return (<Box key={box.key} direction="column" separator={this.state.edit?'all':'none'} colorIndex="light-2">
      {this._buildActions(box, parent)}
      {child}
    </Box>);
  }

  _buildActions(box, parent) {
    var id = (Math.random() + 1).toString(36).substring(7);
    if (this.state.edit)
      return (
        <Box direction="row" justify="center" pad="small">
          <CheckBox id={id} label={box.direction==='row'?'Column':'Row'} checked={box.direction!=='column'}
                    onChange={this._toggleDirection.bind(this, box, parent)} toggle={true}/>
          <Anchor href="#" icon={<Add />} label="Split" onClick={this._addBox.bind(this, box, parent)}/>
          {
            box.child &&
            <Anchor href="#" icon={<Close />} label="Delete" onClick={this._deleteBox.bind(this, box, parent)}/>
          }
        </Box>
      );
  }

  _buildCarousel(data) {
    return (
      <Carousel>
        {
          Object.keys(data).map((key)=> {
            const dataMap = data[key];
            return (
              <Box pad="large" colorIndex="light-2">
                <Header>{dataMap.aql.name}</Header>
                {
                  <Box key={dataMap.aql._id} pad="large" align={(dataMap.aql.type=='meter')?'center':''}
                       full="horizontal">
                    <Graph type={dataMap.aql.type} data={dataMap.data}
                           config={dataMap.aql.form}
                           onClick={(filter) => console.log(filter.key + '=' + filter.value)}/>
                  </Box>
                }
              </Box>
            );
          })
        }
      </Carousel>
    );
  }

  _onSave() {
    AQLActions.saveWall(this.state.box, (data) => {
      if (data)
        this._loadWall();
      var alert = (<AlertForm onClose={this._closeAlert.bind(this)}
                              title={'AM Insight layout saved!'}
                              onConfirm={this._closeAlert.bind(this)}/>);
      this.setState({
        alert: alert
      });
    });
  }

  _closeAlert() {
    this.setState({
      alert: null
    });
  }

  render() {
    var box = this.state.box;
    var data = this.state.data;
    return (
      <Box direction="column" pad="medium" full="horizontal">
        <Header justify="between" size="small" pad={{'horizontal': 'small'}}>
          <Title>AM Insight</Title>
          <Menu direction="row" align="center" responsive={false}>
            <CheckBox id="carousel" label="Carousel" checked={this.state.carousel}
                      onChange={this._toggleCarousel.bind(this)}/>
            <CheckBox id="dashboard" label="Dashboard" checked={!this.state.carousel}
                      onChange={this._toggleCarousel.bind(this)}/>
            {
              this.state.edit &&
              <Anchor link="#" icon={<Checkmark />} onClick={this._onSave.bind(this)} label="Save"/>
            }
            {
              !this.state.edit &&
              <Anchor href="#" icon={<DocumentPdf />} label="Export"/>
            }
            <CheckBox id="edit" label="Edit" checked={this.state.edit} onChange={this._toggleEdit.bind(this)}
                      toggle={true}/>
          </Menu>
        </Header>
        {
          this.state.carousel && !this.state.edit &&
          this._buildCarousel(data)}
        {
          (!this.state.carousel || this.state.edit) &&
          this._buildBox(box, box)
        }
        {this.state.layer}
        {this.state.alert}
      </Box>
    );
  }
}

