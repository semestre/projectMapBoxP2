

// Configurar nuestro token de acceso
mapboxgl.accessToken = "pk.eyJ1IjoianVhbmZyOTciLCJhIjoiY2tkeXgzN2dyMmV1NjJxbjk2em4wbnZ0MiJ9.9ssXDU2u6qBt3V3D0arcMg"

// Inicializar el mapa
const map = new mapboxgl.Map({
    container: "map", // El id del div donde se mostrará el mapa
    style: "mapbox://styles/mapbox/streets-v11", // Tipo de mapa
    center: [-74.5, 40], // Coordenadas de inicio
    zoom: 9 // Nivel de zoom
});

// Agregar controles de navegación
map.addControl(new mapboxgl.NavigationControl());

// Agregar un marcador fijo
const marker = new mapboxgl.Marker()
    .setLngLat([-74.5, 40])
    .addTo(map);

// Agregar capa de puntos desde un archivo GeoJSON
map.on('load', function () {
    map.addSource('places', {
        'type': 'geojson',
        'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
    });

    // map.addLayer({
    //     'id': 'earthquakes',
    //     'type': 'circle',
    //     'source': 'places',
    //     'paint': {
    //         'circle-radius': 6,
    //         'circle-color': '#ff0000',
    //         'circle-stroke-color': '#fff',
    //         'circle-stroke-width': 1
    //     }
    // });

    // // Cambiar cursor al pasar por encima
    // map.on('mouseenter', 'earthquakes', () => map.getCanvas().style.cursor = 'pointer');
    // map.on('mouseleave', 'earthquakes', () => map.getCanvas().style.cursor = '');

    // // Agregar popups al hacer click en un punto
    // map.on('click', 'earthquakes', (e) => {
    //     const coordinates = e.features[0].geometry.coordinates.slice();
    //     const place = e.features[0].properties.place || "Ubicación desconocida";
    //     const magnitude = e.features[0].properties.mag || "N/A";

    //     new mapboxgl.Popup()
    //         .setLngLat(coordinates)
    //         .setHTML(`<strong>${place}</strong><br>Magnitud: ${magnitude}`)
    //         .addTo(map);
    // });
});
