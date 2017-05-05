var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var async = require('async');
var app = express();
var jsonParser = bodyParser.json();

app.get('/', function (req, res) {
	res.send('Homework 5 online');
});

app.post('/', function (req, res) {
	res.status(403).send('Not Implemented');	
});

app.put('/', function (req, res){
	res.status(403).send('Not Implemented');	
});

app.delete('/', function (req, res) {
	res.status(403).send('Not Implemented');	
});

app.get('/movies', function (req, res) {

	request({
		
		url: 'https://apibaas-trial.apigee.net/clockworklegacy/sandbox/movies',
		method: 'GET',
		json: true 
		},
		function(error, response, body){
			if(error) 
			{
				console.log(error);
    		} 
			else{
					if(body.error)
					{
						res.status(400).json(body)
					}
					else{
						for (var x = 0 ; x < body.entities.length ; x++){
						delete body.entities[x].uuid;
						delete body.entities[x].type;
						delete body.entities[x].metadata;
						delete body.entities[x].created;
						delete body.entities[x].modified;
						}
					}	
	
				var newBody = {};
				newBody.status = "200";
				newBody.description = "Successful GET Request";
				newBody.movies = body.entities;
				res.json(newBody);
		}
			
		});
	
});

app.put('/movies', function (req, res) {
	res.status(403).send('Not Implemented');	
});
app.post('/movies', jsonParser, function (req, res) {
	if (req.body.name == undefined || req.body.releasedate == undefined || req.body.actor  == undefined)
	{
		res.status(400).send("To add a movie: enter a movie title, release date, and actors");
	} 
	else 
	{
		request({
		
		url: 'https://apibaas-trial.apigee.net/clockworklegacy/sandbox/movies',
		method: 'POST',
		json: true,
		body: {
				"name" : req.body.name,
				"releasedate" : req.body.releasedate,
				"actor": req.body.actor
			  }
		},
		function(error, response, body){
			if(error) 
			{
				console.log(error);
    		} 
			else{
					if(body.error){
						res.status(400).json("Movie already exists")
					}
					else{
						var newBody = {};
			        	newBody.status = "200";
			        	newBody.description = "Successful POST Request";
	    	    		newBody.name = body.entities[0].name;
	        			newBody.releasedate = body.entities[0].releasedate;
	        			newBody.actor = body.entities[0].actor;
	        			res.json(newBody);
					}
				}	

			
		});
		
	}
	
});

app.post('/reviews', jsonParser, function (req, res) {
	if (req.body.movie == undefined || req.body.reviewer == undefined || req.body.score  == undefined)
	{
		res.status(400).send("To add a review: enter a movie title, reviewer, and a score");
	} 
	else 
	{
		request({
		
		url: 'https://apibaas-trial.apigee.net/clockworklegacy/sandbox/reviews',
		method: 'POST',
		json: true,
		body: {
				"movie" : req.body.movie,
				"reviewer" : req.body.reviewer,
				"score": req.body.score
			  }
		},
		function(error, response, body){
			if(error) 
			{
				console.log(error);
    		} 
			else{
					if(body.error){
						res.status(400).json("Review already exists")
					}
					else{
						var newBody = {};
			        	newBody.status = "200";
			        	newBody.description = "Successful POST Request";
	    	    		newBody.movie = body.entities[0].movie;
	        			newBody.reviewer = body.entities[0].reviewer;
	        			newBody.score = body.entities[0].score;
	        			res.json(newBody);
					}
				}	

			
		});
		
	}
	
});

app.delete('/movies', function (req, res) {
	res.status(403).send('HTTP Method not supported.');	
});

/*
/
/ /movie paths with a title passed in!
/
*/

app.get('/movies/:name', function (req, res) {
	var rqst = 'https://apibaas-trial.apigee.net/clockworklegacy/sandbox/movies/' + req.params.name;
    var rqst2 = "https://apibaas-trial.apigee.net/clockworklegacy/sandbox/reviews?ql=movie='" + req.params.name + "'";
    var get_review = req.query.reviews;
  
  
    if(get_review === 'true'){

        async.parallel
        ([
            function getMovie(callback)
            {

                var responseBody = {};
                request({
                    url: rqst,
                    method: 'GET',
                    json: true
                }, function(error, response, body){
                    if(error) {
                        console.log(error);
                    } else {
                        if(body.error){
                            callback({"status" : "400", "description" : "Movie does not exist"}, responseBody);
                            return false;
                        }else{


                            responseBody.status = "200";
                            responseBody.description = "GET successful!";
                            responseBody.name = body.entities[0].name;
                            responseBody.releasedate = body.entities[0].releasedate;
                            responseBody.actor = body.entities[0].actor;

                            callback(null, responseBody);
                        }
                    }
                });


            },
            function getReview(callback) {

                var responseBody = {};
                responseBody.revs = [];
                request({
                    url: rqst2,
                    method: 'GET',
                    json: true
                }, function(error, response, body){
                    if(error) {
                        console.log(error);
                    } else {
                        if(body.error){
                            callback({"status" : "400", "description" : "Movie does not exist"}, responseBody);
                        }else{

                            for (var i = 0 ; i < body.entities.length ; i++){
								responseBody.revs[i] = {
								"reviewer" : body.entities[i].reviewer,
								"score" : body.entities[i].score
								};
                            }
                            callback(null, responseBody);
                        }
                    }
                });


            } 
        ], function(err, result) {
            console.log(result);
            res.send({movie:result[0], review:result[1]});
        })
    }
    else{
        request({
            url: rqst,
            method: 'GET',
            json: true
        }, function(error, response, body){
            if(error) {
                console.log(error);
            } else {
                if(body.error){
                    res.status(400).json({"status" : "400", "description" : "Movie does not exist"});
                }else{
                    var responseBody = {};

                    responseBody.status = "200";
                    responseBody.description = "GET succesful.";
                    responseBody.name = body.entities[0].name;
                    responseBody.releasedate = body.entities[0].releasedate;
                    responseBody.actor = body.entities[0].actor;


                    res.json(responseBody);
                }
            }
        });
    }


});
app.put('/movies/:name', jsonParser, function (req, res) {
request({
		
		url: 'https://apibaas-trial.apigee.net/clockworklegacy/sandbox/movies/' + req.params.name,
		method: 'PUT',
		json: true,
		body: {
				"name" : req.body.name,
				"releasedate" : req.body.releasedate,
				"actor": req.body.actor
			  }
		},
		function(error, response, body){
			if(error) 
			{
				console.log(error);
    		} 
			else{
					if(body.error)
					{
						res.status(400).json("Movie already exists")
					}
					else{
							res.json("PUT successful");
						}
				}	
			
		});
});
app.post('/movies/:name', function (req, res) {
	res.status(403).send('HTTP Method not supported.');	
});
app.delete('/movies/:name', function (req, res) {
	request({
		
		url: 'https://apibaas-trial.apigee.net/clockworklegacy/sandbox/movies/' + req.params.name,
		method: 'DELETE',
		json: true 
		},
		function(error, response, body){
			if(error) 
			{
				console.log(error);
    		} 
			else{
					if(body.error)
					{
						res.status(400).json("Movie does not exist");
					}
					else{
						var newBody = {};
						newBody.status = "200";
						newBody.description = "DELETE successful!";
						newBody.name = body.entities[0].name;
						newBody.releasedate = body.entities[0].releasedate;
						newBody.actor = body.entities[0].actor;
						res.json(newBody);
						}
				}	
			
		});
	
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});