import expect from 'expect';
import reducer from '../../src/js/reducers/message';
import * as types from '../../src/js/constants/ActionTypes';

const msg = 'dummy message';
const initState = {
  msgs: [],
  status: null,
  msg: null
};

describe('views - reducers/views-spec.js', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(initState);
  });

  it('should handle RECEIVE_ERROR', () => {
    const state = reducer(initState, {
      type: types.RECEIVE_ERROR,
      msg
    });

    expect(state.msgs[0].msg).toEqual(msg);
    expect(state.msgs[0].status).toEqual('critical');
    expect(state.msg).toEqual(msg);
    expect(state.status).toEqual('critical');
  });

  it('should handle RECEIVE_INFO', () => {
    const state = reducer(initState, {
      type: types.RECEIVE_INFO,
      msg
    });

    expect(state.msgs[0].msg).toEqual(msg);
    expect(state.msgs[0].status).toEqual('ok');
    expect(state.msg).toEqual(msg);
    expect(state.status).toEqual('ok');
  });

  it('should handle RECEIVE_WARNING', () => {
    const state = reducer(initState, {
      type: types.RECEIVE_WARNING,
      msg
    });

    expect(state.msgs[0].msg).toEqual(msg);
    expect(state.msgs[0].status).toEqual('warning');
    expect(state.msg).toEqual(msg);
    expect(state.status).toEqual('warning');
  });

  it('should handle MESSAGE_READ', () => {
    expect(
      reducer({}, {
        type: types.MESSAGE_READ
      })
    ).toEqual( { msg: null } );
  });
});
