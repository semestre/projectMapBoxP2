const routeLines = [];

function clearRouteLines() {
    routeLines.forEach((line) => line.remove());
    routeLines.length = 0;
}

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

function addRouteToMap(route) {
    if (!route.coordinates || route.coordinates.length < 2) {
        console.warn("Ruta sin coordenadas válidas:", route.name);
        return;
    }

    const coordinates = route.coordinates.map(coord => [coord[1], coord[0]]);

    // Evitar duplicar capas
    if (map.getLayer(`route-${route.id}`)) {
        map.removeLayer(`route-${route.id}`);
        map.removeSource(`route-${route.id}`);
    }

    // Agregar la línea de la ruta
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

    // Agregar marcador en el punto de inicio de la ruta
    const popup = new mapboxgl.Popup()
        .setHTML(`<strong>${route.name}</strong><br>${route.description || "Sin descripción"}`);

    const el = document.createElement('div');
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.backgroundColor = '#ff0000';
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

setupRouteForm();

map.on("load", () => {
    loadRoutes();
});
