var history_api = typeof history.pushState !== 'undefined';
// history.pushState must be called out side of AngularJS Code
if (history_api) history.pushState(null, '', '#StayHere');

(function () {
    'use strict';

    angular
        .module('werwolf')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', '$http', '$timeout', '$location', '$anchorScroll', '$interval', '$rootScope', '$cookies'];

    function homeCtrl($scope, $http, $timeout, $location, $anchorScroll, $interval, $rootScope, $cookies) {
        $scope.match = {matchStarted: false};
        $scope.color = 99;
        $scope.matchID = -1;
        $scope.status = -1;
        $scope.playerID = -1;
        $scope.playerName = null;
        $scope.inputVoteRadioButton = -1;
        $scope.isGameMaster = false;
        $scope.additionalInformationTimer = 0;
        $scope.dayInputSlider = 9;

        $scope.slider = {
            value: 10,
            options: {
                floor: 0,
                ceil: 30,
                showTicks: 10
            }
        };

        function init() {
            $scope.rolesAssigned = false;
            $scope.match.matchStarted = false;
            $scope.hasVoted = false;
            $scope.selection = {voteRadioSelected: -1};
            $scope.showMoreRoles = false;
        }

        init();


        $scope.inputWerwolfes = [
            {id: '0', value: 1, label: '1 Werwolf'},
            {id: '1', value: 2, label: '2 Werwölfe'},
            {id: '2', value: 3, label: '3 Werwölfe'},
            {id: '3', value: 4, label: '4 Werwölfe'},
            {id: '4', value: 5, label: '5 Werwölfe'},
            {id: '5', value: 6, label: '6 Werwölfe'},
            {id: '6', value: 7, label: '7 Werwölfe'},
            {id: '7', value: 8, label: '8 Werwölfe'},
            {id: '8', value: 9, label: '9 Werwölfe'},
            {id: '9', value: 10, label: '10 Werwölfe'}
        ];

        $scope.inputDorfbewohner = [
            {id: '0', value: 1, label: '1 Dorfbewohner'},
            {id: '1', value: 2, label: '2 Dorfbewohner'},
            {id: '2', value: 3, label: '3 Dorfbewohner'},
            {id: '3', value: 4, label: '4 Dorfbewohner'},
            {id: '4', value: 5, label: '5 Dorfbewohner'},
            {id: '5', value: 6, label: '6 Dorfbewohner'},
            {id: '6', value: 7, label: '7 Dorfbewohner'},
            {id: '7', value: 8, label: '8 Dorfbewohner'},
            {id: '8', value: 9, label: '9 Dorfbewohner'},
            {id: '9', value: 10, label: '10 Dorfbewohner'}
        ];


        $scope.roles = [
            {
                id: 0,
                selected: false,
                name: "Werwolf",
                description: "Während der ersten Nacht lernen die Werwölfe die Identität der anderen Werwölfe kennen. In jeder folgenden Nacht müssen sich die Werwölfe gemeinsam auf ein Opfer einigen, das daraufhin getötet wird. Wenn sich die Werwölfe binnen einer Minute nicht auf ein Opfer einigen können, dürfen sie in dieser Nacht keinen Spieler töten. Die Werwölfe dürfen während der Nacht keinen anderen Werwolf als Opfer auswählen. Werwölfe versuchen während des Tages ihren wahren Charakter zu verheimlichen."
            },
            {
                id: 1,
                selected: false,
                name: "Dorfbewohner",
                description: "Der Dorfbewohner hat keine besonderen Fähigkeiten."
            },
            {
                id: 2,
                selected: false,
                name: "Hexe",
                description: "Die Hexe erwacht immer direkt nachdem die Werwölfe ihr Opfer ausgesucht haben. Sie hat im Verlauf des gesamten Spiels einen Gift- und einen Heiltrank. Der Spielleiter zeigt auf die Person, die von den Werwölfen als Mordopfer gewählt wurde und die Hexe kann diese mit ihrem Heiltrank heilen (auch sich selbst), so dass es am nächsten Morgen keinen Toten gibt. Sie kann aber auch den Gifttrank auf einen anderen Spieler anwenden; dann gibt es mehrere Tote."
            },
            {
                id: 3,
                selected: false,
                name: "Seherin",
                description: "Die Seherin erwacht, während alle anderen schlafen und darf sich eine Person aussuchen, deren Rolle ihr der Spielleiter offenbaren soll. Dabei sollte der Spielleiter möglichst unauffällig vorgehen, idealerweise wiederum durch Gesten, so dass die Schlafenden nicht hören und raten können, welche Person erwählt wurde. Da die Seherin zu jeder Runde die Rolle einer weiteren Person im Spiel kennt, kann sie großen Einfluss nehmen, muss aber ihr Wissen vorsichtig einsetzen."
            },
            {
                id: 4,
                selected: false,
                name: "Armor",
                description: "Amor erwacht nur einmal in der allerersten Nacht, um zwei Spieler seiner Wahl miteinander zu verkuppeln (eventuell auch sich selbst). Danach schläft er wieder ein. Anschließend berührt der Spielleiter die beiden Verliebten an der Schulter, sodass diese kurz erwachen können und wissen, wer der jeweilige Partner ist. Die Verliebten haben im Laufe des Spiels die Aufgabe, den Partner zu beschützen, denn wenn einer der beiden stirbt, macht es ihm der Partner trauernd nach; sie dürfen nie gegeneinander stimmen."
            },
            {
                id: 5,
                selected: false,
                name: "Jäger",
                description: "Scheidet der Jäger aus dem Spiel aus, feuert er in seinem letzten Atemzug noch einen Schuss ab, mit dem er einen Spieler seiner Wahl mit in den Tod reißt, d.h. er bestimmt einen Spieler, der mit ihm aus dem Spiel ausscheidet."
            },
            {
                id: 6,
                selected: false,
                name: "Dieb",
                description: "Der Dieb ist der erste, der im Spiel erwacht. Wird mit Dieb gespielt, werden zwei Karten mehr ausgeteilt. Der Dieb darf diese ansehen und seine Karte gegen eine der beiden übrig gebliebenen Karten austauschen. Er hat ab jetzt also eine neue Rolle. Möchte er nicht tauschen, ist er für den Rest des Spiels einfacher Dorfbewohner. (Bleiben am Ende zwei Werwölfe übrig, muss der Dieb seine Karte tauschen, da die Werwölfe sonst im Spiel keine realistische Chance hätten.)"
            },
            {
                id: 7,
                selected: false,
                name: "Mädchen",
                description: "Das kleine Mädchen darf nachts in der Werwolf-Phase heimlich blinzeln, um so die Werwölfe zu erkennen. Die Werwölfe ihrerseits hingegen achten natürlich darauf, das Mädchen dabei zu ertappen, es besteht also beim Blinzeln ein gewisses Risiko."
            },
            {
                id: 8,
                selected: false,
                name: "Heiler",
                description: "Der Heiler erwacht am Anfang jeder Nacht und bestimmt einen Spieler (auch sich selbst), den er vor den Werwölfen beschützen will. Selbst wenn der ausgewählte Spieler von den Werwölfen gebissen wird, stirbt er nicht. Es ist nicht erlaubt, zwei Runden hintereinander denselben Charakter zu schützen, da dieser sonst unsterblich wäre."
            },
            {
                id: 9,
                selected: false,
                name: "Dirne",
                description: "Die Dirne ist eine normale Bürgerin, welche jedoch Angst davor hat, alleine zuhause zu sein. Aus diesem Grund nennt die Dirne jede Nacht einen Mitspieler, bei welchem sie übernachten möchte. Die Dirne kann in der Nacht nicht von Werwölfen oder sonstigem getötet werden, da diese ein leeres Bett auffinden. Die Dirne stirbt, wenn der Spieler von Werwölfen oder sonstigen tötenden Drittparteien getötet wird, bei welchem sie übernachtet. Die Dirne kann nicht zwei mal hintereinander bei der gleichen Person übernachten."
            },
            {
                id: 10,
                selected: false,
                name: "Sündenbock",
                description: "Immer wenn es im Dorf zu einer Pattsituation während der Abstimmung kommt, trifft es sofort den Sündenbock. Allerdings bleibt ihm ein Vorrecht: Er darf entscheiden, wer am nächsten Tag abstimmen darf."
            },
            {
                id: 11,
                selected: false,
                name: "Dorfdepp",
                description: "Wird der Dorfdepp vom Dorfgericht als Opfer auserkoren, erkennen sie im letzten Moment, dass es sich nur um den Dorfdepp handelt. Der Dorfdepp darf weiter leben, hat aber nun kein Abstimmungsrecht mehr."
            },
            {
                id: 12,
                selected: false,
                name: "Der Alte",
                description: "Der Alte überlebt den ersten Angriff der Werwölfe. Wird er aber vom Dorfgericht zum Opfer bestimmt, durch die Hexe oder den Jäger umgebracht, verliert das Dorf seine Weisheit und alle Sonderrollen werden zu einfachen Dorfbewohnern. Außerdem vergisst das Dorf, dass sie den Dorfdepp verschonen wollten."
            },
            {
                id: 13,
                selected: false,
                name: "Flötenspieler",
                description: "Der Flötenspieler ist eine eigene Partei und kann nur alleine das Spiel gewinnen, außer er ist verliebt. Er erwacht immer am Ende jeder Nacht und bestimmt zwei Spieler, die er mit seiner Musik verzaubert. Anschließend schläft er ein und alle verzauberten Spieler erwachen, erkennen sich und schlafen ebenfalls wieder ein. Der Flötenspieler gewinnt das Spiel alleine, wenn alle anderen Spieler verzaubert sind."
            },
            {
                id: 14,
                selected: false,
                name: "Die reine Seele",
                description: "Die reine Seele ist die einzig offen gespielte Identität, deren Rollekarte auf beiden Seiten das Bild eines normalen Dorfbewohner zeigt. Die Person mit dieser Rolle hat zwar dementsprechend keine Sonderfähigkeiten, verkörpert aber dafür einen eindeutig verifizierten Guten und ist damit eine sichere Option bei der Wahl des Hauptmannes oder Büttels."
            },
            {
                id: 15,
                selected: false,
                name: "Der Engel",
                description: "Wenn er in der Abstimmung der ersten Runde eliminiert wird (nicht von den Werwölfen), gewinnt er das Spiel allein."
            },
            {
                id: 16,
                selected: false,
                name: "Der Fuchs",
                description: "Wenn er in der Nacht aufgerufen wird, wählt er einen Spieler aus und erfährt vom Spielleiter, ob dieser oder einer seiner beiden Nachbarn ein Werwolf ist oder nicht. Ist bei dem Trio mindestens ein Werwolf dabei, darf er es in der nächsten Nacht ein weiteres Mal versuchen. Ist aber keiner der drei ein Werwolf, verliert er seine Fähigkeit."
            },
            {
                id: 17,
                selected: false,
                name: "Aura-Seherin",
                description: "Die Aura-Seherin sucht nach Spielern mit speziellen Fähigkeiten, die nicht nur einfache Dorfbewohner oder Werwölfe sind. Der Moderator sollte vor Spielbeginn festlegen, was spezielle Fähigkeiten sind. Beim nächtlichen Aufruf der Aura-Seherin deutet diese auf einen der Mitspieler und erhält von Moderator den „Daumen hoch“ für eine spezielle Fähigkeit und „Daumen runter“ für einen normalen Dorfbewohner. Je mehr spezielle Charaktere im Spiel sind, desto mächtiger ist diese Seherin. Stellen Sie sicher, dass wenigstens ein „böser“ spezieller Charakter am Spiel teilnimmt, so dass die Aura-Seherin nicht nur Dorfbewohner aufspürt."
            },
            {
                id: 18,
                selected: false,
                name: "Aussätzige",
                description: "Wenn die Werwölfe die Aussätzige töten, dürfen sie in der folgenden Nacht kein neues Opfer wählen, da sie vorübergehend selbst krank werden. Wenn das Spiel ohne Bekanntgabe der verstorbenen Charaktere gespielt wird, wählen die Werwölfe auch in der nächsten Nacht ein Opfer, das aber nicht stirbt. Wenn der Charakter aufgedeckt wird, wählen die Werwölfe kein Opfer aus."
            },
            {
                id: 19,
                selected: false,
                name: "Beschwörerin",
                description: "Jede Nacht darf die Beschwörerin einen Spieler auswählen, der am kommenden Tag schweigen muss. Die Beschwörerin kann sich selber auswählen. Der Schweigende bleibt in der Runde sitzen und kann auch als Opfer ausgewählt werden, wobei er dann natürlich keine Verteidigungsrede halten darf."
            },
            {
                id: 20,
                selected: false,
                name: "Geist",
                description: "Der Geist stirbt in der ersten Nacht. In jeder Nacht (inklusive der ersten) darf er einen Buchstaben auf ein Blatt Papier schreiben, den er als Nachricht aus dem Jenseits allen Spielern hinterlässt. Als Einschränkung darf er aber nicht versuchen, Spieler zu identifizieren, indem er deren Namen schreibt oder Initialen verwendet. Der Geist darf das Spiel nur von außerhalb des Kreises beobachten und andere Spieler weder ansprechen, noch mit ihnen Augenkontakt aufnehmen, noch in irgendeiner anderen Weise während des Tages mit dem Dorf in Verbindung treten. Dieser Charakter kann sehr viel Spaß machen, da das Dorf die Hinweise sehr unterschiedlich deuten kann und schon der erste Tag wesentlich engagierter mit Diskussionen als normal verbracht wird."
            },
            {
                id: 21,
                selected: false,
                name: "Harter Bursche",
                description: "Wenn der Harte Bursche von den Werwölfen ausgewählt wird, stirbt er erst in der folgenden Nacht und nicht bereits in derselben."
            },
            {
                id: 22,
                selected: false,
                name: "Leibwächter",
                description: "Der Leibwächter wählt jede Nacht einen Mitspieler, den er beschützt (aber niemals zweimal hintereinander denselben Spieler). Dieser Spieler kann nachts nicht getötet werden."
            },
            {
                id: 23,
                selected: false,
                name: "Lykanthrophin",
                description: "Die Lykanthrophin besitzt ein unterdrücktes Werwolf-Gen und sieht für die Seherin wie ein Werwolf aus, auch wenn sie dies natürlich nicht ist."
            },
            {
                id: 24,
                selected: false,
                name: "Unruhestifterin",
                description: "Einmal während des Spiels darf die Unruhestiftzerin in der Nacht dem Moderator anzeigen, dass es am nächsten Tag zwei Hinrichtungen geben wird. Jede Nacht sollte der Moderator die Unruhestifterin aufrufen."
            },
            {
                id: 25,
                selected: false,
                name: "Wolfsjunges",
                description: "Das Wolfsjunge gehört zu den Werwölfen und wacht in der Nacht zusammen mit diesen auf. Wenn das Wolfsjunge getötet wird, dürfen die Werwölfe in der kommenden Nacht zwei Opfer auswählen. Die Werwölfe dürfen sich zusammen mit dem Wolfsjungen darauf einigen, das Wolfsjunge zu opfern (alle Werwölfe und das Wolfsjunge müssen zustimmen). Als Ausgleich für dieses Opfer dürfen die Werwölfe in der gleichen Nacht sofort nach der Opferung des Wolfsjungen noch zwei weitere Dorfbewohner auswählen, die ebenfalls sterben."
            },
            {
                id: 26,
                selected: false,
                name: "Zaubermeisterin",
                description: "Die Zaubermeisterin sucht jede Nacht die Seherin (der Moderator zeigt ihr „Daumen hoch“, wenn sie auf die Seherin zeigt). Die Werwölfe wissen nicht, wer die Zaubermeisterin ist, und auch die Zaubermeisterin weiß nichts über die Werwölfe. Die Seherin sieht die Zaubermeisterin als Dorfbewohner."
            },
            {
                id: 27,
                selected: false,
                name: "Verfluchter",
                description: "Der Verfluchte beginnt das Spiel zuerst auf der Seite der Dorfbewohner (und wird von der Seherin vorerst als Dorfbewohner gesehen). Wenn der Verfluchte von den Werwölfen angegriffen wird, stirbt er nicht, sondern wird in der kommenden Nacht ebenfalls ein Werwolf (und wird von nun an von der Seherin als Werwolf gesehen). Der Moderator ruft in jeder Nacht den Verfluchten gesondert auf (auch nachdem er ein Werwolf geworden ist, so dass die anderen Spieler im Unklaren darüber bleiben, ob und wer bereits gewählt wurde) und zeigt ihm den „Daumen hoch“, wenn er noch Dorfbewohner ist. Sobald der Verfluchte ein Werwolf ist, öffnet er zusammen mit den anderen Werwölfen in der Nacht die Augen."
            },
            {
                id: 28,
                selected: false,
                name: "Gerber",
                description: "Der Gerber gewinnt nur, wenn er bis zum Spielende umgebracht wird. Die Siegbedingungen für die anderen Gruppen bestehen weiterhin."
            }
        ]

        $scope.inputWerewolfesCount = $scope.inputWerwolfes[1];
        $scope.inputDorfbewohnerCount = $scope.inputDorfbewohner[2];

        $scope.labels = [];

        $scope.data = [];


        // Check if already ingame
        if ($cookies.get('matchid') && $cookies.get('playername') && $cookies.get('playerid')) {
            $scope.matchID = $cookies.get('matchid');
            $scope.playerID = parseInt($cookies.get('playerid'));
            $scope.playerName = $cookies.get('playername');
            $scope.status = 2;
        }


        $scope.createNewMatch = function () {
            $http({
                method: 'GET',
                url: 'api/createNewMatch'
            }).then(function successCallback(response) {
                console.log(response)
                $scope.matchID = response.data.matchID;
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        }

        $scope.joinMatch = function () {
            if (!$scope.inputMatchID) {
                Materialize.toast("Bitte Spiel-ID eingeben.", 3000, 'blue');
            } else if (!$scope.inputPlayerName) {
                Materialize.toast("Bitte Spielername eingeben.", 3000, 'blue');
            } else {
                var dataObj = {
                    matchID: $scope.inputMatchID,
                    playerName: $scope.inputPlayerName
                };
                $http({
                    method: 'POST',
                    url: 'api/joinMatch',
                    data: dataObj
                }).then(function successCallback(response) {
                    if (response.data.statuscode == 1) {
                        $scope.matchID = response.data.match.matchID;
                        $scope.playerID = response.data.playerID;
                        $scope.playerName = response.data.playerName;
                        $scope.status = 2;
                    } else if (response.data.statuscode == 3) {
                        Materialize.toast("Spiel wurde bereits gestartet.", 3000, 'blue');
                    } else {
                        Materialize.toast("Spiel nicht gefunden.", 3000, 'blue');
                    }
                }, function errorCallback(response) {
                });
            }
        }

        $scope.killPlayer = function (playerID) {
            var dataObj = {
                matchID: $scope.matchID,
                playerID: playerID
            };
            $http({
                method: 'POST',
                url: 'api/killPlayer',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Player killed");
            }, function errorCallback(response) {
            });
        }

        $scope.revivePlayer = function (playerID) {
            var dataObj = {
                matchID: $scope.matchID,
                playerID: playerID
            };
            $http({
                method: 'POST',
                url: 'api/revivePlayer',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Player revived");
            }, function errorCallback(response) {
            });
        }

        $scope.nominatePlayer = function (playerID) {
            var dataObj = {
                matchID: $scope.matchID,
                playerID: playerID
            };
            $http({
                method: 'POST',
                url: 'api/nominatePlayer',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Player nominated");
            }, function errorCallback(response) {
            });
        }

        $scope.undoNominatePlayer = function (playerID) {
            var dataObj = {
                matchID: $scope.matchID,
                playerID: playerID
            };
            $http({
                method: 'POST',
                url: 'api/undoNominatePlayer',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Undo nomiation");
            }, function errorCallback(response) {
            });
        }

        $scope.startVotingPhase = function (playerID) {
            var dataObj = {
                matchID: $scope.matchID
            };
            $http({
                method: 'POST',
                url: 'api/startVotingPhase',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Voting phase started");
            }, function errorCallback(response) {
            });
        }

        $scope.stopVotingPhase = function (playerID) {
            var dataObj = {
                matchID: $scope.matchID
            };
            $http({
                method: 'POST',
                url: 'api/stopVotingPhase',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Voting phase started");
            }, function errorCallback(response) {
            });
        }

        $scope.startDayPhase = function (playerID) {
            console.log($scope.dayInputSlider)
            var dataObj = {
                matchID: $scope.matchID,
                dayTime: $scope.slider.value
            };
            $http({
                method: 'POST',
                url: 'api/startDayPhase',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Day phase started");
            }, function errorCallback(response) {
            });
        }

        $scope.assignRoles = function () {
            var roles = [];
            for (var i = 0; i < $scope.inputWerewolfesCount.value; i++) {
                roles.push(0);
            }
            for (var i = 0; i < $scope.inputDorfbewohnerCount.value; i++) {
                roles.push(1);
            }
            for (var i = 2; i < $scope.roles.length; i++) {
                if ($scope.roles[i].selected) {
                    roles.push(i);
                }
            }

            var dataObj = {
                matchID: $scope.match.matchID,
                roles: roles
            };
            $http({
                method: 'POST',
                url: 'api/assignRoles',
                data: dataObj
            }).then(function successCallback(response) {
                $scope.rolesAssigned = true;
            }, function errorCallback(response) {
            });
        }

        $scope.startMatch = function () {
            var dataObj = {
                matchID: $scope.match.matchID
            };
            $http({
                method: 'POST',
                url: 'api/startMatch',
                data: dataObj
            }).then(function successCallback(response) {
                if (response.data.statuscode == 1) {
                    //$scope.status = 3;
                }
            }, function errorCallback(response) {
            });
        }


        $scope.votePlayer = function () {
            var dataObj = {
                matchID: $scope.match.matchID,
                playerID: $scope.playerID,
                votePlayerID: $scope.selection.voteRadioSelected
            };
            $http({
                method: 'POST',
                url: 'api/votePlayer',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("VOTED")
                $scope.selection = {voteRadioSelected: -1};
                $scope.hasVoted = true;
            }, function errorCallback(response) {
            });
        }

        $scope.generateVoteString = function (player) {
            var genString = '';
            for (var i = 0; i < player.votes.length; i++) {
                genString = genString.concat($scope.match.players[player.votes[i]].playerName);
                if (i < player.votes.length - 1) {
                    genString = genString.concat(", ");
                }
            }
            return genString;
        }

        $scope.calculateCards = function () {
            var count = 0;
            count += $scope.inputWerewolfesCount.value;
            count += $scope.inputDorfbewohnerCount.value;
            if ($scope.inputHexe) {
                count += 1;
            }
            if ($scope.inputSeherin) {
                count += 1;
            }
            if ($scope.inputArmor) {
                count += 1;
            }
            if ($scope.inputHunter) {
                count += 1;
            }
            if ($scope.inputDieb) {
                count += 1;
            }
            if ($scope.inputKind) {
                count += 1;
            }
            return count;
        }

        $scope.resetVoting = function () {
            var dataObj = {
                matchID: $scope.match.matchID
            };
            $http({
                method: 'POST',
                url: 'api/resetVoting',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("VOTING RESETTED")
            }, function errorCallback(response) {
            });
        }

        $scope.promoteMayor = function (playerID) {
            var dataObj = {
                matchID: $scope.match.matchID,
                playerID: playerID
            };
            $http({
                method: 'POST',
                url: 'api/promoteMayor',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Mayor promoted")
            }, function errorCallback(response) {
            });
        }

        $scope.swapLoverStatus = function (playerID) {
            var dataObj = {
                matchID: $scope.match.matchID,
                playerID: playerID
            };
            $http({
                method: 'POST',
                url: 'api/swapLoverStatus',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Loverstatus swapped")
            }, function errorCallback(response) {
            });
        }

        $scope.toastMessage = function (message) {    // obsolete
            Materialize.toast(message, 3000, 'blue');
        }

        $scope.showAdditionalInformation = function () {
            $scope.additionalInformationTimer = 5;
            var downloadTimer = setInterval(function () {
                console.log($scope.additionalInformationTimer)
                $scope.additionalInformationTimer = --$scope.additionalInformationTimer;
                if ($scope.additionalInformationTimer <= 0) {
                    clearInterval(downloadTimer);
                }
            }, 1000);
        }

        $scope.thiefExists = function () {
            for (var i = 0; i < $scope.match.players.length; i++) {
                if ($scope.match.players[i].role == 6) {
                    return true;
                }
            }
            return false;
        }

        $scope.armorExists = function () {
            for (var i = 0; i < $scope.match.players.length; i++) {
                if ($scope.match.players[i].role === 4) {
                    return true;
                }
            }
            return false;
        }

        $scope.handoutThiefCards = function () {
            var dataObj = {
                matchID: $scope.match.matchID
            };
            $http({
                method: 'POST',
                url: 'api/handoutThiefCards',
                data: dataObj
            }).then(function successCallback(response) {
                console.log("Dieb wählt nun Karten")
            }, function errorCallback(response) {
            });
        }

        $scope.setNewThiefRole = function (roleID) {
            var dataObj = {
                matchID: $scope.match.matchID,
                playerID: $scope.playerID,
                roleID: roleID
            };
            $http({
                method: 'POST',
                url: 'api/setNewThiefRole',
                data: dataObj
            }).then(function successCallback(response) {
                Materialize.toast("Du bist nun ".concat($scope.roles[roleID].name), 2000, 'blue');
            }, function errorCallback(response) {
            });
        }

        $scope.newMatch = function () {
            var conf = confirm("Willst du wirklich ein neues Spiel starten?");
            if (conf) {
                init();
                var dataObj = {
                    matchID: $scope.match.matchID
                };
                $http({
                    method: 'POST',
                    url: 'api/newMatch',
                    data: dataObj
                }).then(function successCallback(response) {
                    console.log("Spiel wurde zurückgesetzt.")
                }, function errorCallback(response) {
                });
            }
        }

        $scope.kickPlayer = function (playerID) {
            var conf = confirm("Willst du wirklich den Spieler entfernen?");
            if (conf) {
                init();
                var dataObj = {
                    matchID: $scope.match.matchID,
                    playerID: playerID
                };
                $http({
                    method: 'POST',
                    url: 'api/kickPlayer',
                    data: dataObj
                }).then(function successCallback(response) {
                    console.log("Spiel wurde gekickt.");
                }, function errorCallback(response) {
                });
            }
        };

        $scope.leaveMatch = function () {
            if (confirm("Willst du das Spiel wirklich verlassen?")) {
                $cookies.remove("matchid", {path: "/"});
                $cookies.remove("playername", {path: "/"});
                $cookies.remove("playerid", {path: "/"});
                $scope.status = -1;
            }

        };

        $scope.$watch('matchID', function (newValue, oldValue) {
            if ($scope.matchID !== -1) {
                (function tick() {
                    var dataObj = {
                        matchID: $scope.matchID
                    };
                    $http({
                        method: 'POST',
                        url: 'api/getMatchInfo',
                        data: dataObj
                    }).then(function successCallback(response) {
                        //console.log(response.data)
                        $scope.match = response.data;
                    }, function errorCallback(response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                    })
                    $timeout(tick, 300);
                })();
            }
        });

        $scope.$watch('match.matchStarted', function (newValue, oldValue) {
            if ($scope.match.matchStarted) {
                $scope.status = 3;
            }
        });

        $scope.$watch('match.players.length', function (newValue, oldValue) {
            $scope.rolesAssigned = false;
        });
        //
        $scope.$watch('match.votingPhase', function (newValue, oldValue) {
            $scope.votingPlayerArray = $scope.match.players;
            if (newValue && !$scope.isGameMaster && $scope.match.players[$scope.playerID].alive) {
                Materialize.toast("Abstimmung ist jetzt möglich.", 5000, 'blue');
                $scope.hasVoted = false;
            }
            if (newValue === false || $scope.isGameMaster) {
                $scope.votingPlayerArray.sort(compare);
                console.log($scope.votingPlayerArray)
                $scope.labels = [];
                $scope.data = [];
                for (var i = 0; i < $scope.votingPlayerArray.length; i++) {
                    if ($scope.votingPlayerArray[i].alive) {
                        if ($scope.votingPlayerArray[i].nominated || $scope.votingPlayerArray[i].votes.length > 0) {
                            $scope.labels.push($scope.votingPlayerArray[i].playerName);
                            $scope.data.push($scope.votingPlayerArray[i].votes.length);
                        }
                    }
                }
                if ($scope.isGameMaster && oldValue === true) {
                    if ($scope.votingPlayerArray[0].votes.length !== $scope.votingPlayerArray[1].votes.length) {
                        $scope.killPlayer($scope.votingPlayerArray[0].playerID);
                    }
                }
            }
        });

        $scope.$watch('match.pollCountdown', function (newValue, oldValue) {

            //var temp = "Abstimmung endet in ";
            //$scope.toastText = temp.concat($scope.match.pollCountdown)
            //Materialize.toast($scope.toastText, 1000);
        });

        $scope.$watch('match.dayCountdown', function (newValue, oldValue){
            $scope.dayCountdownMinutes = Math.floor(newValue / 60);
            $scope.dayCountdownSeconds = newValue - $scope.dayCountdownMinutes * 60;
            if ($scope.dayCountdownSeconds < 10) {
                $scope.dayCountdownSeconds = "0".concat($scope.dayCountdownSeconds);
            }
        });

        $scope.$watch('status', function (newValue, oldValue) {
            if (newValue == 1 || newValue == 2) {
                $rootScope.bodylayout = 'wartehalle';
            } else {
                $rootScope.bodylayout = '';
            }
        });

        $scope.$watch('match.showPoll', function (newValue, oldValue) {
            if (!newValue) {
                $scope.votingPlayerArray = $scope.match.players;
                $scope.labels = [];
                $scope.data = [];
            }
        });

        $scope.$watch('match.thiefStatus', function (newValue, oldValue) {
            if (newValue === 2 && $scope.isGameMaster) {
                Materialize.toast("Der Dieb hat seine Karte ausgewählt.", 4000, 'blue');
            }
        });

        $scope.$watch('dayInputSlider', function (newValue, oldValue) {
            console.log(newValue);
        });

        $scope.$watchCollection('match.players', function (newCollection, oldCollection) {
            if (newCollection && oldCollection && newCollection.length === oldCollection.length) {
                for (var i = 0; i < newCollection.length; i++) {
                    if (newCollection[i].alive !== oldCollection[i].alive && !newCollection[i].alive) {
                        if (i === $scope.playerID) {
                            Materialize.toast("Du bist gestorben.", 4000, 'blue');
                        } else {
                            Materialize.toast(newCollection[i].playerName.concat(" ist gestorben."), 4000, 'blue');
                        }
                    }
                }
            }

            if (newCollection && oldCollection && newCollection.length < oldCollection.length && !$scope.isGameMaster) {
                console.log("Jemand ist raus");
                if (newCollection[$scope.playerID]) {
                    if (newCollection[$scope.playerID].playerName !== $scope.playerName) {
                        $scope.status = -1;
                        Materialize.toast("Du wurdest aus dem Spiel entfernt.", 4000, 'blue');
                    }
                } else {
                    $scope.status = -1;
                    Materialize.toast("Du wurdest aus dem Spiel entfernt.", 4000, 'blue');
                }


            }

        });

        $scope.$watch('match.restartMatch', function (newValue, oldValue) {
            if ($scope.match.restartMatch === true) {
                if ($scope.isGameMaster) {

                    // timer damit clients auch noch von dem var change erfahren
                    var timeleft = 10;
                    var downloadTimer = setInterval(function () {
                        --timeleft
                        console.log(timeleft)
                        if (timeleft <= 0) {
                            var dataObj = {
                                matchID: $scope.match.matchID
                            };
                            $http({
                                method: 'POST',
                                url: 'api/resetRestartMatchVar',
                                data: dataObj
                            }).then(function successCallback(response) {
                                console.log("ResetMatchVar wurde zurückgesetzt.")
                            }, function errorCallback(response) {
                            });
                            clearInterval(downloadTimer);
                        }
                    }, 1000);
                    $scope.status = 0;
                } else {
                    $scope.status = 2;
                }
            }
        });


        function compare(a, b) {
            if (a.votes.length > b.votes.length)
                return -1;
            if (a.votes.length < b.votes.length)
                return 1;
            return 0;
        }

        $scope.$on('$locationChangeStart', function (event, next, current) {
            // Here you can take the control and call your own functions:
            alert('Falsch geklickt? Der Zurück-Button wurde auf der Seite deaktiviert.');
            // Prevent the browser default action (Going back):
            event.preventDefault();
        });
    }
})();


