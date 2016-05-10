import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Header from 'grommet/components/Header';
import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import RecordSearch from './explorer/RecordSearch';

export default class Widget extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._onEnter = this._onEnter.bind(this);
    this.state={
      keyword: ''
    }
  }

  componentDidMount() {
    //this.props.dispatch(loadTemplates());
  }

  _onEnter(event) {
    if ((event.keyCode === 13))
      this.setState({
        keyword: event.target.value.trim()
      });
  }

  _onSearch(event) {
    this.setState({
      filtered: this.props.templates.filter((obj) => obj.name.toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1)
    });
  }

  render() {
    const {templates} = this.props;
    var templatesState = this.state && this.state.filtered ? this.state.filtered : templates;
    let widgets = templatesState.map((template, key) => {
      return (
        <Tile key={key} selected={true} align="start" separator="top" colorIndex="light-1">
          <Header tag="h4" size="small" pad={{horizontal: 'small'}}>
            <strong>Description:{template.description}</strong>
          </Header>
          <Box pad="small">
            <p><Link to={`/explorer/${template._id}`}>{template.name}</Link></p>
          </Box>
          <Footer justify="between">
            <span>Group:{template.group}</span>
          </Footer>
        </Tile>
      );
    });
    return (
      <div>
        <Box direction="row">
          <input type="search" inline={true} className="flex" placeholder="Global View and Record search..."
                 onKeyDown={this._onEnter} onChange={this._onSearch}/>
        </Box>
        {
          this.state.keyword &&
          <RecordSearch keyword={this.state.keyword}/>
        }
        <Tiles flush={false} colorIndex="light-2" full="horizontal">
          {widgets}
        </Tiles>
      </div>
    );
  }
}

Widget.propTypes = {
  templates: PropTypes.array.isRequired
};
