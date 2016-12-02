/**
 * Created by huling on 12/1/2016.
 */

import React, {Component} from 'react';
import {Box, Legend, Label} from 'grommet';
import {setColorIndex} from '../../util/charts';
import {pick} from 'grommet/utils/Props';

export default class AMLegend extends Component {
  render() {
    const {series, total = true, units, activeIndex, title, onActive} = this.props;
    if (!series || series.length == 0) {
      return null;
    }

    const boxProps = pick(this.props, Object.keys(Box.propTypes));
    let titleComp;
    if (typeof title == 'string') {
      titleComp = <Label truncate={true} margin='none'>{title}</Label>;
    } else {
      titleComp = title;
    }

    return (
      <Box {...boxProps}>
        {titleComp}
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
