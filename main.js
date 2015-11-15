function HSP(){
  this.map;
  this.infowindow;
  this.geocoder;
  this.service;
  this.markers = [];
}

HSP.prototype.initMap = function() {
  var saopaulo = {lat: -23.5503836, lng: -46.6339538};

  this.map = new google.maps.Map(document.getElementById('map'), {
    center: saopaulo,
    zoom: 15
  });

  this.infowindow = new google.maps.InfoWindow();

  var self = this;
  this.service = new google.maps.places.PlacesService(this.map);
  this.service.nearbySearch({
    location: saopaulo,
    radius: 2000,
    types: ['hospital']
  }, function(results, status) {
    self.callback(results, status);
  });

  this.geocoder = new google.maps.Geocoder();
}

HSP.prototype.callback = function(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    this.fillPlacesList(results);
    for (var i = 0; i < results.length; i++) {
      this.createMarker(results[i]);
    }
  }
}

HSP.prototype.createMarker = function(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: this.map,
    position: place.geometry.location
  });

  this.markers.push(marker);

  var self = this;
  google.maps.event.addListener(marker, 'click', function() {
    self.infowindow.setContent(place.name + " </br>Nota:"+ place.rating);
    self.infowindow.open(this.map, this);
  });
}

HSP.prototype.clearMap = function() {
  for (var i = 0; i < this.markers.length; i++) {
    this.markers[i].setMap(null);
  }
  this.markers = [];
}

HSP.prototype.getPlaceDetails = function(placeId) {
  var request = {
    placeId: placeId
  };
  this.service = new google.maps.places.PlacesService(map);
  this.service.getDetails(request, this.placeDetailsCallback);
}

HSP.prototype.placeDetailsCallback = function(place, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    console.log(place);
  }
}

HSP.prototype.fillPlacesList = function(results) {
  var rankedList = results.map(function (place){
    place.rating = place.rating == null ? 0.0 : place.rating;
    return place
  })
  rankedList = rankedList.sort(function(a, b){ return a.rating > b.rating; })
  rankedList = rankedList.reverse();
  var ul = document.getElementById("list");

  while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
  }

  for( var i =  0 ; i < rankedList.length ; ++i){
    // create a <li> for each one.
    var listItem = document.createElement("li");

    // add the item text
    listItem.innerHTML = rankedList[i].name + " </br>Nota:"+ rankedList[i].rating;

    // add listItem to the listElement
    ul.appendChild(listItem);
  }
}

HSP.prototype.findCoordinatesForAddress = function() {
  this.clearMap();

  var address = document.getElementById("address").value;
  var request = {
         address: address,
         region: "BR"
        };

  var self = this;
  geocoder.geocode( request, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {

      this.map.setCenter(results[0].geometry.location);

      this.service.nearbySearch({
        location: results[0].geometry.location,
        radius: 2000,
        types: ['hospital']
      }, function (){ self.callback });
    } else {
      console.log("Geocode was not successful for the following reason: " + status);
    }
  });
}

window.initHSP = function() {
  var hsp = new HSP();
  hsp.initMap();
  window.hsp = hsp;
};
