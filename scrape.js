var fs      = require('fs');
var url     = require('url');
var path    = require('path');
var request = require('request');
var cheerio = require('cheerio');
var qs      = require('querystring');

var db      = require('./db');
var help    = require('./helpers');
var conf    = require('./conf');



// get n random nouns
function getNouns(count, callback) {
  console.log('requesting nouns');
  request.post(
    {
      url : "http://www.desiquintans.com/articles/noungenerator.php",
      form : {
        nouncount : count
      }
    },
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);

        // Ultra-specific DOM traversal stuff.
        // Get the words from the page.
        $('.greenBox').filter(function() {
          var data = $(this).children()[2].children.filter(
            function(x) {
              return x.type == 'text';
            }).map(function(x) {
              return x.data.replace(/\n$/, '');
            });
          callback(data);
        });
      } else {
        console.log(error);
      }
    }
  ).on('error', function(e) {
    console.log("couldn't get words");
    callback(e);
    this.end();
  });
}

// do a google image search for a list of words
// max is 64 per search
var googleSearch = function(words, callback, pause, results, count, word, page, i) {

  if (!pause) var pause = conf.pause;
  if (!results) var results = [];
  if (!word) {
    if (words.length > 0) {
      var word = words.pop();
    } else {
      return callback(results);
    }
  }
  if (!page) var page = 0;
  if (!count) var count = conf.imgCount;
  if (!i) var i = 0;

  if (i >= count || page >= 8) {
    setTimeout(function() {
      googleSearch(words, callback, pause, results, count, null, null, 0);
    }, pause);
    return;
  }
  console.log(word + ', page', page);

  var googleUrl = "https://ajax.googleapis.com/ajax/services/search/images?"
    + qs.stringify(
      {
        'v'     : '1.0',
        'q'     : word,
        'rsz'   : conf.rsz,
        'imgsz' : conf.imgsz,
        'start' : page
      });
  request(googleUrl, function (err, response, body) {

    if (!err) {
      console.log(googleUrl, '---> SUCCESS');
      // Parse will fail if response is not json.
      // We've probably been cut off.
      try {
        var body = JSON.parse(body);
        if (body.responseData != null) {
          i += body.responseData.results.length;
          results = results.concat(
            body.responseData.results.map(function(x) {
              x.searchTerm = word;
              x.filepath = conf.imgDir + '/' + word + '/' + path.basename(url.parse(x.unescapedUrl).pathname);
              x.metadataRetrieved = help.timestamp();
              return x;
            })
          );
        } else {
          console.log('no response data');
          console.log(body);
        }
      } catch (e) {
        console.log(e);
      }

      // words, callback, pause, results, count, word, page, i
      setTimeout(function() {
        googleSearch(
          words,
          callback,
          pause,
          results,
          count,
          word,
          page+1,
          i);
      }, pause);

    } else {
      console.log(googleUrl, '---> ERR');
      console.log(err);
    }
  }).on('error', function(e) {
    console.log("couldn't get search results");
    callback(e);
    this.end();
  });
}

var saveAllImages = function(results, callback, pause) {
  // default to conf if no pause time was given
  if (!pause) pause = conf.pause;

  // all results have been processed
  if (results.length == 0) {
    callback();
  } else {
    // get next result
    var result = results.pop();

    // create appropriate directory if it doesn't exist
    var dir = conf.imgDir + '/' + result.searchTerm + '/';
    help.ensureExists(dir, function(err) {
      if (!err) {

        // download image
        download(result.unescapedUrl, result.filepath, function(err, uri, fn) {
          if (!err) {
            console.log(uri + ' ---> SUCCESS');
          } else {
            console.log(uri + ' ---> ERR');
            console.log(err);
          }
          result.err = err;
          result.imageRetrieved = help.timestamp();

          // dump result to db
          db.upsert('metadata',
            {
              unescapedUrl : result.unescapedUrl,
            },
            result, 
            function(err, res) {
              if (err) {
                console.log('ERR: no metadata was saved');
                console.log(err);
              }

              // pause to throttle network usage
              setTimeout(function() {
                // process next result
                saveAllImages(results, callback, pause);
              }, pause);
            }
          );
        });
      } else {
        // could not create directory
        // likely a permissions issue or a problem with conf
        console.log(err);

        // pause to throttle network usage
        setTimeout(function() {
          // process next (is this a good idea?)
          saveAllImages(results, callback, pause);
        }, pause);
      }
    });
  }
}

var download = function(uri, filename, callback){
  // make sure to handle fatal errors!
  request.head(uri, function(err, res, body){
    if (err) {
      callback(err, uri, filename);
    } else {
      if (res && res.statusCode != 200)
        callback(res.statusCode, uri, filename);
      else {
        var stream = request.get(uri);
        stream.pipe(
          fs.createWriteStream(filename)
            .on('error', function(err){
              callback(err, uri, filename);
              this.end();
            })
          )
        .on('close', function() {
          callback(null, uri, filename);
          this.end();
        });
      }
    }
  });
};


var main = function(words) {
  console.log(words);

  // google the things
  console.log('googling...');
  googleSearch(words, function(results) {
    console.log('finished googling\n');

    // save results to disk
    help.ensureExists(conf.imgDir, function(err) {
      if (!err) {
        console.log('downloading images...');
        saveAllImages(results, function() {
          console.log('finished crawl!');
          db.close(function(err) {
            if (!err) {
              console.log('db closed');
            } else {
              console.log(err);
            }
          });
        });
      } else {
        console.log(err);
        console.log('could not create image download directory.');
        console.log('  permissions issue?');
        console.log('  bad path name in conf.js?');
      }
    });
  });
}

if (process.argv.length > 2) {
  // use arguments if given
  main(process.argv.slice(2));
} else {
  // get n random nouns (n is set in conf.js)
  getNouns(conf.wordCount, main);
}

