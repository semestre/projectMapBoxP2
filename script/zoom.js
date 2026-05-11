// Gestión de zoom para puntos específicos

/**
 * Hace zoom a un punto específico
 */
function zoomToPoint(lat, lng, zoomLevel = 15) {
  if (window.map) {
    window.map.flyTo({
      center: [lng, lat],
      zoom: zoomLevel,
      duration: 800
    });
  }
}

/**
 * Resetear zoom a la vista original (León)
 */
function resetZoom() {
  if (window.map) {
    window.map.flyTo({
      center: [-101.6845, 21.1234],
      zoom: 12,
      duration: 1000
    });
  }
}

// Inicializar botones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const resetButton = document.getElementById('resetZoomBtn');
  if (resetButton) {
    resetButton.addEventListener('click', resetZoom);
  }
});
