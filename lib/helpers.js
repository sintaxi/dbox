var oauth = require("./oauth")
var path  = require("path")
var qs    = require("querystring")

module.exports = function(config){
  var root    = config.root || "sandbox"
  var signer  = oauth(config.app_key, config.app_secret)
  var scope   = config.scope
  
  return {  
    sign: function(token, args){
      var signature = signer(token)
      
      if(args != null)
        for(var attr in args)
          if (args.hasOwnProperty(attr)) signature[attr] = args[attr]

      return signature
    },
    
    parseJSON: function(str) {
      try {
        var obj = JSON.parse(str)
      } catch (e) {
        var obj = {}
      }
      return obj
    },
    
    filePath: function(fpath){
      return path.join(config.scope, fpath)
    },
    
    /**
     *  Builds url based on args
     *
     *    var url = helpers.url({
     *      base: "https://api-content.dropbox.com",
     *      action: "files",
     *      path: "myfile.txt",
     *      query: signature
     *    })
     *
     *
     *    https://api-content.dropbox.com/1/files/sandbox/myfile.txt
     *      ?oauth_token=o3v22uxb76xim22
     *      &oauth_consumer_key=umdezbv48ck01fx
     *      &oauth_signature=tjmajxw7sci88o6%26xxdg7s05i8yk21b
     *      &oauth_timestamp=1361772981
     *      &oauth_nonce=136177298119121587
     *      &oauth_signature_method=PLAINTEXT
     *      &oauth_version=1.0
     *
     */
    url: function(obj){
      if(!obj.hostname || !obj.action) 
        throw "must have proper base, version, and action"

      // calculate if fileops path
      var fileop   = obj.action.split("/")[0] == "fileops"
      
      // fileops calls desn't want root in path
      var rootpath = fileop ? null : root
      
      // fileops calls desn't want scope in path
      var scopepath = fileop ? null : scope

      // we wont always have this
      var filepath = obj.path ? qs.escape(obj.path) : null
      
      // build full path
      var fullpath = path.join(obj.hostname)
          fullpath = path.join(fullpath, obj.version || "1")
          fullpath = path.join(fullpath, obj.action)
          fullpath = path.join(fullpath, rootpath)
          fullpath = path.join(fullpath, scopepath)
          fullpath = path.join(fullpath, filepath)
      
      // add protocol
      var fullurl = "https://" + fullpath
      
      // add querystring if we have one
      if(obj.hasOwnProperty("query")) fullurl += ("?" + qs.stringify(obj.query))
      
      return fullurl
    }
    
  }
  
}