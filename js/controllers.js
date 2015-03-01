angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout, Settings) {
        // Form data for the login modal
        $scope.loginData = {};

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modal = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function () {
            $scope.modal.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
            console.log('Doing login', $scope.loginData);

            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function () {
                $scope.closeLogin();
            }, 1000);
        };

        $scope.displayMap = function () {
            var map = window.open(Settings.photosSeverURL(), "_blank", "location=yes");
        }
    })

    .controller('CameraCtrl', function ($scope, Settings) {
        // Used for local image css testing
        //$scope.photo =  {"image": "https://tse1.mm.bing.net/th?&id=HN.607986791989315150&w=300&h=300&c=0&pid=1.9&rs=0&p=0"};

        $scope.getGalleryPhoto = function () {
            $scope.capturePhoto(Camera.PictureSourceType.PHOTOLIBRARY);
        };

        $scope.getPhoto = function () {
            $scope.capturePhoto(Camera.PictureSourceType.CAMERA);
        };

        $scope.capturePhoto = function (pictureSourceType) {
            //TODO(jwh) - how to reuse the servers setting?
            $scope.photo = {
                "image": null,
                "tags": null,
                "geo": {
                    "latitude": null,
                    "longitude": null,
                    "exifdata": null
                }
            };

            console.log('Getting camera');
            if (!navigator.camera) {
                alert("Camera is not available");
            }

            navigator.camera.getPicture(function (imageURI) {
                $scope.$apply(function () {
                    $scope.photo.image = imageURI;
                });

                window.resolveLocalFileSystemURL(imageURI,
                    function(entry) {
                        entry.file(function(file){
                            EXIF.getData(file, function () {
                                //alert(JSON.stringify(this.exifdata));
                                if (this.exifdata) {
                                    var exifdata = this.exifdata;
                                    $scope.$apply(function() {
                                        var location = [];
                                        if (exifdata.GPSLatitude) {
                                            location = convertGPSData(exifdata);
                                        }

                                        $scope.photo.geo.exifdata = exifdata;
                                        if (location.length = 2) {
                                            $scope.photo.geo.latitude = location[0];
                                            $scope.photo.geo.longitude = location[1];
                                        }
                                    });
                                }
                            });
                        })
                    }
                );
            }, function (err) {
                console.err(err);
            }, {
                quality: 50,
                //saveToPhotoAlbum: true,
                allowEdit: false, //Note: setting to true removes the exif data
                targetWidth: 640,
                targetHeight: 480,
                correctOrientation: true,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: pictureSourceType,
                encodingType: Camera.EncodingType.JPEG
            });
        };



        $scope.uploadPhoto = function (obj) {
            if (!$scope.photo.image) {
                // error handling no picture given
                return;
            }
            var options = new FileUploadOptions();
            options.fileKey = "fileUpload";
            options.fileName = $scope.photo.image.substr($scope.photo.image.lastIndexOf('/') + 1);

            options.mimeType = "image/jpeg";
            var params = {};
            params.name = "GeoPhotoMobile";
            params.tags = $scope.photo.tags;
            options.params = params;

            //console.log("new imp: prepare upload now");
            var ft = new FileTransfer();
            ft.upload($scope.photo.image, encodeURI(Settings.photosSeverURL() + "/api/photos"), uploadSuccess, uploadError, options); //TODO need to add the url to configuration

            function uploadSuccess(r) {
                // handle success like a message to the user
                console.log("success uploading photo");
                $scope.$apply(function () {
                    $scope.photo = null;

                });
            }

            function uploadError(error) {
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target)
                console.log("Upload error: " + JSON.stringify(error));

                $scope.$apply(function () {
                    $scope.photo = null;
                });
                alert("Error Uploading Photo at this time");
            }
        };
    })

    .controller('SettingsCtrl', function ($scope, Settings) {
        $scope.settings = {};
        $scope.settings.server = Settings.photosSeverURL();

        $scope.$watch('settings.server', function (newValue, oldValue) {
            Settings.photosSeverURL(newValue);
        });
    })

    .controller('PhotosCtrl', function ($scope, Settings) {

    })

    .directive('imageonload', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('load', function () {
                    //call the function that was passed
                    scope.$apply(attrs.imageonload);
                });
            }
        };
    })
;

function convertGPSData(gps) {
    var lat = gps.GPSLatitude;
    var lng = gps.GPSLongitude;

    //Convert coordinates to WGS84 decimal
    var latRef = gps.GPSLatitudeRef || 'N';
    var lngRef = gps.GPSLongitudeRef || 'W';

    lat = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (latRef == 'N' ? 1 : -1);
    lng = (lng[0] + lng[1] / 60 + lng[2] / 3600) * (lngRef == 'W' ? -1 : 1);

    return [lat, lng];
}
