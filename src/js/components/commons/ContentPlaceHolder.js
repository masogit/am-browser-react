/**
 * Created by huling on 9/1/2016.
 */
import React from 'react';
import {Box} from 'grommet';

const ContentPlaceHolder = ({content}) => (
    <Box pad={{horizontal: 'medium'}} flex={true} justify='center' align="center">
      <Box size="medium" colorIndex="light-2" pad={{horizontal: 'large', vertical: 'medium'}} align='center'>
        {content || 'Select an item or create a new one.'}
      </Box>
    </Box>
);

export default ContentPlaceHolder;
