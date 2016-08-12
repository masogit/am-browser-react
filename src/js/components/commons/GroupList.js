import React, {Component, PropTypes} from 'react';
import {
  Anchor,
  Box,
  List,
  ListItem
} from 'grommet';
import Next from 'grommet/components/icons/base/Next';
import Down from 'grommet/components/icons/base/Down';
import Spinning from 'grommet/components/icons/Spinning';
import _ from 'lodash';
import SearchInput from '../commons/SearchInput';

export default class GroupList extends Component {

  constructor() {
    super();
    this.state = {
      expand: ''
    };
  }

  componentWillMount() {
    if (this.props.focus) {
      this.setState({
        expand: this.props.focus.expand
      });
    }
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.focus && (!this.props.focus || nextProps.focus.expand !== this.props.focus.expand)) {
      this.setState({
        expand: nextProps.focus.expand
      });
    }
  }

  _selectSuggestion(event) {
    event.target.value = event.suggestion;
    this._onSearch(event);
  }

  _getSuggestions(children) {
    var suggestions = [];
    children.forEach((child) => {
      if (child.props.search) {
        suggestions.push(child.props.search);
      }
    });
    return suggestions;
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

  _onSearch(event) {
    var keyword = event.target.value.toLowerCase().trim();
    if (keyword) {
      var filtered = this.props.children.filter((child) => {
        return child.props.groupby.toLowerCase().indexOf(keyword) > -1 ||
          child.props.search.toLowerCase().indexOf(keyword) > -1;
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

    const expand = this.state.expand;
    return (
      <Box direction="column" className='fixMinSizing' flex={true}>
        {
          this.props.searchable &&
          <Box pad='small' flex={false}>
            <SearchInput placeHolder="Search..."  suggestions={this._getSuggestions(children)}
                         onSelect={this._selectSuggestion.bind(this)}/>
          </Box>
        }
        <Box className='autoScroll fixIEScrollBar'>
        {this.props.loading ? <ListItem separator="none"><Spinning /></ListItem>
          :
          Object.keys(grouped).map((key, i) => {
            const selected = this.props.focus && _.findIndex(grouped[key], (item => this.props.focus.selected == item.key));
            return (
              <Box key={i} direction="column" flex={false}>
                <List>
                  <ListItem pad='small' {...this.props} justify="between" direction="row" separator="none"
                            responsive={false} onClick={this._expandToggle.bind(this, key)}>
                    <Anchor href="#" label={key} icon={(expand===key)?<Down />:<Next />}/>
                    {grouped[key].length}
                  </ListItem>
                </List>
                {
                  expand === key &&
                  <List selected={selected}>
                    {grouped[key]}
                  </List>
                }
              </Box>
            );
          })
        }
        </Box>
      </Box>
    );
  }
}

GroupList.propTypes = {
  searchable: PropTypes.bool
};

