/**
 * Created by huling on 5/25/2016.
 */

import React, {Component} from 'react';
import { Header, Box, Anchor } from 'grommet';
import {connect} from 'react-redux';

class AMSideToolBar extends Component {
  componentWillMount() {
    this.state = {
      tools: this.props.tools,
      activeIndex: this.props.tools[0].isActive() ? 0 : null
    };
  }

  componentWillReceiveProps(nextProps) {
    let {activeIndex, tools} = this.state;
    if (nextProps.tools.length > this.props.tools.length) {
      tools[activeIndex].onClick();
      activeIndex++;
    }

    this.setState({
      tools: nextProps.tools,
      activeIndex: activeIndex
    });
  }

  render() {
    const {tools} = this.state;

    return (
      <Box separator='right' style={{minHeight: '100%', width: '50px'}} colorIndex='light-2'>{
          tools.map((tool, index) => {
            const onClick = () => {
              if (this.state.activeIndex != index) {
                const activeTool = this.state.tools[this.state.activeIndex];
                if (activeTool && activeTool.onClick) {
                  activeTool.onClick();
                }
              }

              this.setState({activeIndex: this.state.activeIndex == index && tool.isActive() ? null : index});
              tool.onClick();
            };

            return (
              <Header justify="end" size='small' onClick={tool.onClick && onClick} key={index}>
                <Anchor icon={tool.icon} primary={this.state.activeIndex == index} disabled={tool.disable}/>
              </Header>
            );
          })
        }
      </Box>
    );
  }
}

let select = (state) => {
  return {
    tools: state.session.tools
  };
};

export default connect(select)(AMSideToolBar);

