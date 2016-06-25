import React, {Component} from 'react';
import {initAbout} from '../actions';
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
    this.state = {
      about: {
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
      }
    };
  }

  componentDidMount() {
    initAbout().then((res) => {
      this.setState({about: res.about});
    });
  }

  render() {
    return (
      <Box size="medium">
        <Header><Title><Logo /> Asset Manager Browser</Title></Header>
        <Table>
          <tbody>
          <TableRow>
            <td> Version:</td>
            <td> {this.state.about.ambVersion} </td>
          </TableRow>
          <TableRow>
            <td> AM REST Server:</td>
            <td> {this.state.about.rest.server} </td>
          </TableRow>
          <TableRow>
            <td> AM REST Port:</td>
            <td> {this.state.about.rest.port} </td>
          </TableRow>
          <TableRow>
            <td> UCMDB Browser Server:</td>
            <td> {this.state.about.ucmdb.server} </td>
          </TableRow>
          <TableRow>
            <td> UCMDB Browser Port:</td>
            <td> {this.state.about.ucmdb.port} </td>
          </TableRow>
          </tbody>
        </Table>
        <Label className='copyright'>
          © 1994-2016 Hewlett Packard Enterprise Development LP All rights reserved.<br />
          This software is protected by international copyright law.
        </Label>
      </Box>
    );
  }
}
