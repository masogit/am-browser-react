/**
 * Created by huling on 9/1/2016.
 */
import React from 'react';
import {Box, FormField, Header, Title, Layer, Button, Footer} from 'grommet';

const EditLayer = ({onChange, value, label, onClose, name}) => (
  <Layer closer={true}>
    <Box flex={true} size='large'>
      <Header><Title>Edit</Title></Header>
      <FormField label={label} htmlFor={name}>
            <textarea id={name} rows='5' name={name} value={value} onChange={onChange}></textarea>
      </FormField>
      <Footer justify='end' pad={{vertical: 'medium'}}>
        <Button label="Confirm" primary={true} strong={true} onClick={onClose}/>
      </Footer>
    </Box>
  </Layer>
);

export default EditLayer;
