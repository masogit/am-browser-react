import React, {Component, PropTypes} from 'react';
import RecordList from './RecordList';
import ActionTab from '../commons/ActionTab';
import * as ExplorerActions from '../../actions/explorer';
import { Anchor, Layer, Tabs, Table, TableRow, Header, Box, List, ListItem } from 'grommet';
import Close from 'grommet/components/icons/base/Close';
import Pdf from 'grommet/components/icons/base/DocumentPdf';
import * as Format from '../../util/RecordFormat';
import PDFTemplate from '../reports/reports';
import {cloneDeep} from 'lodash';

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
        const link = cloneDeep(bodyLink);
        link.body.filter = ExplorerActions.getLinkFilter(link, this.props.record);
        if (link.body.filter) {
          ExplorerActions.getCount(link.body).then(records => {
            link.count = records.count;
            const links = this.state.links;
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
        link.body.filter = ExplorerActions.getLinkFilter(link, record);
      });
      return bodyClone.links;
    }
    return [];
  }

  _getUCMDBURL(fields) {
    var globalIds = fields.filter((field) => {
      return field.sqlname.indexOf('GlobalId') > -1 && this.props.record[field.sqlname];
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

    const onClose = () => {
      this.onDrop('Drop templates settings', ()=>this.setState({pdfSettings: null}));
    };

    return (
      <Layer closer={true} onClose={onClose}>
        <PDFTemplate {...pdfSettings} fromView={true} links={this.state.links}
                     setOnDrop={func => this.onDrop = func} record={this.props.record}/>
      </Layer>
    );
  }

  _renderDetailInList() {
    return (
      <Layer closer={true} align="right" onClose={this.props.onClose}>
        <Tabs justify="start" activeIndex={0}>
          <ActionTab title={this.props.body.label}>
            <Box flex={true}>
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
                            field.sqlname.indexOf('GlobalId') > -1 && this.props.record[field.sqlname] && this.state.ucmdb &&
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
            </Box>
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
            <Anchor icon={<Close />} onClick={this.props.onClose}/>
        </Header>
        <Box justify='center' pad={{horizontal: 'small'}} flex={false}>
          <List>
            <ListItem>
              <Header justify='end' size='small'>
                <Anchor icon={<Pdf />} label="Download PDF" onClick={this.showPDFDesigner}/>
              </Header>
            </ListItem>
            {
              body.fields.map((field, index) => {
                return (
                  <ListItem key={index} justify="between">
                    <span>
                      {Format.getDisplayLabel(field)}
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
