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

// Referencias de marcadores y líneas para poder limpiarlos en cada recarga.
const pointMarkers = [];
const routeLines = [];
const zonePolygons = [];

function clearPointMarkers() {
    pointMarkers.forEach(marker => marker.remove());
    pointMarkers.length = 0;
}

function clearRouteLines() {
    routeLines.forEach((line) => line.remove());
    routeLines.length = 0;
}

function clearZonePolygons() {
    // Limpiar capas de zonas del mapa
    zonePolygons.forEach((zoneId) => {
        if (map.getLayer(`zone-fill-${zoneId}`)) {
            map.removeLayer(`zone-fill-${zoneId}`);
        }
        if (map.getLayer(`zone-border-${zoneId}`)) {
            map.removeLayer(`zone-border-${zoneId}`);
        }
        if (map.getSource(`zone-${zoneId}`)) {
            map.removeSource(`zone-${zoneId}`);
        }
    });
    zonePolygons.length = 0;
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
                <div class="item-list-actions">
                    <span class="badge badge-success">#${point.id}</span>
                    <button class="btn btn-sm btn-danger btn-delete" data-point-id="${point.id}" title="Eliminar punto">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");

    listaPuntos.innerHTML = pointsHtml;
    listaRutas.innerHTML = pointsHtml;

    // Configurar event listeners para los botones de eliminar
    setupDeleteButtons();
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


// Elimina un punto después de confirmar con el usuario.
async function handleDeletePoint(pointId) {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este punto?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/points/${pointId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("No se pudo eliminar el punto");
        }

        // Recarga la lista de puntos después de eliminar exitosamente
        await loadPoints();
    } catch (error) {
        console.error("Error deleting point:", error);
        alert("Ocurrió un error al eliminar el punto.");
    }
}


// Configura los event listeners para los botones de eliminar.
function setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".btn-delete");

    deleteButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const pointId = button.getAttribute("data-point-id");
            handleDeletePoint(pointId);
        });
    });
}


// ===================== FUNCIONES PARA RUTAS =====================

function addRouteToMap(route) {
    if (!route.coordinates || route.coordinates.length < 2) {
        console.warn("Ruta sin coordenadas válidas:", route.name);
        return;
    }

    const coordinates = route.coordinates.map(coord => [coord[1], coord[0]]);

    const popup = new mapboxgl.Popup()
        .setHTML(`<strong>${route.name}</strong><br>${route.description}`);

    // Crear un elemento personalizado para representar la ruta
    const el = document.createElement('div');
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.backgroundColor = '#3b82f6';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.cursor = 'pointer';

    const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates[0])
        .setPopup(popup)
        .addTo(map);

    routeLines.push(marker);
}

