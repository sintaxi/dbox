var oauth = require("./oauth")
var path  = require("path")
var qs    = require("querystring")

module.exports = function(config){
  var root = config.root || "sandbox"
  var signer = oauth(config.app_key, config.app_secret)
  
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
    
    /**
     *  Builds url based on args
     *
     *    var url = helpers.url({
     *      base: "https://api-content.dropbox.com",
     *      action: "files",
     *      path: path,
     *      query: signature
     *    })
     *
     *
     *    https://api-content.dropbox.com/1/files/sandbox/myrenamedfile.txt
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

      var file_path = obj.path 
        ? qs.escape(obj.path) 
        : null
      
      var u = "https://" + obj.hostname + path.join("/", (obj.version || "1"), obj.action, root, file_path)
              
      if(obj.hasOwnProperty("query"))
        u += ("?" + qs.stringify(obj.query))
      
      return u
    }
    
  }
  
}