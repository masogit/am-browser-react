import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Header from 'grommet/components/Header';
import Box from 'grommet/components/Box';
import Footer from 'grommet/components/Footer';
import Search from 'grommet/components/Search';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';

export default class Widget extends Component {

  constructor() {
    super();
    this.state = {};
    this._onSearch = this._onSearch.bind(this);
  }

  componentDidMount() {
    //this.props.dispatch(loadTemplates());
  }

  _onSearch(event) {
    this.setState({
      filtered: this.props.templates.filter((obj) => obj.name.toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1)
    });
  }

  render() {
    const {templates} = this.props;
    var templatesState = (typeof (this.state.filtered) != 'undefined') ? this.state.filtered : templates;
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
        <div className="searchviews">
          <Search inline={true} placeHolder="Search views" size="medium"
            fill={true} responsive={false} onDOMChange={this._onSearch}/>
        </div>
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
