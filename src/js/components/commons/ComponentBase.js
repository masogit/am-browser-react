import {Component} from 'react';

export default class ComponentBase extends Component {
  constructor() {
    super();
    this.locked = false;
    this.acquireLock = () => {
      return this.locked ? false : (this.locked = true);
    };
    this.releaseLock = () => {
      this.locked = false;
    };
  }

  componentDidUpdate(prevProps, prevState) {
    this.releaseLock();
  }

}
