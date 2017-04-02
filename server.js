var express = require('express');
var app = express();
var Client = require('./lib/client');
var stashHelper = require('./helper');
var utils = require('lodash');
var Promise = require('promise');


var stashApi = new Client('url', 'username', 'pwd');

/*
app.get('/getProjects', function(req, res){
	stashApi.projects.get().then(function(response){
		res.send(response);
	}, function(err){
		res.send(err);
	});
});

app.get('/getRepo', function(req, res){
	stashApi.repos.get('reponame').then(function(response){
		res.send(response);
	}, function(err){
		res.send(err);
	});
});

app.get('/getAllPullRequest', function(req, res){
	stashApi.prs.get('repo', 'repoSlug'.then(function(response){
		res.send(response);
	}, function(err){
		res.send(err);
	});
});

app.get('/getComments', function(req, res){
	stashApi.prs.getComments('repo', 'repoSlug', 1).then(function(response){
		res.send(response);
	}, function(err){
		res.send(err);
	});
});

app.get('/getActivities', function(req, res){
	console.log(JSON.stringify(stashHelper));
	stashHelper.testFn();
	stashApi.prs.getActivities('repo', 'repoSlug', 1).then(function(response){
		res.send(response);
	}, function(err){
		res.send(err);
	});
});
*/

/**
 * This method id used to fetch all comments on a repository
 * 
 * 	get list of pull request for repo
	iterate get the ids
	pass id and get activities
	iterate and filter action = commented
	consolidate
 */
app.get('/get-repo-comments', function(req, res){

	//TODO - get repo information from request instead of hardcoding

	//var repo = req.getParameter('repo');
	//var repoSlug = req.getParameter('repoSlug');

	stashApi.prs.get('repo', 'repoSlug').then(function(response){
		return stashHelper.getPullReqIds(response.values);
	}).then(function(pullreqIds){
		console.log('inside activity');
		var activityPromises = [];
		utils.forEach(pullreqIds, function(id){
			var pr = new Promise(function(resolve, reject) {
				stashApi.prs.getActivities('repo', 'repoSlug', id).then(function(response){
					resolve(response.values);
				}, function(err){
					console.log(err);
				});
			});
			activityPromises.push(pr);
		});

		Promise.all(activityPromises).then(function(allresp){
			var result = utils.reduceRight(allresp, function(flattened, other) {
  				return flattened.concat(other);
			}, []);
			res.send(stashHelper.filterActivities(result));
		});
	});
});

app.listen(3000);