function renderRoutesInList(routes) {
    const listaRutas = document.getElementById("listaRutas");

    if (!listaRutas) {
        return;
    }

    if (!Array.isArray(routes) || routes.length === 0) {
        listaRutas.innerHTML = '<p class="text-muted text-center"><i class="bi bi-inbox"></i> Sin rutas registradas</p>';
        return;
    }

    const routesHtml = routes.map((route) => {
        const description = route.description || "Sin descripción";
        return `
            <div class="item-list">
                <div>
                    <div class="item-list-nombre">${route.name}</div>
                    <div class="item-list-desc">${description}</div>
                </div>
                <div class="item-list-actions">
                    <span class="badge badge-info">#${route.id}</span>
                    <button class="btn btn-sm btn-danger btn-delete-route" data-route-id="${route.id}" title="Eliminar ruta">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");

    listaRutas.innerHTML = routesHtml;
    setupDeleteRouteButtons();
}

async function loadRoutes() {
    try {
        const response = await fetch("/routes");

        if (!response.ok) {
            throw new Error("No se pudieron obtener las rutas");
        }

        const routes = await response.json();
        renderRoutesInList(routes);
        clearRouteLines();

        routes.forEach(route => {
            addRouteToMap(route);
        });

    } catch (error) {
        console.error("Error loading routes:", error);
    }
}

async function handleRouteFormSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById("rutasNombre");
    const coordinatesInput = document.getElementById("rutasCoordenadas");

    let coordinates;
    try {
        coordinates = JSON.parse(coordinatesInput.value);
        if (!Array.isArray(coordinates) || !Array.isArray(coordinates[0])) {
            throw new Error("Formato inválido");
        }
    } catch (error) {
        alert("Las coordenadas deben estar en formato JSON: [[lat, lng], [lat, lng]]");
        return;
    }

    const payload = {
        name: nameInput.value.trim(),
        description: "Ruta personalizada",
        coordinates
    };

    try {
        const response = await fetch("/routes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("No se pudo guardar la ruta");
        }

        event.target.reset();
        await loadRoutes();
    } catch (error) {
        console.error("Error creating route:", error);
        alert("Ocurrió un error al guardar la ruta.");
    }
}

async function handleDeleteRoute(routeId) {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar esta ruta?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/routes/${routeId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("No se pudo eliminar la ruta");
        }

        await loadRoutes();
    } catch (error) {
        console.error("Error deleting route:", error);
        alert("Ocurrió un error al eliminar la ruta.");
    }
}

function setupDeleteRouteButtons() {
    const deleteButtons = document.querySelectorAll(".btn-delete-route");

    deleteButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const routeId = button.getAttribute("data-route-id");
            handleDeleteRoute(routeId);
        });
    });
}

function setupRouteForm() {
    const routeForm = document.getElementById("formRutas");

    if (!routeForm) {
        return;
    }

    routeForm.addEventListener("submit", handleRouteFormSubmit);
}


// ===================== FUNCIONES PARA ZONAS =====================

function addZoneToMap(zone) {
    if (!zone.coordinates || zone.coordinates.length < 3) {
        console.warn("Zona sin coordenadas válidas:", zone.name);
        return;
    }

    const coordinates = zone.coordinates.map(coord => [coord[1], coord[0]]);
    // Cerrar el polígono agregando la primera coordenada al final
    coordinates.push(coordinates[0]);

    const geojsonSource = {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coordinates]
            },
            properties: {
                name: zone.name,
                description: zone.description
            }
        }
    };

    // Agregar fuente GeoJSON
    map.addSource(`zone-${zone.id}`, geojsonSource);

    // Capa de relleno del polígono
    map.addLayer({
        id: `zone-fill-${zone.id}`,
        type: 'fill',
        source: `zone-${zone.id}`,
        paint: {
            'fill-color': '#8b5cf6',
            'fill-opacity': 0.3
        }
    });

    // Capa de borde del polígono
    map.addLayer({
        id: `zone-border-${zone.id}`,
        type: 'line',
        source: `zone-${zone.id}`,
        paint: {
            'line-color': '#8b5cf6',
            'line-width': 3
        }
    });

    // Agregar popup al pasar el mouse sobre el polígono
    map.on('mouseenter', `zone-fill-${zone.id}`, () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', `zone-fill-${zone.id}`, () => {
        map.getCanvas().style.cursor = '';
    });

    map.on('click', `zone-fill-${zone.id}`, () => {
        new mapboxgl.Popup()
            .setLngLat(coordinates[0])
            .setHTML(`<strong>${zone.name}</strong><br><p>${zone.description}</p>`)
            .addTo(map);
    });

    zonePolygons.push(zone.id);
}

function renderZonesInList(zones) {
    const listaZonas = document.getElementById("listaZonas");

    if (!listaZonas) {
        return;
    }

    if (!Array.isArray(zones) || zones.length === 0) {
        listaZonas.innerHTML = '<p class="text-muted text-center"><i class="bi bi-inbox"></i> Sin zonas registradas</p>';
        return;
    }

    const zonesHtml = zones.map((zone) => {
        const description = zone.description || "Sin descripción";
        return `
            <div class="item-list">
                <div>
                    <div class="item-list-nombre">${zone.name}</div>
                    <div class="item-list-desc">${description}</div>
                </div>
                <div class="item-list-actions">
                    <span class="badge badge-warning">#${zone.id}</span>
                    <button class="btn btn-sm btn-danger btn-delete-zone" data-zone-id="${zone.id}" title="Eliminar zona">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join("");

    listaZonas.innerHTML = zonesHtml;
    setupDeleteZoneButtons();
}

async function loadZones() {
    try {
        const response = await fetch("/zones");

        if (!response.ok) {
            throw new Error("No se pudieron obtener las zonas");
        }

        const zones = await response.json();
        renderZonesInList(zones);
        clearZonePolygons();

        zones.forEach(zone => {
            addZoneToMap(zone);
        });

    } catch (error) {
        console.error("Error loading zones:", error);
    }
}

async function handleZoneFormSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById("zonasNombre");
    const coordinatesInput = document.getElementById("zonasCoordenadas");

    let coordinates;
    try {
        coordinates = JSON.parse(coordinatesInput.value);
        if (!Array.isArray(coordinates) || !Array.isArray(coordinates[0])) {
            throw new Error("Formato inválido");
        }
    } catch (error) {
        alert("Las coordenadas deben estar en formato JSON: [[lat, lng], [lat, lng], [lat, lng]]");
        return;
    }

    const payload = {
        name: nameInput.value.trim(),
        description: "Zona personalizada",
        coordinates
    };

    try {
        const response = await fetch("/zones", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error("No se pudo guardar la zona");
        }

        event.target.reset();
        await loadZones();
    } catch (error) {
        console.error("Error creating zone:", error);
        alert("Ocurrió un error al guardar la zona.");
    }
}

async function handleDeleteZone(zoneId) {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar esta zona?");

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/zones/${zoneId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("No se pudo eliminar la zona");
        }

        await loadZones();
    } catch (error) {
        console.error("Error deleting zone:", error);
        alert("Ocurrió un error al eliminar la zona.");
    }
}

function setupDeleteZoneButtons() {
    const deleteButtons = document.querySelectorAll(".btn-delete-zone");

    deleteButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            const zoneId = button.getAttribute("data-zone-id");
            handleDeleteZone(zoneId);
        });
    });
}

function setupZoneForm() {
    const zoneForm = document.getElementById("formZonas");

    if (!zoneForm) {
        return;
    }

    zoneForm.addEventListener("submit", handleZoneFormSubmit);
}


function setupPointForm() {
    const form = document.getElementById("formPuntos");

    if (form) {
        form.addEventListener("submit", handlePointFormSubmit);
    }
}

setupPointForm();
setupRouteForm();
setupZoneForm();


// ====================
// MAP LOAD
// ====================
map.on("load", () => {
    loadPoints();
    loadRoutes();
    loadZones();
});
