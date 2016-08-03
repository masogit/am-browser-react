import expect from 'expect';
import reducer from '../../src/js/reducers/route';
import * as types from '../../src/js/constants/ActionTypes';

const route= {
  pathname: '/ucmdbAdapter/AM%20push/pushJobs',
  search: "",
  hash: "",
  state: null,
  action: "PUSH",
  key: "moktbc"
};

describe('route - reducers/route-spec.js', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(null);
  });

  it('should handle ROUTE_CHANGED', () => {
    expect(
      reducer({}, {
        type: types.ROUTE_CHANGED,
        prefix: '',
        route
      })
    ).toEqual(
      {
        ...route,
        prefix: ''
      }
    );
  });

  it('should handle ROUTE_CHANGED', () => {
    const search = {...route, pathname: '/search'};
    expect(
      reducer({}, {
        type: types.ROUTE_CHANGED,
        prefix: '',
        route: search
      })
    ).toEqual(
      {
        prefix: '',
        ...search
      }
    );
  });
});
