import React, { Component } from 'react';
import Header from 'grommet/components/Header';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import Meter from 'grommet/components/Meter';
//import Table from 'grommet/components/Table';
import Form from 'grommet/components/Form';
import FormField from 'grommet/components/FormField';
import FormFields from 'grommet/components/FormFields';
//import LoginForm from 'grommet/components/LoginForm';
import Anchor from 'grommet/components/Anchor';
//import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
//import Button from 'grommet/components/Button';
//import Section from 'grommet/components/Section';
//import SearchInput from 'grommet/components/SearchInput';
//import Box from 'grommet/components/Box';
import App from 'grommet/components/App';
//import Status from 'grommet/components/icons/Status';
import Rest from 'grommet/utils/Rest';

let HOST_NAME = NODE_ENV === 'development' ? 'http://localhost:8080' : window.location.host;

const links = [
  {label: 'Explorer', value: 'explorer'},
  {label: 'Builder', value: 'builder'},
  {label: 'AQL', value: 'aql'}
];

export default class Dashboard extends Component {

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
    var linkComponents = links.map(function (link) {
      return <Anchor href="/browser/#{link.value}">{link.label}</Anchor>;
    });
    var ids = this.state.ids;
    var tileComponents = ids.map(function (id) {
      return <Tile>Hello, {id}!</Tile>;
    });
    return (
      <App centered='true'>
        <Header size="large" justify="between" colorIndex="neutral-1" pad={{vertical: 'small'}}>
          AM browser
          {linkComponents}
          <Menu>
            <Anchor href="/browser/#setting">Setting</Anchor>
            <Anchor href="#">Logout</Anchor>
          </Menu>
        </Header>
        <Form pad="medium" onSubmit={this._onSearch}>
          <FormFields>
            <fieldset>
              <FormField htmlFor="search">
                <input  type="text" id='search' name='search' placeholder="Search views" onChange={this._onSearch}/>
              </FormField>
            </fieldset>
          </FormFields>
        </Form>
        <Tiles fill={true} flush={false}>
          {tileComponents}
          <Tile>
            <Meter value={70} total={100} units="GB" vertical="true"/>
            <t value={40} type="arc"/>
          </Tile>
          <Tile>
            <Meter value={80} total={100} units="GB" type="circle"/>
          </Tile>
          <Tile>
            <Meter value={90} units="GB" min={{"value": 0, "label": "0 GB"}} max={{"value": 80, "label": "80 GB"}}
                   threshold={75}/>
          </Tile>
          <Tile>
            <Meter type="arc" legend={true} series={[
            {"label": "Gen 7", "value": 50, "colorIndex": "graph-1"},
            {"label": "Gen 8", "value": 200, "colorIndex": "graph-2"},
            {"label": "Gen 9", "value": 100, "colorIndex": "graph-3"},
            {"label": "Gen 10", "value": 300, "colorIndex": "graph-4"}
            ]}/>
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
      </App>
    );
  }
};
