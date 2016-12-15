import React, {Component} from 'react';
import {Box, Button, Icons} from 'grommet';
import _ from 'lodash';
const {Code} = Icons.Base;

export default class SearchInputWithTags extends Component {

  constructor(props) {
    super(props);
    let fields = this.props.searchFields ? this.props.searchFields.split(',') : [];
    let searchTags = fields ? fields.map(field => ({label: field.trim(), disabled: false})) : [];

    this.state = {
      searchFields: this.props.searchFields,
      searchTags: searchTags,
      locked: this.props.locked || false,
      aqlInput: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      let locked = this.props.locked;
      let aqlInput = this.state.aqlInput;

      if (nextProps.locked !== this.props.locked)
        locked = nextProps.locked;

      if (nextProps.reusedFilters !== this.props.reusedFilters) {
        this.refs.search.value=nextProps.reusedFilters;
        aqlInput = true;
      }

      this.setState({
        locked: locked,
        aqlInput: aqlInput
      });
    }
  }

  _resetSearchTags(field) {
    let searchFields = [];
    let searchTags = _.cloneDeep(this.state.searchTags);

    searchTags = searchTags.map(tag => {
      if (tag.label == field.label) {
        tag.disabled = !tag.disabled;
      }
      if (!tag.disabled)
        searchFields.push(tag.label);
      return tag;
    });

    searchFields = searchFields ? searchFields.join(',') : "";
    this.setState({
      searchTags: searchTags,
      searchFields: searchFields
    });
  }

  _toggleAQLInput() {
    let aqlInput = !this.state.aqlInput;
    this.setState({
      aqlInput: aqlInput
    });
  }

  onChange(event) {
    let aqlInput = this.state.aqlInput;

    if (event.target.value.trim()== '/') {
      this._toggleAQLInput();
      event.target.value="";
    } else if(!aqlInput) {
      this.props.onChange(event, aqlInput);
    }

  }

  renderTagButtons(tags) {
    const {aqlInput} = this.state;

    return (tags && tags.map((tag, index) => {
      return <Button label={tag.label} onClick={() => (!aqlInput && this._resetSearchTags(tag))} primary={!tag.disabled && !aqlInput} key={index}/>;
    }));
  }

  render() {
    const {searchFields, searchTags, aqlInput, locked} = this.state;
    const onSearch = this.props.onSearch;
    const aqlWhere = "press / input AQL where statement";
    const quickSearch = searchFields ? `press Enter to quick search in ${searchFields}; ${aqlWhere}` : aqlWhere;
    const placeholder = aqlInput ? "input AQL where statement…" : quickSearch;

    return (
      <Box className="set-position" flex={true}>
        <input type="text" className={aqlInput ? 'aql flex shadow' : 'flex shadow'} ref="search"
               placeholder={placeholder} disabled={locked}
               onKeyDown={(event) => (onSearch(event, searchFields, aqlInput, this.refs.search.value.trim()))}
               onChange={this.onChange.bind(this)}/>
             <Box justify="center" direction="row" flex={true} className="input-with-tag-buttons">
               {searchTags.length > 0 && !aqlInput && this.renderTagButtons(searchTags)}
               <Button icon={<Code />} primary={aqlInput} onClick={this._toggleAQLInput.bind(this)}/>
        </Box>
      </Box>
    );
  }
}
