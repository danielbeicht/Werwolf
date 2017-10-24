var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var shuffle = require('knuth-shuffle').knuthShuffle;

var matches = {};

var requestcount = 0;


// Array
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
// Array

app.use(bodyParser.json());
app.use('/assets', express.static(path.join(process.cwd(), '..', 'assets')));
app.use('/assets', function (req, res, next) {
    res.sendStatus(404);
});

app.use('/node_modules', express.static(path.join(process.cwd(), '..', 'node_modules')));


app.use('/app', express.static(path.join(process.cwd(), '..', 'app')));
app.use('/api', express.static(path.join(process.cwd(), '..', 'api')));
/*app.use('/api', function (req, res, next) {
    res.sendStatus(404);
});*/

app.get('/api/getRequestCount', function (req, res){
  res.send(JSON.stringify(requestcount));
});

app.get('/api/createNewMatch', function (req, res){

  var matchID;
  do {
    matchID = Math.floor(Math.random() * 1000) + 1;
  } while (matches[matchID])

  matches[matchID] = {
    players: [],
    matchStarted: false,
    matchID: matchID,
    votingPhase: false,
      dayPhase: false,
    showPoll: false,
    pollCountdown : 0,
      dayCountdown: 0,
    thiefStatus : 0,
    thiefCards : [],
    restartMatch: false
  }
  res.send({matchID: matchID});
});

app.post('/api/joinMatch', function (req, res){
  if (matches[req.body.matchID]){
    if (matches[req.body.matchID].matchStarted == false){
      matches[req.body.matchID].players.push({playerName: req.body.playerName, playerID: matches[req.body.matchID].players.length, role: -1, alive: true, nominated: false, votes: [], hasVoted: false, mayor: false, lover: false});
      res.send({match: matches[req.body.matchID], statuscode: 1, playerID: matches[req.body.matchID].players.length-1, playerName: matches[req.body.matchID].players[matches[req.body.matchID].players.length-1].playerName});
    } else {
      res.send({statuscode: 3})
    }
  } else {
      res.send({statuscode: 2})
  }
});

app.post('/api/killPlayer', function (req, res){
  matches[req.body.matchID].players[req.body.playerID].alive = false;
  // Kill lover
  if (matches[req.body.matchID].players[req.body.playerID].lover){
    for (var i=0; i<matches[req.body.matchID].players.length; i++){
      if (matches[req.body.matchID].players[i].lover) {
        matches[req.body.matchID].players[i].alive = false;
      }
    }
  }
  res.send("ok");
});

app.post('/api/revivePlayer', function (req, res){
  matches[req.body.matchID].players[req.body.playerID].alive = true;
  res.send("ok");
});

app.post('/api/nominatePlayer', function (req, res){
  matches[req.body.matchID].players[req.body.playerID].nominated = true;
  res.send("ok");
});

app.post('/api/undoNominatePlayer', function (req, res){
  matches[req.body.matchID].players[req.body.playerID].nominated = false;
  res.send("ok");
});

app.post('/api/promoteMayor', function (req, res){
  for (var i=0; i<matches[req.body.matchID].players.length; i++){
    matches[req.body.matchID].players[i].mayor = false;
  }
  matches[req.body.matchID].players[req.body.playerID].mayor = true;
  res.send("ok");
});

app.post('/api/swapLoverStatus', function (req, res){
  matches[req.body.matchID].players[req.body.playerID].lover = !matches[req.body.matchID].players[req.body.playerID].lover;
  res.send("ok");
});

app.post('/api/getMatchInfo', function (req, res){
  requestcount++;
  console.log(new Date().toISOString().concat(": Request for " + req.body.matchID));
  res.send(matches[req.body.matchID]);
});

app.post('/api/startVotingPhase', function (req, res){
  for (var i=0; i<matches[req.body.matchID].players.length; i++){
    matches[req.body.matchID].players[i].votes = [];         // reset last votes
    matches[req.body.matchID].players[i].hasVoted = false;
  }
  matches[req.body.matchID].votingPhase = true;
  res.send("ok");
});

