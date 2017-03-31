var express = require('express');
var app = express();
var Client = require('stash-rest-api').Client;

var auth = {
    "user": "username",
    "password": "password"
};

var stash = new Client(
    'http://localhost:7990/rest/api/1.0/',
    auth.user,
    auth.password
);

app.get('/getAllProjects', function(req, res) {
    console.log('getAllProjects');
    stash.projects.get().then(function(response) {
        res.send(response.data);
    }, function(err) {
        res.send({
            'errMsg': err
        });
    });
});

app.listen(3000);
