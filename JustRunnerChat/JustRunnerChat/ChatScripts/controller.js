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
        }
    });

    return {
        get: function(dataPersister) {
            return new Access(dataPersister);
        }
    };
}());