/// <reference path="../PartialViews/table.html" />
/// <reference path="ui.js" />
/// <reference path="../Scripts/jquery-2.0.2.js" />
/// <reference path="dataAccess.js" />
/// <reference path="../Scripts/class.js" />
/// <reference path="persister.js" />

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
            $(selector).load("../PartialViews/chat.html");

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
                        self.loadChat(self.selector);
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
                        self.loadChat(self.selector);
                    }, function (err) {
                        console.log(err);
                        $("#login-reg-errors").html(err.responseJSON.Message);
                    });
                return false;
            });

            wrapper.on("click", "#logout-button", function () {
                self.persister.user.logout()
                    .then(function () {
                        self.loadLogin(self.selector);
                        $("#go-register").parent().removeAttr("style");
                        $("#go-login").parent().removeAttr("style");
                        $("#menu").children().first().remove();
                    });

                return false;
            });

            wrapper.on("click", "#create-channel", function () {
                var name = $("#channel-name").val();
                var pass = $("#channel-pass").val();
                self.persister.channels.create(name, pass);
                return false;
            });
            
            wrapper.on("click", "#add_tab", function () {
                var addButton = $(".ui-dialog-buttonset").children().first();
                addButton.attr("id", "addButton");
                wrapper.on("click", "#addButton", function(parameters) {
                    var name = $("#tab_title").val();
                    var pass = $("#tab_content").val();
                    var boxes =  $("#tabs ul li");
                    var box = "";
                    for (var i = 0; i < boxes.length; i++) {
                        if (boxes[i].getAttribute("aria-selected") == "true") {
                            box = boxes[i].getAttribute("aria-controls");
                        }   
                    }
                    self.persister.channels.create(name, pass)
                        .then(function (data) {
                            connectToPubNub(name, box);
                        }
                    );
                });

                return false;
            });
            
            wrapper.on("click", "#update-area li a", function (parameters) {
                var name = $(this).text();
                self.persister.channels.join(name, "")
                    .then(function(data) {
                        connectToPubNub(name);
                    });
                
            })
        },
        
        connectToPubNub: function(channelName, box) {
            $("#pubnub").attr("pub-key", "pub-c-52453842-4883-480d-87a9-787acde00194");
            $("#pubnub").attr("sub-key", "pub-c-52453842-4883-480d-87a9-787acde00194");
            
            
            var box = PUBNUB.$(box);
            var input = PUBNUB.$('chat-input');
            var channel = channelName;

            // HANDLE TEXT MESSAGE
            function chat_receive(text) {
                box.innerHTML = (''+text).replace( /[<>]/g, '' ) +
                    '<br>' + box.innerHTML;
            }

            // OPEN SOCKET TO RECEIVE TEXT MESSAGE
            PUBNUB.subscribe({
                channel : channel,
                message : chat_receive
            });

            this.sendMessage(input);
        },
        
        sendMessage: function(message) {

            var input = PUBNUB.$('chat-input');
            // SEND TEXT MESSAGE
            PUBNUB.bind('keyup', input, function (e) {
                (e.keyCode || e.charCode) === 13 && PUBNUB.publish({
                    channel: channel,
                    message: input.value,
                    x: (input.value = '')
                });
            });
        }
        
    });

    return {
        get: function(dataPersister) {
            return new Access(dataPersister);
        }
    };
}());