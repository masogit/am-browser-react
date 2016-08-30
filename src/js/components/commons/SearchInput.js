// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import React from 'react';
import {SearchInput} from 'grommet';

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

