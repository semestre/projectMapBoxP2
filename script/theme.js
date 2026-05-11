// Gestión del tema oscuro/claro
const htmlElement = document.documentElement;

// Función para aplicar el tema
function applyTheme(theme) {
  if (theme === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-mode');
    
    const themeSwitcher = document.getElementById('themeSwitcher');
    if (themeSwitcher) {
      themeSwitcher.checked = true;
    }
    
    // Cambiar estilo del mapa a dark
    if (window.map) {
      window.map.setStyle('mapbox://styles/mapbox/navigation-night-v1');
      
      // Recargar datos después de que el mapa esté listo con el nuevo estilo
      window.map.once('style.load', () => {
        if (typeof loadPoints === 'function') loadPoints();
        if (typeof loadRoutes === 'function') loadRoutes();
        if (typeof loadZones === 'function') loadZones();
      });
    }
  } else {
    htmlElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-mode');
    
    const themeSwitcher = document.getElementById('themeSwitcher');
    if (themeSwitcher) {
      themeSwitcher.checked = false;
    }
    
    // Cambiar estilo del mapa a streets (original)
    if (window.map) {
      window.map.setStyle('mapbox://styles/mapbox/streets-v11');
      
      // Recargar datos después de que el mapa esté listo con el nuevo estilo
      window.map.once('style.load', () => {
        if (typeof loadPoints === 'function') loadPoints();
        if (typeof loadRoutes === 'function') loadRoutes();
        if (typeof loadZones === 'function') loadZones();
      });
    }
  }
  localStorage.setItem('theme', theme);
}

// Esperar a que el DOM esté completamente listo
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  
  // Aplicar tema guardado (por defecto light)
  if (savedTheme === 'dark') {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
  
  // Agregar evento al switch
  const themeSwitcher = document.getElementById('themeSwitcher');
  if (themeSwitcher) {
    themeSwitcher.addEventListener('change', () => {
      const newTheme = themeSwitcher.checked ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }
});
