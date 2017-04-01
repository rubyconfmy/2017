function initGoogleMap() {
  var _this = this;

  if ( jQuery('.map').length ) {
    jQuery('.map').each(function () {
        var mapEl = this;

        var map, marker, geocoder, service;

        var isMobile = function() {
          try{ document.createEvent("TouchEvent"); return true; }
          catch(e){ return false; }
        }();

        var icon = '/assets/img/marker-46x46.png',
            address,
            markerLatLng,
            offsetX,
            offsetY,
            relativeOffset,
            balloons,
            mapOptions = {
                zoom: 14,
                scrollwheel: false,
                mapTypeControl: false,
                draggable: !isMobile,
                styles: [
                          {
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#242f3e"
                              }
                            ]
                          },
                          {
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#746855"
                              }
                            ]
                          },
                          {
                            "elementType": "labels.text.stroke",
                            "stylers": [
                              {
                                "color": "#242f3e"
                              }
                            ]
                          },
                          {
                            "featureType": "administrative.locality",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#d59563"
                              }
                            ]
                          },
                          {
                            "featureType": "poi",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#d59563"
                              }
                            ]
                          },
                          {
                            "featureType": "poi.park",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#263c3f"
                              }
                            ]
                          },
                          {
                            "featureType": "poi.park",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#6b9a76"
                              }
                            ]
                          },
                          {
                            "featureType": "road",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#38414e"
                              }
                            ]
                          },
                          {
                            "featureType": "road",
                            "elementType": "geometry.stroke",
                            "stylers": [
                              {
                                "color": "#212a37"
                              }
                            ]
                          },
                          {
                            "featureType": "road",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#9ca5b3"
                              }
                            ]
                          },
                          {
                            "featureType": "road.highway",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#746855"
                              }
                            ]
                          },
                          {
                            "featureType": "road.highway",
                            "elementType": "geometry.stroke",
                            "stylers": [
                              {
                                "color": "#1f2835"
                              }
                            ]
                          },
                          {
                            "featureType": "road.highway",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#f3d19c"
                              }
                            ]
                          },
                          {
                            "featureType": "transit",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#2f3948"
                              }
                            ]
                          },
                          {
                            "featureType": "transit.station",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#d59563"
                              }
                            ]
                          },
                          {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [
                              {
                                "color": "#17263c"
                              }
                            ]
                          },
                          {
                            "featureType": "water",
                            "elementType": "labels.text.fill",
                            "stylers": [
                              {
                                "color": "#515c6d"
                              }
                            ]
                          },
                          {
                            "featureType": "water",
                            "elementType": "labels.text.stroke",
                            "stylers": [
                              {
                                "color": "#17263c"
                              }
                            ]
                          }
                        ]
            };

        function createMap () {
            mapOptions.center = markerLatLng

            map = new google.maps.Map(mapEl, mapOptions);

            marker = new google.maps.Marker({
                map: map,
                icon: icon,
                position: markerLatLng
            });

            map.addListener('projection_changed', function() {
                centerMap(map, offsetX, offsetY, relativeOffset);
            });

            createBalloons();
        }

        function createBalloons () {
            service = new google.maps.places.PlacesService(map);

            if ( balloons ) {
                for (var i = 0; i < balloons.length; i++) {
                    var balloon = balloons[i];

                    if ( typeof balloon == 'string' ) {
                        service.textSearch({
                            location: markerLatLng,
                            radius: 5000,
                            query: balloon
                        }, function(results, status) {
                            if (status == google.maps.places.PlacesServiceStatus.OK) {
                                for (var i = 0, place; place = results[i]; i++) {
                                    service.getDetails({placeId: place.place_id}, createMarkers);
                                };
                            }
                        });
                    }
                };
            }
        }

        function createMarkers(place, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                var innerContent;

                innerContent = '<div class="balloon"><strong class="name">' + place.name + '</strong>';

                if ( place.rating ) {
                    innerContent += '<ul class="list-inline rating">';

                    for (var i = 0; i < Math.floor(place.rating); i++) {
                        innerContent += '<li><span class="fa fa-star"></span></li>'
                    };

                    innerContent += '</ul>';
                }

                if ( place.adr_address ) {
                    innerContent += '<p class="address">' + place.adr_address + '</p>';
                }

                if ( place.international_phone_number ) {
                    innerContent += '<p class="phone">' + place.international_phone_number + '</p>';
                }

                innerContent += '</div>';

                var infowindow = new google.maps.InfoWindow({
                    position: place.geometry.location,
                    maxWidth: 200,
                    content: innerContent,
                    disableAutoPan: true
                });

                infowindow.open(map);
            }
        }

        function centerMap(map, offsetX, offsetY, relative) {
            var offsetX = (typeof offsetX == 'number' ? offsetX : 0),
                offsetY = (typeof offsetY == 'number' ? offsetY : 0),
                zoom = map.getZoom(),
                scale = Math.pow( 2, zoom ),
                northEast = map.getBounds().getNorthEast(),
                southWest = map.getBounds().getSouthWest(),
                width = Math.abs( northEast.lng() - southWest.lng() ),
                height = Math.abs( northEast.lat() - southWest.lat() ),
                point1 = map.getProjection().fromLatLngToPoint( map.getCenter() ),
                point2 = new google.maps.Point(
                    offsetX / scale,
                    offsetY / scale
                ),
                centerPoint = new google.maps.Point(
                    point1.x - point2.x,
                    point1.y - point2.y
                ),
                center = map.getProjection().fromPointToLatLng( centerPoint );

            if ( relative ) {
                center = new google.maps.LatLng(
                    map.getCenter().lat() + height * offsetY / 100,
                    map.getCenter().lng() - width * offsetX / 100
                );
            }

            map.setCenter( center );
        }

        function successCallback (data) {
            if ( typeof data == 'object' ) {
                if ( data.mapZoom ) mapOptions.zoom = data.mapZoom;

                if ( data.relativeOffset ) relativeOffset = true;

                if ( data.offsetX ) offsetX = data.offsetX;
                else offsetX = 0;

                if ( data.offsetY ) offsetY = data.offsetY;
                else offsetY = 0;

                if ( data.markerImagePath && typeof data.markerImagePath == 'string' ) icon = data.markerImagePath;

                if ( data.markerAddress && typeof data.markerAddress == 'string' ) address = data.markerAddress;
                else if ( data.markerLatLng && typeof data.markerLatLng == 'object' ) markerLatLng = new google.maps.LatLng(data.markerLatLng[0], data.markerLatLng[1]);

                if ( data.balloons && typeof data.balloons == 'object' && data.balloons.length ) balloons = data.balloons;
            }

            geocoder = new google.maps.Geocoder();

            if ( typeof markerLatLng == 'object' ) {
                createMap();

            }else if ( typeof address == 'string' ) {
                geocoder.geocode({ 'address': address }, function(results, status) {
                    markerLatLng = results[0].geometry.location;

                    createMap();
                });
            }
        }

        function failCallback () {
            _this.log("Can't parse map settings!");

            new google.maps.Map(mapEl, {
                center: new google.maps.LatLng(0, 0),
                zoom: 2
            });
        }

        if ( jQuery(this).data('settings') ) {
            jQuery.getJSON(jQuery(this).data('settings'), successCallback).fail(failCallback);

        }else {
            failCallback();
        }
    });
  }
}
