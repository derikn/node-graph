/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */
var https = require('https');
var _ = require('underscore')

/**
 * Generates a GET request the user endpoint
 * @param {string} accessToken the access token with which the request should be authenticated
 * @param {callback} callback
 */
function getUserData(accessToken, callback) {
  var options = {
    host: 'graph.microsoft.com',
    path: '/v1.0/me',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken
    }
  };

  https.get(options, function (response) {
    var body = '';
    response.on('data', function (d) {
      body += d;
    });
    response.on('end', function () {
      var error;
      if (response.statusCode === 200) {
        callback(null, JSON.parse(body));
      } else {
        error = new Error();
        error.code = response.statusCode;
        error.message = response.statusMessage;
        // The error body sometimes includes an empty space
        // before the first character, remove it or it causes an error.
        body = body.trim();
        error.innerError = JSON.parse(body).error;
        callback(error, null);
      }
    });
  }).on('error', function (e) {
    callback(e, null);
  });
}


function postAddPermissions(accessToken, driveItem, callback){
  var outHeaders = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + accessToken,

  }
}
/**
 * Generates a POST request to the SendMail endpoint
 * @param {string} accessToken the access token with which the request should be authenticated
 * @param {string} data the data which will be 'POST'ed
 * @param {callback} callback
 * Per issue #53 for BadRequest when message uses utf-8 characters: Set 'Content-Length': Buffer.byteLength(mailBody,'utf8')
 */
function postSendMail(accessToken, mailBody, callback) {
  var outHeaders = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + accessToken,
    'Content-Length': mailBody.length
  };
  var options = {
    host: 'graph.microsoft.com',
    path: '/v1.0/me/microsoft.graph.sendMail',
    method: 'POST',
    headers: outHeaders
  };

  // Set up the request
  var post = https.request(options, function (response) {
    var body = '';
    response.on('data', function (d) {
      body += d;
    });
    response.on('end', function () {
      var error;
      if (response.statusCode === 202) {
        callback(null);
      } else {
        error = new Error();
        error.code = response.statusCode;
        error.message = response.statusMessage;
        // The error body sometimes includes an empty space
        // before the first character, remove it or it causes an error.
        body = body.trim();
        error.innerError = JSON.parse(body).error;
        // Note: If you receive a 500 - Internal Server Error
        // while using a Microsoft account (outlok.com, hotmail.com or live.com),
        // it's possible that your account has not been migrated to support this flow.
        // Check the inner error object for code 'ErrorInternalServerTransientError'.
        // You can try using a newly created Microsoft account or contact support.
        callback(error);
      }
    });
  });

  // write the outbound data to it
  post.write(mailBody);
  // we're done!
  post.end();

  post.on('error', function (e) {
    callback(e);
  });
}

/** get all **/

function postPermission(accessToken, fileId, user, callback){
  var outHeaders = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + accessToken,
  };
  var options = {
    host: 'graph.microsoft.com',
    path: '/v1.0/me/microsoft.graph.sendMail',
    method: 'POST',
    headers: outHeaders
  };
}

/** get all the drive data **/

function getDriveData(accessToken, callback){
  var outHeaders = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + accessToken,
  };
  var options = {
    host: 'graph.microsoft.com',
    path: '/v1.0/users/derik.ng@gobaci.com/drive/root:/CTS:/children',
    method: 'GET',
    headers: outHeaders
  };

  var data = {};

  var req = https.get(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));

    var bodyChunks = [];
    res.on('data', function(chunk){
      bodyChunks.push(chunk);

    }).on('end', function() {
      var body = Buffer.concat(bodyChunks);
      data = JSON.parse(body.toString());
      //total object indexed by id
      data = (_.indexBy(data.value, 'id'));

      //throw data into a callback
      callback(data);
    });

  });
  req.on('error', function(e) {
    callback(e);
  });
}
exports.getUserData = getUserData;
exports.postSendMail = postSendMail;
exports.getDriveData = getDriveData;
