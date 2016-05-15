import React, {Component} from 'react';
import * as AQLActions from '../../actions/aql';
import Menu from 'grommet/components/icons/base/Menu';
import {
  Anchor,
  Box,
  Chart,
  Title
} from 'grommet';

export default class Wall extends Component {

  constructor() {
    super();
    this.state={
      aqls: []
    };
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

  render() {

    return (
      <Box direction="column">
      <Box align="end">
        <Anchor href="#" icon={<Menu />} />
      </Box>
      <Box align="top" justify="center" direction="row" pad="medium">
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

