import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Treebeard, decorators } from 'react-treebeard';
import { metadataLoad, metadataLoadDetail, metadataSearch, metadataLoadNode, metadataCursorSuccess } from '../../actions';
import TreeTheme from './TreeTheme';
import Sidebar from 'grommet/components/Sidebar';
import Header from 'grommet/components/Header';
//import Footer from 'grommet/components/Footer';
//import Title from 'grommet/components/Title';
//import Menu from 'grommet/components/Menu';
//import CloseIcon from 'grommet/components/icons/Clear';
//import Search from 'grommet/components/Search';
//import Gravatar from 'react-gravatar';
//import Article from 'grommet/components/Article';
//import Section from 'grommet/components/Section';
import Anchor from 'grommet/components/Anchor';
import Menu from 'grommet/components/Menu';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';

// Example: Customising The Header Decorator To Include Icons
decorators.Header = (props) => {
  const style = props.style;
  const iconType = props.node.children ? 'folder' : 'file-text';
  const iconClass = `fa fa-${iconType}`;
  const iconStyle = { marginRight: '5px' };
  return (
    <div style={style.base}>
      <div style={style.title}>
        <i className={iconClass} style={iconStyle}/>
                {props.node.name}
      </div>
    </div>
  );
};

export default class Builder extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    this._onToggle = this._onToggle.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(metadataLoad());
  }

  _onSearch(event) {
    let sidebarsearch = event.target;
    this.props.dispatch(metadataSearch(this.props.data, sidebarsearch.value, this.props.allData));
  }

  _onClick(id) {
    this.props.dispatch(metadataLoadDetail(id));
  }

  _onToggle(node, toggled) {
    if (this.props.cursor) {
      this.props.cursor.active = false;
    }
    node.active = true;
    if (node.children && node.desttable) {
      this.props.dispatch(metadataLoadNode(node.desttable, node));
      node.toggled = toggled;
    }
    this.props.dispatch(metadataCursorSuccess(node));
  }

  render() {
    let item = this.props.rows;
    let items = item.map((row, index) => {
      return <Anchor key={index} className="active" onClick={this._onClick.bind(this, row.id)}>{row.id}</Anchor>;
    });
    return (
      <div className="example">
        <Sidebar primary={true} pad="small" size="large">
          <Tabs initialIndex={0} justify="start">
            <Tab title="Views">
              <Header large={true} flush={false}>
                <input className="sidebarsearch" type="text" placeholder="Search views..."/>
              </Header>
              <h3>Views</h3>
            </Tab>
            <Tab title="Tables">
                <Menu label="Tables">
                  {items}
                </Menu>
              <Header large={true} flush={false}>
                <input className="sidebarsearch" type="text" placeholder="Search fields and links..." onChange={this._onSearch}/>
              </Header>
              <Treebeard
                data={this.props.data}
                onToggle={this._onToggle}
                style={TreeTheme}
                decorators={decorators}
              />
            </Tab>
          </Tabs>
        </Sidebar>
      </div>
    );
  }
}

Builder.propTypes = {
  rows: PropTypes.array.isRequired,
  allData: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  cursor: PropTypes.object.isRequired
};

let select = (state, props) => {
  return {
    rows: state.metadata.rows,
    allData: state.metadata.allData,
    data: state.metadata.data,
    node: state.metadata.node,
    cursor: state.metadata.cursor
  };
};

export default connect(select)(Builder);
