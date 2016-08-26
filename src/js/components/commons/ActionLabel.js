/**
 * Created by huling on 8/26/2016.
 */

import React from 'react';
import {Label, Button} from 'grommet';

const ActionLabel = ({label, icon, onClick}) => {
  return (
    <div className='grommetux-action-label'>
      <Label>{label}</Label>
      <Button className='grommetux-label_control' icon={icon} onClick={onClick}></Button>
    </div>
  );
};

export default ActionLabel;
