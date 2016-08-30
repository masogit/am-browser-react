import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

export default class Textarea extends Component {
  componentDidMount() {
    this.defaultHeight = this.textarea.clientHeight;
    this.originOffsetHeight = this.textarea.offsetParent.clientHeight - this.defaultHeight;
  }

  componentDidUpdate() {
    if (this.props.resize && !this.updatedSize) {
      this.textarea.style.height = this.textarea.offsetParent.clientHeight - this.originOffsetHeight + 'px';
      this.updatedSize = true;
    }

    if(this.updatedSize && !this.props.resize) {
      this.textarea.style.height = this.defaultHeight + 'px';
      this.updatedSize = false;
    }
  }

  render() {
    const props = _.cloneDeep(this.props);
    delete props.resize;
    return <textarea ref={node=> this.textarea = node} {...props} />;
  }
}

Textarea.propTypes = {
  resize: PropTypes.bool
};
