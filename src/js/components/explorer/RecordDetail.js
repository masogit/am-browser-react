import React, { Component, PropTypes } from 'react';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
import Tabs from 'grommet/components/Tabs';
import Tab from 'grommet/components/Tab';
import RecordDetailLink from './RecordDetailLink';

export default class RecordDetail extends Component {

  constructor() {
    super();
  }

  componentDidMount() {

  }

  render() {
    var template = this.props.template;
    var record = this.props.record;
    var links = this.props.links;
    var linkTabs = template.body.links.map((link, index) => {
      return <Tab title={(links[link.sqlname])?link.label+' ('+links[link.sqlname].length+')':link.label + ' (0)'} key={index}>
              {
                links[link.sqlname] &&
                <RecordDetailLink link={link} records={links[link.sqlname]}/>
              }
             </Tab>;
    });
    var fields = record.map((field, index) => {
      return <TableRow key={index}>
              <td>{field.label}</td><td>{field.value}</td>
             </TableRow>;
    });

    return (
      <div>

        <Tabs justify="start" initialIndex={0}>
          <Tab title={template.body.label}>
            <Table>{/*
              <thead>
              <tr>
                <th>Field</th><th>Value</th>
              </tr>
              </thead>*/}
              <tbody>
              {fields}
              </tbody>
            </Table>
          </Tab>
          {linkTabs}
        </Tabs>
      </div>
    );
  }
}

RecordDetail.propTypes = {
  record: PropTypes.array.isRequired
};
