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

import {setColorIndex, getColorIndex, resizeBar} from '../../util/charts';

class LegendChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0
    };
    this.handleActive = this.handleActive.bind(this);
    this.onClick = this.onClick.bind(this);
    this.getCountNum = this.getCountNum.bind(this);
    this.nodes = [];
  }

  componentDidMount() {
    this.nodes.forEach(node => {
      setTimeout(() => {
        resizeBar(node, this.props.chartsValues[0].length);
      }, 200);
    });
  }

  componentDidUpdate() {
    if (this.refs.chart) {
      this.refs.chart._onResize();
      this.refs.chart2._onResize();
    }
    this.nodes.forEach(node => {
      setTimeout(() => {
        resizeBar(node, this.props.chartsValues[0].length);
      }, 200);
    });
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
        const colorIndex = getColorIndex(i);
        metaGraphs.push(<ChartGraph
          key={i} values={data[i]} activeIndex={activeIndex}
          colorIndex={colorIndex} max={max} min={min}
          points={points} smooth={smooth}
          ref={node => {
            if (node && type === 'bar') {
              this.nodes.push(node);
            }
          }}
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

  renderLegend(series, units, activeIndex, titles, index, showTotal) {
    const title = titles[index];

    return (
      <Box pad='small' justify='end' key={index}>
        <Label truncate={true} margin='none'>{title}</Label>
        <Legend
          series={setColorIndex(series, index)}
          total={showTotal}
          units={units}
          activeIndex={activeIndex}
          onActive={this.handleActive}
          />
      </Box>
    );
  }

  renderMarkLabel(count, activeIndex, xAxisLabels, units, titles) {
    const series = xAxisLabels[activeIndex] ? xAxisLabels[activeIndex].displayValue.map((value, i) => ({
      label: titles[i],
      value,
      units,
      colorIndex: getColorIndex(i)
    })) : [{label: '', value: '', units: ''}];
    return (
      <MarkerLabel
        align='start'
        count={count}
        index={activeIndex}
        vertical
        label={<Box><Legend series={series}/></Box>}/>
    );
  }

  render() {
    const {
      className,
      type,
      size,
      xAxisPlacement,
      legendSeries = [],
      legendDirection,
      legendTitles,
      legendTotal,
      units = '',
      chartsValues = [],
      xAxisLabels = [],
      max: originMax,
      min: originMin,
      points,
      smooth,
      markerColorIndex,
      threshold,
      important
      } = this.props;

    let max = originMax;
    let min = originMin;
    if (!max) {
      max = Math.max(...chartsValues.map(values => Math.max(...values)));
    }
    if (!min) {
      min = Math.min(...chartsValues.map(values => Math.min(...values)));
    }
    // handle history data
    let legendPosition = this.props.legendPosition;
    if (legendPosition == 'overlay' || legendPosition == 'after') {
      legendPosition = 'right';
    }

    /* Note: Segmented property is dropped.......*/
    let topAxis = null;
    let bottomAxis = null;
    let top_left_Legend = null;
    let bottom_right_Legend = null;

    const axisPanel = this.renderAxisLabels(xAxisLabels);

    if (xAxisPlacement === 'top') {
      topAxis = axisPanel;
    } else if (xAxisPlacement === 'bottom') {
      bottomAxis = axisPanel;
    }

    const count = this.getCountNum(chartsValues);
    const activeIndex = this.state.activeIndex != undefined ? this.state.activeIndex : important;
    const legend = legendSeries.length > 0 && legendSeries.map((series, index) => this.renderLegend(series, units, activeIndex, legendTitles, index, legendTotal));
    let [direction, legendDir] = ['row', 'column'];
    if (legendPosition == 'top' || legendPosition == 'bottom') {
      [legendDir, direction] = ['row', 'column'];
    }

    if (legendPosition == 'left' || legendPosition == 'top') {
      top_left_Legend = <Box direction={legendDirection || legendDir} align='center' justify='center' flex={false}>{legend}</Box>;
    } else if (legendPosition == 'right' || legendPosition == 'bottom') {
      bottom_right_Legend = legendPosition && <Box direction={legendDirection || legendDir} align='center' justify='center' flex={false}>{legend}</Box>;
    }

    return (
      chartsValues.length > 0 &&
      <Box direction={direction} className={className + (type == 'bar' ? ' hide-HotSpots' : '')}>
        {top_left_Legend}
        <Chart ref='chart' full>
          <Axis count={5} vertical={true}
                labels={[{"index": 0, "label": min}, {"index": 2, "label": Math.floor(max/2)}, {"index": 4, "label": max}]} />
          <Chart vertical full ref='chart2'>
            <Base height={size} width="full"/>
            {topAxis}
            <Layers>
              <Marker colorIndex='graph-2' vertical value={0}/>
              {this.renderMetaGraphs(chartsValues, type, activeIndex, max, min, points, smooth)}
              {threshold && <Marker colorIndex='critical' value={threshold}/>}
              {xAxisPlacement && <Marker colorIndex='graph-2' value={0}/>}
              <Marker
                count={count}
                index={activeIndex}
                value={activeIndex}
                vertical
                colorIndex={markerColorIndex || getColorIndex(1)}/>
              {this.renderMarkLabel(count, activeIndex, xAxisLabels, units, legendTitles)}
              <HotSpots
                count={count}
                activeIndex={activeIndex}
                onActive={this.handleActive}
                onClick={() => {
                  if(Number.isInteger(activeIndex) && legendSeries.length > 0) {
                    legendSeries[0][activeIndex].onClick();
                  }
                }}
                />
            </Layers>
            {bottomAxis}
          </Chart>
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
  legendPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right', '', 'overlay', 'after']),
  markerColorIndex: PropTypes.string,
  max: PropTypes.number,
  min: PropTypes.number,
  showLegendTotal: PropTypes.bool,
  size: PropTypes.oneOf(['xxsmall', 'xsmall', 'small', 'medium', 'large', 'sparkline']),
  smooth: PropTypes.bool,
  type: PropTypes.oneOf(['bar', 'line', 'area']),
  units: PropTypes.string,
  xAxisLabels: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    index: PropTypes.number.isRequired
  })),
  xAxisPlacement: PropTypes.oneOf(['top', 'bottom', ''])

};

export default LegendChart;

