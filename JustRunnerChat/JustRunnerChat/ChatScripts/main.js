/// <reference path="controller.js" />
/// <reference path="dataAccess.js" />
(function () {
    var serviceRoot = "http://roadrunnerchat.apphb.com/api/";
    
    var persister = Chat.persisters.get(serviceRoot);

    var controller = Chat.controller.get(persister);
    controller.loadUI("#body");
    
}());