import React, {Component} from 'react';
import { initAbout } from '../actions';
import {
  Box,
  Header,
  Title,
  Table,
  TableRow
} from 'grommet';
import Label from 'grommet/components/Label';
import Logo from './Logo'; // './HPELogo';

export default class About extends Component {

  constructor() {
    super();
    this.state = {about: {
      amVersion: null,
      ambVersion: null,
      rest: {
        server: null,
        port: null
      },
      ucmdb: {
        server: null,
        port: null
      }
    }};
  }

  componentDidMount() {
    initAbout().then((res) => {
      this.setState({about: res.about});
    });
  }

  render() {
    return (
      <Box size="large">
        <Header><Title><Logo /> AM Browser</Title></Header>
        <Table>
          <thead>
          <tr>
            <th></th>
            <th></th>
          </tr>
          </thead>
          <tbody>
            <TableRow>
              <td> Asset Manager Browser Version: </td>
              <td> {this.state.about.ambVersion} </td>
            </TableRow>
            <TableRow>
              <td> REST Server: </td>
              <td> {this.state.about.rest.server} </td>
            </TableRow>
            <TableRow>
              <td> REST Port: </td>
              <td> {this.state.about.rest.port} </td>
            </TableRow>
            <TableRow>
              <td> UCMDB Server: </td>
              <td> {this.state.about.ucmdb.server} </td>
            </TableRow>
            <TableRow>
              <td> UCMDB Port: </td>
              <td> {this.state.about.ucmdb.port} </td>
            </TableRow>
          </tbody>
        </Table>
        <Box full="horizontal">
          <Label className='copyright'>
            © 1994-2016 Hewlett Packard Enterprise Development LP All rights reserved.
            This software is protected by international copyright law.
          </Label>
        </Box>
      </Box>
    );
  }
}