// Configurar token Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoianVhbmZyOTciLCJhIjoiY2tkeXgzN2dyMmV1NjJxbjk2em4wbnZ0MiJ9.9ssXDU2u6qBt3V3D0arcMg";

// Inicializar mapa con estilo streets por defecto (light mode)
window.map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-101.6845, 21.1234], // León
    zoom: 12
});

// Controles de navegación
window.map.addControl(new mapboxgl.NavigationControl());

// Esperar a que el mapa esté completamente cargado antes de cargar datos
window.map.on('load', () => {
  console.log('Mapa cargado');
  
  // Cargar datos de puntos, rutas y zonas
  if (typeof loadPoints === 'function') {
    loadPoints();
  }
  if (typeof loadRoutes === 'function') {
    loadRoutes();
  }
  if (typeof loadZones === 'function') {
    loadZones();
  }
});

