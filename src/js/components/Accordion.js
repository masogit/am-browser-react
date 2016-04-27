import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import Button from 'grommet/components/Button';
import Layer from 'grommet/components/Layer';
import AccordionItem from './AccordionItem';
import Builder from './builder/Builder';

export default class Accordion extends Component {

  constructor() {
    super();
    this.onSearch = this.onSearch.bind(this);
    this._onOpen = this._onOpen.bind(this);
    this._onClose = this._onClose.bind(this);
  }

  onSearch(event) {
    this.setState({
      filtered : this.props.views.filter((obj) => obj.name.toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1)
    });
  }

  _onOpen(event) {
    this.setState({active: true});
  }

  _onClose(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({active: false});
  }

  renderItems(views, editButton) {
    const {type} = this.props;
    return views.map((view, key) => {
      return (
        <AccordionItem catagory={view.catagory} key={key}><Link to={`/${type}/${view._id}`}>{view.name}</Link>{editButton}</AccordionItem>
      );
    });
  }

  render() {
    const { views, isFetching, isEditable } = this.props;
    let editButton = null;
    let Edit = require('grommet/components/icons/base/Edit');
    if (isEditable) {
      editButton = (
        <Button icon={<Edit size="large" colorIndex="brand"/>} onClick={this._onOpen}/>
      );
    }
    let activeLayer = null;
    if (this.state && this.state.active) {
      activeLayer = (
        <Layer onClose={this._onClose} closer={true} align="left">
          <Builder/>
        </Layer>
      );
    }
    let viewsState = this.state && this.state.filtered ? this.state.filtered : views;
    return (
      <Sidebar primary={true} pad="small" fixed={false} full={false}>
      <div style={{"backgroundColor": "#01a982", "color": "#ffffff", "width": "280px", "height": "820px"}}>
        <Header large={true} flush={false}>
          <input className="sidebarsearch" type="text" placeholder="Search views..." onChange={this.onSearch} style={{"backgroundColor": "#ffffff", "color": "#000000", "margin": "40px 24px 24px"}}/>
        </Header>
        <div>
          {viewsState.length > 0 &&
          <div>{this.renderItems(viewsState, editButton)}</div>
          }
          {!isFetching && viewsState.length === 0 &&
          <h2>No data to display!</h2>
          }
          {isFetching &&
          <div>
          <h2>Fetching views</h2>
          </div>
          }
        </div>
        {activeLayer}
      </div>
      </Sidebar>
    );
  }
}

Accordion.propTypes = {
  views: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired
};
