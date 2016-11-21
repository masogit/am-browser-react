/**
 * Created by huling on 5/26/2016.
 */

import Edit from 'grommet/components/icons/base/Edit';
import React from 'react';

const cls = 'icon-empty';
const EmptyIcon = ({className = cls}) => (
  <Edit className = {className} />
);

export default EmptyIcon;