app.post('/api/stopVotingPhase', function (req, res){
  matches[req.body.matchID].pollCountdown = 10;
  var timeleft = 10;
  var downloadTimer = setInterval(function(){
    --timeleft;
    matches[req.body.matchID].pollCountdown = timeleft;
    if(timeleft <= 0){
      // Wenn jemand nicht gevotet hat stimmt er für sich
      for (var i=0; i<matches[req.body.matchID].players.length; i++){
        if (!matches[req.body.matchID].players[i].hasVoted && matches[req.body.matchID].players[i].alive) {
          matches[req.body.matchID].players[i].votes.push(i);
        }
      }
      matches[req.body.matchID].votingPhase = false;
      matches[req.body.matchID].showPoll = true;
      for (var i=0; i<matches[req.body.matchID].players.length; i++){
        matches[req.body.matchID].players[i].hasVoted = false;
      }
      clearInterval(downloadTimer);
    }
  },1000);


  res.send("ok");
});

app.post('/api/startDayPhase', function (req, res){
    matches[req.body.matchID].dayPhase = true;
    var timeleft = req.body.dayTime * 60;
    var downloadTimer = setInterval(function() {
        --timeleft;
        matches[req.body.matchID].dayCountdown = timeleft;
        console.log(timeleft);
        if (timeleft <= 0) {
            clearInterval(downloadTimer);
            matches[req.body.matchID].dayPhase = false;
        }
    },1000);
    res.send("ok");
});

app.post('/api/votePlayer', function (req, res){
  matches[req.body.matchID].players[req.body.votePlayerID].votes.push(req.body.playerID);
  matches[req.body.matchID].players[req.body.playerID].hasVoted = true;
  res.send("ok");
});

app.post('/api/resetVoting', function (req, res){
  matches[req.body.matchID].showPoll = false;
  for (var i=0; i<matches[req.body.matchID].players.length; i++){
    matches[req.body.matchID].players[i].nominated = false;
    matches[req.body.matchID].players[i].votes = [];
  }
  res.send(matches[req.body.matchID]);
});

app.post('/api/handoutThiefCards', function (req, res){
  matches[req.body.matchID].thiefStatus = 1;
  res.send("ok");
});

app.post('/api/setNewThiefRole', function (req, res){
  matches[req.body.matchID].players[req.body.playerID].role = req.body.roleID;
  matches[req.body.matchID].thiefStatus = 2;
  res.send("ok");
});

app.post('/api/assignRoles', function (req, res) {
  /*
  0 - werewolf
  1 - villager
  2 - witch
  3 - seer
  4 - armor
  5 - hunter
  6 - thief
  7 - child
   */
  var roles = req.body.roles;
  roles = shuffle(roles);
  matches[req.body.matchID].thiefCards = [];
  for (var i=0; i<matches[req.body.matchID].players.length; i++){
    matches[req.body.matchID].players[i].role = roles[i];
  }
  for (var i=matches[req.body.matchID].players.length; i<roles.length; i++) {
    matches[req.body.matchID].thiefCards.push(roles[i]);
  }
  res.send("ok");
});

app.post('/api/kickPlayer', function (req, res){
  matches[req.body.matchID].players.remove(req.body.playerID);
  res.send("ok");
});

app.post('/api/startMatch', function (req, res) {
  matches[req.body.matchID].matchStarted = true;
  res.send("ok");
});

app.post('/api/newMatch', function (req, res) {
  console.log(req.body.matchID)
  matches[req.body.matchID].matchStarted = false;
  matches[req.body.matchID].votingPhase = false;
  matches[req.body.matchID].showPoll = false;
  matches[req.body.matchID].pollCountdown = false;
  matches[req.body.matchID].thiefStatus = false;
  matches[req.body.matchID].thiefCards = [];
  matches[req.body.matchID].restartMatch = true;

  for (var i=0; i<matches[req.body.matchID].players.length; i++){
    matches[req.body.matchID].players[i].role = -1;
    matches[req.body.matchID].players[i].alive = true;
    matches[req.body.matchID].players[i].nominated = false;
    matches[req.body.matchID].players[i].votes = [];
    matches[req.body.matchID].players[i].hasVoted = false;
    matches[req.body.matchID].players[i].mayor = false;
    matches[req.body.matchID].players[i].lover = false;
  }
  res.send("ok");
});

app.post('/api/resetRestartMatchVar', function (req, res) {
  matches[req.body.matchID].restartMatch = false;
  res.send("ok");
});


app.get('/*', function (req, res) {
    res.status(200).sendFile(path.join(process.cwd(), '..', 'index.html'));
});









var server = app.listen(82, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Server is running on Port", port);
});
