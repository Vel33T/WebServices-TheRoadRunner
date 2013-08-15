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
            this.getChannels();
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

            var count = 0;
            wrapper.on("click", "#add_tab", function () {
                var addButton = $(".ui-dialog-buttonset").children().first();
                addButton.attr("id", "addButton");
                count++;
                if (count == 1) {
                    wrapper.on("click", "#addButton", function (parameters) {
                        var name = $("#tab_title").val();
                        var pass = $("#tab_content").val();
                        self.persister.channels.create(name, pass).then(function (data) {
                            this.addTab(name);
                            this.loadChatBox();
                        });

                        return false;
                    });
                }

                return false;
            });

            wrapper.on("click", "#update-area li a", function(parameters) {
                var name = $(this).text();
                self.persister.channels.join(name, "")
                    .then(function(data) {
                        self.addTab(name);
                        this.loadChatBox();
                    });

            });

            wrapper.on("click", "#tabs li a", function(ev) {
                var channelName = $(this).text();

                self.persister.channels.getUsers(channelName)
                    .then(function (data) {
                        var users = "";
                        for (var i = 0; i < data.length; i++) {
                            users += '<li>'+ data[i].nickname +'</li>';
                        }
                        $("#list-of-people").html(users);
                    });
            });

            wrapper.on("click", "#chat-button", function() {
                var message = $("#chat-input").val();
                var boxes = $("#tabs ul li");
                var channelName;
                for (var i = 0; i < boxes.length; i++) {
                    if (boxes[i].getAttribute("aria-selected") == "true") {
                        channelName = boxes[i].children[0].innerHTML;
                    }
                }
                self.persister.channels.sendMessage(channelName, message)
                    .then(function(data) {
                        self.loadChatBox();
                    });
                return false;
            });
        },
        
        addTab: function (clicked) {
            var tabTitle = $("#tab_title"),
                    tabContent = $("#tab_content"),
                    tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>",
                    tabCounter = 2;
            var tabs = $("#tabs").tabs();

            var label = clicked || "Tab " + tabCounter,
            id = "tabs-" + tabCounter,
            li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g, label)),
            tabContentHtml = tabContent.val() || "Tab " + tabCounter + " content.";

            tabs.find(".ui-tabs-nav").append(li);
            tabs.append("<div id='" + id + "'></div>");
            //$("#update-area ul").append("<li><a href='#'>" + tabTitle.val() + "</a></li>");
            tabs.tabs("refresh");
            tabCounter++;

            return false;
        },

        getChannels: function () {
            var self = this;
            setInterval(function () {
                self.persister.channels.getAll()
                    .then(function (data) {
                        var channelsHtml = "";
                        for (var i = 0; i < data.length; i++) {
                            channelsHtml += '<li><a href"#">' + data[i].name + '</a></li>';
                        }
                        $("#update-area").html(channelsHtml);
                    });
            }, 1000);
        },
        
        loadChatBox: function () {
            var pubnub = PUBNUB.init({
                publish_key: 'pub-c-ddf12ac6-a70e-4372-86d8-64318d45d6dc',
                subscribe_key: 'sub-c-e07ea95a-0445-11e3-b42d-02ee2ddab7fe',
            });
            //var str = "<div id=pubnub pub-key=pub-c-ddf12ac6-a70e-4372-86d8-64318d45d6dc sub-key=sub-c-e07ea95a-0445-11e3-b42d-02ee2ddab7fe></div>";
            $("#tabs-1").append("<div id='box' />");
            setInterval(1000);
            //alert("aaaaaaaaaa");
            var box = pubnub.$('box');
            var input = pubnub.$('input');
            var channel = 'chat';

            // HANDLE TEXT MESSAGE
            function chat_receive(text) {
                box.innerHTML = (''+text).replace( /[<>]/g, '' ) +
                    '<br>' + box.innerHTML;
            }

            // OPEN SOCKET TO RECEIVE TEXT MESSAGE
            pubnub.subscribe({
                channel : channel,
                message : chat_receive
            });

            // SEND TEXT MESSAGE
            pubnub.bind('keyup', input, function (e) {
                (e.keyCode || e.charCode) === 13 && pubnub.publish({
                    channel : channel,
                    message : input.value,
                    x       : (input.value='')
                });
            });

            return false;
        },
    });

    return {
        get: function(dataPersister) {
            return new Access(dataPersister);
        }
    };
}());