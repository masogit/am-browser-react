import React, {Component, PropTypes} from 'react';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';
import {metadataLoadDetail} from '../../actions/system';

export default class BreadCrumb extends Component {
  _onDetailClick(index) {
    this.props.clearFilter();
    const obj = this.props.elements[index];
    metadataLoadDetail(obj, []).then(({rows}) => {
      this.props.updateData(this.props.elements.slice(0, index + 1), rows);
    });
  }

  render() {
    let elements = this.props.elements;
    let Home = require('grommet/components/icons/base/Home');
    let Next = require('grommet/components/icons/base/Next');
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
