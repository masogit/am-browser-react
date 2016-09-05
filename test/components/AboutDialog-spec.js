/**
 * Created by huling on 8/3/2016.
 */
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import AboutDialog from '../../src/js/components/SessionMenu/AboutDialog';
import {Box, Header, Table, Label, TableRow} from 'grommet';

describe('components - components/AboutDialog-spec.js', () => {
  it('should render AboutDialog correctly', () => {
    const renderer = TestUtils.createRenderer();
    const dialog = renderer.render(<AboutDialog />);
    expect(dialog.type).toEqual(Box);

    const header = dialog.props.children[0];
    expect(header.type).toEqual(Header);

    const table = dialog.props.children[1];
    expect(table.type).toEqual(Table);

    const tr = table.props.children.props.children;
    expect(tr[0].type).toEqual(TableRow);
    expect(tr.length).toEqual(5);

    const label = dialog.props.children[2];
    expect(label.type).toEqual(Label);
    expect(label.props.className).toEqual('copyright');
  });
});

