/**
Initialize Slideout
*/
var slideout = new Slideout({
  'panel': document.getElementById('panel'),
  'menu': document.getElementById('menu'),
  'padding': 320,
  'tolerance': 70
});

/** 
*Active Toggle button
*/
	document.querySelector('.toggle-button').addEventListener('click', function() {
	  slideout.toggle();
	});
	
/**
* Create an array to store markers.
* Create an infoWindow to display info 
*/
var markers = [];
var infoWindow;

/**
* Handle error if Google map failed to load.
*/
function mapError() {
	alert("Failed to load Google Map.");
}

/**
* Initialize Google map api.
*/
function initMap() {

	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
        mapTypeControl: true,
		 styles: [
          {elementType: 'geometry', stylers: [{color: '#ebe3cd'}]},
          {elementType: 'labels.text.fill', stylers: [{color: '#523735'}]},
          {elementType: 'labels.text.stroke', stylers: [{color: '#f5f1e6'}]},
          {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{color: '#c9b2a6'}]
          },
          {
            featureType: 'administrative.land_parcel',
            elementType: 'geometry.stroke',
            stylers: [{color: '#dcd2be'}]
          },
          {
            featureType: 'administrative.land_parcel',
            elementType: 'labels.text.fill',
            stylers: [{color: '#ae9e90'}]
          },
          {
            featureType: 'landscape.natural',
            elementType: 'geometry',
            stylers: [{color: '#dfd2ae'}]
          },
          {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{color: '#dfd2ae'}]
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{color: '#93817c'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [{color: '#a5b076'}]
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{color: '#447530'}]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{color: '#f5f1e6'}]
          },
          {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{color: '#fdfcf8'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{color: '#f8c967'}]
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{color: '#e9bc62'}]
          },
          {
            featureType: 'road.highway.controlled_access',
            elementType: 'geometry',
            stylers: [{color: '#e98d58'}]
          },
          {
            featureType: 'road.highway.controlled_access',
            elementType: 'geometry.stroke',
            stylers: [{color: '#db8555'}]
          },
          {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [{color: '#806b63'}]
          },
          {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{color: '#dfd2ae'}]
          },
          {
            featureType: 'transit.line',
            elementType: 'labels.text.fill',
            stylers: [{color: '#8f7d77'}]
          },
          {
            featureType: 'transit.line',
            elementType: 'labels.text.stroke',
            stylers: [{color: '#ebe3cd'}]
          },
          {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [{color: '#dfd2ae'}]
          },
          {
            featureType: 'water',
            elementType: 'geometry.fill',
            stylers: [{color: '#b9d3c2'}]
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{color: '#92998d'}]
          }
	  ]
	});

	infoWindow = new google.maps.InfoWindow();

	var geocoder = new google.maps.Geocoder();

/**
*Call geocodeAddress() on each place in the Places array.
*/
	Places.forEach(function(place) {
		geocodeAddress(geocoder, map, place);
	});

	ko.applyBindings(new ViewModel());
}


/**
*This function converts addresses into geographic coordinates and place markers accordingly.
*/
function geocodeAddress(geocoder, resultsMap, place) {
	var address = place.address;

	geocoder.geocode({'address': address}, function(results, status) {
		if (status === 'OK') {
			resultsMap.setCenter(results[0].geometry.location);
			place.marker = new google.maps.Marker({
				map: resultsMap,
				animation: google.maps.Animation.DROP,
				position: results[0].geometry.location
			});
			
			/** 
			* Bounces clicked Marker.
			*/
			google.maps.event.addListener(place.marker, 'click', function() {
				toggleBounce(place.marker);
			});

			markers.push({
				name: place.name,
				marker: place.marker
			});

		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}


/**
* Enable the marker to bounce.
*/
function toggleBounce(marker) {
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			marker.setAnimation(null);
		}, 1400);
	}
}

/**
* Open marker info window when corresponding item was clicked.
*/
function clickedMarker(name) {
	markers.forEach(function(markerItem) {
		if (markerItem.name == name) {
			google.maps.event.trigger(markerItem.marker, 'click');
		}
	});
}

/**
* Create ViewModel.
*/
var ViewModel = function() {
	var self = this;

	this.filter = ko.observable("");

	// Filter places based on user input.
	this.filteredPlaces = ko.computed(function() {
		var filter = self.filter().toLowerCase();
		if (!filter) {
			Places.forEach(function(place) {
				if (place.marker) {
					place.marker.setVisible(true);
				}
			});
			return Places;
		} else {
			return ko.utils.arrayFilter(Places, function(place) {
		 		var match = place.name.toLowerCase().indexOf(filter) !== -1;
		 		if (match) {
		 			place.marker.setVisible(true);
		 		} else {
		 			place.marker.setVisible(false);
		 		}
		 		return match;
		 	});
		}
	});
};
