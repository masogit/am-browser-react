/**
 * Created by huling on 12/1/2016.
 */
// @flow weak

import React, { Component, PropTypes } from 'react';
import Legend from './Legend';
import {setColorIndex} from '../../util/charts';
import {Box, Distribution} from 'grommet';

class LegendDistribution extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: null
    };
    this.handleActive = this.handleActive.bind(this);
  }

  handleActive(index) {
    this.setState({activeIndex: index});
  }

  renderLegend(props) {
    return <Legend justify='start' pad='medium' flex={false} {...props} onActive={this.handleActive}/>
  }

  render() {
    const {
      className,
      size,
      units,
      legendPosition,
      legendTitle,
      legendSeries,
      distributionSeries
      } = this.props;

    const activeIndex = this.state.activeIndex;

    let top_left_Legend = null;
    let bottom_right_Legend = null;
    const legend = legendPosition && legendSeries.length > 0 &&
      this.renderLegend({
        series: legendSeries,
        units,
        title: legendTitle,
        activeIndex
      });

    let direction = 'row';
    if (legendPosition == 'top' || legendPosition == 'bottom') {
      direction = 'column';
    }
    if (legendPosition == 'left' || legendPosition == 'top') {
      top_left_Legend = legend;
    } else if (legendPosition == 'right' || legendPosition == 'bottom') {
      bottom_right_Legend = legend;
    }

    return (
      distributionSeries.length > 0 &&
      <Box className={className} direction={direction}>
        {top_left_Legend}
        <Box flex>
          <Distribution
            series={setColorIndex(distributionSeries)}
            units={units}
            size={size}
            />
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

LegendDistribution.propTypes = {
  className: PropTypes.string,
  distributionSeries: SeriesPropType,
  legendSeries: SeriesPropType,
  showLegendTotal: PropTypes.bool,
  units: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large'])
};

export default LegendDistribution;
