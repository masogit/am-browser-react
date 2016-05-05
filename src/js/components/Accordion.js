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
    this._onNew = this._onNew.bind(this);
    this._onClose = this._onClose.bind(this);
  }

  onSearch(event) {
    this.setState({
      filtered : this.props.views.filter((obj) => obj.name.toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1)
    });
  }

  _onNew() {
    this.setState({active: true});
    this.props.newSelectedView();
  }

  _onOpen(viewId) {
    this.setState(
      {
        active: true,
        viewId: viewId
      }
    );
  }

  _onClose(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({active: false});
  }

  getGroups(views) {
    var groups = [];
    for (var i = 0; i < views.length; i++) {
      for (var j = 0; j < groups.length; j++) {
        if (views[i].category == groups[j]) {
          break;
        }
        if (j == groups.length - 1) {
          groups.push(views[i].category);
        }
      }
      if (i == 0) {
        groups.push(views[i].category);
      }
    }
    return groups;
  }

  renderItems(views, isEditable) {
    const {type} = this.props;
    let editButton = null;
    let Edit = require('grommet/components/icons/base/Edit');
    let groups = this.getGroups(views);
    return groups.map((group, key) => {
      let links = views.filter(view => view.category == group).map((view, link_key) => {
        if (isEditable) {
          editButton = (
            <Button icon={<Edit size="large" colorIndex="brand"/>} onClick={this._onOpen.bind(this, view._id)}/>
          );
        }
        return (
          <Link to={`/${type}/${view._id}`} key={link_key}>{view.name}{editButton}</Link>
        );
      });
      return (
        <AccordionItem category={group} key={key}>{links}</AccordionItem>
      );
    });
  }

  render() {
    const { views, isFetching, isEditable } = this.props;
    let activeLayer = null;
    if (this.state && this.state.active) {
      if (this.state.viewId) {
        let selectedView = views.filter(view => view._id == this.state.viewId)[0];
        activeLayer = (
          <Layer onClose={this._onClose} closer={true} align="left">
            <Builder filterEntities={selectedView.body.sqlname}/>
          </Layer>
        );
      } else {
        activeLayer = (
          <Layer onClose={this._onClose} closer={true} align="left">
            <Builder/>
          </Layer>
        );
      }
    }
    let viewsState = this.state && this.state.filtered ? this.state.filtered : views;
    return (
      <Sidebar primary={true} pad="small" fixed={false} full={false}>
      <div style={{"backgroundColor": "#01a982", "color": "#ffffff", "width": "280px", "height": "820px"}}>
        <Button label="Add" onClick={this._onNew}/>
        <Header large={true} flush={false}>
          <input className="sidebarsearch" type="text" placeholder="Search views..." onChange={this.onSearch} style={{"backgroundColor": "#ffffff", "color": "#000000", "margin": "40px 24px 24px"}}/>
        </Header>
        <div>
          {viewsState.length > 0 &&
          <div>{this.renderItems(viewsState, isEditable)}</div>
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
