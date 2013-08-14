/// <reference path="../PartialViews/table.html" />
/// <reference path="ui.js" />
/// <reference path="../Scripts/jquery-2.0.2.js" />
/// <reference path="dataAccess.js" />
/// <reference path="../Scripts/class.js" />

var Chat = Chat || {};

Chat.controller = (function () {
    var Access = Class.create({
        init: function (persister) {
            this.persister = persister;
        },

        loadUI: function (selector) {
            this.selector = selector;
            //this.loginSelector = "#login-wrapper";
            //$(selector).html('<div id="login-wrapper"></div>');

            if (this.persister.isLoggedIn()) {
                this.loadChat(selector);
            }

            this.atachUIHandlers("body");
        },

        loadLogin: function (selector) {
            $(selector).load("../PartialViews/login.html");
        },

        loadRegister: function (selector) {
            $(selector).load("../PartialViews/register.html");
        },
            
        loadChat: function (selector) {
            var nickname = this.persister.getNickname();
            $(selector).append('<div id=header></div>');

            $("#menu").prepend('<li><span>Hello, ' + nickname + '</span><a href="#" id="logout-button">Logout</a></li>');
            $("#go-register").parent().attr("style", "display:none");
            $("#go-login").parent().attr("style", "display:none");

        },

        loadButtons: function(selector) {
            $(selector).append('<div id="scores-wrapper"></div>');
            $(selector).append('<div id="create-game-wrapper"></div>');
            $(selector + " #scores-wrapper").load("../PartialViews/scores.html");
            $(selector + " #create-game-wrapper").load("../PartialViews/create-game.html");
        },

        loadScores: function (selector) {
            this.persister.user.scores().then(function (data) {
                var list = $('<ol></ul>');

                for (var i = 0; i < data.length; i++) {
                    list.append('<li>' + data[i].nickname + ": " + data[i].score + " points" + '</li>');
                }

                $("#scores-body").html(list);
            });
        },

        loadCreateGame: function (selector) {
            $(selector + " #create-game-wrapper").load("../PartialViews/create-game.html");
        },

        loadOpenGames: function (selector) {
            this.persister.game.open()
                .then(function (data) {
                    var html = '<h2>Open games</h2>';
                    html += '<table class="table">';
                    html += '<tr><th>Title</th><th>Creator</th><th>id</th></tr>';

                    for (var i = 0; i < data.length; i++) {
                        html += '<tr><td>' + data[i].title + '</td><td>' + data[i].creator + '</td><td>' + data[i].id + '</td></tr>';
                    }

                    html += '</table>';

                    $(selector).html(html);
                 });
        },

        loadActiveGames: function (selector) {
            this.persister.game.myActive()
                .then(function (data) {
                    var html = '<h2>Active games</h2>';
                    html += '<table class="table">';
                    html += '<tr><th>Title</th><th>Creator</th><th>id</th><th>status</th></tr>';

                    for (var i = 0; i < data.length; i++) {
                        html += '<tr><td>' + data[i].title + '</td><td>' + data[i].creator + '</td><td>' + data[i].id + '</td><td>' + data[i].status + '</td></tr>';
                    }
                   
                    html += '</table>';
                    $(selector).html(html);
                });
        },

        loadMessages: function (selector) {
            var self = this;
            setInterval(function () {
                self.persister.message.unread()
                    .then(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            $(selector).append(data[i]);
                        }
                    });
            }, 2000);
        },

        atachUIHandlers: function (selector) {
            var wrapper = $(selector);
            var self = this;

            wrapper.on("click", "#go-login", function () {
                self.loadLogin(self.selector);
            });

            wrapper.on("click", "#go-register", function () {
                self.loadRegister(self.selector);
            });

            wrapper.on("click", "#login-button", function () {
                var username = $(selector + " #login-username").val();
                var password = $(selector + " #login-password").val();

                self.persister.user.login(username, password)
                    .then(function (data) {
                        self.loadUI(self.selector);
                    }, function (err) {
                        $("#login-reg-errors").html(err.responseJSON.Message);
                    });

                return false;
            });

            wrapper.on("click", "#register-button", function () {
                var username = $(selector + " #reg-username").val();
                var nickname = $(selector + " #reg-nickname").val();
                var password = $(selector + " #reg-password").val();

                self.persister.user.register(username, nickname, password)
                    .then(function () {
                        console.log("Register success!");
                        self.loadUI(self.selector);
                    }, function (err) {
                        console.log(err);
                        $("#login-reg-errors").html(err.responseJSON.Message);
                    });
                return false;
            });

            wrapper.on("click", "#logout-button", function () {
                self.persister.user.logout()
                    .then(function () {
                        self.loadUI(self.selector);

                        $("#go-register").parent().attr("style", "display:none");
                        $("#go-login").parent().attr("style", "display:none");
                    });

                return false;
            });

            wrapper.on("click", "#show-scores", function () {
                self.loadScores("#scores-body");
            });

            wrapper.on("click", "#show-create-game", function () {
                self.loadCreateGame("#create-game-body");
            });

            wrapper.on("click", "#create-game-button", function () {
                var name = $("#create-game-name").val();
                var password = $("#create-game-password").val();
                self.persister.game.create({
                    name: name,
                    password: password || "",
                }).then(function () {
                    $("#messages").append("<p>You are create the game " + name + "</p>");
                }, function (err) {
                    $("#messages").append("<p>" + err.responseJSON.Message + ": " + name + "</p>")
                });
            })

            wrapper.on("click", "#open-games tr", function () {
                var id = $(this).children().last().text();
                var name = $(this).children().first().text();

                self.persister.game.join({ gameId: id, password: "" })
                    .then(function () {
                        $("#messages").append("<p>You are joined in game: " + name + "</p>");
                    }, function (err) {
                        $("#messages").append("<p>" + err.responseJSON.Message + ": " + name + "</p>")
                    });
            });

            wrapper.on("click", "#game-ui td", function () {
                if ($("#game-ui tr td").hasClass("selected") == false && ($(this).hasClass("red") || $(this).hasClass("blue"))) {

                    $("#game-ui tr td").removeClass("selected");
                    $(this).addClass("selected");
                }
                else if ($("#game-ui tr td").hasClass("selected") && (!$(this).hasClass("red") || !$(this).hasClass("blue"))) {
                    if (!$("#game-ui tr td").hasClass("moved-cell")) {
                        $(this).addClass("moved-cell");
                    }

                    if ($(".selected").hasClass("red")) {
                        $(".selected").removeClass("red");
                        $(".moved-cell").html($(".selected").html()).addClass("red");
                    }

                    if ($(".selected").hasClass("blue")) {
                        $(".selected").removeClass("blue");
                        $(".moved-cell").html($(".selected").html()).addClass("blue");
                    }

                    if ($(this).hasClass("moved-cell")) {
                        $(this).removeClass("moved-cell");
                    }
                    $(".selected").text("");

                    $(".selected").removeClass("selected");
                    $("#messages").append("<p>You are make move</p>");
                }

            })
        }
    });

    return {
        get: function(dataPersister) {
            return new Access(dataPersister);
        }
    };
}());