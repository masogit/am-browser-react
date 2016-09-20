/**
 * Created by huling on 9/9/2016.
 */
import React, {Component, PropTypes} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import {Topology, Box}from 'grommet';
//const Parts = Topology.Parts;
const Part = Topology.Part;
const Label = Topology.Label;
import ComputerPersonal from 'grommet/components/icons/base/ComputerPersonal';
import App from 'grommet/components/icons/base/App';
import More from 'grommet/components/icons/base/More';
import LinkPrevious  from 'grommet/components/icons/base/LinkPrevious';
import RecordDetail from '../explorer/RecordDetail';

const getLinkBody = (link, record) => {
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
};

let usedIds = {'item-1-0': true};
export default class PCDetail extends Component {
  componentWillMount() {

    this.state = {
      record: this.props.record,
      body: this.props.body,
      links: [],
      linkMap: {}
    };

    this.state.data = this.getData();
    this.getLinks = this.getLinks.bind(this);
  }

  componentDidMount() {
    this.getLinks(2, 0, this.state.data, this.state.body.links, this.state.record);
  }

  componentWillUnmount() {
    usedIds = {'item-1-0': true};
  }

  getData(record = this.state.record) {
    const data = {
      categories: [
        {
          id: 'category-0',
          items: []
        },{
          id: "category-1",
          items: [
            {
              id: "item-1-0",
              demarcate: true,
              label: record.self + (this.state.body.links ? ` (${this.state.body.links.length})` : ''),
              onClick: () => {
                if (this.props.onClick) {
                  this.props.onClick(this.state.body, record);
                }
              }
            }
          ]
        }
      ],
      links: []
    };

    let index = 0;
    this.state.body.fields.map(field => {
      if (field.sqlname.indexOf('Parent') > -1 && record[field.sqlname]) {
        const id = 'item-0-' + index++;
        data.categories[0].items.push({
          id: id,
          label: record[field.sqlname],
          noLeadingStatus: true,
          iconB: <LinkPrevious />,
          onClick: () => {
            const body = Object.assign({}, this.state.body);
            body.filter = `TcpIpHostName='${record['Portfolio.Parent.Computer.Name']}'`;
            ExplorerActions.loadRecordsByBody(body).then((data) => {
              usedIds = {'item-1-0': true};
              record = data.entities[0];
              this.setState({
                record,
                data: this.getData(record)
              }, () => this.getLinks(2, 0, this.state.data, this.state.body.links, record));
            });
          }
        });

        data.links.push({parentId: id, childId: 'item-1-0'});
      }
    });

    return data;
  }

  getLinks(childLayer, parentIndex, data, links, record) {
    links.forEach((link, index) => {
      const id =`item-${childLayer}-${index + parentIndex * links.length}`;
      if (usedIds[id]) {
        return;
      }

      if (data.categories.length <= childLayer) {
        data.categories.push({id:`category-${childLayer}`, items: []});
      }

      ExplorerActions.getCount(getLinkBody(link, record)).then(records => {
        data.links.push({parentId: `item-${childLayer -1}-${parentIndex}`, childId: id});

        let label = link.label, onClick = null;
        if (records.count != undefined) {
          label = `${label} (${records.count})`;
          if (records.count > 0) {
            const body = getLinkBody(link, record);
            onClick = () => {
              //const item = data.categories[childLayer].items[index];
              //body.param = item.param = {
              //  offset: item.param ? item.param.offset + item.param.limit : 0,
              //  limit: 5
              //};
              body.param = data.categories[childLayer].items[index].param;
              this.getChildLink(childLayer + 1, index, body, link);
            };
          }
        }

        data.categories[childLayer].items.push({
          id: id,
          label: label,
          icon: <App/>,
          param: {
            limit: 5,
            offset: 0
          },
          //iconB: 'dot',
          onClick: onClick
        });
        this.setState({data});
      });

      usedIds[id] = true;
    });
  }

