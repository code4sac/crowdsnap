var map;
var markers; 
var size = new OpenLayers.Size(21,25);
var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
var fromProj    = new OpenLayers.Projection("EPSG:4326");   // WGS 1984
var toProj      = new OpenLayers.Projection("EPSG:900913"); // Spherical Mercator
$(function() {
  OpenLayers.ImgPath = "/assets/";
  function mapEvent(event) {
    if($('#ch_vline').css('display') != 'none') {
      showCrossHairs();
    }
    var lat = map.center.lat;
    var lon = map.center.lon;
  }
  // Create Map
  map = new OpenLayers.Map("OSMap", {
    eventListeners: {
      "moveend": mapEvent,
      "zomeend": mapEvent  
    }
  });
  var center_lon  = '38.575067';
  var center_lat  = '-121.487761';
  var mapnik      = new OpenLayers.Layer.OSM();
  var position    = new OpenLayers.LonLat(center_lat, center_lon).transform(fromProj, toProj);
  var zoom        = 13;

  map.addLayer(mapnik);
  map.setCenter(position, zoom);

  // Create marker layer
  markers = new OpenLayers.Layer.Markers("Markers");
  map.addLayer(markers);


  // Panel open event
  $('#panel_open').click(function() {
    $('mypanel').panel('open');
    alert('hi');

  });

  setTimeout(function() {
    showCrossHairs();
  },1000);
  //getCurrentLoc();

});

function getCurrentLoc() {
  var geolocate = new OpenLayers.Control.Geolocate({
    bind: false,
    geolocationOptions: {
      enableHighAccuracy: false,
      maximumAge: 0,
      timeout: 7000
    }
  });
  var bounds = new OpenLayers.Bounds();

  map.addControl(geolocate);
  geolocate.events.register("locationfailed", this, function() {
    console.log('Location Detection Failed');
  });
  geolocate.events.register("locationupdated", geolocate, function(e) {
    // Geolocation worked. Lets move and zoom.
    console.log(e);
    bounds.extend(e.point);
    bounds.toBBOX();
    map.zoomToExtent(bounds);
  });
  geolocate.activate();


}

function showCrossHairs() {
  var vertCenter = $('#content').width() / 2;
  var horzCenter = $('#content').height() /2;
  var vc_center = vertCenter - parseInt($('#ch_circle').css('width')) / 2;
  var hc_center = horzCenter - parseInt($('#ch_circle').css('height')) /2;

  $('#ch_vline').css('left', vertCenter);
  $('#ch_hline').css('top', horzCenter);

  $('#ch_circle').css('left', vc_center);
  $('#ch_circle').css('top', hc_center);

  $('#ch_vline').css('display', 'block');
  $('#ch_hline').css('display', 'block');
  $('#ch_circle').css('display', 'block');
}

function rejectPoint() {
  $('#info-panel').panel('close');
  $('#info-panel').empty();
}

function confirmPoint(lon, lat) {
  var point_name = $('#point_name').val();
  $('#info-panel').empty();
  $('#info-panel').html('<h3>Thank you</h3>');
  setTimeout(function() {
    $('#info-panel').panel('close');
  }, 500);
  setTimeout(function() {
    markers.addMarker(new OpenLayers.Marker(map.center));
    console.log(markers);
  }, 800);
}

function setPoint() {
  var pos = new OpenLayers.LonLat(map.center.lon, map.center.lat).transform(toProj, fromProj);
  var lat = pos.lat;
  var lon = pos.lon;

  // Ajax Request for populating info_window
  $.ajax({
    type: 'GET',
    url: '/info_window',
    data: {
      'lat': lat,
      'lon': lon
    },
    success: function(data) {
      $('#info-panel').empty();
      $('#info-panel').html(data);      
    }
  });

  setTimeout(function() {
  $('#info-panel').panel('open');
  }, 800);

}
