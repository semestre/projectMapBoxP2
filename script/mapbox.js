// Configurar token Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoianVhbmZyOTciLCJhIjoiY2tkeXgzN2dyMmV1NjJxbjk2em4wbnZ0MiJ9.9ssXDU2u6qBt3V3D0arcMg";

// Inicializar mapa
window.map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-101.6845, 21.1234], // León
    zoom: 12
});

// Controles de navegación
map.addControl(new mapboxgl.NavigationControl());

