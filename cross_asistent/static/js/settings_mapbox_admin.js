window.addEventListener("load", () => {
    var mapToken = "pk.eyJ1IjoiY2hhdmEtdXRjIiwiYSI6ImNtOTdqdm13cjA4ZGsyaW9rc2g0OGRmdWoifQ.oxLDSCy8_q3xLJNVtDHmDw";
    var mapElement = document.getElementById("map");
    const savedLastLayerMap = localStorage.getItem("mapbox-last_layer");
    const inputsLayer = document.querySelectorAll("#offcanvasbody input[type='radio']");
    const labelsLayer = document.querySelectorAll("#offcanvasbody label");
    const formRoute = document.querySelector("#form_route");
    const selectOrigin = formRoute.querySelector("#origen");
    const selectDestiny = formRoute.querySelector("#destino");
    let colorlabels = "#000";
    let offcanvasOpen = false;
    let formChanges = false;
    let currentRoute;
    var currentMarker;
    var doorMarker;

    if (mapElement.classList.contains("map_editing")) {
        formChanges = true;

        // Hacer visible los campos de las esquinas
        $("#btnPoligon").on("click", function () {
            $("#esquinasPoligono").slideDown("slow");
        });

        // Dibujar poligono
        const drawPolygonButton = document.getElementById("btnPoligon");
        const drawPolygonCancel = document.getElementById("btnPoligonCancel");
        const coordInputs = ["esquina1", "esquina2", "esquina3", "esquina4"];
        const colors = ["tomato", "#3b71ca", "lime", "#d29c15"];
        let rightClicks = 4;
        let markers = [];
        let coords = [];
        let polygonLayer = null;
        let createNew = false;

        drawPolygonButton.addEventListener("click", () => {
            createNew = true;
            formChanges = false;
            initPolygonDrawing();
            $("#controlsIndic .card-header h6").html('<i class="fa-solid fa-draw-polygon me-1"></i>Dibujar Poligono:');
            $("#controlsIndic .card-body p").html(
                'Da <strong id="poligonClicks">4</strong> cliks derechos en el mapa... <br> Dibuja el poligono en sentido <u>Horario</u> <i class="fa-solid fa-arrow-rotate-right ms-1"></i>'
            );
            $("#controlsIndic").addClass("show");
            mapMapbox.on("contextmenu", countClicks);

            mapMapbox.on("contextmenu", addMarker);
            $("#btnPoligonCancel").slideDown();
            if (window.innerWidth <= 800) {
                setTimeout(() => {
                    if (offcanvasElement.classList.contains("show")) {
                        offcanvasInstance.hide();
                    }
                }, 1000);
            }
        });
        drawPolygonCancel.addEventListener("click", () => {
            createNew = "";
            initPolygonDrawing();
            mapMapbox.off("contextmenu", addMarker);
            mapMapbox.off("contextmenu", countClicks);
            $("#controlsIndic").removeClass("show");
            $("#btnPoligonCancel").slideUp();
            $("#esquinasPoligono").slideUp("fast");
        });
        function addMarker(e) {
            if (coords.length < 4) {
                const color = colors[coords.length];
                const marker = new mapboxgl.Marker({ color: color, draggable: true }).setLngLat(e.lngLat).addTo(mapMapbox).on("dragend", updatePolygon);
                markers.push(marker);
                coords.push(e.lngLat);

                document.getElementById(coordInputs[coords.length - 1]).classList.add("active");
                document.getElementById(coordInputs[coords.length - 1]).value = `${e.lngLat.lng}, ${e.lngLat.lat}`;
            }

            if (coords.length === 4) {
                mapMapbox.off("contextmenu", addMarker);
                drawPolygon();
                drawPolygonButton.classList.add("bg_red-blue");
                drawPolygonButton.classList.remove("bg_purple-blue");
                drawPolygonButton.innerHTML = 'Dibujar de nuevo <i class="fa-solid fa-trash-can ms-1"></i>';
                createNew = true;
                $("#btnPoligonCancel").slideUp();
            }
        }
        function initPolygonDrawing() {
            markers.forEach((marker) => marker.remove());
            markers = [];
            coords = [];
            if (createNew) {
                drawPolygonButton.classList.remove("btn_detail", "bg_red-blue");
                drawPolygonButton.classList.add("bg_purple-blue");
                drawPolygonButton.innerHTML = 'Borrar marcadores <i class="fa-solid fa-trash-can ms-1"></i>';
            } else if (createNew === "") {
                drawPolygonButton.classList.remove("bg_purple-blue", "bg_red-blue");
                drawPolygonButton.classList.add("btn_detail");
                drawPolygonButton.innerHTML = 'Dibujar Poligono <i class="fa-solid fa-draw-polygon ms-1"></i>';
            }

            if (polygonLayer) {
                if (mapMapbox.getLayer(polygonLayer.id + "_label")) {
                    mapMapbox.removeLayer(polygonLayer.id + "_label");
                }
                if (mapMapbox.getLayer(polygonLayer.id)) {
                    mapMapbox.removeLayer(polygonLayer.id);
                }
                if (mapMapbox.getSource(polygonLayer.id)) {
                    mapMapbox.removeSource(polygonLayer.id);
                }
            }

            createNew = false;
        }
        function drawPolygon() {
            const polygonText = document.getElementById("nombreEdificio").value || "Nuevo Lugar";
            const polygonColor = document.getElementById("colorHex").value || "#808080";

            const coordinates = [coords[0].toArray(), coords[1].toArray(), coords[2].toArray(), coords[3].toArray(), coords[0].toArray()];

            if (mapMapbox.getLayer("polygon_label")) {
                mapMapbox.removeLayer("polygon_label");
            }
            if (mapMapbox.getLayer("polygon")) {
                mapMapbox.removeLayer("polygon");
            }
            if (mapMapbox.getSource("polygon")) {
                mapMapbox.removeSource("polygon");
            }

            const polygonId = "polygon";

            mapMapbox.addSource(polygonId, {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [coordinates],
                    },
                },
            });

            mapMapbox.addLayer({
                id: polygonId,
                type: "fill",
                source: polygonId,
                layout: {},
                paint: {
                    "fill-color": polygonColor,
                    "fill-opacity": 0.5,
                },
            });

            mapMapbox.addLayer({
                id: polygonId + "_label",
                type: "symbol",
                source: polygonId,
                layout: {
                    "text-field": polygonText,
                    "text-size": 14,
                    "text-anchor": "center",
                },
                paint: {
                    "text-color": colorlabels,
                },
            });

            polygonLayer = { id: polygonId };
        }
        function updatePolygon() {
            coords = markers.map((marker) => marker.getLngLat());
            coordInputs.forEach((id, index) => {
                document.getElementById(id).value = `${coords[index].lng}, ${coords[index].lat}`;
            });

            drawPolygon();
        }
        function countClicks() {
            rightClicks--;
            if (rightClicks > 0) {
                document.getElementById("poligonClicks").textContent = rightClicks;
            } else {
                mapMapbox.off("contextmenu", countClicks);
                setTimeout(() => {
                    $("#controlsIndic").removeClass("show");
                    rightClicks = 4;
                    document.getElementById("poligonClicks").textContent = rightClicks;
                }, 2000);
            }
        }

        // Colocar puerta
        const btnDoor = document.getElementById("inputBtnDoor");
        const puertaCordsEdificio = document.getElementById("puertaCordsEdificio");
        var doorMarker;
        let addDoorMarker = true;
        btnDoor.addEventListener("click", () => {
            formChanges = false;
            if (addDoorMarker) {
                if (coords.length > 4) {
                    drawPolygonCancel.click();
                }
                btnDoor.classList.add("bg_purple-blue");
                btnDoor.classList.remove("btn_detail");
                mapMapbox.on("contextmenu", addMarkerDoor);

                $("#controlsIndic .card-header h6").html('<i class="fa-solid fa-location-dot me-1"></i>Punto de Entrada:');
                $("#controlsIndic .card-body p").html(
                    "Da <strong>1</strong> clik derecho en el mapa... <br> Debe esta ubicada en el <strong>borde</strong>  del poligono y conectada con algun <strong>camino</strong>"
                );
                $("#controlsIndic").addClass("show");
            }
            addDoorMarker = false;
            if (window.innerWidth <= 800) {
                setTimeout(() => {
                    if (offcanvasElement.classList.contains("show")) {
                        offcanvasInstance.hide();
                    }
                }, 1000);
            }
        });
        function addMarkerDoor(e) {
            if (doorMarker) {
                doorMarker.remove();
            }
            doorMarker = new mapboxgl.Marker({ color: "purple", draggable: true }).setLngLat(e.lngLat).addTo(mapMapbox).on("dragend", updateDoorCords);

            puertaCordsEdificio.classList.add("active");
            puertaCordsEdificio.value = `${e.lngLat.lng}, ${e.lngLat.lat}`;
            btnDoor.classList.remove("bg_purple-blue");
            btnDoor.classList.add("btn_detail");
            addDoorMarker = true;

            mapMapbox.off("contextmenu", addMarkerDoor);
            setTimeout(() => {
                $("#controlsIndic").removeClass("show");
            }, 2000);
        }
        function updateDoorCords(e) {
            const lngLat = doorMarker.getLngLat();
            puertaCordsEdificio.value = `${lngLat.lng}, ${lngLat.lat}`;
        }

        // Detectar si es marcador
        $("#checkIsmarker").change(function () {
            if ($(this).is(":checked")) {
                $("#sizemarkerdiv").slideDown("fast");
                $("[data-notmarker]").slideUp();
                $('[for="puertaCordsEdificio"]').text("Ubicacion:");
            } else {
                $("#sizemarkerdiv").slideUp();
                $("[data-notmarker]").slideDown();
                $('[for="puertaCordsEdificio"]').text("Punto de entrada:");
            }
        });
        $("#sizemarker").blur(function () {
            const maxval = parseFloat($("#sizemarker").attr("max"));
            const minval = parseFloat($("#sizemarker").attr("min"));
            let defval = parseFloat($("#sizemarker").val());

            if (defval > maxval) {
                defval = maxval;
            } else if (defval < minval) {
                defval = minval;
            }

            $("#sizemarker").val(defval);
        });

        const draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true,
            },
            // defaultMode: "draw_polygon",
        });

        mapMapbox.addControl(draw);

        mapMapbox.on("draw.create", updateArea);
        mapMapbox.on("draw.delete", updateArea);
        mapMapbox.on("draw.update", updateArea);

        function updateArea(e) {
            const data = draw.getAll();
            console.log(data);
            $("#controlsIndic").addClass("show");
            if (data.features.length > 0) {
                const polygon = data.features[0];

                // Calcular área
                const area = turf.area(polygon);
                const rounded_area = Math.round(area * 100) / 100;

                // Obtener coordenadas del polígono
                const coordinates = polygon.geometry.coordinates[0]; // primer anillo del polígono

                // Calcular perímetro (longitud del borde)
                const perimeter = turf.length(polygon, { units: "kilometers" });
                const rounded_perimeter = Math.round(perimeter * 1000 * 100) / 100; // en metros

                // Calcular centroide (centro geométrico)
                const centroid = turf.centroid(polygon);

                // Mostrar resultados
                $("#controlsIndic .card-body p").html(`
                    <p><strong>Área:</strong> ${rounded_area} m²</p>
                    <p><strong>Perímetro:</strong> ${rounded_perimeter} m</p>
                    <p><strong>Centroide:</strong> [${centroid.geometry.coordinates.map((c) => c.toFixed(5)).join(", ")}]</p>
                    <p><strong>Puntos del polígono:</strong></p>
                    <ol>${coordinates.map((coord) => `<li>[${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}]</li>`).join("")}</ol>
                `);
            } else {
                $("#controlsIndic").removeClass("show");
                $("#controlsIndic .card-body p").html("");
                if (e.type !== "draw.delete") alert("Haz clic en el mapa para dibujar un polígono.");
            }
        }
    }


    // Crear nuevo menu de botones personalizados ########################################
    mapMapbox.addControl(new mapboxgl.NavigationControl());
    class CustomControl {
        constructor() {
            this._container = null;
        }

        onAdd(mapMapbox) {
            if (mapElement.classList.contains("map_editing")) {
                const newBuild = createButton("newBuild", `<i class="fa-solid fa-building-flag"></i>`, "Crear Nuevo Edificio", () => {
                    $("#btnDeletedPleace").hide();
                    $("[data-namePleace]").text("");

                    if (formChanges) {
                        $("#offcanvasContent input").removeClass("active is-invalid is-valid").val("");
                        $(".error.bg-danger").slideUp("fast");
                        document.getElementById("imagen_actual").src = "/static/img/default_image.webp";
                        $("#offcanvasContent #isNewEdif").val("new");

                        const newUID = $("#uuid").data("new-uid");
                        $("#uuid").removeClass("active").val(newUID);
                        $("#namecolor").addClass("active").val("gray");
                        $("#colorPicker").addClass("active").val("#808080");
                        initPolygonDrawing();

                        $('[for="fotoEdificio"]').html('Subir foto <i class="fa-regular fa-image ms-1"></i>');
                        $("#fotoEdificio").attr("required", true);
                        tinymce.get("textTiny").setContent("");

                        $("#ismarker").val("False");
                        $("#checkIsmarker").removeAttr("checked");
                        $("#sizemarkerdiv").slideUp();
                        $("[data-notmarker]").slideDown();
                        $('[for="puertaCordsEdificio"]').text("Punto de entrada:");
                        $("#hidename").slideDown();
                        $("#btnOpenGalery").slideUp();
                    }

                    if (!offcanvasOpen) {
                        if (offcanvasElement.classList.contains("show")) {
                            offcanvasInstance.hide();
                        } else {
                            offcanvasInstance.show();
                        }
                    }
                });
                const OSMgo = createButton("OSMgo", `<i class="fa-solid fa-book-atlas"></i>`, "Editar en OpenStreetMaps", () => {
                    const url = "https://www.openstreetmap.org/edit#map=17/25.55684/-100.93548";
                    window.open(url, "_blank", "noopener,noreferrer");
                });
                const importMap = createButton("importmap", `<div class="mapboxgl-ctrl-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>`, "Importar y Exportar", () => {
                    var myModal = new mdb.Modal(document.getElementById("importInMap"));
                    myModal.show();
                });

                this._container.appendChild(OSMgo);
                this._container.appendChild(importMap);
                this._container.appendChild(newBuild);
            }
            return this._container;
        }
    }

    // Estilo guardado ########################################
    function updateLabelsAndInputs(varLayer) {
        if (varLayer) {
            labelsLayer.forEach((label) => label.classList.remove("btn_detail", "text-white", "cursor-not"));
            inputsLayer.forEach((input) => input.removeAttribute("disabled"));

            const label = document.querySelector(`label[for='${varLayer}']`);
            label.classList.add("btn_detail", "text-white", "cursor-not");

            const input = document.querySelector(`input#${varLayer}`);
            input.setAttribute("disabled", "disabled");

            colorlabels = "#000";
            if (varLayer === "dark-v11") {
                colorlabels = "#fff";
            }
            localStorage.setItem("mapbox-last_layer", varLayer);
        }
    }
    function setMapStyle(style) {
        mapMapbox.setStyle("mapbox://styles/mapbox/" + style);
    }
    if (savedLastLayerMap) {
        updateLabelsAndInputs(savedLastLayerMap);
        setMapStyle(savedLastLayerMap);
    }

    // Controles de Ruta
    const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: "metric",
        profile: "mapbox/walking",
        controls: {
            inputs: false,
            instructions: false,
            profileSwitcher: false,
        },
        alternatives: true,
        interactive: false,
    });
    function saveRouteLayers() {
        if (mapMapbox.getSource("directions")) {
            currentRoute = mapMapbox.getSource("directions")._data;
        }
    }

    // Agregar nuevo menu
    mapMapbox.addControl(new CustomControl(), "top-right");

    // Cursor segun el evento ###########################################
    mapMapbox.getCanvas().style.cursor = "default";
    function setCursor(cursorStyle) {
        mapMapbox.getCanvas().style.cursor = cursorStyle;
    }

    mapMapbox.on("dragstart", () => setCursor("move"));
    mapMapbox.on("dragend", () => setCursor("default"));
    mapMapbox.on("mousedown", () => setCursor("pointer"));
    mapMapbox.on("mouseup", () => setCursor("default"));
    mapMapbox.on("mouseover", () => setCursor("default"));

    // Agregar marcador al hacer click cuando se es usuario y no es editor #################################################
    function addMarkerToMap(lngLat) {
        if (currentMarker) {
            currentMarker.remove();
        }
        let savedColor = localStorage.getItem("data-color_rgb");
        currentMarker = new mapboxgl.Marker({
            color: savedColor || "#3b71ca",
            draggable: false,
        })
            .setLngLat(lngLat)
            .addTo(mapMapbox);
    }
    if (mapElement.classList.contains("map_user")) {
        mapMapbox.on("click", function (e) {
            const lngLat = e.lngLat;
            addMarkerToMap(lngLat);
        });
    }

    // Cambiar estilo del mapa ########################################################
    inputsLayer.forEach((input) => {
        input.addEventListener("click", function (layer) {
            const layerId = layer.target.id;
            updateLabelsAndInputs(layerId);
            saveRouteLayers();

            setMapStyle(layerId);
        });
    });

    // Cargar datos de Marcadores ####################
    const dataMarkers = document.querySelector("#map").getAttribute("data-mapa_markers");
    fetch(dataMarkers)
        .then((response) => response.json())
        .then((data) => {
            mapMapbox.on("click", (e) => {
                if (mapElement.classList.contains("map_editing")) {
                    const features = mapMapbox.queryRenderedFeatures(e.point, {
                        layers: data.map((item) => `points${item.nombre.replace(" ", "")}`),
                    });

                    if (features.length) {
                        const feature = features[0];
                        const { nombre, imagen, uuid, ismarker, icon_size, edges } = feature.properties;
                        const coordinates = feature.geometry.coordinates.slice();

                        const offcanvasContent = document.getElementById("offcanvasContent");
                        document.getElementById("imagen_actual").src = imagen;

                        $("#btnDeletedPleace").show();
                        $("[data-namePleace]").text(nombre);

                        offcanvasContent.querySelector("#isNewEdif").value = "notnew";

                        if (ismarker) {
                            $("#ismarker").val("True");
                            $("#checkIsmarker").attr("checked", "checked");
                            $("#sizemarkerdiv").slideDown("fast");
                            $("[data-notmarker]").slideUp();
                            $('[for="puertaCordsEdificio"]').text("Ubicacion:");
                        } else {
                            $("#ismarker").val("False");
                            $("#checkIsmarker").removeAttr("checked");
                        }

                        $("#hidename").slideUp();
                        $("[data-uuid]").addClass("active").val(uuid);
                        $("#nombreEdificio").addClass("active").val(nombre);
                        $("#sizemarker").addClass("active").val(icon_size);
                        $("#puertaCordsEdificio").addClass("active").val(`${coordinates}`);

                        $('[for="fotoEdificio"]').html('Cambiar foto <i class="fa-regular fa-image ms-1"></i>');
                        $("#fotoEdificio").attr("required", false);

                        $("#esquina1").addClass("active").val(edges[0]);
                        $("#esquina2").addClass("active").val(edges[1]);
                        $("#esquina3").addClass("active").val(edges[2]);
                        $("#esquina4").addClass("active").val(edges[3]);

                        var canvasGalery = document.getElementById("pleaceGalery");
                        var bsOffcanvasGalery = bootstrap.Offcanvas.getInstance(canvasGalery);
                        if (bsOffcanvasGalery) {
                            bsOffcanvasGalery.hide();
                        }

                        offcanvasInstance.show();
                        offcanvasOpen = true;
                    }
                }
            });
        })
        .catch((error) => {
            console.error("Error al obtener Marcadores del mapa:");
            console.error(error);
            alertSToast("top", 5000, "error", "Ocurrio un error inesperado. #403");
        });

    // Cargar datos de lugares ##################################################################
    const dataPleaces = document.querySelector("#map").getAttribute("data-mapa_edif");
    fetch(dataPleaces)
        .then((response) => response.json())
        .then((data) => {
            const geojsonEdificios = {
                type: "FeatureCollection",
                features: data.map((item) => ({
                    type: "Feature",
                    properties: {
                        uuid: item.uuid,
                        color: item.color,
                        label: item.hidename ? "" : item.nombre,
                        nombre: item.nombre,
                        door: item.door_coords,
                        ismarker: item.ismarker,
                        imagen_url: item.imagen_url,
                        informacion: item.informacion,
                        galery_count: item.galery_count,
                        galery_items: item.galery_items,
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [[item.polygons[0], item.polygons[1], item.polygons[2], item.polygons[3], item.polygons[0]]],
                    },
                })),
            };

            // Abrir offcanvas: Informacion del edificio
            mapMapbox.on("click", "places-layer", (e) => {
                const feature = e.features[0];
                const { nombre, informacion, imagen_url, galery_count, galery_items } = feature.properties;
                const { coordinates } = feature.geometry;
                // let galeryObj = JSON.parse(galery_items);

                if (mapElement.classList.contains("map_editing")) {
                    $("#offcanvasContent input").removeClass("active is-invalid is-valid").val("");
                    $(".error.bg-danger").slideUp("fast");
                    const { color, door, uuid, ismarker, label } = feature.properties;

                    if ($("#checkIsmarker").is(":checked")) {
                        $("#sizemarkerdiv").slideUp();
                        $("[data-notmarker]").slideDown();
                        $('[for="puertaCordsEdificio"]').text("Punto de entrada:");
                    }
                    $("#btnDeletedPleace").show();
                    $("#btnOpenGalery").slideDown();
                    $("[data-namePleace]").text(nombre);
                    $("#galeryCount").text(galery_count);
                    $("#isNewEdif").val("notnew");
                    $("#sizemarker").val("0.5");

                    if (ismarker) {
                        $("#ismarker").val("True");
                        $("#checkIsmarker").attr("checked", "checked");
                    } else {
                        $("#ismarker").val("False");
                        $("#checkIsmarker").removeAttr("checked");
                    }

                    $("#hidename").slideDown();
                    if (label != "") {
                        $("#hidename").attr("checked", "checked");
                    } else {
                        $("#hidename").removeAttr("checked");
                    }

                    $("[data-uuid]").addClass("active").val(uuid);
                    $("#nombreEdificio").addClass("active").val(nombre);
                    $(".name_pleace").text(nombre);

                    const numeros = door.slice(1, -1).split(",");
                    $("#puertaCordsEdificio").addClass("active").val(`${numeros[0]},${numeros[1]}`);

                    $("#esquina1").addClass("active").val(coordinates[0][0]);
                    $("#esquina2").addClass("active").val(coordinates[0][1]);
                    $("#esquina3").addClass("active").val(coordinates[0][2]);
                    $("#esquina4").addClass("active").val(coordinates[0][3]);

                    $('[for="fotoEdificio"]').html('Cambiar foto <i class="fa-regular fa-image ms-1"></i>');
                    $("#fotoEdificio").attr("required", false);
                    tinymce.get("textTiny").setContent(informacion);
                }

                offcanvasInstance.show();
                offcanvasOpen = true;
            });
        })
        .catch((error) => {
            console.error("Error al obtener lugares del mapa:");
            console.error(error);
            alertSToast("top", 5000, "error", "Ocurrio un error inesperado. #403");
        });
});