  getChildLink(childLayer, parentIndex, body, link) {
    const data = this.state.data;
    if (body.filter) {
      ExplorerActions.loadRecordsByBody(body).then(records => {
        records.entities.map((record, index) => {
          // should add all the parentIndex before this, and all it's children count
          const id = `item-${childLayer}-${index + body.param.offset + parentIndex * records.entities.length}`;
          if (usedIds[id]) {
            return;
          }
          if (data.categories.length <= childLayer) {
            data.categories.push({id:`category-${childLayer}`, items: []});
          }

          let label = record.self, onClick = null;
          if (link.body.links) {
            label = `${label} (${link.body.links.length})`;
            if (link.body.links.length > 0) {
              onClick = () => {
                this.getLinks(childLayer + 1, index, data, link.body.links, record);
                this.setState({data});
                if (this.props.onClick) {
                  this.props.onClick(link.body, record);
                }
              };
            }
          } else {
            onClick = () => this.setState({record, body: link.body});
          }

          data.categories[childLayer].items.push({
            id: id,
            label: label,
            onClick: onClick//,
            //showDetail: () => this.setState({record, body: link.body})
          });
          data.links.push({parentId: `item-${childLayer - 1}-${parentIndex}`, childId: id});
          usedIds[id] = true;
        });

        const moreId = `item-${childLayer}-more`;
        if (records.count > body.param.limit + body.param.offset) {
          data.categories[childLayer].items.push({
            id: moreId,
            label: 'more',
            icon: <More/>,
            onClick: () => {
              const item = data.categories[childLayer - 1].items[parentIndex];
              body.param = item.param = {
                offset: item.param ? item.param.offset + item.param.limit : 0,
                limit: 5
              };
              this.getChildLink(childLayer, parentIndex, body, link);
              if (this.props.onClick) {
                this.props.onClick(body, link);
              }
            }
          });
          data.links.push({parentId: `item-${childLayer - 1}-${parentIndex}`, childId: moreId});
        } else {
          data.categories[childLayer].items = data.categories[childLayer].items.filter(item => item.id.indexOf('more') == -1);
          data.links =  data.links.filter(link => link.childId != moreId);
        }

        this.setState({
          data: data
        });
      });
    }
  }

  getItems(items, idMap, categoryMap, index) {
    return (
      <Part direction='column' demarcate={false} key={index}>
        {items.sort((linkA, linkB) => {
          return linkA.id > linkB.id;
        }).map((item, index) => {
          if (categoryMap[item.id].rendered) {
            return;
          }
          categoryMap[item.id].rendered = true;
          //item.noTailStatus = !idMap[item.id];
          return (
            <Part justify='start' demarcate={false} key={index}>
              <Part demarcate={false} align='start' direction='column' key={index}>
                {getParts(item)}
              </Part>
              {idMap[item.id] && this.getItems(idMap[item.id].map(id => categoryMap[id]), idMap, categoryMap, item.id + index)}
            </Part>
          );
        })}
      </Part>
    );
  }

  render() {
    const data = this.state.data;

    const links = [], idMap= {}, idsMap= {}, categoryMap = {};
    data.links.map((link, index) => {
      if (!idMap[link.parentId]) {
        idMap[link.parentId] = [];
      }
      idMap[link.parentId].push(link.childId);
    });

    Object.keys(idMap).map((key, index) => {
      const ids = [key + 'B'];
      idsMap[key] = idMap[key].map(id => ids.push(id + 'A'));
      links.push({colorIndex: "graph-1", ids: ids});
    });

    data.categories.map((category) => category.items.map(item => {
      item.rendered = false;
      categoryMap[item.id] = item;
    }));

    return (
      <Topology links={links} ref={ref => this.topology = ref}>
        <Part demarcate={false} align='start' direction='row' justify='between'>
          <Part demarcate={false}>
            {
              data.categories.map((category, index) => this.getItems(category.items, idMap, categoryMap, index))
            }
          </Part>
        </Part>
      </Topology>
    );
  }
}

const getParts = ({id, label, icon, iconA, iconB, onClick, showDetail, noLeadingStatus, demarcate}) => {
  return (
    <Part className='margin30' key={id} demarcate={false}>
      <Part id={id + 'A'} demarcate={false} status={iconA == 'dot' ? 'ok' : ''} align='center'>
        {iconA != 'dot' && iconA}
      </Part>
      <Part demarcate={demarcate || false}>
        <Box direction='row' onClick={onClick}>
          {icon || <ComputerPersonal/>}
          <Label>{label}</Label>
        </Box>
      </Part>
      {onClick &&
      <Part id={id + 'B'} demarcate={false} align='start'>
        <Box onClick={onClick}>
          {iconB}
        </Box>
      </Part>}
    </Part>
  );
};

PCDetail.propTypes = {
  body: PropTypes.object.isRequired,
  record: PropTypes.object.isRequired,
  onClick: PropTypes.func
};
