import React, {Component, PropTypes} from 'react';
import RecordList from './RecordList';
import ActionTab from '../commons/ActionTab';
import * as ExplorerActions from '../../actions/explorer';
import { Anchor, Layer, Tabs, Table, TableRow, Header, Box, List, ListItem } from 'grommet';
import Close from 'grommet/components/icons/base/Close';
import Pdf from 'grommet/components/icons/base/DocumentPdf';
import * as Format from '../../util/RecordFormat';
import PDFTemplate from '../reports/reports';

export default class RecordDetail extends Component {

  constructor() {
    super();
    this.state = {
      body: null,
      links: [],
      pdfSettings: null
    };
    this.showPDFDesigner = this.showPDFDesigner.bind(this);
    this.renderPDFPreview = this.renderPDFPreview.bind(this);
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
    if (nextProps.record != this.props.record) {
      let links = this._linksProcessing(nextProps.choosenRecord, nextProps.record);
      this.setState({
        links: links
      });
    }

  }

  _linksProcessing(body, record) {
    if (body.links) {
      let bodyClone = _.cloneDeep(body);
      bodyClone.links.forEach((link) => {
        link.body = this._getLinkBody(link, record);
      });
      return bodyClone.links;
    }
    return [];
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

  showPDFDesigner() {
    this.setState({pdfSettings: {body: this.props.body}});
  }

  renderPDFPreview() {
    const pdfSettings = this.state.pdfSettings;
    if (!pdfSettings) {
      return;
    }

    return (
      <Layer closer={true} onClose={() => this.setState({pdfSettings: null})}>
        <PDFTemplate {...pdfSettings} fromView={true} links={this.state.links} record={this.props.record}/>
      </Layer>
    );
  }

  _renderDetailInList() {
    return (
      <Layer closer={true} align="right" onClose={this.props.onClose}>
        <Tabs justify="start" activeIndex={0}>
          <ActionTab title={this.props.body.label}>
            <Header justify="end">
              <Anchor icon={<Pdf />} label="Download PDF" onClick={this.showPDFDesigner}/>
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
        {this.renderPDFPreview()}
      </Layer>
    );
  }

  _renderDetailInTopology() {
    const body = this.props.choosenRecord;

    return (
      <Box className='topology-background-color autoScroll' flex={false}>
        <Header justify='between'>
            {body.label}
            <Anchor icon={<Close />} onClick={this.props.onClose} justify='end'/>
        </Header>
        <Box justify='center' pad={{horizontal: 'small'}} flex={false}>
          <List>
            <ListItem>
              <Header justify='end'>
                <Anchor icon={<Pdf />} label="Download PDF" onClick={this.showPDFDesigner}/>
              </Header>
            </ListItem>
            {
              body.fields.map((field, index) => {
                return (
                  <ListItem key={index} justify="between">
                    <span>
                      {field.label}
                    </span>
                    <Box pad={{horizontal: 'medium'}} />
                    <span className="secondary">
                      {Format.getFieldStrVal(this.props.record, field)}
                    </span>
                  </ListItem>
                );
              })
            }
          </List>
        </Box>
        {this.renderPDFPreview()}
      </Box>
    );
  }

  render() {
    if (this.props.showTopology)
      return this._renderDetailInTopology();
    else
      return this._renderDetailInList();
  }
}

RecordDetail.propTypes = {
  onClose: PropTypes.func.isRequired,
  body: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired
};
