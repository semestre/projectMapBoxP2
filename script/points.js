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

  // Configurar event listeners para los botones de eliminar
  setupDeleteButtons();
  setupEditButtons();
}

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






let currentPointId = null;

async function handleEditPoint(pointId) {
  try {
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
  const modal = bootstrap.Modal.getInstance(document.getElementById("editPointModal"));
  if (modal) modal.hide();
}


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

function setupEditButtons() {
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
    form.addEventListener("submit", handlePointFormSubmit);
  }
}

setupPointForm();

const closeModalBtn = document.getElementById("closeModal");
const savePointChangesBtn = document.getElementById("savePointChanges");

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeModal);
}

if (savePointChangesBtn) {
  savePointChangesBtn.addEventListener("click", saveEditedPoint);
}

map.on("load", () => {
  loadPoints();
});
