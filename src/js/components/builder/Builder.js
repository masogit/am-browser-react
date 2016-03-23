import React, { Component } from 'react';
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
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';

export default class Builder extends Component {

  constructor() {
    super();
    //this._onSearch = this._onSearch.bind(this);
    //this.state = {ids: ['test1', 'test2', 'test3']};
  }

  render() {
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
              <Header large={true} flush={false}>
                <input className="sidebarsearch" type="text" placeholder="Search tables..."/>
              </Header>
              <h3>Tables</h3>
            </Tab>
          </Tabs>
        </Sidebar>
      </div>
    );
  }
};
