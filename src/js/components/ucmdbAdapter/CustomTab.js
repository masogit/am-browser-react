// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP
import Tab from 'grommet/components/Tab';
class CustomTab extends Tab {
  constructor () {
    super();
  }

  componentDidMount() {
    let clickHandler = this.props.onClick;
    if (typeof clickHandler === 'function') {
      let originalClick = Tab.prototype._onClickTab.bind(this);
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
