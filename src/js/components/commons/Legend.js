/**
 * Created by huling on 12/1/2016.
 */

import React, {Component} from 'react';
import {Box, Legend, Label} from 'grommet';
import {setColorIndex} from '../../util/charts';

export default class AMLegend extends Component {
  render() {
    const {series, total = true, units, activeIndex, title, onActive} = this.props;
    if (!series || series.length == 0) {
      return null;
    }

    const props = Object.assign({}, this.props);
    delete props.series;
    delete props.units;
    delete props.activeIndex;
    delete props.total;
    delete props.onActive;
    delete props.title;

    return (
      <Box {...props}>
        <Label truncate={true} margin='none'>{title}</Label>
        <Legend
          series={setColorIndex(series)}
          total={total}
          units={units}
          activeIndex={activeIndex}
          onActive={onActive}
          />
      </Box>
    );
  }
}
