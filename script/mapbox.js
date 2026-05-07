// Configurar nuestro token de acceso
mapboxgl.accessToken = "YOUR_TOKEN";

// Inicializar mapa
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-101.6845, 21.1234],
    zoom: 12
});

// Navegación
map.addControl(new mapboxgl.NavigationControl());

// Referencias de marcadores
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
// LOAD POINTS
// ====================
async function loadPoints() {
    try {
        const response = await fetch("/points");

        if (!response.ok) {
            throw new Error("No se pudieron obtener los puntos");
        }

        const points = await response.json();

        // Actualizar lista lateral
        renderPointsInList(points);

        // Limpiar marcadores anteriores
        clearPointMarkers();

        // Agregar nuevos marcadores
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
        const routes = await response.json();

        routes.forEach(route => {
            const coordinates = route.coordinates.map(coord => [
                coord[1], // lng
                coord[0]  // lat
            ]);

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
// HANDLE FORM SUBMIT
// ====================
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


// ====================
// SETUP FORM
// ====================
function setupPointForm() {
    const pointForm = document.getElementById("formPuntos");

    if (!pointForm) {
        return;
    }

    pointForm.addEventListener("submit", handlePointFormSubmit);
}

setupPointForm();


// ====================
// MAP LOAD
// ====================
map.on("load", () => {
    loadPoints();
    loadRoutes();
});
