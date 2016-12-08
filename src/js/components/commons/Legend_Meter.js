// @flow weak
import React, { Component, PropTypes } from 'react';

import { Box, Meter, Value} from 'grommet';
import {setColorIndex} from '../../util/charts';
import Legend from './Legend';

class LegendMeter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0
    };
    this.handleActive = this.handleActive.bind(this);
  }

  handleActive (index) {
    this.setState({ activeIndex: index });
  };

  renderLegend (props) {
    return (
      <Legend justify='start' pad='medium' flex={false} {...props} onActive={this.handleActive}/>
    );
  };

  renderValue (meterSeries, activeIndex, units) {
    const valueObj = meterSeries[activeIndex] || {};

    const value = valueObj.value;
    const label = valueObj.label || <Box pad='small'/>;
    const onClick = valueObj.onClick;

    return (
      <Value
        value={value}
        units={value ? units : ''}
        align="center"
        label={label}
        onClick={onClick}
        />
    );
  };

  render() {
    const {
      className,
      type,
      size,
      units,
      meterSeries = [],
      legendPosition,
      legendTitle,
      legendSeries = [],
      legendTotal,
      threshold,
      stacked,
      vertical,
      max,
      min,
      thresholds,
      important
      } = this.props;

    const activeIndex = this.state.activeIndex != undefined ? this.state.activeIndex : important;
    let [direction, meterDir] = ['row', 'column'];
    if (legendPosition == 'top' || legendPosition == 'bottom') {
      [meterDir, direction] = ['row', 'column'];
    }

    let top_left_Legend = null;
    let bottom_right_Legend = null;
    const legend = legendPosition && legendSeries.length > 0 && this.renderLegend({series: legendSeries, units, activeIndex, title: legendTitle, size, total: legendTotal});
    if (legendPosition == 'left' || legendPosition == 'top') {
      top_left_Legend = legend;
    } else if (legendPosition == 'right' || legendPosition == 'bottom') {
      bottom_right_Legend = legend;
    }

    return (
      meterSeries.length > 0 &&
        <Box direction={direction} className={className}>
          {top_left_Legend}
          <Box direction={meterDir} align='center'>
            <Meter
              className={type == 'bar' && meterSeries.length > 4 ? ' grommetux-meter--count-4' : ''}
              type={type} label={false} series={setColorIndex(meterSeries)}
              stacked={stacked} activeIndex={activeIndex} size={size}
              threshold={threshold} vertical={vertical}
              onActive={this.handleActive} max={max} min={min}
              thresholds={thresholds}
              />
            {this.renderValue(meterSeries, activeIndex, units)}
          </Box>
          {bottom_right_Legend}
        </Box>
    );
  }
}

const SeriesPropType = PropTypes.arrayOf(PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  colorIndex: PropTypes.string
}));

LegendMeter.defaultProps = {
  showLegendTotal: true
};

LegendMeter.propTypes = {
  className: PropTypes.string,
  meterSeries: SeriesPropType,
  legendSeries: SeriesPropType,
  legendTitle: PropTypes.string,
  showLegendTotal: PropTypes.bool,
  stacked: PropTypes.bool,
  vertical: PropTypes.bool,
  type: PropTypes.oneOf(['bar', 'arc', 'circle', 'spiral']),
  legendPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right', '']),
  units: PropTypes.string,
  max: PropTypes.number,
  min: PropTypes.number,
  important: PropTypes.number,
  threshold: PropTypes.number,
  thresholds: SeriesPropType,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default LegendMeter;
