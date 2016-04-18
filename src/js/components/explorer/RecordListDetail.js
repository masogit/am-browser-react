import React, { Component, PropTypes } from 'react';
import Anchor from 'grommet/components/Anchor';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

export default class RecordListDetail extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  render() {
    var records = this.props.records;
    //var record = this.props.record;

    var recordComponents = records.map((record, index) => {
      return <TableRow key={index}><td><Anchor key={index}>Hello, {record.self}!</Anchor></td></TableRow>;
    });

    //var fields = record.map((field, index) => {
    //  return <p key={index}><label key={index}>{field.$.label}:{field.value}</label></p>;
    //});

    return (
      <div>
        <Table>
          <tbody>
          {recordComponents}
          </tbody>
        </Table>
        Detail:
      </div>
    );
  }
}

RecordListDetail.propTypes = {
  records: PropTypes.array.isRequired
};
