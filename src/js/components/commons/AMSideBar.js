/**
 * Created by huling on 5/25/2016.
 */

import React, {Component} from 'react';
import { Header, Sidebar, Menu, Box, Footer, Anchor} from 'grommet';
import GroupList from './GroupList';
import GroupListItem from './GroupListItem';
import EmptyIcon from './EmptyIcon';
import {connect} from 'react-redux';
import ChapterPrevious from 'grommet/components/icons/base/CaretPrevious';
import ChapterNext from 'grommet/components/icons/base/CaretNext';
import {toggleSidebar} from '../../actions/system';

class AMSideBar extends Component {
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
    const {toolbar, contents, focus, footer, loading, colorIndex, showSidebar, toggle, pad, margin} = this.props;
    if (!showSidebar) {
      return (
        <Sidebar fixed={true} full={false} style={{minHeight: '100%', width: '50px'}}
                 colorIndex={colorIndex || 'light-1'}>
          <Box style={{overflow: 'visible'}} className='fixMinSizing'>
            <Header justify="between" pad='small' onClick={toggleSidebar}>
              <ChapterNext />
            </Header>
          </Box>
        </Sidebar>
      );
    }
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
                <Box justify='between' direction="row" responsive={false} flex={true}>
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
      <Sidebar fixed={true} full={false} style={{minHeight: '100%'}} colorIndex={colorIndex || 'light-1'} pad={pad} margin={margin}>
        <Box style={{overflow: 'visible'}} className='fixMinSizing'>
          <Header justify="between" pad='small'>
            {toggle == false ? this.state.title
              : (<Anchor icon={<ChapterPrevious/>} onClick={toggleSidebar} label={this.state.title}
                      className='grommetux-title'/>)
            }
            {toolbar &&
            <Menu direction="row" align="center" responsive={false}>
              {toolbar}
            </Menu>
            }
          </Header>
          {sidebarContent}
          {footer ? footer :
            <Footer justify="center">
               {(new Date()).toLocaleString()}
            </Footer>
          }
        </Box>
      </Sidebar>
    );
  }
}

let select = (state) => {
  return {
    showSidebar: state.session.showSidebar
  };
};

export default connect(select)(AMSideBar);
