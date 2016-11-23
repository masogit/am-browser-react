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
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      this.props.onChange(e.target.result);
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
