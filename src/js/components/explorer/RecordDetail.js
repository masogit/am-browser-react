import React, {Component, PropTypes} from 'react';
import RecordList from './RecordList';
import ActionTab from '../commons/ActionTab';
import * as ExplorerActions from '../../actions/explorer';
import { Anchor, Layer, Tabs, Table, TableRow, Header } from 'grommet';
import Pdf from 'grommet/components/icons/base/DocumentPdf';
import * as Format from '../../util/RecordFormat';
import cookies from 'js-cookie';

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
    this._getUCMDBURL(this.props.body.fields);

    if (this.props.body.links)
      this.props.body.links.forEach((bodyLink) => {
        let link = Object.assign({}, bodyLink);
        var body = this._getLinkBody(link, this.props.record);
        if (body.filter) {
          ExplorerActions.getCount(body).then(records => {
            link.count = records.count;
            link.body = body;
            var links = this.state.links;
            links.push(link);
            this.setState({
              links: links
            });
          });
        }
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
      if (record[src_field]) {
        AQL = `${link.dest_field.sqlname}=${record[src_field]}`;
      }
    }

    body.filter = body.filter ? `(${body.filter}) AND ${AQL}` : AQL;
    return body;
  }

  _getUCMDBURL(fields) {
    var globalIds = fields.filter((field) => {
      return field.sqlname.indexOf('GlobalId') > -1;
    });

    if (globalIds.length > 0)
      ExplorerActions.getUCMDB().then(url=> {
        if (url) {
          this.setState({
            ucmdb: url
          });
        }
      });
  }

  _download(type) {
    this.refs.downloadForm.action = ExplorerActions.getDownloadQuery(this.props.body.sqlname) + `?type=${type}`;
    this.refs.downloadForm.submit();
  }

  render() {

    return (
      <Layer closer={true} align="right" onClose={this.props.onClose}>
        <Tabs justify="start" activeIndex={0}>
          <ActionTab title={this.props.body.label}>
            <Header justify="end">
              <Anchor icon={<Pdf />} label="PDF Report" onClick={() => this._download('1vM')}/>
              <form name="Download" ref="downloadForm" method="post">
                <input type="hidden" name="_csrf" value={cookies.get('csrf-token')}/>
                <input type="hidden" name="record" value={JSON.stringify(this.props.record)} />
                <input type="hidden" name="links" value={JSON.stringify(this.state.links)} />
                <input type="hidden" name="fields" value={JSON.stringify(this.props.body.fields)}/>
                <input type="hidden" name="label" value={this.props.title || this.props.body.label} />
              </form>
            </Header>
            <Table>
              <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
              </thead>
              <tbody>
              {
                this.props.body.fields.map((field, index) => {
                  return (
                    <TableRow key={index}>
                      <td>{Format.getDisplayLabel(field)}</td>
                      <td>
                        {Format.getFieldStrVal(this.props.record, field)}
                        {
                          field.sqlname.indexOf('GlobalId') > -1 && this.props.record[field.sqlname] &&
                          <Anchor href={`${this.state.ucmdb}${this.props.record[field.sqlname]}`}
                                  target="_blank"
                                  label={`Open UCMDB Browser`} primary={true}/>
                        }
                      </td>
                    </TableRow>
                  );
                })
              }
              </tbody>
            </Table>
          </ActionTab>
          {
            this.state.links.map((link, index) => {
              return (<ActionTab title={`${link.label} (${link.count})`} key={index}>
                <RecordList key={link.sqlname} body={link.body}/>
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
