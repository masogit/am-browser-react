import React, {Component} from 'react';
import * as AQLActions from '../../actions/aql';
import AlertForm from '../commons/AlertForm';
import Add from 'grommet/components/icons/base/Add';
import Close from 'grommet/components/icons/base/Close';
import Attachment from 'grommet/components/icons/base/Attachment';
import Camera from 'grommet/components/icons/base/Camera';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import {
  Anchor,
  Box,
  Chart,
  CheckBox,
  Distribution,
  Header,
  Layer,
  Meter
} from 'grommet';
import GroupList from '../commons/GroupList';
import GroupListItem from '../commons/GroupListItem';

export default class Wall extends Component {

  constructor() {
    super();
    this.state = {
      edit: false,
      aqls: [],
      box: {
        direction: 'row',
        child: null
      }
    };
    this._buildBox.bind(this);
    this._buildActions.bind(this);
    this._addBox.bind(this);
    this._deleteBox.bind(this);
    this._toggleDirection.bind(this);
    this._attachAQL.bind(this);
    this._selectAQL.bind(this);
  }

  componentDidMount() {
    this._loadAQLs();
    this._loadWall();
  }

  _loadAQLs() {
    AQLActions.loadAQLs((data) => {
      this.setState({
        aqls: data
      });
    });
  }

  _loadWall() {
    AQLActions.loadWall((data) => {
      console.log(data);
      if (data)
        this.setState({
          box: data
        });
    });
  }

  _toggleEdit() {
    this.setState({
      edit: !this.state.edit
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
    box.child = aql;
    this.setState({
      box: parent
    }, this._onClose(this));
  }

  _buildBox(box, parent) {
    return (<Box key={box.key} direction="column" separator={this.state.edit?'all':'none'}>
      {
        this._buildActions(box, parent)}
      {
        box.child && box.child instanceof Array &&
        <Box justify="center" {...box}>{
          box.child.map((child, i) => {
            child.key = i;
            if (child)
              return this._buildBox(child, parent);
          })
        }</Box>
      }
      {
        box.child && box.child.name &&
        <Box justify="center" {...box} direction="column" pad="medium">
          <Header>{box.child.name}</Header>
          {
            box.child.type === 'chart' &&
            <Chart {...box.child.chart} />
          }
          {
            box.child.type === 'meter' &&
            <Meter {...box.child.meter} />
          }
          {
            box.child.type === 'distribution' &&
            <Distribution {...box.child.distribution} />
          }
        </Box>
      }
      {
        !box.child && this.state.edit &&
        <Box direction="row" justify="center" pad="large">
          <Anchor href="#" icon={<Attachment />} label="Attach AQL" onClick={this._selectAQL.bind(this, box, parent)}/>
        </Box>
      }
    </Box>);
  }

  _buildActions(box, parent) {
    var id = (Math.random() + 1).toString(36).substring(7);
    if (this.state.edit)
      return (<Box direction="row" justify="center" separator="bottom" pad="small">
        <CheckBox id={id} label={box.direction==='row'?'Column':'Row'} checked={box.direction!=='column'}
                  onChange={this._toggleDirection.bind(this, box, parent)} toggle={true}/>
        <Anchor href="#" icon={<Add />} label="Add" onClick={this._addBox.bind(this, box, parent)}/>
        <Anchor href="#" icon={<Close />} label="Delete" onClick={this._deleteBox.bind(this, box, parent)}/>
      </Box>);
  }

  _onSave() {
    AQLActions.saveWall(this.state.box, (data) => {
      if (data)
        this._loadWall();

      this.setState({
        savedAlert: <AlertForm onClose={()=>{
          this.setState({
            savedAlert: null});}}
                                 title={'AM Insight layout saved!'}
                                 onConfirm={()=>{
                                   this.setState({
                                     savedAlert: null});}}/>
      });
    });
  }

  render() {
    var box = this.state.box;
    return (
      <Box direction="column" pad="medium" full="horizontal">
        <Box justify="between" direction="row">
          {
            this.state.edit &&
            <Anchor link="#" icon={<Checkmark />} onClick={this._onSave.bind(this)} label="Save"/>
          }
          {
            !this.state.edit &&
            <Anchor href="#" icon={<Camera />} label="Picture"/>
          }
          <CheckBox id="edit" label="Edit" checked={this.state.edit} onChange={this._toggleEdit.bind(this)}
                    toggle={true}/>

        </Box>
        {this._buildBox(box, box)}
        {this.state.layer}
        {this.state.savedAlert}
      </Box>
    );
  }
}

