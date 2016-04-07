import React, { Component /*, PropTypes*/ } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Sidebar from 'grommet/components/Sidebar';
import Split from 'grommet/components/Split';

class View extends Component {

  constructor() {
    super();
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render() {
    const { view } = this.props;
    return (
      <Split flex="right">
        <Sidebar primary={true} pad="small" size="large">
          {view && view[0] &&
          <ul>
            <li>{view[0].name}</li>
            <li>{view[0].description}</li>
            <li>{view[0].group}</li>
          </ul>
          }
        </Sidebar>

        <div>

        </div>
      </Split>
    );
  }
}

//View.propTypes = {
//  views: PropTypes.array.isRequired,
//  viewId: PropTypes.string
//};

export default View;
