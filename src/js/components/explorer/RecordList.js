import React, { Component, PropTypes } from 'react';
// import Anchor from 'grommet/components/Anchor';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';
// import Search from 'grommet/components/Search';
// import Menu from 'grommet/components/Menu';
// import Header from 'grommet/components/Header';
// import Filter from 'grommet/components/icons/base/Filter';
// import Tree from 'grommet/components/icons/base/Tree';
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
      return <TableRow key={index}>
              <td>{record.self}</td>
              {
                template.body.fields.map((field, tdindex) => {
                  return !field.PK &&
                    <td key={tdindex} onClick={this._onClick.bind(this, template, record)}>{record[field.sqlname]}</td>;
                })
              }
             </TableRow>;
    });

    var header = template.body.fields.map((field, index) => {
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

RecordList.propTypes = {
  records: PropTypes.array.isRequired
};
