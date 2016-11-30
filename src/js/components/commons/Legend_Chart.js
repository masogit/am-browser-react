// @flow weak

import React, { Component, PropTypes } from 'react';

import {Legend , Box, chart, Label} from 'grommet';
import Chart from 'grommet/components/chart/Chart';
const {
  Axis,
  Bar,
  Layers,
  Base,
  Marker,
  Line,
  Area,
  MarkerLabel,
  HotSpots
  } = chart;

const getColorIndex = index => 'graph-' + (index % 8 + 1);

class LegendChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: null
    };
    this.handleActive = this.handleActive.bind(this);
    this.onClick = this.onClick.bind(this);
    this.getCountNum = this.getCountNum.bind(this);
  }

  componentDidUpdate() {
    this.refs.chart._onResize();
  }

  handleActive (index) {
    this.setState({ activeIndex: index });
  };

  onClick(index) {
    this.setState({ activeHotSpot: index });
  }

  getCountNum(data) {
    let countNum = 0;
    for (let i = 0; i < data.length; i += 1) {
      if (data[i].length > countNum) {
        countNum = data[i].length;
      }
    }
    return countNum;
  }

  renderMetaGraphs (data, type, activeIndex, max, min, points, smooth) {
    let ChartGraph = Bar;
    let metaGraphs = null;

    if (type && data) {
      metaGraphs = [];
      if (type === 'bar') {
        ChartGraph = Bar;
      } else if (type === 'line') {
        ChartGraph = Line;
      } else if (type === 'area') {
        ChartGraph = Area;
      }

      for (let i = 0; i < data.length; i += 1) {
        const colorIndex = this.props.legendSeries ? this.props.legendSeries[i].colorIndex : getColorIndex(i);
        metaGraphs.push(<ChartGraph
          key={i}
          values={data[i]}
          activeIndex={activeIndex}
          colorIndex={colorIndex}
          max={max}
          min={min}
          points={points}
          smooth={smooth}
          className={type== 'bar' ? 'bar' : ''}
          />);
      }
    }
    return metaGraphs;
  }

  renderAxisLabels(axisLabels) {
    if (axisLabels) {
      return <Axis ticks count={axisLabels.length} labels={axisLabels} />;
    }
    return null;
  };

  renderLegend(legendSeries, units, activeIndex) {
    let series = null;
    if (legendSeries) {
      series = legendSeries.map((item, index) => {
        if (!item.colorIndex) {
          item.colorIndex = getColorIndex(index);
        }
        return item;
      });
    } else {
      return null;
    }

    return (
      <Box pad='small' justify='end'>
        <Legend
          series={series}
          total={true}
          units={units}
          activeIndex={activeIndex}
          onActive={this.handleActive}
          />
      </Box>
    );
  }

  render() {
    const {
      className,
      type,
      size,
      xAxisPlacement,
      legendPosition,
      legendSeries = [],
      legendDirection,
      units = '',
      chartsValues = [],
      xAxisLabels = [],
      max,
      min,
      points,
      smooth,
      markerColorIndex,
      threshold,
      important
      } = this.props;

    /* Note: Segmented property is dropped.......*/
    let topPanel = null;
    let bottomPanel = null;
    let top_left_Legend = null;
    let bottom_right_Legend = null;

    const axisPanel = this.renderAxisLabels(xAxisLabels);

    if (xAxisPlacement === 'top') {
      topPanel = axisPanel;
    } else if (xAxisPlacement === 'bottom') {
      bottomPanel = axisPanel;
    }

    const count = this.getCountNum(chartsValues);
    const activeIndex = this.state.activeIndex;
    const label = xAxisLabels[activeIndex] ? xAxisLabels[activeIndex].displayValue + units: '';
    const legend = legendSeries.length > 0 && legendSeries.map(series => this.renderLegend(series, units, activeIndex));
    let [direction, legendDir] = ['row', 'column'];
    if (legendPosition == 'top' || legendPosition == 'bottom') {
      [legendDir, direction] = ['row', 'column'];
    }

    if (legendPosition == 'left' || legendPosition == 'top') {
      top_left_Legend = <Box direction={legendDirection || legendDir}>{legend}</Box>;
    } else if (legendPosition == 'right' || legendPosition == 'bottom') {
      bottom_right_Legend = <Box direction={legendDirection || legendDir}>{legend}</Box>;
    }

    return (
    chartsValues.length > 0 &&
        <Box direction={direction} className={className}>
          {top_left_Legend}
          <Chart vertical full ref='chart'>
            {topPanel}
            <Layers>
              {this.renderMetaGraphs(chartsValues, type, activeIndex || important, max, min, points, smooth)}
              {threshold && <Marker colorIndex='critical' value={threshold} />}
              <Marker
                count={count}
                index={activeIndex}
                value={activeIndex}
                vertical
                colorIndex={markerColorIndex || getColorIndex(1)}/>
              <MarkerLabel
                align='start'
                count={count}
                index={activeIndex}
                vertical
                label={<Label>{label}</Label>}/>
              <HotSpots
                count={count}
                activeIndex={activeIndex}
                onActive={this.handleActive}
                onClick={(a, b, c) => {
                  if(activeIndex && legendSeries.length > 0) {
                    legendSeries[0][activeIndex].onClick();
                  }
                }}
                />
            </Layers>
            <Base height={size} width="full" />
            {bottomPanel}
          </Chart>
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

const ChartsValuesPropType = PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number));

LegendChart.defaultProps = {
  showLegendTotal: true
};

LegendChart.propTypes = {
  chartsValues: ChartsValuesPropType,
  className: PropTypes.string,
  points: PropTypes.bool,
  legendSeries: PropTypes.arrayOf(SeriesPropType),
  legendPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  markerColorIndex: PropTypes.string,
  max: PropTypes.number,
  min: PropTypes.number,
  showLegendTotal: PropTypes.bool,
  size: PropTypes.oneOf(['xxsmall', 'xsmall', 'small', 'medium', 'large', 'sparkline']),
  smooth: PropTypes.bool,
  type: PropTypes.oneOf(['bar', 'line', 'area']),
  units: PropTypes.string,
  xAxisLabels: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired
  })),
  xAxisPlacement: PropTypes.oneOf(['top', 'bottom', ''])

};

export default LegendChart;

