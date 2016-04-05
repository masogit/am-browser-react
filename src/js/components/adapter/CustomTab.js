// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import Tab from 'grommet/components/Tab';
class CustomTab extends Tab {
  constructor () {
    super();
  }

  componentDidMount() {
    let clickHandler = this.props.clickHandler;
    if (typeof clickHandler === 'function') {
      let originalClick = this._onClickTab.bind(this);
      if (originalClick) {
        this._onClickTab = (event) => {
          originalClick(event);
          clickHandler();
        };
      }
    }
  }
}
export default CustomTab;
