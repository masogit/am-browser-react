import React, {Component} from 'react';
import cookies from 'js-cookie';
import * as AQLActions from '../../actions/aql';
import * as ExplorerActions from '../../actions/explorer';
import * as Format from '../../util/RecordFormat';
import history from '../../RouteHistory';
import RecordList from '../explorer/RecordList';
import AlertForm from '../commons/AlertForm';
import EmptyIcon from '../commons/EmptyIcon';
import Add from 'grommet/components/icons/base/Add';
import Close from 'grommet/components/icons/base/Close';
import Attachment from 'grommet/components/icons/base/Attachment';
import Checkmark from 'grommet/components/icons/base/Checkmark';
import Search from 'grommet/components/icons/base/Search';
import Previous from 'grommet/components/icons/base/Previous';
import Graph from './../commons/Graph';
import { Anchor, Box, CheckBox, Header, Menu, Title, Table, TableRow,  Layer, Carousel, RadioButton } from 'grommet';
import GroupList from '../commons/GroupList';
import GroupListItem from '../commons/GroupListItem';

let idList = [];
export default class Insight extends Component {

  constructor() {
    super();
    this.state = {
      wall: {},
      edit: false,
      carousel: false,
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

  componentDidMount() {
    // get user name from localstorage
    var user = cookies.get('user') && cookies.get('user').toLowerCase();
    if (user) {
      if (this.props.params.id) {
        AQLActions.loadAQL(this.props.params.id, (aql)=> {
          this._queryData(aql);
        });
      } else {
        this._loadAQLs();
        this._loadWall(user);
      }
    }

  }

  _findAqls(box) {
    if (box.child && box.child._id) {
      AQLActions.loadAQL(box.child._id, (aql)=> {
        this._queryData(aql);
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
      if (result) {
        data[aql._id] = {
          aql: aql,
          data: result
        };
        this.setState({data});
      }
    });
  }

  _loadWall(user) {
    this.setState({data: {}});
    AQLActions.loadWalls((walls) => {
      var walls = walls.filter((wall)=> {
        return wall.user == user;
      });

      if (walls[0])
        this.setState({
          wall: walls[0],
          box: walls[0].box
        }, this._findAqls(walls[0].box));
      else
        this.setState({
          wall: {
            user: user,
            box: this.state.box
          }
        });
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
                                 pad={{horizontal: 'medium', vertical: 'small'}}
                                 onClick={this._attachAQL.bind(this, aql, box, parent)}>
                    <EmptyIcon />{aql.name}
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
    this._findAqls(box);
    this.setState({
      box: parent
    }, this._onClose(this));
  }

  _buildBox(box, parent) {
    let child;
    if (box.child) {
      if (box.child instanceof Array) {
        child = (
          <Box justify="center" {...box} flex={false}>{
            box.child.map((child, i) => {
              child.key = i;
              return this._buildBox(child, parent);
            })
          }</Box>
        );
      } else if (box.child._id && this.state.data[box.child._id]) {
        const dataMap = this.state.data[box.child._id];
        idList.push(box.child._id);
        child = (
          <Box justify="center" {...box} direction="column" pad="medium" flex={false}>
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
                  onClick={this._selectAQL.bind(this, box, parent)}/>
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
    var id = (Math.random() + 1).toString(36).substring(7);
    if (this.state.edit)
      return (
        <Box direction="row" justify="center" pad="small" flex={false}>
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
    // disable animation, so Chart can be rendered correctly
    setTimeout(()=> {
      if (this.refs.carousel) {
        this.refs.carousel.refs.carousel.className = this.refs.carousel.refs.carousel.className.replace('disable_animation', '');
      }
    }, 1000);

    return (
      <Carousel ref='carousel' className='disable_animation no-flex'>
        {
          idList.slice(-Object.keys(data).length).map((key, index)=> {
            const dataMap = data[key];
            return (
              <Box pad="large" colorIndex="light-2" key={index}>
                <Header>
                  <Anchor icon={<Search />} label={dataMap.aql.name} onClick={this._showAQLDetail.bind(this, dataMap.aql._id)}/>
                </Header>
                <Box pad="large" align={(dataMap.aql.type=='meter')?'center':null}>
                  <Graph key={dataMap.aql._id} type={dataMap.aql.type} data={dataMap.data} config={dataMap.aql.form}
                         onClick={(filter) => this._showViewRecords(filter, dataMap.aql.view)}/>
                </Box>
              </Box>
            );
          })
        }
      </Carousel>
    );
  }

  _showViewRecords(filter, viewInAQL) {
    if (viewInAQL && viewInAQL._id)
      ExplorerActions.loadView(viewInAQL._id, (view) => {
        var body = view.body;
        var newFitler = Format.getFilterFromField(view.body.fields, filter);
        body.filter = (body.filter) ? `(${body.filter} AND ${newFitler})` : newFitler;
        var layer = (
          <Layer onClose={this._onClose.bind(this)} closer={true} flush={true} align="center">
            <Box full={true} pad="large">
              <RecordList body={body} title={view.name}/>
            </Box>
          </Layer>
        );

        this.setState({
          layer: layer
        });
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
        <Box key={aql._id} pad="large" align={(aql.type=='meter')?'center':null}>
          <Graph type={aql.type} data={data} config={aql.form}
                 onClick={(filter) => this._showViewRecords(filter, aql.view)}/>
        </Box>
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
    wall.box = this.state.box;
    AQLActions.saveWall(wall, (data) => {
      if (data)
        this._loadWall(wall.user);
    });
  }

  _closeAlert() {
    this.setState({
      alert: null
    });
  }

  render() {
    const {box, data, carousel, edit, layer, alert} = this.state;
    const id = this.props.params.id;
    let content;
    if (id) {
      content = data && data[id] &&
        this._renderSingleAQL(data[id]);
    } else {
      content = carousel && !edit ? this._buildCarousel(data) : this._buildBox(box, box);
    }

    return (
      <Box pad="medium" full="horizontal">
        <Header justify="between" size="small" pad={{'horizontal': 'small'}}>
          <Title>AM Insight</Title>
          {
            !id &&
            <Menu direction="row" align="center" responsive={true}>
              {!edit &&
              <RadioButton id="carousel" name="choice" label="Carousel" onChange={this._toggleCarousel.bind(this)}
                           checked={carousel} disabled={edit}/>}
              {!edit &&
              <RadioButton id="dashboard" name="choice" label="Dashboard" onChange={this._toggleCarousel.bind(this)}
                           checked={!carousel || edit}/>
              }
              {edit && <Anchor link="#" icon={<Checkmark />} onClick={this._onSave.bind(this)} label="Save"/>}
              <CheckBox id="edit" label="Edit" checked={edit} onChange={this._toggleEdit.bind(this)}
                        toggle={true}/>
            </Menu>
          }
          {
            id && <Anchor icon={<Previous />} label="Back" onClick={() => {
              history.go(-1);
            }}/>
          }
        </Header>
        <Box className={edit ? '' : 'autoScroll'}>
          {content}
          {layer}
          {alert}
        </Box>
      </Box>
    );
  }
}
