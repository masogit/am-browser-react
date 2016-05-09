import expect from 'expect'
import reducer from '../../src/js/reducers/views'
import * as types from '../../src/js/constants/ActionTypes'
import mockViews from '../mockdata/views.json';

describe('views - reducers/views-spec.js', () => {
  it('should return the initial state', () => {
    expect(
      reducer(undefined, {})
    ).toEqual(
      {
        isFetchingViewList: false,
        isFetchingTemplateTable: false,
        views: [],
        selectedView: {},
        selectedViewId: '',
        templateTable: {},
        err: '',
        editing: false
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
        isFetchingViewList: true
      }
    )
  })

  it('should handle RECEIVE_VIEWS_SUCCESS', () => {
    expect(
      reducer({}, {
        type: types.RECEIVE_VIEWS_SUCCESS,
        views: mockViews
      })
    ).toEqual(
      {
        isFetchingViewList: false,
        views: mockViews
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
        isFetchingViewList: false,
        err: "error"
      }
    )
  })
})