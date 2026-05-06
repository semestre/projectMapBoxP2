

// Token de Mapbox para habilitar el render del mapa.
mapboxgl.accessToken = "pk.eyJ1IjoianVhbmZyOTciLCJhIjoiY2tkeXgzN2dyMmV1NjJxbjk2em4wbnZ0MiJ9.9ssXDU2u6qBt3V3D0arcMg"
// Inicializa el mapa centrado en León, Gto.
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-101.6845, 21.1234],
    zoom: 12
});

// Controles de zoom/rotación en la esquina del mapa.
map.addControl(new mapboxgl.NavigationControl());


// Pinta los puntos en el panel lateral (lista de puntos y lista temporal en rutas).
function renderPointsInList(points) {
    const listaPuntos = document.getElementById("listaPuntos");
    const listaRutas = document.getElementById("listaRutas");

    if (!listaPuntos || !listaRutas) {
        return;
    }

    if (!Array.isArray(points) || points.length === 0) {
        // Estado vacío cuando el backend no devuelve puntos.
        listaPuntos.innerHTML = '<p class="text-muted text-center"><i class="bi bi-inbox"></i> Sin puntos registrados</p>';
        listaRutas.innerHTML = '<p class="text-muted text-center"><i class="bi bi-inbox"></i> Sin datos para mostrar</p>';
        return;
    }

    const pointsHtml = points.map((point) => {
        const description = point.description || "Sin descripción";
        return `
            <div class="item-list">
                <div>
                    <div class="item-list-nombre">${point.name}</div>
                    <div class="item-list-desc">${description}</div>
                </div>
                <span class="badge badge-success">#${point.id}</span>
            </div>
        `;
    }).join("");

    listaPuntos.innerHTML = pointsHtml;
    listaRutas.innerHTML = pointsHtml;
}


// Consulta la API de puntos, renderiza la lista lateral y coloca marcadores en el mapa.
async function loadPoints() {
    try {
        const response = await fetch("/points");
        const points = await response.json();

        // Sincroniza el panel lateral con los datos obtenidos.
        renderPointsInList(points);

        points.forEach(point => {
            // Cada punto se representa con un marcador y popup informativo.
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


// Evita dibujar marcadores antes de que Mapbox termine de cargar el mapa.
map.on("load", () => {
    loadPoints();
});
// Inicializar el mapa
// const map = new mapboxgl.Map({
//     container: "map", // El id del div donde se mostrará el mapa
//     style: "mapbox://styles/mapbox/streets-v11", // Tipo de mapa
//     center: [-74.5, 40], // Coordenadas de inicio
//     zoom: 9 // Nivel de zoom
// });

// // Agregar controles de navegación
// map.addControl(new mapboxgl.NavigationControl());

// // // Agregar un marcador fijo
// // const marker = new mapboxgl.Marker()
// //     .setLngLat([-74.5, 40])
// //     .addTo(map);

// // Agregar capa de puntos desde un archivo GeoJSON
// map.on('load', function () {
//     map.addSource('places', {
//         'type': 'geojson',
//         'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
//     });

//     // map.addLayer({
//     //     'id': 'earthquakes',
//     //     'type': 'circle',
//     //     'source': 'places',
//     //     'paint': {
//     //         'circle-radius': 6,
//     //         'circle-color': '#ff0000',
//     //         'circle-stroke-color': '#fff',
//     //         'circle-stroke-width': 1
//     //     }
//     // });

//     // // Cambiar cursor al pasar por encima
//     // map.on('mouseenter', 'earthquakes', () => map.getCanvas().style.cursor = 'pointer');
//     // map.on('mouseleave', 'earthquakes', () => map.getCanvas().style.cursor = '');

//     // // Agregar popups al hacer click en un punto
//     // map.on('click', 'earthquakes', (e) => {
//     //     const coordinates = e.features[0].geometry.coordinates.slice();
//     //     const place = e.features[0].properties.place || "Ubicación desconocida";
//     //     const magnitude = e.features[0].properties.mag || "N/A";

//     //     new mapboxgl.Popup()
//     //         .setLngLat(coordinates)
//     //         .setHTML(`<strong>${place}</strong><br>Magnitud: ${magnitude}`)
//     //         .addTo(map);
//     // });
// });
