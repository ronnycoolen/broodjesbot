var http = require('http');
var https = require('https');
var querystring = require('querystring');
var config = require('./config.json');

var broodjes = false;

var checkBroodjes = function(html, callback) {
    if (html.match(/Ja/)) {
        if (broodjes == false) {
            broodjes = true;
            console.log('De broodjes zijn er!');
            return callback();
        } else {
            console.log('De broodjes zijn er, maar het bericht werd al verstuurd.');
        }
    } else {
        broodjes = false;
        console.log('Nog geen broodjes.');
    }
}

setInterval(function() {
    http.get("http://zijneralbroodjes.be/", function(res) {
        var response = "";
        res.on('data', function (chunk) {
            response += chunk;
        });
        res.on('end', function() {
            checkBroodjes(response, function() {
                params = {
                    token: config.slack.token,
                    channel: config.slack.channel,
                    text: "De broodjes zijn er!",
                     as_user: false,
                    username: "BroodjesBot"
                };

                post_data = querystring.stringify(params);
                options = {
                    hostname: 'slack.com',
                    method: 'POST',
                    path: '/api/chat.postMessage',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': post_data.length
                    }
                };

                req = https.request(options);

                req.on('response', function(res) {
                    var buffer = '';
                    res.on('data', function(chunk) {
                         return buffer += chunk;
                    });
                    return res.on('end', function() {
                        var value;
                        if (res.statusCode === 200) {
                            value = JSON.parse(buffer);
                            console.log(value);
                        } else {
                            console.log('error!');
                        }
                    });
                });
                req.on('error', function(error) {
                    console.log('error');
                });
                req.write(post_data);
                req.end();
            });
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    }); 
}, 30000)
