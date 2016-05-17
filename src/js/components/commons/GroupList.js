import React, {Component, PropTypes} from 'react';
import {
  Anchor,
  Box,
  List,
  SearchInput
} from 'grommet';
import Next from '../../../../node_modules/grommet/components/icons/base/Next';
import Down from '../../../../node_modules/grommet/components/icons/base/Down';

export default class GroupList extends Component {

  constructor() {
    super();
    this.state = {
      expand: ''
    };
  }

  componentDidMount() {
  }

  _getGroupedChildren(children) {
    var grouped = {};
    children.forEach((child) => {
      if (grouped[child.props.groupby]) {
        grouped[child.props.groupby].push(child);
      } else {
        grouped[child.props.groupby] = [child];
      }
    });
    return grouped;
  }

  _expandToggle(key) {
    if (key !== this.state.expand)
      this.setState({
        expand: key
      });
    else
      this.setState({
        expand: ''
      });
  }

  _onSearch(keyword) {
    var keyword = keyword.toLowerCase().trim();
    if (keyword) {
      var filtered = this.props.children.filter((child) => {
        return child.props.groupby.toLowerCase().indexOf(keyword) > -1 ||
          child.props.children.props.children.toLowerCase().indexOf(keyword) > -1;
      });
      this.setState({
        filtered: filtered
      });
    } else
      this.setState({
        filtered: null
      });
  }

  render() {
    var children = this.state.filtered || this.props.children;
    var grouped = this._getGroupedChildren(children);

    return (

      <Box direction="column">
        {
          this.props.searchable &&
          <SearchInput placeHolder="Search..." onChange={this._onSearch.bind(this)}/>
        }
        {
          Object.keys(grouped).map((key, i) => {
            return (<Box key={i} direction="column">
              <Box justify="between" direction="row" {...this.props}>
                <Anchor href="#" label={key} icon={(this.state.expand===key)?<Down />:<Next />}
                        onClick={this._expandToggle.bind(this, key)}/>{grouped[key].length}
              </Box>
              {
                this.state.expand === key &&
                <List {...this.props}>
                  {
                    grouped[key].map((child) => {
                      return child;
                    })
                  }
                </List>
              }
            </Box>);
          })
        }
      </Box>
    );
  }
}

GroupList.propTypes = {
  searchable: PropTypes.bool
};
