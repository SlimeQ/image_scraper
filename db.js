var conf = require('./conf');
var MongoClient = require('mongodb').MongoClient;

var openConnection;
var connect = function (callback) {
	if (!openConnection) {
		MongoClient.connect(conf.dbURL, function(err, db) {
			if (!err) {
				openConnection = db;
				console.log('connected to ' + conf.dbURL);
				return callback(err, db);
			} else {
				return callback(err);
			}
		});
	} else {
		return callback(null, openConnection);
	}
}
var openConnection = connect(function(err, db) {
	if (!err) {
		return db;
	} else {
		console.log(err);
	}
});

exports.close = function(callback) {
	if (openConnection) {
		openConnection.close(function(err) {
			callback(err);
		});
	} else {
		if (callback) {
			callback('no connection to close');
		}
	}
}
exports.insert = function(coll, obj, callback) {
	// make sure we're connected
	connect(function(err, db) {
		if (!err) {
			var collection = db.collection(coll);
			collection.insert(obj, function(err, res) {
				if (!err) {
					callback(null, res);
				} else {
					callback(err);
				}
			});
		} else {
			callback(err);
		}
	});
};
exports.upsert = function(coll, query, obj, callback) {
	// make sure we're connected
	connect(function(err, db) {
		if (!err) {
			var collection = db.collection(coll);
			collection.update(query, obj, {upsert : true}, function(err, res) {
				if (!err) {
					callback(null, res);
				} else {
					callback(err);
				}
			});
		} else {
			callback(err);
		}
	});
};
exports.find = function(coll, query, projection) {

}

