import expect from 'expect';
import reducer from '../../src/js/reducers/session';
import * as types from '../../src/js/constants/ActionTypes';

describe('session - reducers/session-spec.js', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual({
      email: null,
      error: null,
      headerNavs: null,
      loggedout: false
    });
  });

  it('should handle INIT', () => {
    expect(
      reducer({}, {
        type: types.INIT,
        email: 'admin@hpe.com',
        headerNavs: 'login:true, aql:false'
      })
    ).toEqual(
      {
        email: 'admin@hpe.com',
        headerNavs: 'login:true, aql:false'
      }
    );
  });

  it('should handle LOGIN_SUCCESS', () => {
    expect(
      reducer({}, {
        type: types.LOGIN_SUCCESS,
        email: 'admin@hpe.com',
        headerNavs: 'login:true, aql:false'
      })
    ).toEqual(
      {
        email: 'admin@hpe.com',
        headerNavs: 'login:true, aql:false',
        error: null
      }
    );
  });

  it('should handle LOGIN_FAILURE', () => {
    expect(
      reducer({}, {
        type: types.LOGIN_FAILURE,
        error: 'something wrong'
      })
    ).toEqual(
      {
        error: 'something wrong'
      }
    );
  });

  it('should handle LOGOUT', () => {
    expect(
      reducer({}, {
        type: types.LOGOUT
      })
    ).toEqual(
      {
        email: null,
        error: null,
        headerNavs: null,
        loggedout: true
      }
    );
  });
});
