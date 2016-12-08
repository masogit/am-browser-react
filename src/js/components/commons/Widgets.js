/**
 * Created by huling on 11/23/2016.
 */
import React, {Component} from 'react';
import {Anchor, Icons} from 'grommet';
const Upload = Icons.Base.Upload;

class UploadWidget extends Component {
  onChange(e) {
    let file = e.target.files[0];
    var reader = new FileReader();
    if (this.props.accept.includes('.json')) {
      reader.readAsBinaryString(file);
    } else if (this.props.accept.match(/\.(jpg|png)$/i)) {
      reader.readAsDataURL(file);
    } else {
      throw 'Can not upload this type of file';
    }

    reader.onload = (e) => {
      this.props.onChange(e.target.result, this.props.closeMenu);
    };
  }

  render() {
    const { accept, label = 'Upload', enable = true} = this.props;
    return (
      <Anchor icon={<Upload />} disabled={!enable}
              onClick={() => enable && this.refs.upload.click()}
              label={
                <span>
                  {label}
                  <input type="file" ref='upload' accept={accept} onChange={this.onChange.bind(this)} style={{display: 'none'}}/>
                </span>
              }/>
    );
  }
}

export {
  UploadWidget
};
