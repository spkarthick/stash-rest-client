var express = require('express');
var utils = require('lodash');
var app = express();

var Client = require('./lib/client');

var stashApi = new Client('https://git.rabobank.nl/rest/api/1.0/', 'sattanv', 'Fqo0BXCJ');

//get all projects for all repo
app.get('/getProjects', function(req, res){
	stashApi.projects.get().then(function(response){
		res.send(response.values);
	}, function(err){
		res.send(err);
	});
});

//get all repo
app.get('/getRepo/:projectId', function(req, res){
	console.log(req.params.projectId);
	stashApi.repos.get(req.params.projectId).then(function(response){
		res.send(response.values);
	}, function(err){
		res.send(err);
	});
});

//pull request
app.get('/getAllPullRequest/:project/:repo/:state', function(req, res){
	stashApi.prs.get(req.params.project, req.params.repo, {'state': req.params.state}).then(function(response){
		res.send(response);
	}, function(err){
		res.send(err);
	});
});


app.get('/getComments/:project/:repo/:id', function(req, res){
	stashApi.prs.getComments(req.params.project, req.params.repo, req.params.id).then(function(response){
		res.send(response);
	}, function(err){
		res.send(err);
	});
});

app.get('/getActivities/:project/:repo/:id/:action', function(req, res){
	stashApi.prs.getActivities(req.params.project, req.params.repo, req.params.id, {'action': req.params.action}).then(function(response){
		res.send(response);
	}, function(err){
		res.send(err);
	});
});

app.use('/', express.static('public'));

app.get('/getFormattedData/:project/:repo/:start/:end', function(req, res){
	var prs = stashApi.prs.get(req.params.project, req.params.repo, {'state': 'merged'}).then(function(response){
		//var uniqueAuthors = utils.uniq(response.values, function(e) {
		//	return e.author.user.name;
		//});
		var formattedData = [];
		var promises = [];
		response.values.filter(function(pull) {
			return pull.createdDate >= req.params.start && pull.createdDate <= req.params.end;
		}).forEach(function(pull, index) {
			var defer = new Promise(function(resolve, reject) {
				var obj = {
					'author': pull.author.user.name, 
					'title': pull.description
				};
				obj.reviewers = pull.reviewers.map(function(e) {
					return {
						'name': e.user.name
					}
				});
				stashApi.prs.getActivities(req.params.project, req.params.repo, pull.id, {'action': 'COMMENTED'}).then(function(response){
					obj.comments = response.values.map(function(e) {
						return {
							'comment': e.comment.text,
							'author': e.comment.author.name,
							'date': e.comment.updatedDate
						}
					});
					obj.files = response.values.map(function(e) {
						return e.commentAnchor?e.commentAnchor.path:undefined;
					}).filter(function (value, index, self) { 
						return value && (self.indexOf(value) === index);
					})
					stashApi.prs.getCommits(req.params.project, req.params.repo, pull.id).then(function(response){
						obj.commits = response.values;
						formattedData.push(obj);
						resolve();
					}, function(err){
						reject();
						res.send(err);
					});
				}, function(err){
					reject();
					res.send(err);
				});
			});
			promises.push(defer);
			
		}, this);
		Promise.all(promises).then(function() {
			require('fs').writeFile("./reports/" + req.params.project + "_" + req.params.repo + "_" + (new Date()).getTime() + ".json", JSON.stringify(formattedData));
			res.send(formattedData);
		});
		
	}, function(err){
		res.send(err);
	});
});



app.listen(3000);