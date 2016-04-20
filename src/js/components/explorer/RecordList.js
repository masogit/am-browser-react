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

  _onClick(template, record) {
    this.props.loadDetailRecord(template, record);
  }

  render() {
    var records = this.props.records;
    var template = this.props.template;

    var recordComponents = records.map((record, index) => {
      return <TableRow key={index}><td><Anchor key={index} onClick={this._onClick.bind(this, template, record)}>{record.self}</Anchor></td></TableRow>;
    });

    var header = template.body.fields.map((field, index) => {
      return !field.PK && <th>{ field.alias?field.alias:(field.label?field.label:field.sqlname)}</th>;
    });

    return (
      <div>
        List:
        <Table>
          <thead>
            <tr>
              {header}
            </tr>
          </thead>
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
