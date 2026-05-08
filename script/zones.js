const zonePolygons = [];

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

setupZoneForm();

map.on("load", () => {
    loadZones();
});
