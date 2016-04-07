import React, { Component } from 'react';
import {HOST_NAME} from '../../constants/Config';
import Header from 'grommet/components/Header';
//import Title from 'grommet/components/Title';
//import Logo from './Logo'; // './HPELogo';
//import NavHeader from './NavHeader';
//import ActionsLogo from 'grommet/components/icons/base/Actions';
//import UserSettingsIcon from 'grommet/components/icons/base/UserSettings';
import Search from 'grommet/components/Search';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import Meter from 'grommet/components/Meter';
//import Table from 'grommet/components/Table';
//import LoginForm from 'grommet/components/LoginForm';
//import Anchor from 'grommet/components/Anchor';
//import Footer from 'grommet/components/Footer';
//import Menu from 'grommet/components/Menu';
//import Button from 'grommet/components/Button';
import Section from 'grommet/components/Section';
//import SearchInput from 'grommet/components/SearchInput';
//import Box from 'grommet/components/Box';
//import App from 'grommet/components/App';
//import Status from 'grommet/components/icons/Status';
import Rest from 'grommet/utils/Rest';

export default class Explorer extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    this.state = {ids: ['test1', 'test2', 'test3']};
  }

  _onSearch(value) {
    var self = this;
    console.log(value);
    Rest.post(HOST_NAME + '/cache/search', {keyword: value}).end(function (err, res) {
      if (err || !res.ok) {
        //dispatch(loginFailure(res.body));
        console.log("error");
      } else {
        console.log('res.body:');
        console.log(res.body);
        console.log(res.body.ids);
        self.setState({ids: res.body.ids});
      }
    });
  }

  render() {
    //var links = this.state.links;
    //console.log(links);

    //var ids = this.state.ids;
    //var tileComponents = ids.map(function (id) {
    //  return <Tile>Hello, {id}!</Tile>;
    //});
    return (
      <div>
        <div className="searchviews">
          <Search inline={true} placeholder="Search views" size="medium"
                  fill={true} responsive={false} onDOMChange={this._onSearch}/>
        </div>
        <Section>
          <Header>
            <h3 className="searchviews">Sample Content</h3>
          </Header>
          <Tiles fill={true} flush={false}>
            <Tile>
              <Meter value={70} total={100} units="GB" vertical={true}/>
              <t value={40} type="arc"/>
            </Tile>
            <Tile>
              <Meter value={80} total={100} units="GB" type="circle"/>
            </Tile>
            <Tile>
              <Meter value={90} units="GB" min={{"value": 0, "label": "0 GB"}}
                     max={{"value": 80, "label": "80 GB"}}
                     threshold={75}/>
            </Tile>
          </Tiles>
        </Section>
        <Section>
          <Header>
            <h3 className="searchviews">Sample Content</h3>
          </Header>
          <Tiles fill={true} flush={false}>
            <Tile>
              <Meter type="arc" legend={true} series={[
            {"label": "Gen 7", "value": 50, "colorIndex": "graph-1"},
            {"label": "Gen 8", "value": 200, "colorIndex": "graph-2"},
            {"label": "Gen 9", "value": 100, "colorIndex": "graph-3"},
            {"label": "Gen 10", "value": 300, "colorIndex": "graph-4"}]}/>
            </Tile>
            <Tile>
              <Meter type="arc" legend={true} series={[
             {"label": "Gen 7", "value": 50, "colorIndex": "graph-1"},
             {"label": "Gen 8", "value": 200, "colorIndex": "graph-2"},
             {"label": "Gen 9", "value": 100, "colorIndex": "graph-3"},
             {"label": "Gen 10", "value": 300, "colorIndex": "graph-4"}]}/>
            </Tile>
            <Tile>
              <Meter value={40} type="arc" size="large"/>
            </Tile>
          </Tiles>
        </Section>
      </div>
    );
  }
};
