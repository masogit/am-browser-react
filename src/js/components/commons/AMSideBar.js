/**
 * Created by huling on 5/25/2016.
 */

import React, {Component} from 'react';
import { Title, Header, Sidebar, Menu, Box, Footer } from 'grommet';
import GroupList from './GroupList';
import GroupListItem from './GroupListItem';
import EmptyIcon from './EmptyIcon';

export default class SideBar extends Component {
  componentWillMount() {
    this.state = {
      title: this.props.title
    };
  }

  componentDidMount() {
    this.updateTitleByProps(this.props.contents);
  }

  componentWillReceiveProps(nexProps) {
    this.updateTitleByProps(nexProps.contents);
  }

  updateTitleByProps(contents) {
    if (contents instanceof Array) {
      this.updateTitle(contents.length);
    }
  }

  updateTitle(total) {
    this.setState({
      title: `${this.props.title}(${total})`
    });
  }

  render() {
    const {toolbar, contents, focus, footer, loading, separator, colorIndex} = this.props;
    // 1) Show group list
    // 2) Show table schema
    let sidebarContent;
    if (contents instanceof Array) {
      sidebarContent = (
        <GroupList selectable={true} searchable={true} focus={focus} loading={loading} updateTitle={this.updateTitle.bind(this)}>
          {
            contents.map((listItem, index) => (
              <GroupListItem key={listItem.key || index} {...listItem} responsive={false}>
                <EmptyIcon />
                <Box justify='between' direction="row" full='horizontal' responsive={false}>
                  {listItem.child}
                  {listItem.icon}
                </Box>
              </GroupListItem>
            )).sort((a, b) => {
              if (a.props.child > b.props.child) {
                return 1;
              }
              if (a.props.child < b.props.child) {
                return -1;
              }
              // a must be equal to b
              return 0;
            })
          }
        </GroupList>
      );
    } else {
      sidebarContent = contents;
    }

    return (
      <Sidebar fixed={true} separator={separator || 'right'} full={false} style={{minHeight: '100%'}} colorIndex={colorIndex || 'light-2'}>
        <Box style={{overflow: 'visible'}} className='fixMinSizing'>
          <Header justify="between" pad='small'>
            <Title>{this.state.title}</Title>
            {toolbar &&
            <Menu direction="row" align="center" responsive={false}>
              {toolbar}
            </Menu>
            }
          </Header>
          {sidebarContent}
          <Footer separator="top" justify="center">
            {footer ? footer : (new Date()).toLocaleString()}
          </Footer>
        </Box>
      </Sidebar>
    );
  }
}
