var bounds = [[0,0], [905, 1280]];

var map = L.map("map",{
    crs: L.CRS.Simple,
    maxZoom: 2,
    minZoom: 0.5,//0.017,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
});

var image = L.imageOverlay("images/Sinnoh.png", bounds).addTo(map);
map.fitBounds(bounds);
