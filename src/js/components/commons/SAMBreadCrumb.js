import React, {Component, PropTypes} from 'react';
import { Box, Menu, Anchor, Button } from 'grommet';

export default class SAMBreadCrumb extends Component {

  constructor(props) {
    super(props);
    this.state = {
      vendor: this.props.hierarchyData[0],
      product: this.props.hierarchyData[1],
      license: this.props.hierarchyData[2],
      software: this.props.hierarchyData[3],
      itemSelected: this.props.itemSelected
    };
  }

  componentWillReceiveProps(nextProps) {
    this.state = {
      vendor: nextProps.hierarchyData[0],
      product: nextProps.hierarchyData[1],
      license: nextProps.hierarchyData[2],
      software: nextProps.hierarchyData[3],
      itemSelected: nextProps.itemSelected
    };
  }

  formatItems(bCrumb, sam) {
    let breadCrumbs = bCrumb;
    breadCrumbs.push({
      title: sam.title,
      items: sam.data.map(entry => ({label: entry.name})),
      onSelect: sam.onSelect
    });
    return breadCrumbs;
  }

  renderBreadCrumbs() {
    const {vendor, product, license, itemSelected} = this.state;
    let breadCrumbs = [];
    if (vendor && product) {
      breadCrumbs = this.formatItems(breadCrumbs, vendor);
      if (product && license)
        breadCrumbs = this.formatItems(breadCrumbs, product);
    }

    let breadCrumbsContent = breadCrumbs.map((bcrumb, index) => (
        <Box direction="row" key={`bcrumb-${index}`}>
          <Button label="/" plain={true} />
          <Menu label={itemSelected[index]}>
            {bcrumb.items.map((item, index) => {
              return (<Anchor key={index} label={item.label} onClick={() => {
                bcrumb.onSelect(item.label);
              }} />);
            })}
          </Menu>
        </Box>
      ));

    return breadCrumbsContent;
  }

  render() {
    const {product} = this.state;
    return(
      <Box direction="row"  pad={{vertical: product ? 'small': "medium"}} justify="start" alignContent="start" margin={{horizontal: "small"}}>
        <Button label="Home" onClick={() => (this.props.toOverview())}
          plain={true}/>
        {this.renderBreadCrumbs()}
      </Box>
    );
  }
}

SAMBreadCrumb.propTypes = {
  hierarchyData: PropTypes.array.isRequired
};
