import React, { Component, PropTypes } from 'react';
import Anchor from 'grommet/components/Anchor';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

export default class RecordList extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  render() {
    var records = this.props.records;

    var recordComponents = records.map((record, index) => {
      return <TableRow key={index}><td><Anchor key={index}>{record.self}!</Anchor></td></TableRow>;
    });

    return (
      <div>
        List:
        <Table>
          <tbody>
          {recordComponents}
          </tbody>
        </Table>
      </div>
    );
  }
}

RecordList.propTypes = {
  records: PropTypes.array.isRequired
};
