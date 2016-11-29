/**
 * Created by huling on 11/29/2016.
 */
import React, {Component} from 'react';
import {/*Legend,*/ Meter, Box} from 'grommet';

export class AMMeter extends Component {
  render() {
    const {form, data, onClick} = this.props;
    const meter = {
      //important: form.important || 0,
      //threshold: form.threshold || 0,
      //type: form.type,
      //series_col: form.series_col,
      //series: [],
      //col_unit: form.col_unit,
      //size: form.size,
      //vertical: form.vertical,
      //stacked: form.stacked,
      //units: form.units
      active: true,
      activeIndex: form.activeIndex,
      label: form.label,
      max: form.max,
      min: form.min,
      onActive: form.onActive,
      series: [],
      size: form.size,
      stacked: form.stacked,
      tabIndex: form.tabIndex,
      threshold: form.threshold,
      thresholds: form.thresholds,
      type: form.type,
      value: form.value,
      vertical: form.vertical,
      responsive: form.responsive
    };

    if (form.series_col) {
      data.rows.filter((row, index) => {
        const value = row[form.series_col] / 1.0;
        if (!isNaN(value)) {
          const label = form.col_unit ? '' + row[form.col_unit] : '';
          const filter = this._getFullCol(row, data.header);
          const mainFilterKey = form.col_unit || form.series_col;
          const mainFilterValue = form.col_unit ? label : value;
          meter.series.push({
            colorIndex: 'graph-' + (index % 8 + 1),
            label,
            value,
            onClick: onClick && onClick.bind(this, {
              key: data.header[mainFilterKey].Name,
              value: mainFilterValue
            }, filter)
          });
        }
      });

      // gen legend
      if (form.legend && form.legend.position) {
        meter.legend = {
          position: form.legend.position,
          total: form.legend.total
        };
      }
    }

    return (
      <Box>
        <Meter {...meter} />
      </Box>
    );

  }
}
