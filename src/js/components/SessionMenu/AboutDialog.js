import React, {Component} from 'react';
import {initAbout} from '../../actions/system';
import {getVersionFromLiveNetWork} from '../../actions/sessionMenu';
import {
  Box,  Header, Table, TableRow, Label, Tabs, Tiles, Tile, Anchor, List, ListItem, Button
} from 'grommet';
import Star from 'grommet/components/icons/base/Star';
import Down from 'grommet/components/icons/base/Down';
import Next from 'grommet/components/icons/base/Next';
import ActionTab from '../commons/ActionTab';
import Spinning from 'grommet/components/icons/Spinning';

export default class About extends Component {

  constructor() {
    super();
    this.state = {
      about: {
        amVersion: null,
        ambVersion: null,
        rest: {
          server: null,
          port: null
        },
        ucmdb: {
          server: null,
          port: null
        }
      },
      versions: {},
      activeIndex: 0,
      loading: false
    };
  }

  componentDidMount() {
    initAbout().then((res) => {
      this.setState({about: res.about});
    });
  }

  _download() {
    window.open('https://hpln.hpe.com/contentoffering/am-browser', '_blank');
  }

  getVersions() {
    if (!this.state.versions.list || this.state.versions.list.length == 0) {
      this.setState({loading: true});
      getVersionFromLiveNetWork().then((versions) => {
        versions.list = versions.list.sort((version1, version2) => {
          return version1.hplnContentpackage.publicationTime < version2.hplnContentpackage.publicationTime;
        });
        this.setState({activeIndex: 1, versions: versions, loading: false});
      });
    } else {
      this.setState({activeIndex: 1});
    }
  }

  showVersions(versions) {
    if (versions.list.length > 0 && versions.list[0].expand == undefined) {
      versions.list[0].expand = true;
    }
    return (
      <Tiles flush={false} justify="center" full="horizontal" pad='none'>{
        versions.list.map((app, index) => {
          const packages = app.hplnContentpackage;
          const expand = app.expand && (
              <Box key={index}>
                <List>
                  <ListItem justify="between" separator='none'>
                    <div dangerouslySetInnerHTML={{__html: app.hplnContentpackage.description}} />
                  </ListItem>
                  <ListItem justify="between" separator='none'>
                    <span>Language</span>
                  <span className="secondary">
                    {app.listHplnLocale.dtos.map((locale, index) => <Box align="end" key={index}>{locale.displayname}</Box>)}
                  </span>
                  </ListItem>
                  <ListItem justify="between" separator='none'>
                    <span>Platforms</span>
                  <span className="secondary">
                    {app.listHplnPlatform.dtos.map((platform, index) => <Box align="end" key={index}>{platform.displayname}</Box>)}
                  </span>
                  </ListItem>
                  <ListItem justify="between" separator='none'>
                    <span>Size</span>
                  <span className="secondary">
                    {`${(app.listHplnContentfile.dtos.reduce((file, next) => file.size + next.size)/1024/1024).toFixed(2)}MB`}
                  </span>
                  </ListItem>
                  <ListItem justify="between" separator='none'>
                    <span>File</span>
                  <span className="secondary">
                    <List>
                      {app.listHplnContentfile.dtos.map((file, index) => <Box align="end" key={index}>{file.filename}</Box>)}
                    </List>
                  </span>
                  </ListItem>
                </List>
              </Box>
            );

          return (
            <Tile key={index} wide={true} colorIndex="light-2" pad='small'>
              <Box direction='row' style={{width: '100%'}}>
                <Anchor icon={app.expand ? <Down size='small'/> : <Next size='small'/>} onClick={() => {
                  app.expand = !app.expand;
                  this.setState({apps: this.state.apps});
                }}/>
                <Box flex={true} separator={app.expand ? 'bottom' : 'none'} pad={{vertical: 'small'}}>
                  <Box tag='h4' margin='none'>{`${packages.name}, Version ${packages.version}`}</Box>
                  <Box direction='row' align='center' justify='between' margin='none'>
                    <Box tag='h5' margin='none'>{`Last Update: ${new Date(packages.publicationTime).toDateString()}`}</Box>
                    <Box tag='h5' margin='none'>{`Downloads: ${packages.downloads}`}</Box>
                    <Box tag='h5' direction='row' margin='none'>
                      {
                        [1,2,3,4,5].map(i => {
                          return <Star colorIndex={packages.rating >= i ? 'accent-3' : ''} type='status' key={i}/>;
                        })
                      }
                    </Box>
                    <Box tag='h5' margin='none'>
                      <Button onClick={this._download.bind(this)}>Download</Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {expand}
            </Tile>
          );
        })
      }</Tiles>
    );
  }

  render() {
    const {activeIndex, versions, loading} = this.state;

    let versionList;
    if (loading) {
      versionList = <Spinning />;
    } else if (versions.list) {
      versionList = versions.err ? <Label>{versions.err}</Label> : this.showVersions(versions);
    }

    return (
      <Box pad='medium' className='autoScroll'>
        <Header pad='none'><img src="../../img/favicon.png"/><Box margin={{left: 'small'}}>Asset Manager Browser</Box></Header>
        <Tabs justify='start' activeIndex={activeIndex}>
          <ActionTab title="General" onClick={() => this.setState({activeIndex: 0})}>
            <Table>
              <tbody>
              <TableRow>
                <td> Version:</td>
                <td> {this.state.about.ambVersion} </td>
              </TableRow>
              <TableRow>
                <td> AM REST Server:</td>
                <td> {this.state.about.rest.server} </td>
              </TableRow>
              <TableRow>
                <td> AM REST Port:</td>
                <td> {this.state.about.rest.port} </td>
              </TableRow>
              <TableRow>
                <td> UCMDB Browser Server:</td>
                <td> {this.state.about.ucmdb.server} </td>
              </TableRow>
              <TableRow>
                <td> UCMDB Browser Port:</td>
                <td> {this.state.about.ucmdb.port} </td>
              </TableRow>
              </tbody>
            </Table>
          </ActionTab>
          <ActionTab title="All Versions" onClick={this.getVersions.bind(this)}>
            {versionList}
          </ActionTab>
        </Tabs>
        <Label className='copyright'>
          © 2016 Hewlett Packard Enterprise Development LP All rights reserved.<br />
          This software is protected by international copyright law.
        </Label>
      </Box>
    );
  }
}
