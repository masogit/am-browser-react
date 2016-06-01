import React, {Component, PropTypes} from 'react';
import RecordList from './RecordList';
import ActionTab from '../commons/ActionTab';
import * as ExplorerActions from '../../actions/explorer';
import {
  Layer,
  Tabs,
  Table,
  TableRow
} from 'grommet';
import * as Format from '../../constants/RecordFormat';

export default class RecordDetail extends Component {

  constructor() {
    super();
    this.state = {
      record: null,
      body: null,
      links: []
    };
  }

  componentDidMount() {
    if (this.props.body.links)
      this.props.body.links.forEach((link) => {
        var body = this._getLinkBody(link, this.props.record);
        console.log(body);
        ExplorerActions.getCount(body, (records) => {
          link.count = records.count;
          var links = this.state.links;
          links.push(link);
          this.setState({
            links: links
          });
        });
      });
  }

  componentWillReceiveProps(nextProps) {
  }


  _getLinkBody(link, record) {
    var body = Object.assign({}, link.body);

    let AQL = "";
    if (link.src_field) {
      var relative_path = link.src_field.relative_path;
      var src_field = relative_path ? relative_path + '.' + link.src_field.sqlname : link.src_field.sqlname;
      AQL = link.dest_field.sqlname + '=' + record[src_field];
    } else
      AQL = link.reverse + '.PK=' + record[link.reversefield]; // TODO remove reversefield

    body.filter = body.filter ? '(' + body.filter + ') AND ' + AQL : AQL;
    return body;
  }

  render() {

    return (
      <Layer closer={true} align="right" onClose={this.props.onClose}>
        <Tabs justify="start" initialIndex={0}>
          <ActionTab title={this.props.body.label}>
            <Table>
              <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
              </thead>
              <tbody>
              <TableRow>
                <td>Self</td>
                <td>{this.props.record.self}</td>
              </TableRow>
              {
                this.props.body.fields.map((field, index) => {
                  return !field.PK &&
                    <TableRow key={index}>
                      <td>{Format.getDisplayLabel(field)}</td>
                      <td>{Format.getFieldStrVal(this.props.record, field)}</td>
                    </TableRow>;
                })
              }
              </tbody>
            </Table>
          </ActionTab>
          {
            this.state.links.map((link, index) => {
              return (<ActionTab title={`${link.label} (${link.count})`} key={index}>
                <RecordList key={link.sqlname} body={this._getLinkBody(link, this.props.record)}/>
              </ActionTab>);
            })
          }
        </Tabs>
      </Layer>
    );
  }
}

RecordDetail.propTypes = {
  onClose: PropTypes.func.isRequired,
  body: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired
};
