document.addEventListener("DOMContentLoaded", () => {
    
    // =======================================================
    // 1. CONFIGURACIÓN INICIAL Y VISOR
    // =======================================================
    // 📌 AJUSTA ESTOS VALORES PARA LA POSICIÓN INICIAL AL CARGAR
    const X_PIXEL_INICIAL = 2000; 
    const Y_PIXEL_INICIAL = 1500; 
    const ZOOM_FACTOR_INICIAL = 0.50; // 50% del zoom máximo

    const viewer = OpenSeadragon({
        id: "openseadragon1",
        prefixUrl: "https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/",
        tileSources: `/static/images/${imageName}.dzi`,
        showNavigator: true,
        navigatorPosition: "BOTTOM_RIGHT",
        showFullPageControl: false,
        showHomeControl: true,
        showZoomControl: true,
        minZoomLevel: 0.5,
        defaultZoomLevel: 1
    });

    // =======================================================
    // 2. FUNCIÓN CENTRAL PARA MOVER Y ZOMEAR (Reutilizable)
    // =======================================================
    /**
     * Centra el visor en un punto específico de la imagen con un zoom específico.
     * @param {number} x - Coordenada X en píxeles de la imagen.
     * @param {number} y - Coordenada Y en píxeles de la imagen.
     * @param {number} zoomLevelOrFactor - El nivel de zoom (usado como factor si es menor a 1, o nivel si es mayor).
     */
    function goToCoordinates(x, y, zoomLevelOrFactor) {
        if (!viewer.world.getItemCount()) return; 

        // 1. CONVERSIÓN: Píxel de la imagen a Coordenadas del Viewport (normalizadas)
        var imagePoint = new OpenSeadragon.Point(x, y); 
        var viewportPoint = viewer.viewport.imageToViewportCoordinates(imagePoint);

        // 2. Determinar el zoom objetivo
        let targetZoom = zoomLevelOrFactor;
        
        // Si el valor es pequeño (como 0.5), lo tratamos como factor del zoom máximo.
        if (targetZoom <= 1.0) {
            var maxZoom = viewer.viewport.getMaxZoom();
            targetZoom = maxZoom * zoomLevelOrFactor;
        }

        // 3. Mover la vista al punto convertido (centrar)
        viewer.viewport.panTo(viewportPoint, true); 
        
        // 4. Aplicar el zoom, centrado en el punto
        viewer.viewport.zoomTo(targetZoom, viewportPoint, true); 
    }

    // =======================================================
    // 3. EVENTO DE INICIO (Carga inicial)
    // =======================================================
    viewer.addHandler('open', function() {
        goToCoordinates(X_PIXEL_INICIAL, Y_PIXEL_INICIAL, ZOOM_FACTOR_INICIAL);
    });

    // =======================================================
    // 4. LÓGICA DE INTERFAZ Y ENTRADA DE USUARIO
    // =======================================================
    const infoBox = document.getElementById("info-box");
    const infoTitle = document.getElementById("info-title");
    const infoText = document.getElementById("info-text");
    const closeInfo = document.getElementById("close-info");
    const menuCards = document.getElementById("menu-cards");
    
    // Referencias al formulario de coordenadas
    const coordForm = document.getElementById("coordinate-input-form");
    const inputX = document.getElementById("input-x");
    const inputY = document.getElementById("input-y");


    closeInfo.addEventListener("click", () => infoBox.classList.add("hidden"));

    // Maneja el envío del formulario de coordenadas (Usuario)
    coordForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Evita que la página se recargue

        const x = parseInt(inputX.value);
        const y = parseInt(inputY.value);
        
        if (!isNaN(x) && !isNaN(y)) {
            // Usa la función reutilizable con los datos del usuario.
            // Mantenemos el zoom inicial (0.5) para las entradas manuales.
            goToCoordinates(x, y, ZOOM_FACTOR_INICIAL); 
            infoBox.classList.add("hidden"); 
        } else {
            alert("Por favor, introduce coordenadas numéricas válidas.");
        }
    });

    // =======================================================
    // 5. LÓGICA DE POIs (Puntos de Interés)
    // =======================================================
    fetch(`/static/data/pois_${imageName}.json`)
        .then(res => res.json())
        .then(pois => {
            pois.forEach(poi => {
                const marker = document.createElement("div");
                marker.className = "poi-marker";
                viewer.addOverlay({
                    element: marker,
                    // location: usa las coordenadas de píxel del POI
                    location: new OpenSeadragon.Point((poi.x/poi.z), (poi.y/poi.z)),
                    placement: OpenSeadragon.Placement.CENTER
                });

                // Manejador de clic de Marcador
                marker.addEventListener("click", () => {
                    infoTitle.textContent = poi.title;
                    infoText.textContent = poi.description;
                    infoBox.classList.remove("hidden");
                    // Usa la función goToCoordinates. El zoom se toma de poi.zoom o 5 por defecto.
                    goToCoordinates(poi.x, poi.y, poi.zoom || 5);
                });

                // Manejador de clic de Tarjeta
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `<h3>${poi.title}</h3><p>${poi.short || ""}</p>`;
                card.addEventListener("click", () => {
                    // Usa la función goToCoordinates
                    goToCoordinates(poi.x, poi.y, poi.zoom || 5);
                    infoTitle.textContent = poi.title;
                    infoText.textContent = poi.description;
                    infoBox.classList.remove("hidden");
                });

                menuCards.appendChild(card);
            });
        })
        .catch(err => console.error("Error cargando POIs:", err));
});