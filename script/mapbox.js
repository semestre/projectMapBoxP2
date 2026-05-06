// Configurar nuestro token de acceso
mapboxgl.accessToken = "pk.eyJ1IjoianVhbmZyOTciLCJhIjoiY2tkeXgzN2dyMmV1NjJxbjk2em4wbnZ0MiJ9.9ssXDU2u6qBt3V3D0arcMg";

// Inicializar mapa
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-101.6845, 21.1234],
    zoom: 12
});

// Navegación
map.addControl(new mapboxgl.NavigationControl());


// ====================
// LOAD POINTS
// ====================
async function loadPoints() {
    try {
        const response = await fetch("/points");
        const points = await response.json();

        points.forEach(point => {

            new mapboxgl.Marker()
                .setLngLat([point.lng, point.lat])
                .setPopup(
                    new mapboxgl.Popup().setHTML(`
                        <h3>${point.name}</h3>
                        <p>${point.description}</p>
                    `)
                )
                .addTo(map);

        });

    } catch (error) {
        console.error("Error loading points:", error);
    }
}


// ====================
// LOAD ROUTES
// ====================
async function loadRoutes() {
    try {

        const response = await fetch("/routes");
        const routes = await response.json();

        routes.forEach(route => {

            // Convert coordinates
            const coordinates = route.coordinates.map(coord => [
                coord[1], // lng
                coord[0]  // lat
            ]);

            // Draw line
            map.addLayer({
                id: `route-${route.id}`,
                type: "line",
                source: {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: coordinates
                        }
                    }
                },
                layout: {
                    "line-join": "round",
                    "line-cap": "round"
                },
                paint: {
                    "line-color": "#ff0000",
                    "line-width": 4
                }
            });

        });

    } catch (error) {
        console.error("Error loading routes:", error);
    }
}


// ====================
// MAP LOAD
// ====================
map.on("load", () => {
    loadPoints();
    loadRoutes();
});
