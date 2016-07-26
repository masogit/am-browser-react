/**
 * Created by huling on 6/29/2016.
 */
var db = {
  view: 'view',
  insight: 'wall',
  graph: 'aql'
};

module.exports = {
  rights: {
    admin: {
      value: 'admin',
      index: 0
    },
    power: {
      value: 'power',
      index: 1
    },
    guest: {
      value: 'guest',
      index: 2
    }
  },
  modules: {
    view: '/coll/' + db.view,
    insight: '/coll/' + db.insight,
    graph: '/coll/' + db.graph
  },
  collections: db
};
