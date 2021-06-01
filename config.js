// Create a map
var mymap = L.map('map', {
  center: [47.24, -122.45],
  zoom: 11,
});

// Geocoding!
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);
var searchControl = L.esri.Geocoding.geosearch().addTo(mymap);
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
    attribution: 'basemap tiles by <a href="https://www.mapbox.com/">MapBox</a> | data from <a href="https://ecology.wa.gov/Spills-Cleanup/Contamination-cleanup/Cleanup-sites/Tacoma-smelter">Washington Department of Ecology</a>',
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
  iconUrl: 'images/smokestack.png',
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
    switch (feature.properties.MAX_PPM) {
      case 10: return {color: "#709959", fillOpacity: 1};
      case 20: return {color: "#B0C67C", fillOpacity: 1};
      case 30: return {color: "#F2EEA2", fillOpacity: 1};
      case 40: return {color: "#F2E094", fillOpacity: 1};
      case 60: return {color: "#F2CE85", fillOpacity: 1};
      case 80: return {color: "#DAA982", fillOpacity: 1};
      case 100: return {color: "#C38C7B", fillOpacity: 1};
      case 200: return {color: "#E7BDC6", fillOpacity: 1};
      case 575: return {color: "#F9F5FC", fillOpacity: 1};
    }
  },
  interactive: false // Turns off the pointer on mouseover
});

// Lead map layer as a variable
var leadLayer = L.geoJson(lead, {
  style: function(feature) {
    switch (feature.properties.MAX_PPM) {
      case 25: return {color: "#709959", fillOpacity: 1};
      case 50: return {color: "#B0C67C", fillOpacity: 1};
      case 75: return {color: "#F2EEA2", fillOpacity: 1};
      case 100: return {color: "#F2E094", fillOpacity: 1};
      case 150: return {color: "#F2CE85", fillOpacity: 1};
      case 200: return {color: "#DAA982", fillOpacity: 1};
      case 250: return {color: "#C38C7B", fillOpacity: 1};
      case 300: return {color: "#E7BDC6", fillOpacity: 1};
      case 442: return {color: "#F9F5FC", fillOpacity: 1};
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
    // does this feature have a property named MAX_PPM?
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
