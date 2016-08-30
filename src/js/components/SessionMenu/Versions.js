import React, {Component} from 'react';
import {
  Box, Header, Title, Tiles, Tile, Label, Button, Anchor
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

  render() {
    const versions = this.state.versions;
    let content;
    if (versions.err) {
      content = <Label>{versions.err}</Label>;
    } else {
      content = (
        <Tiles flush={false} justify="center" colorIndex="light-2" full="horizontal">{
          versions.list.map((app, index) => {
            app = app.hplnContentpackage;
            return (
              <Tile key={index} wide={true}>
                <Box direction='row' style={{width: '100%'}}>
                  <Anchor icon={app.expand ? <Down size='small'/> : <Next size='small'/>} onClick={() => {
                    app.expand = !app.expand;
                    this.setState({apps: this.state.apps});
                  }}/>
                  <Box flex={true}>
                    <strong>{`${app.name}, Version ${app.version}`}</strong>
                    <Box direction='row' align='center' justify='between'>
                      <label>{`Last Update ${app.publicationTime}`}</label>
                      <label>{`Downloads ${app.downloads}`}</label>
                      <Box direction='row'>
                        {
                          [0,1,2,3,4].map(i => {
                            return <Star colorIndex={app.rating >= i ? 'accent-2' : ''} type='status' key={i}/>;
                          })
                        }
                      </Box>
                      <Button>Download</Button>
                    </Box>
                  </Box>
                </Box>
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
