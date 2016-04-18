import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
import AccordionItem from './AccordionItem';

export default class Accordion extends Component {

  constructor() {
    super();
    this.state = {
    };
    this.onSearch = this.onSearch.bind(this);
  }

  onSearch(event) {
    this.setState({
      filtered : this.props.views.filter((obj) => obj.name.toLowerCase().indexOf(event.target.value.toLowerCase().trim()) !== -1)
    });
  }

  renderItems(views) {
    return views.map((view, key) => {
      return (
        <AccordionItem group={view.group} key={key}><Link to={`/views/${view.$loki}`}>{view.name}</Link></AccordionItem>
      );
    });
  }

  render() {
    const { views, isFetching } = this.props;
    var viewsState = (typeof (this.state.filtered) != 'undefined') ? this.state.filtered : views;
    return (
      <Sidebar primary={true} pad="small" fixed={false} full={false}>
      <div style={{"backgroundColor": "#01a982", "color": "#ffffff", "width": "280px", "height": "820px"}}>
        <Header large={true} flush={false}>
          <input className="sidebarsearch" type="text" placeholder="Search views..." onChange={this.onSearch} style={{"backgroundColor": "#ffffff", "color": "#000000", "margin": "40px 24px 24px"}}/>
        </Header>
        <div>
          {viewsState.length > 0 &&
          <div>{this.renderItems(viewsState)}</div>
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
      </div>
      </Sidebar>
    );
  }
}

Accordion.propTypes = {
  views: PropTypes.array.isRequired
};
