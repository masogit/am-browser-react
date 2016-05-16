import React, {Component} from 'react';
import * as AQLActions from '../../actions/aql';
import Add from 'grommet/components/icons/base/Add';
import {
  Anchor,
  Box,
  Chart,
  Header,
  Title
} from 'grommet';

export default class Wall extends Component {

  constructor() {
    super();
    this.state = {
      aqls: [],
      box: {
        separator: 'all',
        direction: 'row',
        child: null
      }
    };
    this._buildBox.bind(this);
    this._buildActions.bind(this);
    this._addBox.bind(this);
  }

  componentDidMount() {
    this._loadAQLs();
  }

  _loadAQLs() {
    AQLActions.loadAQLs((data) => {
      this.setState({
        aqls: data
      });
    });
  }

  _addBox(box, direction, parent) {
    console.log(parent);
    box.direction = direction;
    if (box.child) {
      box.child.push({
        separator: 'all',
        direction: 'row',
        child: null
      });
    } else
      box.child = [{
        separator: 'all',
        direction: 'row',
        child: null
      }];
    this.setState({
      box: parent
    });
  }

  _buildBox(box, parent) {
    console.log(box);
    return (<Box {...box}>
      {this._buildActions(box, parent)}
      {
        box.child &&
        box.child.map((child) => {
          return this._buildBox(child, parent);
        })
      }
    </Box>);
  }

  _buildActions(box, parent) {
    return (<Header>
      <Anchor href="#" icon={<Add />} label="Row" onClick={this._addBox.bind(this, box, 'row', parent)}/>
      <Anchor href="#" icon={<Add />} label="Column" onClick={this._addBox.bind(this, box, 'column', parent)}/>
      <Anchor href="#" icon={<Add />} label="AQL"/>
    </Header>);
  }

  render() {
    var box = this.state.box;
    return (
      <Box direction="column" pad="medium">
        <Box separator="all">
          {this._buildBox(box, box)}
        </Box>
        <Box justify="center" direction="row" pad="medium">
          {
            this.state.aqls.map((aql, i) => {
              return aql.chart &&
                <Box direction="column" pad="small" separator="horizontal">
                  <Title>{aql.name}</Title>
                  <Chart key={i} {...aql.chart} />
                </Box>;
            })
          }
        </Box>
      </Box>
    );
  }
}

