import React, {Component} from 'react';
import * as ExplorerActions from '../../actions/explorer';
import {
  Tiles,
  Tile,
  Header,
  Anchor
} from 'grommet';

export default class RecordSearch extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
    console.log("RecordSearch");
  }

  componentWillReceiveProps(nextProps) {

  }


  render() {

    return (
      <Tiles fill={true} flush={true}>
        <Tile>
          <Header>{this.props.keyword}</Header>
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword+'111111111111kkkkkkkkkkkkkkk'} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
        </Tile>
        <Tile>
          <Header>{this.props.keyword}</Header>
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
        </Tile>
        <Tile>
          <Header>{this.props.keyword}</Header>
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
        </Tile>
        <Tile>
          <Header>{this.props.keyword}</Header>
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
          <Anchor href="#" label={this.props.keyword} primary={true} />
        </Tile>
      </Tiles>
    );
  }
}
