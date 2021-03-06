var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var shuffle = require('knuth-shuffle').knuthShuffle;
var _ = require('lodash');

var matches = {};
var playercount = 0;

var requestcount = 0;


// Array
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
// Array

app.use(bodyParser.json());
app.use(cookieParser());
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

app.get('/api/getRequestCount', function (req, res) {
    res.send(JSON.stringify(requestcount));
});

app.get('/api/createNewMatch', function (req, res) {
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
        pollCountdown: 0,
        dayCountdown: 0,
        thiefStatus: 0,
        thiefCards: [],
        restartMatch: false,
        possibleRoles: []
    };
    res.cookie("gamemaster" , "yes").cookie("matchid" , matchID).send({matchID: matchID});
});

app.post('/api/joinMatch', function (req, res) {
    if (matches[req.body.matchID]) {
        if (matches[req.body.matchID].matchStarted === false) {
            var playerID = playercount++;
            matches[req.body.matchID].players.push({
                playerName: req.body.playerName,
                playerID: playerID,
                role: -1,
                alive: true,
                nominated: false,
                votes: [],
                hasVoted: false,
                mayor: false,
                lover: false
            });
            res.cookie("matchid" , req.body.matchID.toString()).cookie("playername" , req.body.playerName).cookie("playerid" , playerID).send({
                match: matches[req.body.matchID],
                statuscode: 1,
                playerID: playerID,
                playerName: req.body.playerName
            });
        } else {
            res.send({statuscode: 3});
        }
    } else {
        res.send({statuscode: 2});
    }
});

app.post('/api/killPlayer', function (req, res) {
    var player = _.find(matches[req.body.matchID].players, function(o) {return o.playerID === req.body.playerID;});
    player.alive = false;

    // Kill lover
    if (player.lover) {
        for (var i = 0; i < matches[req.body.matchID].players.length; i++) {
            if (matches[req.body.matchID].players[i].lover) {
                matches[req.body.matchID].players[i].alive = false;
            }
        }
    }
    res.send("ok");
});

app.post('/api/revivePlayer', function (req, res) {
    var player = _.find(matches[req.body.matchID].players, function(o) {return o.playerID === req.body.playerID;});
    player.alive = true;
    res.send("ok");
});

app.post('/api/nominatePlayer', function (req, res) {
    var player = _.find(matches[req.body.matchID].players, function(o) {return o.playerID === req.body.playerID;});
    player.nominated = true;
    res.send("ok");
});

app.post('/api/undoNominatePlayer', function (req, res) {
    var player = _.find(matches[req.body.matchID].players, function(o) {return o.playerID === req.body.playerID;});
    player.nominated = false;
    res.send("ok");
});

app.post('/api/promoteMayor', function (req, res) {
    for (var i = 0; i < matches[req.body.matchID].players.length; i++) {
        matches[req.body.matchID].players[i].mayor = false;
    }
    var player = _.find(matches[req.body.matchID].players, function(o) {return o.playerID === req.body.playerID;});
    player.mayor = true;
    res.send("ok");
});

app.post('/api/swapLoverStatus', function (req, res) {
    var player = _.find(matches[req.body.matchID].players, function(o) {return o.playerID === req.body.playerID;});
    player.lover = !player.lover;
    res.send("ok");
});

app.post('/api/getMatchInfo', function (req, res) {
    requestcount++;
    res.send(matches[req.body.matchID]);
});

app.post('/api/startVotingPhase', function (req, res) {
    for (var i = 0; i < matches[req.body.matchID].players.length; i++) {
        matches[req.body.matchID].players[i].votes = [];         // reset last votes
        matches[req.body.matchID].players[i].hasVoted = false;
    }
    matches[req.body.matchID].votingPhase = true;
    res.send("ok");
});

