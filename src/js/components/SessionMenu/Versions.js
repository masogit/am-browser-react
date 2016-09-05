import React, {Component} from 'react';
import {
  Box, Header, Title, Tiles, Tile, Label, Button, Anchor, List, ListItem
} from 'grommet';
import Star from 'grommet/components/icons/base/Star';
import Down from 'grommet/components/icons/base/Down';
import Next from 'grommet/components/icons/base/Next';

export default class Versions extends Component {
  componentWillMount() {
    this.state = {
      versions: this.props.versions
    };
  }

  _download() {
    window.open('https://hpln.hpe.com/contentoffering/am-browser', '_blank');
  }

  render() {
    const versions = this.state.versions;
    let content;
    if (versions.err) {
      content = <Label>{versions.err}</Label>;
    } else {
      if (versions.list.length > 0 && versions.list[0].expand == undefined) {
        versions.list[0].expand = true;
      }
      content = (
        <Tiles flush={false} justify="center" colorIndex="light-2" full="horizontal">{
          versions.list.map((app, index) => {
            const packages = app.hplnContentpackage;
            const expand = app.expand && (
              <Box>
                <List>
                  <ListItem justify="between" separator='none'>
                    <div dangerouslySetInnerHTML={{__html: app.hplnContentpackage.description}} />
                  </ListItem>
                  <ListItem justify="between" separator='none'>
                    <span>Language</span>
                    <span className="secondary">
                      {app.listHplnLocale.dtos.map(locale => <Box align="end">{locale.displayname}</Box>)}
                    </span>
                  </ListItem>
                  <ListItem justify="between" separator='none'>
                    <span>Platforms</span>
                    <span className="secondary">
                      {app.listHplnPlatform.dtos.map(platform => <Box align="end">{platform.displayname}</Box>)}
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
                        {app.listHplnContentfile.dtos.map(file => <Box align="end">{file.filename}</Box>)}
                      </List>
                    </span>
                  </ListItem>
                </List>
              </Box>
              );

            return (
              <Tile key={index} wide={true}>
                <Box direction='row' style={{width: '100%'}}>
                  <Anchor icon={app.expand ? <Down size='small'/> : <Next size='small'/>} onClick={() => {
                    app.expand = !app.expand;
                    this.setState({apps: this.state.apps});
                  }}/>
                  <Box flex={true} separator={app.expand ? 'bottom' : 'none'} pad={{vertical: 'small'}}>
                    <Title>{`${packages.name}, Version ${packages.version}`}</Title>
                    <Box direction='row' align='center' justify='between'>
                      <label>{`Last Update: ${new Date(packages.publicationTime).toDateString()}`}</label>
                      <label>{`Downloads: ${packages.downloads}`}</label>
                      <Box direction='row'>
                        {
                          [1,2,3,4,5].map(i => {
                            return <Star colorIndex={packages.rating >= i ? 'accent-3' : ''} type='status' key={i}/>;
                          })
                        }
                      </Box>
                      <Button onClick={this._download.bind(this)}>Download</Button>
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

    return (
      <Box pad="medium" size='large'>
        <Header><Title>Version List</Title></Header>
        {content}
      </Box>
    );
  }
}
