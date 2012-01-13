# dbox 

## Instalation

I always recomend you bundle your dependencies with your application. To do
this, create a `package.json` file in the root of your project with the minimum
information...

    {
      "name": "yourapplication",
      "verson": "0.1.0",
      "dependencies": {
        "dbox": "0.2.2"
      }
    }

Then run the following command using npm...

    npm install

OR, if you just want to start playing with the library run...

    npm install dbox

## Docs

To create a dbox client that gives us functions to managing a dropbox account we must
call `createClient()` with our dropbox app (aka. consumer) credentials.

    var dbox   = require("dbox")

    var client = dbox.createClient({
      app_key    : 1234567,             // required
      app_secret : "abcdefg",           // required
      root       : "sandbox"            // optional (defaults to sandbox)
    })

Now we have a client that gives us access to all the api functionality.

### request_token(callback)

We can now request a `Request Token` to begin the Oauth process. This function
doesn't take any arguments other than the callback that you would like called
once a valid `Request Token` is generated.

    client.request_token(function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   oauth_token        : "h89r0sdfdsfwiko",  // required
      //   oauth_token_secret : "8hielfflk7100mv",  // required
      // }
    })

### Authorization

The next step is to redirect the user to the dropbox endpoint to recieve
authorization from the user. Dbox makes no attempt to do this for you. Simply
pass in the `oauth_token` into the querystring.

    https://www.dropbox.com/1/oauth/authorize?oauth_token=h89r0sdfdsfwiko

### access_token(callback)

Once the user has granted authorization we can now generate the access token
using the request token to sign the request.

    var options = {
      oauth_token        : "h89r0sdfdsfwiko",  // required
      oauth_token_secret : "8hielfflk7100mv",  // required
    }

    client.access_token(options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   oauth_token        : "jm0qrf7hohgwiko",
      //   oauth_token_secret : "5n9687cyzp8xwii"
      // }
    })

### account(options, callback)

Returns account information.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      locale:            : "en"                // optional
    }

    client.account(options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // { 
      //   uid: 123456789,
      //   display_name: 'Brock Whitten',
      //   email: 'brock@sintaxi.com',
      //   country: 'CA',
      //   referral_link: 'https://www.dropbox.com/referrals/NTc0NzYwNDc5',
      //   quota_info: { 
      //     shared: 1100727791, 
      //     quota: 2415919104, 
      //     normal: 226168599
      //   }
      // }
    })

### mkdir(path, options, callback)

Creates directory at specified location.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      locale:            : "en",               // optional
      root:              : "sandbox"           // optional
    }

    client.mkdir("foo", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   "size": "0 bytes",
      //   "rev": "1f477dd351f",
      //   "thumb_exists": false,
      //   "bytes": 0,
      //   "modified": "Wed, 10 Aug 2011 18:21:30 +0000",
      //   "path": "/foo",
      //   "is_dir": true,
      //   "icon": "folder",
      //   "root": "sandbox",
      //   "revision": 5023410
      // }
    })

### mv(from\_path, to\_path, options, callback)

Moves file or directory to a new location.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      locale:            : "en",               // optional
      root:              : "sandbox"           // optional
    }

    client.mv("foo", "bar", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   "size": "0 bytes",
      //   "rev": "irt77dd3728",
      //   "thumb_exists": false,
      //   "bytes": 0,
      //   "modified": "Wed, 10 Aug 2011 18:21:30 +0000",
      //   "path": "/bar",
      //   "is_dir": true,
      //   "icon": "folder",
      //   "root": "sandbox",
      //   "revision": 5023410
      // }
    })

### cp(from\_path, to\_path, options, callback)

Copies a file or directory to a new location.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      locale:            : "en",               // optional
      root:              : "sandbox"           // optional
    }

    client.cp("bar", "baz", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   "size": "0 bytes",
      //   "rev": "irt77dd3728",
      //   "thumb_exists": false,
      //   "bytes": 0,
      //   "modified": "Wed, 10 Aug 2011 18:21:30 +0000",
      //   "path": "/baz",
      //   "is_dir": true,
      //   "icon": "folder",
      //   "root": "sandbox",
      //   "revision": 5023410
      // }
    })

### rm(path, options, callback)

Removes a file or directory.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      locale:            : "en",               // optional
      root:              : "sandbox"           // optional
    }

    client.rm("README.txt", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //     "size": "0 bytes",
      //     "is_deleted": true,
      //     "bytes": 0,
      //     "thumb_exists": false,
      //     "rev": "1f33043551f",
      //     "modified": "Wed, 10 Aug 2011 18:21:30 +0000",
      //     "path": "/README.txt",
      //     "is_dir": false,
      //     "icon": "page_white_text",
      //     "root": "sandbox",
      //     "mime_type": "text/plain",
      //     "revision": 492341
      // }
    })

### put(path, data, options, callback)

Creates or modifies a file with given data.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      overwrite:         : true,               // optional
      parent_rev         : 8,                  // optional
      locale:            : "en"                // optional
    }

    client.put("foo/hello.txt", "here is some text", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   "size": "225.4KB",
      //   "rev": "35e97029684fe",
      //   "thumb_exists": false,
      //   "bytes": 230783,
      //   "modified": "Tue, 19 Jul 2011 21:55:38 +0000",
      //   "path": "/foo/hello.txt",
      //   "is_dir": false,
      //   "icon": "page_white_text",
      //   "root": "sandbox",
      //   "mime_type": "text/plain",
      //   "revision": 220823
      // }     
    })

