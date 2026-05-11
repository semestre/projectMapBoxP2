// Marcadores activos de puntos en el mapa.
const pointMarkers = [];

function clearPointMarkers() {
  // Elimina los marcadores actuales antes de volver a pintar.
  pointMarkers.forEach(marker => marker.remove());
  pointMarkers.length = 0;
}

function addPointMarker(point) {
  // Crea un marcador con popup para mostrar el punto en el mapa.
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

  // Construye la lista lateral con acciones de editar y eliminar.
  const pointsHtml = points.map((point) => {
    const description = point.description || "Sin descripción";
    return `
            <div class="item-list" data-point-lat="${point.lat}" data-point-lng="${point.lng}">
                <div class="item-info">
                    <div class="item-list-nombre">${point.name}</div>
                    <div class="item-list-desc">${description}</div>
                </div>
                <div class="item-list-actions">
                    <span class="badge badge-success">#${point.id}</span>
                  <button class="btn btn-sm btn-info btn-edit" data-point-id="${point.id}" title="Editar punto">
                      <i class="bi bi-pencil-square"></i>
                  </button>

                  <button class="btn btn-sm btn-danger btn-delete" data-point-id="${point.id}" title="Eliminar punto">
                      <i class="bi bi-trash"></i>
                  </button>
                </div>
            </div>
        `;
  }).join("");

  listaPuntos.innerHTML = pointsHtml;

  // Agregar event listeners a los items para hacer zoom al clickear
  const itemLists = listaPuntos.querySelectorAll('.item-list');
  itemLists.forEach(item => {
    item.addEventListener('click', (event) => {
      // No hacer zoom si se clickea un botón
      if (event.target.closest('.item-list-actions')) {
        return;
      }
      
      const lat = parseFloat(item.getAttribute('data-point-lat'));
      const lng = parseFloat(item.getAttribute('data-point-lng'));
      
      if (!isNaN(lat) && !isNaN(lng) && typeof zoomToPoint === 'function') {
        zoomToPoint(lat, lng, 16);
      }
    });
  });

  // Configurar event listeners para los botones de eliminar
  setupDeleteButtons();
  setupEditButtons();
}

async function loadPoints() {
  try {
    // Obtiene los puntos del backend y sincroniza lista + mapa.
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

async function handlePointFormSubmit(event) {
  event.preventDefault();

  // Toma los datos del formulario para crear un nuevo punto.
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

async function handleDeletePoint(pointId) {
  // Pide confirmación antes de eliminar el punto.
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






let currentPointId = null;

async function handleEditPoint(pointId) {
  try {
    // Carga el punto seleccionado para mostrarlo en el modal de edición.
    const response = await fetch(`/points/${pointId}`);
    const point = await response.json();

    currentPointId = pointId;

    document.getElementById("editName").value = point.name;
    document.getElementById("editDescription").value = point.description;
    document.getElementById("editLat").value = point.lat;
    document.getElementById("editLng").value = point.lng;

    const modal = new bootstrap.Modal(document.getElementById("editPointModal"));
    modal.show();

  } catch (error) {
    console.error(error);
  }
}


async function saveEditedPoint() {
  // Envía al backend los cambios editados desde el modal.
  const payload = {
    name: document.getElementById("editName").value,
    description: document.getElementById("editDescription").value,
    lat: parseFloat(document.getElementById("editLat").value),
    lng: parseFloat(document.getElementById("editLng").value)
  };

  try {
    const response = await fetch(`/points/${currentPointId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("No se pudo editar");
    }

    const modal = bootstrap.Modal.getInstance(document.getElementById("editPointModal"));
    modal.hide();

    loadPoints();

  } catch (error) {
    console.error(error);
  }
}

function closeModal() {
  // Cierra el modal de edición si está abierto.
  const modal = bootstrap.Modal.getInstance(document.getElementById("editPointModal"));
  if (modal) modal.hide();
}


function setupDeleteButtons() {
  // Conecta los botones de eliminar de la lista renderizada.
  const deleteButtons = document.querySelectorAll(".btn-delete");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const pointId = button.getAttribute("data-point-id");
      handleDeletePoint(pointId);
    });
  });
}

function setupEditButtons() {
  // Conecta los botones de edición de la lista renderizada.
  const editButtons = document.querySelectorAll(".btn-edit");

  editButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const pointId = button.getAttribute("data-point-id");
      handleEditPoint(pointId);
    });
  });
}

function setupPointForm() {
  const form = document.getElementById("formPuntos");

  if (form) {
    // Activa el submit del formulario de creación de puntos.
    form.addEventListener("submit", handlePointFormSubmit);
  }
}

// Inicializa el formulario y los controles del modal.
setupPointForm();

const closeModalBtn = document.getElementById("closeModal");
const savePointChangesBtn = document.getElementById("savePointChanges");

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (savePointChangesBtn) {
  savePointChangesBtn.addEventListener("click", saveEditedPoint);
}
