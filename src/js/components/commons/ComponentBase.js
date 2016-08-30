import {Component} from 'react';
import {stopMonitorEdit} from '../../actions/system';

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
    this.promiseList = [];
  }

  componentWillMount() {
    this._unmount = false;
  }

  shouldComponentUpdate() {
    return !this._unmount;
  }

  componentDidUpdate(prevProps, prevState) {
    this.releaseLock();
  }

  componentWillUnmount() {
    stopMonitorEdit();
    this.cancelPromises();
    this._unmount = true;
  }

  addPromise(promise) {
    this.promiseList.push(promise);
  }

  cancelPromises() {
    this.promiseList.forEach(promise => promise.cancel());
  }

  clearPromiseList() {
    this.promiseList = [];
  }
}
