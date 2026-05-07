

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

// Referencias de marcadores para poder limpiarlos en cada recarga.
const pointMarkers = [];

function clearPointMarkers() {
    pointMarkers.forEach((marker) => marker.remove());
    pointMarkers.length = 0;
}

function addPointMarker(point) {
    const marker = new mapboxgl.Marker()
        .setLngLat([point.lng, point.lat])
        .setPopup(
            new mapboxgl.Popup().setHTML(`
                <h3>${point.name}</h3>
                <p>${point.description || "Sin descripción"}</p>
            `)
        )
        .addTo(map);

    pointMarkers.push(marker);
}


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

        if (!response.ok) {
            throw new Error("No se pudieron obtener los puntos");
        }

        const points = await response.json();

        // Sincroniza el panel lateral con los datos obtenidos.
        renderPointsInList(points);

        // Evita duplicar marcadores cuando se recarga la lista.
        clearPointMarkers();

        points.forEach(point => {
            // Cada punto se representa con un marcador y popup informativo.
            addPointMarker(point);
        });

    } catch (error) {
        console.error("Error loading points:", error);
    }
}


// Envía el formulario de puntos al backend y recarga datos visibles.
async function handlePointFormSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById("puntosNombre");
    const descriptionInput = document.getElementById("puntosDesc");
    const latInput = document.getElementById("puntosLat");
    const lngInput = document.getElementById("puntosLng");

    const lat = Number.parseFloat(latInput.value);
    const lng = Number.parseFloat(lngInput.value);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        alert("Latitud y longitud deben ser números válidos.");
        return;
    }

    const payload = {
        name: nameInput.value.trim(),
        description: descriptionInput.value.trim(),
        lat,
        lng
    };

    try {
        const response = await fetch("/points", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("No se pudo guardar el punto");
        }

        event.target.reset();
        await loadPoints();
    } catch (error) {
        console.error("Error creating point:", error);
        alert("Ocurrió un error al guardar el punto.");
    }
}


function setupPointForm() {
    const pointForm = document.getElementById("formPuntos");

    if (!pointForm) {
        return;
    }

    pointForm.addEventListener("submit", handlePointFormSubmit);
}


setupPointForm();


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
