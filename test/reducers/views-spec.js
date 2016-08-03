import expect from 'expect';
import reducer from '../../src/js/reducers/views';
import emptyViewDef from '../../src/js/reducers/EmptyViewDef.json';
import * as Types from '../../src/js/constants/ActionTypes';
import mockViews from '../mockdata/views.json';
import mockMetadata from '../mockdata/metadata.json';

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
        preview: false,
        alertForm: null,
        elements: [],
        rows: {}
      }
    );
  });

  it('should handle REQUEST_VIEWS', () => {
    expect(
      reducer({}, {
        type: Types.REQUEST_VIEWS
      })
    ).toEqual(
      {
        isFetchingViewList: true
      }
    );
  });

  it('should handle RECEIVE_VIEWS_SUCCESS', () => {
    expect(
      reducer({}, {
        type: Types.RECEIVE_VIEWS_SUCCESS,
        views: mockViews
      })
    ).toEqual(
      {
        isFetchingViewList: false,
        views: mockViews
      }
    );
  });

  it('should handle RECEIVE_VIEWS_FAILURE', () => {
    expect(
      reducer({}, {
        type: Types.RECEIVE_VIEWS_FAILURE,
        err: "error"
      })
    ).toEqual(
      {
        isFetchingViewList: false,
        err: "error"
      }
    );
  });

  it('should handle SET_SELECTED_VIEW', () => {
    expect(
      reducer({}, {
        type: Types.SET_SELECTED_VIEW,
        selectedView: mockViews[2],
        selectedViewId: mockViews[2]._id
      })
    ).toEqual(
      {
        selectedView: mockViews[2],
        selectedViewId: mockViews[2]._id
      }
    );
  });

  it('should handle UPDATE_SELECTED_VIEW', () => {
    const state = reducer({}, {
      type: Types.UPDATE_SELECTED_VIEW,
      selectedView: mockViews[2],
      path: 'body.groupby',
      newValue: 'dBilling'
    });
    expect(state.selectedView.body.groupby).toEqual('dBilling');
  });

  it('should handle DELETE_TABLE_ROW', () => {
    expect(
      reducer({}, {
        type: Types.DELETE_TABLE_ROW,
        selectedView: mockViews[2]
      })
    ).toEqual({
      selectedView: mockViews[2]
    });
  });

  it('should handle DUPLICATE_VIEW_DEF', () => {
    expect(
      reducer({}, {
        type: Types.DUPLICATE_VIEW_DEF,
        selectedView: mockViews[2]
      })
    ).toEqual({
      selectedView: mockViews[2]
    });
  });

  it('should handle SYNC_SELECTED_VIEW', () => {
    expect(
      reducer({}, {
        type: Types.SYNC_SELECTED_VIEW,
        selectedView: mockViews[2]
      })
    ).toEqual({
      selectedView: mockViews[2]
    });
  });

  it('should handle SAVE_VIEW_DEF', () => {
    expect(
      reducer({}, {
        type: Types.SAVE_VIEW_DEF,
        selectedView: mockViews[2],
        selectedViewId: mockViews[2]._id
      })
    ).toEqual({
      selectedView: mockViews[2],
      selectedViewId: mockViews[2]._id
    });
  });

  it('should handle DELETE_VIEW_DEF', () => {
    expect(
      reducer({views: mockViews}, {
        type: Types.DELETE_VIEW_DEF,
        selectedView: mockViews[2],
        selectedViewId: mockViews[2]._id,
        views: mockViews
      })
    ).toEqual({
      selectedViewId: "",
      selectedView: {},
      views: mockViews.slice(0, 2)
    });
  });

  it('should handle OPEN_PREVIEW', () => {
    expect(
      reducer({}, {
        type: Types.OPEN_PREVIEW
      })
    ).toEqual({
      preview: true
    });
  });

  it('should handle CLOSE_PREVIEW', () => {
    expect(
      reducer({}, {
        type: Types.CLOSE_PREVIEW
      })
    ).toEqual({
      preview: false
    });
  });

  it('should handle NEW_SELECTED_VIEW', () => {
    expect(
      reducer({}, {
        type: Types.NEW_SELECTED_VIEW
      })
    ).toEqual({
      selectedView: emptyViewDef
    });
  });

  it('should handle LOAD_METADATA_DETAIL_SUCCESS', () => {
    expect(
      reducer({}, {
        type: Types.LOAD_METADATA_DETAIL_SUCCESS,
        rows: mockMetadata.rows,
        elements: mockMetadata.elements
      })
    ).toEqual({
      rows: mockMetadata.rows,
      elements: mockMetadata.elements
    });
  });

  it('should handle LOAD_ALL_METADATA_SUCCESS', () => {
    const allRows = {
      count: 431,
      entities: new Array(431)
    };
    expect(
      reducer({}, {
        type: Types.LOAD_ALL_METADATA_SUCCESS,
        rows: allRows
      })
    ).toEqual({
      rows: allRows
    });
  });
});