app.post('/api/stopVotingPhase', function (req, res) {
    matches[req.body.matchID].pollCountdown = 10;
    var timeleft = 10;
    var downloadTimer = setInterval(function () {
        --timeleft;
        matches[req.body.matchID].pollCountdown = timeleft;
        if (timeleft <= 0) {
            // Wenn jemand nicht gevotet hat stimmt er für sich
            for (var i = 0; i < matches[req.body.matchID].players.length; i++) {
                if (!matches[req.body.matchID].players[i].hasVoted && matches[req.body.matchID].players[i].alive) {
                    matches[req.body.matchID].players[i].votes.push(matches[req.body.matchID].players[i].playerID);
                }
            }
            matches[req.body.matchID].votingPhase = false;
            matches[req.body.matchID].showPoll = true;
            for (var i = 0; i < matches[req.body.matchID].players.length; i++) {
                matches[req.body.matchID].players[i].hasVoted = false;
            }
            clearInterval(downloadTimer);
        }
    }, 1000);
    res.send("ok");
});

app.post('/api/startDayPhase', function (req, res) {
    matches[req.body.matchID].dayPhase = true;
    var timeleft = req.body.dayTime * 60;
    var downloadTimer = setInterval(function () {
        --timeleft;
        matches[req.body.matchID].dayCountdown = timeleft;
        console.log(timeleft);
        if (timeleft <= 0) {
            clearInterval(downloadTimer);
            matches[req.body.matchID].dayPhase = false;
        }
    }, 1000);
    res.send("ok");
});

app.post('/api/votePlayer', function (req, res) {
    var player = _.find(matches[req.body.matchID].players, function(o) {return o.playerID === req.body.playerID;});
    var votedPlayer = _.find(matches[req.body.matchID].players, function(o) {return o.playerID === req.body.votePlayerID;});
    if (!votedPlayer.votes.includes(player.playerID)) {
        votedPlayer.votes.push(player.playerID);
    }
    player.hasVoted = true;
    res.send("ok");
});

app.post('/api/resetVoting', function (req, res) {
    matches[req.body.matchID].showPoll = false;
    for (var i = 0; i < matches[req.body.matchID].players.length; i++) {
        matches[req.body.matchID].players[i].nominated = false;
        matches[req.body.matchID].players[i].votes = [];
    }
    res.send(matches[req.body.matchID]);
});

app.post('/api/handoutThiefCards', function (req, res) {
    matches[req.body.matchID].thiefStatus = 1;
    res.send("ok");
});

app.post('/api/setNewThiefRole', function (req, res) {
    var player = _.find(matches[req.body.matchID].players, function(o) {return o.playerID === req.body.playerID;});
    player.role = req.body.roleID;
    matches[req.body.matchID].thiefStatus = 2;
    res.send("ok");
});

app.post('/api/assignRoles', function (req, res) {
    var roles = req.body.roles;
    roles = shuffle(roles);
    matches[req.body.matchID].thiefCards = [];

    for (var i=0; i < roles.length; i++) {
        if (matches[req.body.matchID].possibleRoles.indexOf(roles[i]) < 0) {
            matches[req.body.matchID].possibleRoles.push(roles[i]);
        }
    }

    for (var i = 0; i < matches[req.body.matchID].players.length; i++) {
        matches[req.body.matchID].players[i].role = roles[i];
    }
    for (var i = matches[req.body.matchID].players.length; i < roles.length; i++) {
        matches[req.body.matchID].thiefCards.push(roles[i]);
    }
    res.send("ok");
});

app.post('/api/kickPlayer', function (req, res) {
    _.remove(matches[req.body.matchID].players, function(n) {return n.playerID === req.body.playerID;});
    res.send("ok");
});

app.post('/api/startMatch', function (req, res) {
    matches[req.body.matchID].matchStarted = true;
    res.send("ok");
});

app.post('/api/newMatch', function (req, res) {
    console.log(req.body.matchID);
    matches[req.body.matchID].matchStarted = false;
    matches[req.body.matchID].votingPhase = false;
    matches[req.body.matchID].showPoll = false;
    matches[req.body.matchID].pollCountdown = false;
    matches[req.body.matchID].thiefStatus = false;
    matches[req.body.matchID].thiefCards = [];
    matches[req.body.matchID].restartMatch = true;

    for (var i = 0; i < matches[req.body.matchID].players.length; i++) {
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
