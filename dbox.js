var request = require("request")
var oauth   = require("./lib/oauth")
var qs      = require("querystring")

exports.createClient = function(config){

  var sign = oauth(config.app_key, config.app_secret)
  var root = config.root || "sandbox"
 
  return {

    request_token: function(cb){
      var signature = sign({})
      var args = {
        "method": "POST",
        "headers": { "content-type": "application/x-www-form-urlencoded" },
        "url": "https://api.dropbox.com/1/oauth/request_token",
        "body": qs.stringify(signature)
      }
      request(args, function(e, r, b){
        var obj = {}
        b.split("&").forEach(function(kv){
          var kv = kv.split("=")
          obj[kv[0]] = kv[1] 
        })
        cb(r.statusCode, obj)
      })
    },
    build_authorize_url: function(oauth_token, oauth_callback){
      var url = "https://www.dropbox.com/1/oauth/authorize?oauth_token=" + oauth_token;
      if(oauth_callback){
        url = url + "&oauth_callback=" + oauth_callback;
      }
      return url;
    },
    access_token: function(options, cb){
      var params = sign(options)
      var args = {
        "method": "POST",
        "headers": { "content-type": "application/x-www-form-urlencoded" },
        "url": "https://api.dropbox.com/1/oauth/access_token",
        "body": qs.stringify(params)
      }
      request(args, function(e, r, b){
        var obj = {}
        b.split("&").forEach(function(kv){
          var kv = kv.split("=")
          obj[kv[0]] = kv[1] 
        })
        cb(r.statusCode, obj)
      })
    },

    account: function(options, cb){
      var params = sign(options)
      var args = {
        "method": "POST",
        "headers": { "content-type": "application/x-www-form-urlencoded" },
        "url": "https://api.dropbox.com/1/account/info",
        "body": qs.stringify(params)
      }
      request(args, function(e, r, b){
        cb(r.statusCode, JSON.parse(b))
      })
    },

    get: function(path, options, cb){
      var params = sign(options)

      var args = {
        "method": "GET",
        "url": "https://api-content.dropbox.com/1/files/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params),
        "encoding": null
      }
      request(args, function(e, r, b){
        cb(r.statusCode, b)
      })
    },

    put: function(path, body, options, cb){
      var params = sign(options)
      var args = {
        "method": "PUT",
        "headers": { "content-length": body.length },
        "url": "https://api-content.dropbox.com/1/files_put/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params),
        "body": body 
      }
      request(args, function(e, r, b){
        cb(r.statusCode, JSON.parse(b))
      })
    },

    metadata: function(path, options, cb){
      var params = sign(options)
      var args = {
        "method": "GET",
        "url": "https://api.dropbox.com/1/metadata/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params)
      }
      request(args, function(e, r, b){
        cb(r.statusCode, b)
      })
    },

    revisions: function(path, options, cb){
      var params = sign(options)
      var args = {
        "method": "GET",
        "url": "https://api.dropbox.com/1/revisions/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params)
      }
      request(args, function(e, r, b){
        cb(r.statusCode, JSON.parse(b))
      })
    },

    restore: function(path, rev, options, cb){
      var params = sign(options)
      params["rev"] = rev

      var body = qs.stringify(params)
      var args = {
        "method": "POST",
        "headers": {
          "content-type": "application/x-www-form-urlencoded",
          "content-length": body.length
        },
        "url": "https://api.dropbox.com/1/restore/" + (params.root || root) + "/" + qs.escape(path), // + "?" + qs.stringify(params)
        "body": qs.stringify(params)
      }
      request(args, function(e, r, b){
        cb(r.statusCode, b)
      })
    },

    search: function(path, query, options, cb){
      var params = sign(options)
      params["query"] = query

      var body = qs.stringify(params)
      var args = {
        "method": "POST",
        "headers": {
          "content-type": "application/x-www-form-urlencoded",
          "content-length": body.length 
        },
        "url": "https://api.dropbox.com/1/search/" + (params.root || root) + "/" + qs.escape(path),
        "body": body
      }
      request(args, function(e, r, b){
        cb(r.statusCode, JSON.parse(b))
      })
    },

    shares: function(path, options, cb){
      var params = sign(options)
      var body = qs.stringify(params)
      var args = {
        "method": "POST",
        "headers": {
          "content-type": "application/x-www-form-urlencoded",
          "content-length": body.length 
        },
        "url": "https://api.dropbox.com/1/shares/" + (params.root || root) + "/" + qs.escape(path), 
        "body": body
      }
      request(args, function(e, r, b){
        cb(r.statusCode, b)
      })
    },

    media: function(path, options, cb){
      var params = sign(options)
      var body = qs.stringify(params)
      var args = {
        "method": "POST",
        "headers": {
          "content-type": "application/x-www-form-urlencoded",
          "content-length": body.length 
        },
        "url": "https://api.dropbox.com/1/media/" + (params.root || root) + "/" + qs.escape(path), 
        "body": body
      }
      request(args, function(e, r, b){
        cb(r.statusCode, b)
      })
    },

    thumbnails: function(path, options, cb){
      var params = sign(options)
      var args = {
        "method": "GET",
        "url": "https://api-content.dropbox.com/1/thumbnails/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params),
        "encoding": null
      }
      request(args, function(e, r, b){
        cb(r.statusCode, b)
      })
    },

    cp: function(from_path, to_path, options, cb){
      var params = sign(options)
      params["root"] = params.root || root
      params["from_path"] = from_path
      params["to_path"] = to_path
      var args = {
        "method": "POST",
        "headers": { "content-type": "application/x-www-form-urlencoded" },
        "url": "https://api.dropbox.com/1/fileops/copy",
        "body": qs.stringify(params)
      }
      request(args, function(e, r, b){
        cb(r.statusCode, JSON.parse(b))
      })
    },

    mv: function(from_path, to_path, options, cb){
      var params = sign(options)
      params["root"] = params.root || root
      params["from_path"] = from_path
      params["to_path"] = to_path

      var args = {
        "method": "POST",
        "headers": { "content-type": "application/x-www-form-urlencoded" },
        "url": "https://api.dropbox.com/1/fileops/move",
        "body": qs.stringify(params)
      }

      request(args, function(e, r, b){
        cb(r.statusCode, JSON.parse(b))
      })
    },

    rm: function(path, options, cb){
      var params = sign(options)
      params["root"] = params["root"] || root
      params["path"] = path
      var args = {
        "method": "POST",
        "headers": { "content-type": "application/x-www-form-urlencoded" },
        "url": "https://api.dropbox.com/1/fileops/delete",
        "body": qs.stringify(params)
      }
      request(args, function(e, r, b){
        cb(r.statusCode, JSON.parse(b))
      })
    },

    mkdir: function(path, options, cb){
      var params = sign(options)
      params["root"] = params.root || root
      params["path"] = path
      var args = {
        "method": "POST",
        "headers": { "content-type": "application/x-www-form-urlencoded" },
        "url": "https://api.dropbox.com/1/fileops/create_folder",
        "body": qs.stringify(params)
      }
      request(args, function(e, r, b){
        cb(r.statusCode, JSON.parse(b))
      })
    }

  } 

}

