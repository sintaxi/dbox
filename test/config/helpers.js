var fs      = require("fs")
var prompt  = require("prompt")

exports.auth = function(app, callback){
  var makeNewAccessToken = function() {
    app.requesttoken(function(status, request_token){
      prompt.start()
      prompt.get(['please authorize application at the following url and enter when done\n' + request_token.authorize_url], function (err, result) {
        if (err) { return 1 }
        app.accesstoken(request_token, function(status, access_token){
          fs.writeFile(__dirname + "/access_token.json", JSON.stringify(access_token), function(err){
            if (err) throw err;
            callback(access_token)
          })
        })
      })
    }) 
  }

  if (fs.existsSync(__dirname + "/access_token.json")) {
    var access_token = JSON.parse(fs.readFileSync(__dirname + "/access_token.json"))
    var client = app.client(access_token)
    client.account(function(status, account){
      if(status == 200){
        callback(access_token)
      }else{
        makeNewAccessToken();
      }
    })
  } else {
    makeNewAccessToken();
  }
}