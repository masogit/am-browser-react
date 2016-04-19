import React, { Component, PropTypes } from 'react';
import Anchor from 'grommet/components/Anchor';
import Table from 'grommet/components/Table';
import TableRow from 'grommet/components/TableRow';

export default class RecordDetail extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  _onClick(template, record) {
    for (var i in template.field) {
      var sqlname = template.field[i].$.sqlname;
      template.field[i].value = record[sqlname];
    }
    this.setState(
      {fields: template.field}
    );
  }

  render() {
    var record = this.props.record;
    var fields = record.map((field, index) => {
      return <p key={index}><label key={index}>{field.$.label}:{field.value}</label></p>;
    });

    return (
      <div>
        Detail:
        {fields}
      </div>
    );
  }
}

RecordDetail.propTypes = {
  record: PropTypes.array.isRequired
};
