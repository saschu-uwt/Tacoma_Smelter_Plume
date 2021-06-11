// Create a map
var mymap = L.map('map', {
  center: [47.24, -122.45],
  zoom: 11,
  minZoom: 11,
  defaultExtentControl: true,
});

// Geocoding!
var bounds = L.latLngBounds([47.1, -122.7],[47.4, -122.2]);
var searchControl = L.esri.Geocoding.geosearch({
  useMapBounds: false,
  searchBounds: bounds
}).addTo(mymap);
var results = L.layerGroup().addTo(mymap);
searchControl.on('results', function (data) {
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
      results.addLayer(L.marker(data.results[i].latlng));
    }
})

// The 'labels' pane allows the roads and labels to ride over the GeoJSON polygon layers
mymap.createPane('labels');
mymap.getPane('labels').style.zIndex = 400;
mymap.getPane('labels').style.pointerEvents = 'none';

// Custom built mapbox light with blue water and no roads or labels.
var basemap = L.tileLayer(
'https://api.mapbox.com/styles/v1/saschu/ckp4g6sjf1jwt18r0ffjwxamf/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic2FzY2h1IiwiYSI6ImNrZ3poNGVkYjA1b3Ayd3JzOHczb29iNjEifQ.MqXTIcUhZl4C-s0Jk5o49A', {
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1,
    attribution: 'Basemap tiles by <a href="https://www.mapbox.com/">MapBox</a> | Data from <a href="https://ecology.wa.gov/Spills-Cleanup/Contamination-cleanup/Cleanup-sites/Tacoma-smelter">Washington Department of Ecology</a>',
});

// Layer with roads and labels. Using the 'labels' pane to put this over the interpolation polygon layers
var labels = L.tileLayer(
'https://api.mapbox.com/styles/v1/saschu/ckp4x6ay61pf217nkyzhjzq84/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1Ijoic2FzY2h1IiwiYSI6ImNrZ3poNGVkYjA1b3Ayd3JzOHczb29iNjEifQ.MqXTIcUhZl4C-s0Jk5o49A', {
    id: 'mapbox/light-v9',
    tileSize: 512,
    zoomOffset: -1,
    pane: 'labels'
});

// ASARCO stack icon
var stack = L.icon({
  iconUrl: 'images/smokestack2.png',
  iconSize: [50,50],
  iconAnchor: [50,50],
  popupAnchor: [0,-50]
});
L.marker([47.29878, -122.50828], {icon: stack}).addTo(mymap).bindPopup("ASARCO smokestack");

// Here's the basemap
basemap.addTo(mymap);
labels.addTo(mymap);

// Arsenic map layer loaded into a variable
var arsenicLayer = L.geoJson(arsenic, {
  style: function(feature) {
    switch (feature.properties.gridcode) {
      case 1: return {color: "#709959", fillOpacity: 1};
      case 2: return {color: "#B0C67C", fillOpacity: 1};
      case 3: return {color: "#F2EEA2", fillOpacity: 1};
      case 4: return {color: "#F2E094", fillOpacity: 1};
      case 5: return {color: "#F2CE85", fillOpacity: 1};
      case 6: return {color: "#DAA982", fillOpacity: 1};
      case 7: return {color: "#C38C7B", fillOpacity: 1};
      case 8: return {color: "#E7BDC6", fillOpacity: 1};
      case 9: return {color: "#F9F5FC", fillOpacity: 1};
    }
  },
  interactive: false // Turns off the pointer on mouseover
});

// Lead map layer as a variable
var leadLayer = L.geoJson(lead, {
  style: function(feature) {
    switch (feature.properties.gridcode) {
      case 1: return {color: "#709959", fillOpacity: 1};
      case 2: return {color: "#B0C67C", fillOpacity: 1};
      case 3: return {color: "#F2EEA2", fillOpacity: 1};
      case 4: return {color: "#F2E094", fillOpacity: 1};
      case 5: return {color: "#F2CE85", fillOpacity: 1};
      case 6: return {color: "#DAA982", fillOpacity: 1};
      case 7: return {color: "#C38C7B", fillOpacity: 1};
      case 8: return {color: "#E7BDC6", fillOpacity: 1};
      case 9: return {color: "#F9F5FC", fillOpacity: 1};
    }
  },
  interactive: false // Turns off the pointer on mouseover
});

// styles for sample markers (AS is arsenic, LD is lead)
var markers = {
  radius: 3,
  fillColor: "blue",
  color: "blue",
  weight: .5,
  opacity: .5,
  fillOpacity: .5,
  pane: "labels"
};

function onEachFeature(feature, layer) {
    // does this feature have a properties named Arsenic_PPM and Lead_PPM?
    if (feature.properties && feature.properties.Arsenic_PPM && feature.properties.Lead_PPM) {
        layer.bindPopup("<b>Average Test Results</b><br>Arsenic: "+feature.properties.Arsenic_PPM+" ppm</br>Lead: "+feature.properties.Lead_PPM+" ppm");
    }
}

// Samples layer as a variable
var samplesLayer = L.geoJson(samples, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker (latlng, markers);
  },
  onEachFeature: onEachFeature
});

// Putting layers onto the map/page (over the basemap)
leadLayer.addTo(mymap);

// These three sections build out the layer control
var maplayers = {
  "Arsenic Interpolation": arsenicLayer,
  "Lead Interpolation": leadLayer,
};
var samplelayers = {
  "Sample Sites": samplesLayer,
};
L.control.layers(maplayers, samplelayers, {
  collapsed: false
  }).addTo(mymap);


// Legends: how-to from http://plnkr.co/edit/a8tRcba0kr3sLeYNuDPC?p=preview&preview
var LeadLegend = L.control({
  position: 'bottomleft'
});
var ArsenicLegend = L.control({
  position: 'bottomleft'
});

ArsenicLegend.onAdd = function(mymap) {
  var div = L.DomUtil.create('div', 'info legend');
  div.innerHTML += "<iframe src='" + "images/Arsenic_Legend.png" + "' width='200' height='200' frameborder='0' scrolling='no'></iframe>"
  return div;
};

LeadLegend.onAdd = function(mymap) {
  var div = L.DomUtil.create('div', 'info legend');
  div.innerHTML += "<iframe src='" + "images/Lead_Legend.png" + "' width='200' height='200' frameborder='0' scrolling='no'></iframe>"
  return div;
};

LeadLegend.addTo(mymap);

// Swap legends based on the selected map layer
mymap.on('baselayerchange', function(eventLayer) {
  console.log("clicked on base layer: " + eventLayer.name);
  if (eventLayer.name === 'Arsenic Interpolation') {
    ArsenicLegend.addTo(mymap);
    mymap.removeControl(LeadLegend);
  }
  if (eventLayer.name === 'Lead Interpolation') {
    LeadLegend.addTo(mymap);
    mymap.removeControl(ArsenicLegend);
  }
});
