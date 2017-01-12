import React, {Component, PropTypes} from 'react';
import { Anchor, Menu } from 'grommet';
import Sort from 'grommet/components/icons/base/Sort';

export default class SortMenu extends Component {

  constructor() {
    super();
    this.state = {
      selectedLabel: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.data.indexOf(this.state.selectedLabel) && nextProps.data != this.props.data) {
      this.setState({
        selectedLabel: ''
      });
    }
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
