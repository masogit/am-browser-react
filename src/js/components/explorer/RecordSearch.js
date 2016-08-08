import React from 'react';
import * as ExplorerAction from '../../actions/explorer';
import RecordDetail from './RecordDetail';
import RecordListLayer from './RecordListLayer';
import ComponentBase from '../commons/ComponentBase';
import history from '../../RouteHistory';
import {
  Anchor, Box, Button, Header, Footer, Layer, Split, Table, TableRow, Tiles, Title, Tile, Form
} from 'grommet';

export default class RecordSearch extends ComponentBase {

  constructor() {
    super();
    this.state = {
      messages: {},
      results: [],
      record: null,
      view: null,
      warning: null
    };
    this._setMessage.bind(this);
  }

  componentDidMount() {
    this._search(this.props.params.keyword);
  }

  componentDidUpdate(prevProps, prevState) {
  }

  componentWillReceiveProps(nextProps) {
  }

  _setMessage(view, time, num) {
    var messages = this.state.messages;
    if (messages[view._id]) {
      messages[view._id].timeEnd = time;
      messages[view._id].num = num;
    } else {
      messages[view._id] = { view: view, timeStart: time, num: num };
    }
    this.setState({
      messages: messages
    });
  }

  _search(keyword) {
    if (keyword.length <= 2) {
      this.setState({
        warning: 'Please type at least 3 words to search'
      });
      return;
    }

    this.setState({
      warning: ''
    });

    //  Escaped for SQL. e.g. org.apache.commons.lang.StringEscapeUtils.escapeSql(String str).
    keyword = keyword.replace(/[']/g, '\'\'');
    keyword = encodeURI(keyword);
    this.setState({
      messages: {},
      results: [],
      keyword: keyword
    }, () => {
      if (keyword)
        ExplorerAction.loadViews().then(views => {
          if (views instanceof Array) {
            views.forEach((view) => {
              // check searchable
              var aql = view.body.fields.filter((field) => {
                return field.searchable;
              });
              if (aql.length > 0) {
                ExplorerAction.getBodyByKeyword(view.body, keyword);
                this._setMessage(view, Date.now(), 0);
                ExplorerAction.loadRecordsByBody(view.body).then((data) => {
                  this._setMessage(view, Date.now(), data.count);
                  if (data && data.entities.length > 0) {
                    var results = this.state.results;
                    results.push({ view: view, records: data.entities });
                    this.setState({
                      results: [...results]
                    });
                    this.releaseLock();
                  }
                });
              }
            });
          }
        });
    });
  }

  _getContent(view, record) {
    return view.body.fields.map((field) => {
      if (field.searchable) {
        var index = record[field.sqlname].toLocaleLowerCase().indexOf(this.state.keyword.toLocaleLowerCase().trim());
        if (index > -1) {
          var length = this.state.keyword.toLocaleLowerCase().trim().length;
          var pre_str = record[field.sqlname].substr(0, index);
          var key_str = record[field.sqlname].substr(index, length);
          var suf_str = record[field.sqlname].substr(index + length);
          const title = pre_str + key_str + suf_str;
          return (
            <Box key={field.sqlname + index} direction='row'>
              <span className='grommetux-text-ellipsis' title={title}>{
                `${field.sqlname}: ${pre_str}`
              }<span className='grommetux-background-color-index-brand'>{
                key_str
              }</span>{
                  suf_str
                }</span>
            </Box>
          );
        }
      }
    });
  }

  _onClose(event) {
    if (event) {
      event.preventDefault();
    }
    this.setState({ record: null, layer: null });
  }

  _onClick(view, record) {
    this.setState({
      view: view,
      record: record
    });
  }

  _onSearch(keyword) {
    if (!this.acquireLock()) {
      return;
    }
    history.push(`/search/${encodeURI(keyword)}`);
    this.setState({
      keyword: keyword
    });
    this._search(keyword);
  }

  _onEnter(event) {
    if (event.keyCode === 13) {
      this._onSearch(event.target.value.trim());
    }
  }

  _showViewRecords(view) {
    var layer = <RecordListLayer onClose={this._onClose.bind(this)} body={view.body} title={view.name}/>;

    this.setState({
      layer: layer
    });
  }

  render() {
    var messages = Object.keys(this.state.messages).map((key) => {
      return {
        _id: key,
        view: this.state.messages[key].view,
        timeEnd: this.state.messages[key].timeEnd,
        timeStart: this.state.messages[key].timeStart,
        num: this.state.messages[key].num
      };
    }).sort((a, b) => {
      return b.num - a.num;
    });

    return (
      <Box flex={true}>
        <Header justify="between" pad={{'horizontal': 'medium'}}>
          <Title>Global Search</Title>
          <input type="search" className="flex" placeholder="Global Record search..." ref="search" style={{marginLeft: '20px', marginRight: '20px'}}
            onKeyDown={this._onEnter.bind(this)} defaultValue={this.props.params.keyword} maxLength={50}/>
          <Button label="Search" onClick={()=>this._onSearch(this.refs.search.value)} />
        </Header>
        <Split flex="right" fixed={false} className={this.state.warning?'flex':''}>
          <Box pad="medium" flex={true}>
            <Table>
              <thead>
                <tr>
                  <th>View</th>
                  <th><Box align="end">Time</Box></th>
                  <th><Box align="end">Count</Box></th>
                </tr>
              </thead>
              <tbody>
                {
                  messages.map((msg) => {
                    return (<TableRow key={msg._id} justify="between">
                      <td>{msg.view.name}</td>
                      <td>
                        <Box align="end">
                          {`${msg.timeEnd ? (msg.timeEnd - msg.timeStart) + 'ms' : ''}`}
                        </Box>
                      </td>
                      <td>
                        <Box align="end">
                        {msg.num > 0 ?
                            <Anchor onClick={this._showViewRecords.bind(this, msg.view)} label={msg.num}/> : msg.num
                        }
                        </Box>
                      </td>
                    </TableRow>);
                  })
                }
              </tbody>
            </Table>
          </Box>
          {
            this.state.warning ?
              <Box pad='small' flex={true} justify='center' align="center">
                <Box colorIndex="light-2" pad={{horizontal: 'large', vertical: 'medium'}}>
                  {this.state.warning}
                </Box>
              </Box>
              :
              <Tiles flush={false} size="large" className='autoScroll' justify="around">
                {
                  this.state.results.map((result, i) => {
                    return result.records.map((record, j) => {
                      // var id = record['ref-link'].split('/')[2];
                      return (
                        <Tile key={`${i}.${j}`} align="start" className='box-shadow'>
                          <Header tag="h4" size="small" pad={{ horizontal: 'small' }}>
                            {result.view.name}
                          </Header>
                          <Form>
                            <Box pad="small">
                              <Anchor onClick={this._onClick.bind(this, result.view, record)}
                                      className='grommetux-text-ellipsis'>
                                <span title={record.self}><b>{record.self}</b></span>
                              </Anchor>
                              {this._getContent(result.view, record)}
                            </Box>
                            <Footer pad={{ horizontal: 'small' }}>
                              {'Table: ' + result.view.body.sqlname}
                            </Footer>
                          </Form>
                        </Tile>);
                    });
                  })
                }
              </Tiles>
          }
        </Split>
        {
          this.state.record &&
          <RecordDetail body={this.state.view.body} record={this.state.record} onClose={this._onClose.bind(this)}/>
        }
        {this.state.layer}
      </Box>
    );
  }
}
