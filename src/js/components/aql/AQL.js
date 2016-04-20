import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Sidebar,
  Split,
  // Footer,
  SearchInput,
  List,
  ListItem,
  // Header,
  Tabs,
  Tab
} from 'grommet';
import {loadAQLs, loadReports} from '../../actions/aql';

class AQL extends Component {

  constructor() {
    super();
    //this._onSearch = this._onSearch.bind(this);
    //this.state = {ids: ['test1', 'test2', 'test3']};
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(loadAQLs());
    dispatch(loadReports());
    // console.log('AQLs: ' + JSON.stringify(AQLs));
  }

  componentWillReceiveProps(newProps) {
  }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render() {
    const { AQLs, reports } = this.props;

    return (
      <Split flex="right">
        <Sidebar primary={true} pad="small" size="large">
          <SearchInput suggestions={['123', '2344']}/>
          <Tabs initialIndex={0} justify="start">
            <Tab title="Reports">
              <List selectable={true}>
                {
                  reports.entities &&
                  reports.entities.map((report) => {
                    return (
                      <ListItem key={report['ref-link']}>{report.Name}</ListItem>
                    );
                  })
                }

              </List>
            </Tab>
            <Tab title="Saved AQLs">
              <List selectable={true}>
                {
                  AQLs.map((aql) => {
                    return (
                      <ListItem key={aql._id}>{aql.name}</ListItem>
                    );
                  })
                }

              </List>
            </Tab>
          </Tabs>
        </Sidebar>
        <List selectable={true}>
          <ListItem>234</ListItem>
          <ListItem>123</ListItem>
          <ListItem>123</ListItem>
          <ListItem>123</ListItem>
        </List>
      </Split>
    );
  }
}
;

let mapStateToProps = (state) => {
  return {
    AQLs: state.aql.AQLs,  // see store-dev.js or store-prod.js
    reports: state.aql.reports
  };
};

export default connect(mapStateToProps)(AQL);
