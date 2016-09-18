/**
 * Created by huling on 9/1/2016.
 */
import React from 'react';
import {Box} from 'grommet';

const EditLayer = () => (
    <Box pad={{horizontal: 'medium'}} flex={true} justify='center' align="center">
      <Box size="medium" colorIndex="light-2" pad={{horizontal: 'large', vertical: 'medium'}} align='center'>
        Select an item or create a new one.
      </Box>
    </Box>
);

export default EditLayer;
