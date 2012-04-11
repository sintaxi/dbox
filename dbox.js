var request = require("request")
var oauth   = require("./lib/oauth")
var qs      = require("querystring")

exports.app = function(config){

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
        var obj = qs.parse(b)
        obj.authorize_url = "https://www.dropbox.com/1/oauth/authorize?oauth_token=" + obj.oauth_token
        cb(e ? null : r.statusCode, obj)
      })
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
        cb(e ? null : r.statusCode, qs.parse(b))
      })
    },

    createClient: function(options){
      var options = options

      return {
        account: function(cb){
          var params = sign(options)
          var args = {
            "method": "POST",
            "headers": { "content-type": "application/x-www-form-urlencoded" },
            "url": "https://api.dropbox.com/1/account/info",
            "body": qs.stringify(params)
          }
          request(args, function(e, r, b){
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },
        
        delta: function(args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
          var params = sign(options)
          var args = {
            "method": "POST",
            "headers": { "content-type": "application/x-www-form-urlencoded" },
            "url": "https://api.dropbox.com/1/delta",
            "body": qs.stringify(params)
          }
          request(args, function(e, r, b){
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        get: function(path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
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

        put: function(path, body, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
          var params = sign(options)
          var args = {
            "method": "PUT",
            "headers": { "content-length": body.length },
            "url": "https://api-content.dropbox.com/1/files_put/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params),
            "body": body 
          }
          request(args, function(e, r, b){
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        metadata: function(path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
          var params = sign(options)
          var args = {
            "method": "GET",
            "url": "https://api.dropbox.com/1/metadata/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params)
          }
          request(args, function(e, r, b){
            // this is a special case, since the dropbox api returns a
            // 304 response with an empty body when the 'hash' option
            // is provided and there have been no changes since the
            // hash was computed
            cb(e ? null : r.statusCode, r.statusCode == 304 ? {} : JSON.parse(b))
          })
        },

        revisions: function(path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
          var params = sign(options)
          var args = {
            "method": "GET",
            "url": "https://api.dropbox.com/1/revisions/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params)
          }
          request(args, function(e, r, b){
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        restore: function(path, rev, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
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
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        search: function(path, query, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
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
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        shares: function(path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
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
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        media: function(path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
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
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        copy_ref: function(path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
          var params = sign(options)
          var args = {
            "method": "GET",
            "url": "https://api.dropbox.com/1/copy_ref/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params)
          }
          request(args, function(e, r, b){
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        thumbnails: function(path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
          var params = sign(options)
          var args = {
            "method": "GET",
            "url": "https://api-content.dropbox.com/1/thumbnails/" + (params.root || root) + "/" + qs.escape(path) + "?" + qs.stringify(params),
            "encoding": null
          }
          request(args, function(e, r, b){
            cb(e ? null : r.statusCode, b)
          })
        },

        cp: function(from_path, to_path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
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
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        mv: function(from_path, to_path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
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
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        rm: function(path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
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
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        },

        mkdir: function(path, args, cb){
          if(cb == null){
            cb = args
          }else{
            for(var attr in args)(function(attr){
              options[attr] = args[attr]
            })(attr)
          }
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
            cb(e ? null : r.statusCode, JSON.parse(b))
          })
        }
      }
    }
  } 

}

