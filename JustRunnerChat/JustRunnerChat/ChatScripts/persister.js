/// <reference path="requester.js" />
/// <reference path="../Scripts/jquery-2.0.2.js" />
/// <reference path="../Scripts/class.js" />
var Chat = Chat || {};

Chat.persisters = (function () {
    var nickname = localStorage.getItem("nickname");
    var sessionKey = localStorage.getItem("sessionKey");

    function saveUserData(data) {
        localStorage.setItem("sessionKey", data.sessionKey);
        localStorage.setItem("nickname", data.nickname);
        nickname = data.nickname;
        sessionKey = data.sessionKey;
    }

    function clearUserData() {
        localStorage.removeItem("sessionKey");
        localStorage.removeItem("nickname");
        nickname = "";
        sessionKey = "";
    }

    var Base = Class.create({
        init: function (rootUrl) {
            this.rootUrl = rootUrl;
            this.user = new Users(rootUrl);
        },

        isLoggedIn: function () {
            var hasSessionKey = localStorage.hasOwnProperty("sessionKey");
            var hasNickname = localStorage.hasOwnProperty("nickname");
            return (hasNickname && hasSessionKey) == true;
        },

        getNickname: function() {
            return nickname;
        }
    
    });

    var Users = Class.create({
        init: function (rootUrl) {
            this.serviceUrl = rootUrl + "user/";
        },

        register: function (username, nickname, password) {
            var url = this.serviceUrl + "register";
            var data = {
                username: username,
                nickname: nickname,
                authCode: CryptoJS.SHA1(username + password).toString()
            };

            return Requester.post(url, data)
                .then(function (data) {
                    saveUserData(data);
                });
        },

        login: function (username, password) {
            var url = this.serviceUrl + "login";
            var data = {
                username: username,
                authCode: CryptoJS.SHA1(username + password).toString()
            };

            return Requester.post(url, data)
                .then(function (data) {
                    console.log(data);
                    saveUserData(data);
                });
        },

        logout: function () {
            var url = this.serviceUrl + "logout/" + sessionKey;

            return Requester.get(url)
                .then(function (data) {
                    clearUserData();
                });
        }
    });

    return {
        get: function(url) {
            return new Base(url);
        },
    };
}());