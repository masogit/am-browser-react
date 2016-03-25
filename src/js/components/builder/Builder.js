import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { metadataLoad, metadataSearch } from '../../actions';
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
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

export default class Builder extends Component {

  constructor() {
    super();
    this._onSearch = this._onSearch.bind(this);
    //this.state = {ids: ['test1', 'test2', 'test3']};
  }

  componentDidMount() {
    this.props.dispatch(metadataLoad());
  }

  _onSearch(event) {
    let sidebarsearch = event.target;
    if (sidebarsearch.value.length > 2) {
      setTimeout(() => {
        this.props.dispatch(metadataSearch(this.props.rows, sidebarsearch.value));
      }, 500);
    }
  }

  render() {
    let item = this.props.filterRows;
    let items = item.map(function (row, index) {
      return <TableRow key={index}><td>{row.id}</td></TableRow>;
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
              <Header large={true} flush={false}>
                <input className="sidebarsearch" type="text" placeholder="Search tables..." onChange={this._onSearch}/>
              </Header>
              <h3>Tables</h3>
              <Table>
                <thead>
                  <tr>
                    <th>column1</th>
                  </tr>
                </thead>
                <tbody>
                  {items}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </Sidebar>
      </div>
    );
  }
}

Builder.propTypes = {
  rows: PropTypes.array.isRequired,
  filterRows: PropTypes.array.isRequired
};

let select = (state, props) => {
  return {
    rows: state.metadata.rows,
    filterRows: state.metadata.filterRows
  };
};

export default connect(select)(Builder);
