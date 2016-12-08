/**
 * Created by huling on 12/7/2016.
 */
import React, {Component} from 'react';
import {Header, Menu, Anchor, Title, Icons} from 'grommet';
import {UploadWidget} from './Widgets';
const { Play, Checkmark, Close, Download, More, Mail, Duplicate } = Icons.Base;

const renderAnchor = ({icon, onClick, args, enable, label, index}) => {
  return <Anchor key={index} icon={icon} label={label} disabled={!enable} onClick={() => enable && onClick(args)}/>;
};

const renderHelper = {
  Query: props => renderAnchor({icon:<Play />, label: 'Query', ...props}),
  Save: props => renderAnchor({icon:<Checkmark />, label: 'Save', ...props}),
  Delete: props => renderAnchor({icon:<Close />, label: 'Delete', ...props}),
  Duplicate: props => renderAnchor({icon:<Duplicate />, label: 'Duplicate', ...props}),
  Mail: props => renderAnchor({icon:<Mail />, label: 'Mail', ...props}),
  Download: props => renderAnchor({icon:<Download />, label: 'Download', ...props})
};

const getButtons = (buttons) => {
  return buttons.map((button, index) => {
    if (!button.hide) {
      const renderFunc = renderHelper[button.id] || renderAnchor;
      button.index = index;
      return renderFunc(button);
    }
  });
};

export default class AMHeader extends Component {
  closeMenu() {
    this.menu.setState({state: 'collapsed'});
  }

  render() {
    const {title, buttons, subMenuButtons, uploadProps} = this.props;

    return (
      <Header justify="between" pad={{'horizontal': 'medium'}}>
        <Title>{title}</Title>
        <Menu direction="row" align="center" responsive={true}>
          {getButtons(buttons)}
          <Menu icon={<More />} dropAlign={{ right: 'right', top: 'top' }} ref={node => this.menu = node}
                closeOnClick={!uploadProps || !uploadProps.enable}>
            {getButtons(subMenuButtons)}
            {uploadProps && <UploadWidget enable={uploadProps.enable} accept={uploadProps.accept} onChange={uploadProps.onChange} closeMenu={this.closeMenu.bind(this)}/>}
          </Menu>
        </Menu>
      </Header>
    );
  }
}
