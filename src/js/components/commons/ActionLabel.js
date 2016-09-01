/**
 * Created by huling on 8/26/2016.
 */

import React from 'react';
import {Button} from 'grommet';

const ActionLabel = ({label, icon, onClick, onLabelClick}) => {
  return (
    <div className='grommetux-action-label'>
      <p style={{margin: '12px 0', cursor: onLabelClick ? 'pointer' : 'default', minHeight: '1.375em'}} onClick={onLabelClick}>{label || ' '}</p>
      {!onLabelClick && <Button className='grommetux-label_control' icon={icon} onClick={onClick}/>}
    </div>
  );
};

export default ActionLabel;
