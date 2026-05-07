// Configurar token Mapbox
mapboxgl.accessToken = "pk.eyJ1IjoianVhbmZyOTciLCJhIjoiY2tkeXgzN2dyMmV1NjJxbjk2em4wbnZ0MiJ9.9ssXDU2u6qBt3V3D0arcMg";

// Inicializar mapa
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-101.6845, 21.1234], // León
    zoom: 12
});

// Controles de navegación
map.addControl(new mapboxgl.NavigationControl());


// ====================
// MARKERS
// ====================
const pointMarkers = [];

function clearPointMarkers() {
    pointMarkers.forEach(marker => marker.remove());
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


// ====================
// RENDER POINT LIST
// ====================
function renderPointsInList(points) {
    const listaPuntos = document.getElementById("listaPuntos");
    const listaRutas = document.getElementById("listaRutas");

    if (!listaPuntos || !listaRutas) return;

    if (!points.length) {
        listaPuntos.innerHTML = "Sin puntos registrados";
        listaRutas.innerHTML = "Sin datos para mostrar";
        return;
    }

    const html = points.map(point => `
        <div class="item-list">
            <div>
                <div class="item-list-nombre">${point.name}</div>
                <div class="item-list-desc">${point.description || "Sin descripción"}</div>
            </div>
            <span class="badge badge-success">#${point.id}</span>
        </div>
    `).join("");

    listaPuntos.innerHTML = html;
    listaRutas.innerHTML = html;
}


// ====================
// LOAD POINTS
// ====================
async function loadPoints() {
    try {
        const response = await fetch("/points");

        if (!response.ok) {
            throw new Error("No se pudieron obtener puntos");
        }

        const points = await response.json();

        renderPointsInList(points);

        clearPointMarkers();

        points.forEach(point => {
            addPointMarker(point);
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

        if (!response.ok) {
            throw new Error("No se pudieron obtener rutas");
        }

        const routes = await response.json();

        routes.forEach(route => {
            const coordinates = route.coordinates.map(coord => [
                coord[1],
                coord[0]
            ]);

            // evitar duplicar capas
            if (map.getLayer(`route-${route.id}`)) {
                map.removeLayer(`route-${route.id}`);
                map.removeSource(`route-${route.id}`);
            }

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
// FORM SUBMIT
// ====================
async function handlePointFormSubmit(event) {
    event.preventDefault();

    const payload = {
        name: document.getElementById("puntosNombre").value.trim(),
        description: document.getElementById("puntosDesc").value.trim(),
        lat: parseFloat(document.getElementById("puntosLat").value),
        lng: parseFloat(document.getElementById("puntosLng").value)
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
            throw new Error("No se pudo guardar");
        }

        event.target.reset();
        loadPoints();

    } catch (error) {
        console.error(error);
    }
}


// ====================
// SETUP FORM
// ====================
function setupPointForm() {
    const form = document.getElementById("formPuntos");

    if (form) {
        form.addEventListener("submit", handlePointFormSubmit);
    }
}

setupPointForm();


// ====================
// MAP LOAD
// ====================
map.on("load", () => {
    loadPoints();
    loadRoutes();
});
