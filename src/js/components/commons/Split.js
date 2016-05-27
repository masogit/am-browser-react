/**
 * Created by huling on 5/27/2016.
 */

import React from 'react';
import Box from 'grommet/components/Box';

export const Container = (props) => <Box {...props} direction="row" full={true}>{props.children}</Box>;
export const Content = (props) => <Box {...props} pad={{horizontal: 'medium'}} full={true}>{props.children}</Box>;
