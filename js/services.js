angular.module('starter.services', [])

    .factory('Settings', ['$rootScope', function ($rootScope) {

        return {
            "keys": {
                "photoServerURL": "photosServerURL"
            },
            "photosSeverURL": function(newServer) {
                var server = localStorage[this.keys.photoServerURL];
                if (newServer !== undefined && newServer !== server) {
                    //TODO(jwh) - is there a way to validate this server setting before setting it?
                    localStorage[this.keys.photoServerURL] = newServer;
                }
                if (!server) {
                    return this.photosSeverURL("https://murmuring-sierra-2207.herokuapp.com");
                } else {
                    return server;
                }
            },
            "allPhotos": function() {

            }
        }
    }]);
