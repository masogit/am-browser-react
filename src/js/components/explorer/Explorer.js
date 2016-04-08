import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import {HOST_NAME} from '../../constants/Config';
import { loadTemplates, loadRecords } from '../../actions';
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
import Anchor from 'grommet/components/Anchor';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
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
    //this.state = {ids: ['test1', 'test2', 'test3']};
  }

  componentDidMount() {
    this.props.dispatch(loadTemplates());
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

  _onClick(template) {
    this.props.dispatch(loadRecords(template));
  }
  render() {
    var templates = this.props.templates;
    var records = this.props.records;
    //console.log(links);

    var templateComponents = templates.map((template, index) => {
      return <Anchor key={index} onClick={this._onClick.bind(this, template)}>Hello, {template.name}!</Anchor>;
    });

    var recordComponents = records.map((record, index) => {
      return <TableRow key={index}><td>Hello, {record.self}!</td></TableRow>;
    });

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
            {templateComponents}
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
        <Table>
          <tbody>
          {recordComponents}
          </tbody>
        </Table>
      </div>
    );
  }
}

Explorer.propTypes = {
  templates: PropTypes.array.isRequired,
  records: PropTypes.array.isRequired
};

let select = (state, props) => {
  return {
    templates: state.explorer.templates,
    records: state.explorer.records
  };
};

export default connect(select)(Explorer);
