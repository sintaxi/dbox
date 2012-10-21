
/**
 * Module dependencies.
 */

var express = require('express')
  , json = require('./routes/json')
  , http = require('http')
  , dbox = require('dbox')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('d9nEPGiAeSwGFUN2Ra8CGBmq'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req,res){
  res.render('index',{authorize_url: ( req.session.request_token ? req.session.request_token.authorize_url : null)});
});

app.get('/view', function(req,res){
  if (req.session.app_info != null && req.session.access_token != null){
    var app = dbox.app({ "app_key": req.session.app_info.app_key, 
                         "app_secret": req.session.app_info.app_secret,
                         "root": req.session.app_info.root
                       });
    var client = app.client(req.session.access_token);
    client.account(function(status,reply){
      if (status == 200) 
        res.render('view', {account: reply});
      else 
        res.redirect('/'); //Something went bad
    });
  } else {
    res.redirect('/');
  }
});

app.post('/json/setupApp', json.setupApp);
app.post('/json/generateAccessToken', json.generateAccessToken);
app.get('/json/metadata/*:path?', json.metadata);
app.post('/json/mkdir', json.mkdir);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
