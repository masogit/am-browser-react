import React, {Component} from 'react';
import {
  Anchor,
  Box,
  List
} from 'grommet';
import Next from 'grommet/components/icons/base/Next';
import Down from 'grommet/components/icons/base/Down';

export default class GroupList extends Component {

  constructor() {
    super();
    this.state = {
      expand: ''
    };
  }

  componentDidMount() {
  }

  _getGroupedChildren(children) {
    var grouped = {};
    children.forEach((child) => {
      if (grouped[child.props.groupby]) {
        grouped[child.props.groupby].push(child);
      } else {
        grouped[child.props.groupby] = [child];
      }
    });
    return grouped;
  }

  _expandToggle(key) {
    if (key !== this.state.expand)
      this.setState({
        expand: key
      });
    else
      this.setState({
        expand: ''
      });
  }

  render() {
    var children = this.props.children;
    var grouped = this._getGroupedChildren(children);

    return (

      <Box direction="column">
        {
          Object.keys(grouped).map((key, i) => {
            return <Box key={i}>
              <Box direction="column" full="horizontal">
                <Box justify="between" direction="row">
                  <Anchor href="#" label={key} icon={(this.state.expand===key)?<Down />:<Next />}
                          onClick={this._expandToggle.bind(this, key)}/>{grouped[key].length}
                </Box>
                {
                  this.state.expand === key &&
                  <List {...this.props}>
                    {
                      grouped[key].map((child) => {
                        return child;
                      })
                    }
                  </List>
                }
              </Box>
            </Box>;
          })
        }
      </Box>
    );
  }
}

