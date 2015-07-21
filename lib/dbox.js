var request = require("request")
var qs      = require("querystring")
var path    = require("path")

exports.app = function(config){
  var root   = config.root  || "sandbox"
  var helpers = require("./helpers")(config)

  return {
    root: root,

    requesttoken: function(cb){
      var signature = helpers.sign({})
      var body = qs.stringify(signature)
      var args = {
        "method": "POST",
        "headers": {
          "content-type": "application/x-www-form-urlencoded",
          "content-length": body.length
        },
        "url": "https://api.dropbox.com/1/oauth/request_token",
        "body": body
      }
      return request(args, function(e, r, b){
        var obj = qs.parse(b)
        obj.authorize_url = "https://www.dropbox.com/1/oauth/authorize?oauth_token=" + obj.oauth_token
        cb(e ? null : r.statusCode, obj)
      })
    },

    accesstoken: function(options, cb){
      var signature = helpers.sign(options)
      var body = qs.stringify(signature)
      var args = {
        "method": "POST",
        "headers": {
          "content-type": "application/x-www-form-urlencoded",
          "content-length": body.length
        },
        "url": "https://api.dropbox.com/1/oauth/access_token",
        "body": body
      }
      return request(args, function(e, r, b){
        cb(e ? null : r.statusCode, qs.parse(b))
      })
    },

    // creates client object
    client: function(options){
      var options = options

      return {
        account: function(cb){
          var signature = helpers.sign(options)
          var args = {
            "method": "POST",
            "headers": { "content-type": "application/x-www-form-urlencoded" },
            "url": "https://api.dropbox.com/1/account/info",
            "body": qs.stringify(signature)
          }
          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        delta: function(args, cb){
          if(!cb){
            cb   = args
            args = {}
          }

          if (config.scope) {
            args.path_prefix = path.join("/", config.scope);
          }

          var entries = []
          var REQUEST_CONCURRENCY_DELAY = 20
          var reset;

          var fetch = function(args){
            var signature = helpers.sign(options, args)
            var body = qs.stringify(signature)
            var opts = {
              "method": "POST",
              "headers": {
                "content-type": "application/x-www-form-urlencoded",
                "content-length": body.length
              },
              "url": "https://api.dropbox.com/1/delta",
              "body": body
            }

            return request(opts, function(e, r, b){
              var status = e ? null : r.statusCode
              var output = helpers.parseJSON(b)

              if(typeof reset == 'undefined'){
                reset = output.reset
              }

              if(output && output.hasOwnProperty("entries")){
                output["entries"].forEach(function(entry){
                  entries.push(entry)
                })
              }
              if(output && output.hasOwnProperty("has_more") && output.has_more == true){
                args["cursor"] = output.cursor
                fetch(args)
              }else{
                if(output){
                  output["entries"] = entries
                  output["reset"] = reset
                }
                // console.log("MADE IT:", status, output)
                cb(status, output)
              }
            })
          }

          fetch(args)

        },

        get: function(path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          var url = helpers.url({
            hostname: "api-content.dropbox.com",
            action: "files",
            path: path,
            query: signature
          })

          var args = {
            "method": "GET",
            "url": url,
            "encoding": null
          }

          return request(args, function(e, r, b) {
            if (e) {
               cb(null, null, null);
            } else {
              var headers = (r.headers['x-dropbox-metadata'] !== undefined) ? helpers.parseJSON(r.headers['x-dropbox-metadata']) : {};
              cb(r.statusCode, b, headers);
            }
          })
        },

        stream: function(path, args) {
          var signature = helpers.sign(options, args)

          var url = helpers.url({
            hostname: "api-content.dropbox.com",
            action: "files",
            path: path,
            query: signature
          })

          var args = {
            "method": "GET",
            "url": url,
            "encoding": null
          }

          return request(args);
        },

        put: function(path, body, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          var url = helpers.url({
            hostname: "api-content.dropbox.com",
            action: "files_put",
            path: path,
            query: signature
          })

          var args = {
            "method": "PUT",
            "headers": { "content-length": body.length },
            "url": url
          }

          // do not send empty body
          if(body.length > 0) args["body"] = body

          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        putChunked: function (buffer, args, cb) {
          if (!cb) {
            cb = args;
            args = {
              offset: 0
            };
          }

          var signature = helpers.sign(options, args);

          var url = helpers.url({
            hostname: 'api-content.dropbox.com',
            action: 'chunked_upload',
            query: signature
          });

          args = {
            'method': 'PUT',
            'url': url.replace(/chunked_upload\/dropbox/i, 'chunked_upload')
          };

          // do not send empty body
          if (buffer.length > 0) {
            args.body = buffer;
          }

          return request(args, function (e, r, b) {
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b));
          });
        },

        commitChunked: function (path, upload_id, cb) {


          if (!upload_id) {
            return cb('upload_id is required');
          }

          var args = { "upload_id": upload_id };

          var signature = helpers.sign(options, args);

          var url = helpers.url({
            hostname: 'api-content.dropbox.com',
            action: 'commit_chunked_upload',
            path: path,
            query: signature
          });

          args = {
            'method': 'POST',
            'url': url.replace(/commit_chunked_upload\/dropbox/gi, 'commit_chunked_upload/auto')
          };

          return request(args, function (e, r, b) {
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b));
          });
        },

        uploadChunked: function (localPath, remotePath, options, cb) {

          var self = this;

          var defaultOptions = {
              "upload_id": null, // default null; `upload_id` of a previously initiated, unfinished chunked upload
              "offset": 0, // default 0; `offset` of a previously initiated, unfinished chunked upload
              "chunkSize": 5248288, // default 524288; chunkSize in bytes; recommend 524288 (512KB) or 1048576 (1MB)
              "onBeginChunkUpload": function(upload_id, chunkSize, chunkOffset) {}, //  function to be notified before each chunk is uploaded
              "onEndChunkUpload": function(upload_id, chunkSize, chunkOffset, fileBytesUploaded, fileBytesRemaining) {} // this will get called right after each chunk is uploaded
          };

          if (!options) {
            cb = options;
            options = defaultOptions;
          }

          if (!localPath) {
            return cb('localPath is required');
          }

          if (!remotePath) {
            return cb('remotePath is required');
          }

          // Assign default options for any not provided
          for (var key in defaultOptions) {
            if (defaultOptions.hasOwnProperty(key)) {
              options[key] = options[key] || defaultOptions[key];
            }
          }


          var fs = require('fs');
          fs.stat(localPath, function (err, stats) {

              var upload_id = options.upload_id || null,
                  offset =  parseInt(options.offset || 0),
                  chunkSize = parseInt(options.chunkSize || 0);

              if (err) {
                return cb({
                  'message': 'unable to get stats for file',
                  'err': err
                });
              }

              fs.open(localPath, 'r', function (err, fd) {
                var buffer,
                    fileBytesUploaded = 0,
                    fileBytesRemaining = stats.size;

                if (err) {
                  return cb({
                    'message': 'unable to open file',
                    'err': err
                  });
                }

                buffer = new Buffer(chunkSize);

                function putChunks() {
                  fs.read(fd, buffer, 0, chunkSize, offset, function (err, bytesRead, buffer) {
                    var chunkNumber;
                    if (err) {
                      return cb({
                        'message': 'unable to read buffer',
                        'err': err
                      });
                    }
                    // If on last chunk, bytes read might be less than chunk size
                    if (bytesRead !== chunkSize) {
                      buffer = buffer.slice(0, bytesRead);
                      chunkSize = bytesRead;
                    }

                    if (options.onBeginChunkUpload) {
                      options.onBeginChunkUpload(upload_id, chunkSize, offset);
                    }

                    // Now upload the buffer contents
                    self.putChunked(buffer, {
                      'upload_id': upload_id,
                      'offset': offset
                    }, function (status, reply) {

                      upload_id = reply.upload_id;
                      offset = reply.offset;

                      if (options.onEndChunkUpload) {
                        options.onEndChunkUpload(upload_id, chunkSize, offset, fileBytesUploaded, fileBytesRemaining, status, reply);
                      }

                      if (status === 400 && reply.offset) {
                        // offset was wrong. try again at correct offset
                        return putChunks();
                      }

                      if (status !== 200) {
                        return cb({
                          'message': reply,
                          'err': status
                        });
                      }

                      fileBytesUploaded = offset;
                      fileBytesRemaining = stats.size - offset;

                      if (offset === stats.size) {
                        return self.commitChunked(remotePath, upload_id, cb);
                      }
                      putChunks(); // put next chunk
                    });

                  });
                }
                putChunks(); // put first chunk

              });

            });

          },

        metadata: function(path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "metadata",
            path: path,
            query: signature
          })

          var args = {
            "method": "GET",
            "url": url
          }

          return request(args, function(e, r, b){
            // this is a special case, since the dropbox api returns a
            // 304 response with an empty body when the 'hash' option
            // is provided and there have been no changes since the
            // hash was computed
            if (e) {
                cb(null, null)
            } else {
                cb(r.statusCode, r.statusCode == 304 ? {} : helpers.parseJSON(b))
            }
          })
        },

        //
        // Loads a dropbox folder
        // (recursive by default)
        //
        readdir: function (path, options, callback) {
          if (arguments.length < 3) {
            callback = options;
            options = options || {};
          }
          options.recursive = (options.recursive !== false);    // default true
          options.details = (options.details === true);         // default false

          var results = [],
          REQUEST_CONCURRENCY_DELAY = 20,
          callbacks = 0,
          self = this;
          //
          // Remark: REQUEST_CONCURRENCY_DELAY represents the millisecond,
          // delay between outgoing requests to dropbox
          //
          function load (path) {
            callbacks++;
            //
            // Give the dropbox API a delay between requests,
            // by wrapping each depth level in a setTimeout delay
            //
            setTimeout(function(){
              self.metadata(path, function (status, reply) {
                //
                // If we have found any contents on this level of the folder
                //
                if (reply.contents) {
                  reply.contents.forEach(function (item) {
                    //
                    // Add the item into our results array (details or path)
                    //
                    var itemPath = helpers.scopedPath(item.path)
                    if(options.details){
                      item.path = itemPath
                      results.push(item)
                    }else{
                      results.push(itemPath)
                    }
                    //
                    // If we have encountered another folder, we can recurse on it
                    //
                    if (item.is_dir && options.recursive) {
                      load(itemPath);
                    }
                  });
                }
                callbacks--;
                if (callbacks === 0) {
                  callback(status, results);
                }
              });
            }, REQUEST_CONCURRENCY_DELAY)
          }
          load(path, results);
        },

        revisions: function(path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "revisions",
            path: path,
            query: signature
          })

          var args = {
            "method": "GET",
            "url": url
          }
          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        restore: function(path, rev, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature    = helpers.sign(options, args)
          signature["rev"] = rev

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "restore",
            path: path
          })

          var body = qs.stringify(signature)

          var args = {
            "method": "POST",
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
              "content-length": body.length
            },
            "url": url,
            "body": body
          }

          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        search: function(path, query, args, cb){

          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)
          signature["query"] = query

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "search",
            path: path
          })

          var body = qs.stringify(signature)
          var args = {
            "method": "POST",
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
              "content-length": body.length
            },
            "url": url,
            "body": body
          }
          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        shares: function(path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "shares",
            path: path
          })

          var body = qs.stringify(signature)

          var args = {
            "method": "POST",
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
              "content-length": body.length
            },
            "url": url,
            "body": body
          }
          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        media: function(path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "media",
            path: path
          })

          var body = qs.stringify(signature)

          var args = {
            "method": "POST",
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
              "content-length": body.length
            },
            "url": url,
            "body": body
          }
          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        cpref: function(path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "copy_ref",
            path: path,
            query: signature
          })

          var args = {
            "method": "GET",
            "url": url
          }
          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        thumbnails: function(path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          var url = helpers.url({
            hostname: "api-content.dropbox.com",
            action: "thumbnails",
            path: path,
            query: signature
          })

          var args = {
            "method": "GET",
            "url": url,
            "encoding": null
          }

          return request(args, function(e, r, b){
            if (e) {
                cb(null, null, null)
            } else {
                var headers = (r.headers['x-dropbox-metadata'] !== undefined) ? helpers.parseJSON(r.headers['x-dropbox-metadata']) : {};
                cb(r.statusCode, b, headers)
            }
          })
        },

        cp: function(from_path, to_path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          // check for copy ref
          if(from_path.hasOwnProperty("copy_ref")){
            signature['from_copy_ref'] = from_path["copy_ref"]
          }else{
            signature['from_path'] = helpers.filePath(from_path)
          }

          signature["root"]    = root       // API quirk that this is reqired for this call
          signature["to_path"] = helpers.filePath(to_path)


          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "fileops/copy"
          })

          var body = qs.stringify(signature)

          var args = {
            "method": "POST",
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
              "content-length": body.length
            },
            "url": url,
            "body": body
          }
          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        mv: function(from_path, to_path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          signature["root"]      = root          // API quirk that this is reqired for this call
          signature["from_path"] = helpers.filePath(from_path)
          signature["to_path"]   = helpers.filePath(to_path)

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "fileops/move"
          })

          var body = qs.stringify(signature)

          var args = {
            "method": "POST",
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
              "content-length": body.length
            },
            "url": url,
            "body": body
          }

          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        rm: function(path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          signature["root"] = root
          signature["path"] = helpers.filePath(path)

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "fileops/delete"
          })

          var body = qs.stringify(signature)

          var args = {
            "method": "POST",
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
              "content-length": body.length
            },
            "url": url,
            "body": body
          }
          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        },

        mkdir: function(path, args, cb){
          if(!cb){
            cb   = args
            args = null
          }

          var signature = helpers.sign(options, args)

          signature["root"] = root
          signature["path"] = helpers.filePath(path)

          var url = helpers.url({
            hostname: "api.dropbox.com",
            action: "fileops/create_folder"
          })

          var body = qs.stringify(signature)

          var args = {
            "method": "POST",
            "headers": {
              "content-type": "application/x-www-form-urlencoded",
              "content-length": body.length
            },
            "url": url,
            "body": body
          }
          return request(args, function(e, r, b){
            cb(e ? null : r.statusCode, e ? null : helpers.parseJSON(b))
          })
        }
      }
    }
  }

}

