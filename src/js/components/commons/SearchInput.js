// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import React, {Component} from 'react';
import {SearchInput, Box, Anchor, Header} from 'grommet';
import Search from 'grommet/components/icons/base/Search';

export default class Input extends SearchInput {
  componentDidMount() {
    const _renderDrop = this.search._renderDrop.bind(this.search);
    this.search._renderDrop = () => <div style={{background: '#fff', boxShadow: '0px 0px 4px #eee inset'}}>{_renderDrop()}</div>;
    this.setSuggestions();
  }

  componentDidUpdate() {
    this.setSuggestions();
  }

  setSuggestions() {
    const suggestions = this.props.suggestions;
    if (!this.state.suggestions && suggestions && suggestions.length > 0) {
      this.setState({ suggestions });
    }
  }

  _onSearch(event) {
    const suggestions = this.props.suggestions;
    if (suggestions) {
      var keyword = event.target.value.toLowerCase().trim();
      if (keyword) {
        var filtered = suggestions.filter((child) => child.toLowerCase().indexOf(keyword) > -1);
        this.setState({ suggestions: filtered });
      } else {
        this.search.setState({ dropActive: false });
        this.setState({ suggestions });
      }
    }
    if (this.props.onDOMChange) {
      this.props.onDOMChange(event);
    }
  }

  render() {
    return (
      <SearchInput ref={node => this.search = node}
                   {...this.props}
                   suggestions={this.state.suggestions}
                   onDOMChange={this._onSearch.bind(this)} />);
  }
}

export class LongSearchInput extends Component {
  _onEnter(event) {
    const searchText = event.target.value.trim();
    if (event.keyCode === 13) {
      this.props.onSearch(searchText);
    }
  }

  render () {
    const {direction, title, onSearch} = this.props;
    let dir, marginBottom, marginRight, flex, tag;

    if (direction == 'column') {
      dir = direction;
      marginBottom = '12px';
      marginRight = 0;
      tag = 'h1';
      flex = false;
    } else {
      dir = 'row';
      marginBottom = 0;
      marginRight = '12px';
      tag = 'h2';
      flex = true;
    }

    return (
      <Header justify="between" direction={dir} full='horizontal' align='center'>
        <Box tag={tag} style={{marginBottom: marginBottom, marginRight: marginRight}}>{title || 'Global Record Search'}</Box>
        <Box flex={flex} direction='row'>
          <input type="search" className="flex shadow" ref="input" size='120'
                 onKeyDown={this._onEnter.bind(this)} maxLength={50}/>
          <Box colorIndex='brand' pad={{vertical: 'small', horizontal: 'medium'}} className='button'
               onClick={()=>onSearch(this.refs.input.value.trim())}>
            <Anchor icon={<Search/>} label='Search'/>
          </Box>
        </Box>
      </Header>
    );
  }
}
