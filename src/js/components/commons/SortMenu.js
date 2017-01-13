import React, {Component, PropTypes} from 'react';
import { Anchor, Menu } from 'grommet';
import Sort from 'grommet/components/icons/base/Sort';

export default class SortMenu extends Component {

  constructor(props) {
    super(props);
    const {sortDefault, data} = this.props;
    this.state = {
      selectedLabel: sortDefault ? this.getLabel(data, sortDefault) : ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data != this.props.data) {
      const {sortDefault, data} = nextProps;

      this.setState({
        selectedLabel: sortDefault ? this.getLabel(data, sortDefault) : ''
      });
    }
  }

  getLabel(propsData, sortDefault) {
    let label = '';
    propsData.forEach(data => {
      if (data.value == sortDefault)
        label = data.label;
    });

    return label;
  }

  render() {

    return (
      <Menu icon={<Sort />} label={this.state.selectedLabel} dropAlign={{ right: 'right', top: 'top' }}>
      {
        this.props.data.map((data, index) => {
          return (
            <Anchor key={index} label={data.label} onClick={() => {
              this.setState({
                selectedLabel: data.label
              });
              this.props.onSort(data.value);
            }}/>
          );
        })
      }
      </Menu>
    );
  }
}

SortMenu.propTypes = {
  search: PropTypes.string
};
