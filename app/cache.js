module.exports = function (db, am, redisConf) {

    // init redis search client, need redis service on 127.0.0.1:6379
    var redis = require("redis"),
        rds_client = redis.createClient({
            host: redisConf.host,
            port: redisConf.port,
            auth_pass: redisConf.auth_pass
        });

    rds_client.on("error", function (err) {
        console.log("Redis Error " + err);
        rds_client.end();
    });

    var Search = require('redis-search');
    var search = Search.createSearch({
        service: 'am-browser',  // The name of your service. used for namespacing. Default 'search'.
        key: (am) ? am.server : "db",              // The name of this search. used for namespacing. So that you may have several searches in the same db. Default 'ngram'.
        n: 3,                   // The size of n-gram. Note that this method cannot match the word which length shorter then this size. Default '3'.
        cache_time: redisConf.ttl,         // The second of cache retention. Default '60'.
        client: rds_client      // The redis client instance. Set if you want customize redis connect. Default connect to local.
    });

    this.search = function (req, res) {
        var keyword = req.body.keyword;
        console.log("cache search keyword: " + keyword);
        search
            .type('and')
            .query(query = keyword, function (err, ids) {
                if (err) throw err;
                console.log('Search results for "%s":', query);
                //                console.log(ids);
                res.send({count: ids.length, ids: ids.slice(0, 99)});
            });
    };
};