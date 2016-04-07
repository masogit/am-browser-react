import expect from 'expect'
import reducer from '../../src/js/reducers/views'
import * as types from '../../src/js/constants/ActionTypes'

describe('views - reducers/views-spec.js', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(
      {
        isFetching: false,
        views: [],
        selectedView: '',
        err: ''
      }
    )
  })

  it('should handle REQUEST_VIEWS', () => {
    expect(
      reducer({}, {
        type: types.REQUEST_VIEWS
      })
    ).toEqual(
      {
        isFetching: true
      }
    )
  })

  it('should handle RECEIVE_VIEWS_SUCCESS', () => {
    expect(
      reducer({}, {
        type: types.RECEIVE_VIEWS_SUCCESS,
        views: [{
          "name": "Asset template 1",
          "description": "Asset template 1",
          "group": "Assets",
        }]
      })
    ).toEqual(
      {
        isFetching: false,
        views: [{
          "name": "Asset template 1",
          "description": "Asset template 1",
          "group": "Assets",
        }]
      }
    )
  })

  it('should handle RECEIVE_VIEWS_FAILURE', () => {
    expect(
      reducer({}, {
        type: types.RECEIVE_VIEWS_FAILURE,
        err: "error"
      })
    ).toEqual(
      {
        isFetching: false,
        err: "error"
      }
    )
  })
})