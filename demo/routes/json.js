
/*
 * GET home page.
 */

 var dbox = require('dbox');

 function setupApp(session){
 	if (session.app_info != null)
	 	return dbox.app({ 
	 		"app_key": session.app_info.app_key, 
	 		"app_secret": session.app_info.app_secret,
	 		"root": session.app_info.root
	 	});
	 else 
	 	return null;
 }

 function setupClient(session){
 	var app = setupApp(session);
 	if (app != null && session.access_token != null)
    	return app.client(session.access_token);
   	else 
   		return null;
 }

exports.setupApp = function(req, res){
	var app = dbox.app({ 
		"app_key": req.param('app_key'), 
		"app_secret": req.param('app_secret'),
		"root": req.param('root')
	});
	app.requesttoken(function(status, request_token){
		if (status == 200) {
			req.session.request_token = request_token;
			req.session.app_info = {
				app_key: req.param('app_key'),
				app_secret: req.param('app_secret'),
				root: req.param('root')
			}
		}
		res.send({status: status, request_token: request_token});
	});
};

exports.generateAccessToken = function(req,res){
	if (req.session.app_info != null && req.session.request_token != null){
		var app = setupApp(req.session);
		app.accesstoken(req.session.request_token, function(status, access_token){
			if (status == 200) req.session.access_token = access_token;
			res.send({status: status, access_token: access_token});
		});
	} else {
		res.send({status: 10000});
	}
};

exports.metadata = function(req,res){
	var client = setupClient(req.session);
	if (client != null){
		client.metadata( req.param('path') ? req.param('path') : '/', {}, function(status, result){
			res.send({status: status, result: result});
		});
	} else {
		res.send({status: 10000});
	}
}

exports.mkdir = function(req,res){
	var client = setupClient(req.session);
	if (client != null){
		client.mkdir( req.param('path'), {}, function(status, result){
			res.send({status: status, result: result});
		});
	} else {
		res.send({status: 10000});
	}
}