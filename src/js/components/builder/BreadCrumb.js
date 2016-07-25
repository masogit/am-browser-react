import React, {Component, PropTypes} from 'react';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import {metadataLoadDetail, loadMetadataDetailSuccess} from '../../actions/system';
import {connect} from 'react-redux';
let Home = require('grommet/components/icons/base/Home');
let Next = require('grommet/components/icons/base/Next');

class BreadCrumb extends Component {
  _onDetailClick(index) {
    this.props.clearFilter();
    const rows = this.props.elements[index];
    const elements = this.props.elements.slice(0, index);
    metadataLoadDetail(rows, elements).then(({rows, elements}) => this.props.dispatch(loadMetadataDetailSuccess(rows, elements)));
  }

  render() {
    let elements = this.props.elements;
    let breadcrumbs = elements.map((element, index) => {
      if (index == 0) {
        return (<Anchor key={index} icon={<Home />} onClick={this._onDetailClick.bind(this, index)}
                        label={`${element.label}(${element.sqlname})`}/>);
      } else if (index == elements.length - 1) {
        return <Anchor key={index} icon={<Next />} label={element.sqlname} disabled={true}/>;
      } else {
        return (<Anchor key={index} icon={<Next />} onClick={this._onDetailClick.bind(this, index)}
                        label={element.sqlname}/>);
      }
    });

    return (
      <Box pad={breadcrumbs.length > 0 ? {vertical: 'small'} : null} flex={false}>{breadcrumbs}</Box>
    );
  }
}

BreadCrumb.propTypes = {
  elements: PropTypes.array.isRequired
};

let select = (state, props) => {
  return {
    elements: state.views.elements
  };
};

export default connect(select)(BreadCrumb);
