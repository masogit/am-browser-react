import React, { Component, PropTypes } from 'react';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

export default class RecordDetailLink extends Component {

  constructor() {
    super();
  }

  componentDidMount() {

  }

  render() {
    var link = this.props.link;
    var records = this.props.records;
    var recordComponents = records.map((record, index) => {
      return <TableRow key={index}>
              <td>{record.self}</td>
              {
                link.body.fields.map((field, tdindex) => {
                  return !field.PK &&
                    <td key={tdindex}>{record[field.sqlname]}</td>;
                })
              }
             </TableRow>;
    });

    var header = link.body.fields.map((field, index) => {
      return !field.PK && <th key={index}>{ field.alias?field.alias:(field.label?field.label:field.sqlname)}</th>;
    });

    return (
        <Table selectable={true} scrollable={true}>
          <thead>
            <tr>
              <th>Self</th>
              {header}
            </tr>
          </thead>
          <tbody>
          {recordComponents}
          </tbody>
        </Table>
    );
  }
}

RecordDetailLink.propTypes = {
  records: PropTypes.array.isRequired
};
