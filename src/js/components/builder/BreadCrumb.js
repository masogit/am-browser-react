import React, {Component, PropTypes} from 'react';
import Anchor from 'grommet/components/Anchor';
import Box from 'grommet/components/Box';

export default class BreadCrumb extends Component {

  constructor() {
    super();
  }

  componentDidMount() {
  }

  _onDetailClick(obj, index) {
    this.props.clearFilter();
    this.props.metadataLoadDetail(obj, this.props.elements, index);
  }

  render() {
    let elements = this.props.elements;
    let Home = require('grommet/components/icons/base/Home');
    let Next = require('grommet/components/icons/base/Next');
    let breadcrumbs = elements.map((element, index) => {
      if (index == 0) {
        return (<Anchor key={index} icon={<Home />} onClick={this._onDetailClick.bind(this, element, index)}
                        label={element.label+'('+element.sqlname+')'}/>);
      } else if (index == elements.length - 1) {
        return <Anchor key={index} icon={<Next />} label={element.sqlname}/>;
      } else {
        return (<Anchor key={index} icon={<Next />} onClick={this._onDetailClick.bind(this, element, index)}
                        label={element.sqlname}/>);
      }
    });

    return (
      <Box pad={{vertical: 'small'}} flex={false}>{breadcrumbs}</Box>
    );
  }
}

BreadCrumb.propTypes = {
  elements: PropTypes.array.isRequired
};