### get(path, options, callback)

Pulls down file.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      rev:               : 31                  // optional
    }

    client.get("foo/hello.txt", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // here is some text
    })

### metadata(path, options, callback)

Retrieves file or directory  metadata.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      file_limit         : 10000,              // optional
      hash               : ...,                // optional
      list               : true,               // optional
      include_deleted    : false,              // optional
      rev                : 7,                  // optional
      locale:            : "en",               // optional
      root:              : "sandbox"           // optional
    }

    client.metadata("Getting_Started.pdf", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   "size": "225.4KB",
      //   "rev": "35e97029684fe",
      //   "thumb_exists": false,
      //   "bytes": 230783,
      //   "modified": "Tue, 19 Jul 2011 21:55:38 +0000",
      //   "path": "/Getting_Started.pdf",
      //   "is_dir": false,
      //   "icon": "page_white_acrobat",
      //   "root": "sandbox",
      //   "mime_type": "application/pdf",
      //   "revision": 220823
      // }
    })

### revisions(path, options, callback)

Obtains metadata for the previous revisions of a file.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      rev_limit          : 10,                 // optional
      locale:            : "en"                // optional
    }

    client.revisions("foo/hello.txt", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // [
      //   {
      //     "is_deleted": true,
      //     "revision": 4,
      //     "rev": "40000000d",
      //     "thumb_exists": false,
      //     "bytes": 0,
      //     "modified": "Wed, 20 Jul 2011 22:41:09 +0000",
      //     "path": "foo/hello.txt",
      //     "is_dir": false,
      //     "icon": "page_white",
      //     "root": "sandbox",
      //     "mime_type": "text/plain",
      //     "size": "0 bytes"
      //   },
      //   {
      //     "revision": 1,
      //     "rev": "10000000d",
      //     "thumb_exists": false,
      //     "bytes": 3,
      //     "modified": "Wed, 20 Jul 2011 22:40:43 +0000",
      //     "path": "foo/hello.txt",
      //     "is_dir": false,
      //     "icon": "page_white",
      //     "root": "sandbox",
      //     "mime_type": "text/plain",
      //     "size": "3 bytes"
      //   }
      // ]
    })

### restore(path, rev, options, callback)

Restores a file path to a previous revision.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      locale:            : "en"                // optional
    }

    client.revisions("foo/hello.txt", 4, options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   "is_deleted": true,
      //   "revision": 4,
      //   "rev": "40000000d",
      //   "thumb_exists": false,
      //   "bytes": 0,
      //   "modified": "Wed, 20 Jul 2011 22:41:09 +0000",
      //   "path": "/foo/hello.txt",
      //   "is_dir": false,
      //   "icon": "page_white",
      //   "root": "sandbox",
      //   "mime_type": "text/plain",
      //   "size": "0 bytes"
      // }
    })
    
### search(path, query, options, callback)

Returns metadata for all files and directories that match the search query.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      file_limit         : 10000,              // optional
      include_deleted    : false,              // optional
      locale:            : "en"                // optional
    }

    client.search("foo", "hello", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // [
      //   {
      //     "size": "0 bytes",
      //     "rev": "35c1f029684fe",
      //     "thumb_exists": false,
      //     "bytes": 0,
      //     "modified": "Mon, 18 Jul 2011 20:13:43 +0000",
      //     "path": "/foo/hello.txt",
      //     "is_dir": false,
      //     "icon": "page_white_text",
      //     "root": "sandbox",
      //     "mime_type": "text/plain",
      //     "revision": 220191
      //   }
      // ]
    })

### shares(path, options, callback)

Creates and/or returns a shareable link to a file or directory.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      locale:            : "en"                // optional
    }

    client.shares("foo/hello.txt", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   "url": "http://db.tt/APqhX1",
      //   "expires": "Sat, 17 Aug 2011 02:34:33 +0000"
      // }
    })

### media(path, options, callback)

Creates and/or returns a shareable link to a file or directory. This endpoint
is similar to /shares but content is streamable.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      locale:            : "en"                // optional
    }

    client.media("foo/hello.txt", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   "url": "http://www.dropbox.com/s/m/a2mbDa2",
      //   "expires": "Thu, 16 Sep 2011 01:01:25 +0000"
      // }
    })

### thumbnails(path, options, callback)

Gets a thumbnail for an image.

    var options = {
      oauth_token        : "jm0qrf7hohgwiko",  // required
      oauth_token_secret : "5n9687cyzp8xwii",  // required
      locale:            : "en"                // optional
    }

    client.thumbnails("foo/hello.txt", options, function(status, reply){
      console.log(status)
      // 200
      console.log(reply)
      // {
      //   "url": "http://www.dropbox.com/s/m/a2mbDa2",
      //   "expires": "Thu, 16 Sep 2011 01:01:25 +0000"
      // }
    })

## License

Copyright 2011 Brock Whitten
All rights reserved.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
