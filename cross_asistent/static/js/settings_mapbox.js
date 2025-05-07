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

    const offcanvasElement = document.querySelector("#infoLateral");
    const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasElement) || new bootstrap.Offcanvas(offcanvasElement);

    mapboxgl.accessToken = mapToken;
    const mapMapbox = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-100.93655, 25.55701],
        zoom: 16,
        maxZoom: 20,
        minZoom: 15,
        maxBounds: [
            [-100.9736, 25.5142],
            [-100.9117, 25.5735],
        ],
    });

    // Controles de localizacion ########################################
    const locateUser = new mapboxgl.GeolocateControl({
        positionOPtions: { enableHighAccuracy: true },
        trackUserLocation: true,
        ShowUserHeading: true,
    });

    mapMapbox.addControl(locateUser);

    // Cambiar Estilo con switch de tema ######################################
    $("#switchTheme").click(function () {
        if ($("#switchTheme").is(":checked")) {
            colorlabels = "#000";
            setMapStyle("streets-v12");
            updateLabelsAndInputs("streets-v12");
        } else {
            colorlabels = "#fff";
            setMapStyle("dark-v11");
            updateLabelsAndInputs("dark-v11");
        }
    });

    // Detectar cuando un offcanvas se cierra
    offcanvasElement.addEventListener("hidden.bs.offcanvas", function () {
        offcanvasOpen = false;
    });
    // Cuando se cierra el modal de eliminar
    $("#deletePleace").on("hidden.bs.modal", function (e) {
        $("#btnDeletedPleace").hide();
        $("[data-namePleace]").text("");
    });

    // Crear nuevo menu de botones personalizados ########################################
    mapMapbox.addControl(new mapboxgl.NavigationControl());
    class CustomControl {
        constructor() {
            this._container = null;
        }

        onAdd(mapMapbox) {
            this._container = document.createElement("div");
            this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

            const createButton = (className, innerHTML, title, onClick) => {
                const button = document.createElement("button");
                button.className = "mapboxgl-ctrl-" + className;
                button.innerHTML = innerHTML;
                button.title = title;
                button.type = "button";
                button.onclick = onClick;
                return button;
            };
            const linkmaps = createButton("gmaps", `<div class="mapboxgl-ctrl-icon"><i class="fa-solid fa-map-location-dot"></i></div>`, "Google Maps", () => {
                document.querySelectorAll(".offcanvas.show").forEach((openOffcanvasElement) => {
                    const openOffcanvasInstance = bootstrap.Offcanvas.getInstance(openOffcanvasElement);
                    if (openOffcanvasInstance) {
                        openOffcanvasInstance.hide();
                    }
                });
                var myModal = new mdb.Modal(document.getElementById("beforeSend"));
                myModal.show();
            });
            const layers = createButton("styles", '<i class="fa-solid fa-layer-group"></i>', "Cambiar Aspecto", () => {
                document.querySelectorAll(".offcanvas.show").forEach((openOffcanvasElement) => {
                    const openOffcanvasInstance = bootstrap.Offcanvas.getInstance(openOffcanvasElement);
                    if (openOffcanvasInstance) {
                        openOffcanvasInstance.hide();
                    }
                });
                const offcanvasElement = new bootstrap.Offcanvas(document.querySelector("#offcanvasBottom"));
                offcanvasElement.show();
            });
            const btnroute = createButton("route", '<div class="mapboxgl-ctrl-icon"><i class="fa-solid fa-route"></i></div>', "Como ir a...", () => $("#controlsRoute").toggleClass("show"));

            // Agregar botones al contenedor personalizado
            this._container.appendChild(linkmaps);
            this._container.appendChild(layers);
            this._container.appendChild(btnroute);

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
            function createMarkers() {
                data.forEach((item) => {
                    const nameImage = item.nombre.replace(" ", "");

                    if (!mapMapbox.getSource(item.uuid)) {
                        mapMapbox.addSource(item.uuid, {
                            type: "geojson",
                            data: {
                                type: "FeatureCollection",
                                features: [
                                    {
                                        type: "Feature",
                                        properties: {
                                            uuid: item.uuid,
                                            nombre: item.nombre,
                                            imagen: item.imagen,
                                            ismarker: item.ismarker,
                                            icon_size: item.icon_size,
                                            sizemarker: item.sizemarker,
                                            edges: [[item.edges[0], item.edges[1], item.edges[2], item.edges[3]]],
                                        },
                                        geometry: {
                                            type: "Point",
                                            coordinates: item.coords,
                                        },
                                    },
                                ],
                            },
                        });
                    }

                    if (!mapMapbox.hasImage(nameImage)) {
                        mapMapbox.loadImage(item.imagen, (error, image) => {
                            if (error) throw error;
                            mapMapbox.addImage(nameImage, image);
                        });
                    }

                    if (!mapMapbox.getLayer(`points${nameImage}`)) {
                        mapMapbox.addLayer({
                            id: `points${nameImage}`,
                            type: "symbol",
                            source: item.uuid,
                            layout: {
                                "icon-image": nameImage,
                                "icon-size": item.icon_size,
                                "icon-allow-overlap": true,
                            },
                        });
                        // mapMapbox.moveLayer("places-label", `points${nameImage}`);
                    }
                });
            }
            mapMapbox.on("load", () => {
                createMarkers();
            });
            mapMapbox.on("style.load", () => {
                createMarkers();
            });
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

                        // $('[for="fotoEdificio"]').html('Cambiar foto <i class="fa-regular fa-image ms-1"></i>');
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
                        door: item.coords,
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

            function createEdificios() {
                if (!mapMapbox.getSource("places")) {
                    mapMapbox.addSource("places", {
                        type: "geojson",
                        data: geojsonEdificios,
                    });
                }

                if (!mapMapbox.getLayer("places-layer")) {
                    mapMapbox.addLayer({
                        id: "places-layer",
                        type: "fill",
                        source: "places",
                        paint: {
                            "fill-color": ["get", "color"],
                            "fill-opacity": 0.4,
                        },
                    });
                }

                // Agregar capa para las etiquetas
                if (!mapMapbox.getLayer("places-label")) {
                    mapMapbox.addLayer({
                        id: "places-label",
                        type: "symbol",
                        source: "places",
                        layout: {
                            "text-field": ["get", "label"],
                            "text-size": 12,
                            "text-offset": [0, -0.6],
                            "text-anchor": "top",
                        },
                        paint: {
                            "text-color": colorlabels,
                        },
                    });
                    mapMapbox.moveLayer("places-label");
                }
            }
            function calcularRuta() {
                const origen = selectOrigin.value;
                const destino = selectDestiny.value;

                if (origen && destino && origen !== destino) {
                    const origenFeature = geojsonEdificios.features.find((feature) => feature.properties.nombre === origen);
                    const destiFeature = geojsonEdificios.features.find((feature) => feature.properties.nombre === destino);

                    if (origenFeature && destiFeature) {
                        const origenCoords = origenFeature.properties.door;
                        const destinoCoords = destiFeature.properties.door;

                        directions.setOrigin(origenCoords);
                        directions.setDestination(destinoCoords);
                        $("#buttons_route").slideDown("slow");

                        directions.on("route", (e) => {
                            const routeGeoJSON = {
                                type: "FeatureCollection",
                                features: e.route.map((r) => ({
                                    type: "Feature",
                                    geometry: r.geometry,
                                    properties: {},
                                })),
                            };
                            currentRoute = routeGeoJSON;

                            const rawDistance = e.route[0].distance; // en metros
                            const rawDuration = e.route[0].duration; // en segundos

                            // Formato de distancia
                            let distanceStr;
                            if (rawDistance < 1000) {
                                distanceStr = `${Math.round(rawDistance)} m`;
                            } else {
                                distanceStr = `${(rawDistance / 1000).toFixed(2)} km`;
                            }

                            // Formato de duración
                            const minutes = Math.floor(rawDuration / 60);
                            const seconds = Math.round(rawDuration % 60);

                            let durationStr;
                            if (seconds === 0) {
                                durationStr = `${minutes} min`;
                            } else if (minutes === 0) {
                                durationStr = `${seconds} s`;
                            } else {
                                durationStr = `${minutes}:${seconds.toString().padStart(2, "0")} min`;
                            }

                            // Mostrar en HTML
                            $("#route-info").html(
                                `<div class="row">
                                    <div class="col-1 mb-2">
                                        <i class="fa-solid fa-shoe-prints me-1"></i>
                                    </div>
                                    <div class="col-10 mb-2">
                                        Distancia: <strong>${distanceStr}</strong>
                                    </div>
                                
                                    <div class="col-1">
                                        <i class="fa-solid fa-hourglass-half me-1"></i>
                                    </div>
                                    <div class="col-10">
                                        Duración: <strong>${durationStr} aprox.</strong>
                                    </div>
                                </div>`
                            );
                            $("#route-info").slideDown();
                        });

                        if (window.innerWidth <= 800) {
                            setTimeout(() => {
                                $("#controls_route").removeClass("show");
                            }, 4000);
                        }

                        mapMapbox.addControl(directions, "top-left");
                        mapMapbox.moveLayer("places-label");
                        addRouteLayer();
                    }
                } else {
                    alertSToast("center", 5000, "warning", "Por favor, selecciona tanto origen como destino.");
                }
            }
            function addRouteLayer() {
                if (currentRoute && currentRoute.features && currentRoute.features.length > 0) {
                    if (!mapMapbox.getSource("directions")) {
                        mapMapbox.addSource("directions", {
                            type: "geojson",
                            data: currentRoute,
                        });
                    }

                    const originFeature = currentRoute.features.find((feature) => feature.properties.id === "origin");
                    const destFeature = currentRoute.features.find((feature) => feature.properties.id === "destination");

                    // Agregar capa de línea de ruta
                    if (!mapMapbox.getLayer("directions-route-line")) {
                        mapMapbox.addLayer({
                            id: "directions-route-line",
                            type: "line",
                            source: "directions",
                            layout: {
                                "line-cap": "round",
                                "line-join": "round",
                            },
                            paint: {
                                "line-color": "#2d5f99",
                                "line-width": 12,
                            },
                            filter: ["==", "$type", "LineString"],
                        });
                    }

                    // Agregar capa de línea de ruta
                    if (!mapMapbox.getLayer("directions-route-line-alt")) {
                        mapMapbox.addLayer({
                            id: "directions-route-line-alt",
                            type: "line",
                            source: "directions",
                            layout: {
                                "line-cap": "round",
                                "line-join": "round",
                            },
                            paint: {
                                "line-color": "#4882c5",
                                "line-width": 6,
                            },
                            filter: ["==", "$type", "LineString"],
                        });
                    }

                    // Agregar capa de punto de origen
                    if (!mapMapbox.getLayer("directions-origin-point")) {
                        mapMapbox.addLayer({
                            id: "directions-origin-point",
                            type: "circle",
                            source: "directions",
                            paint: {
                                "circle-color": "#3bb2d0",
                                "circle-radius": 20,
                            },
                            filter: ["==", ["get", "id"], "origin"],
                        });
                    }

                    // Agregar capa de punto de destino
                    if (!mapMapbox.getLayer("directions-destination-point")) {
                        mapMapbox.addLayer({
                            id: "directions-destination-point",
                            type: "circle",
                            source: "directions",
                            paint: {
                                "circle-color": "#8a8bc9",
                                "circle-radius": 20,
                            },
                            filter: ["==", ["get", "id"], "destination"],
                        });
                    }

                    // Agregar etiqueta de punto de origen
                    if (!mapMapbox.getLayer("directions-origin-label")) {
                        mapMapbox.addLayer({
                            id: "directions-origin-label",
                            type: "symbol",
                            source: "directions",
                            layout: {
                                "text-field": originFeature.properties["marker-symbol"],
                                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                                "text-size": 18,
                            },
                            paint: {
                                "text-color": "#fff",
                            },
                            filter: ["==", ["get", "id"], "origin"],
                        });
                    }

                    // Agregar etiqueta de punto de destino
                    if (!mapMapbox.getLayer("directions-destination-label")) {
                        mapMapbox.addLayer({
                            id: "directions-destination-label",
                            type: "symbol",
                            source: "directions",
                            layout: {
                                "text-field": destFeature.properties["marker-symbol"],
                                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                                "text-size": 18,
                            },
                            paint: {
                                "text-color": "#fff",
                            },
                            filter: ["==", ["get", "id"], "destination"],
                        });
                    }

                    mapMapbox.moveLayer("places-label");
                }
            }
            function getParamsFromURL() {
                const params = new URLSearchParams(window.location.search);
                return {
                    origin: params.get("origin"),
                    destiny: params.get("destiny"),
                };
            }

            mapMapbox.on("load", function () {
                createEdificios();
            });
            mapMapbox.on("style.load", function () {
                createEdificios();
                addRouteLayer();
            });

            // Abrir offcanvas: Informacion del edificio
            mapMapbox.on("click", "places-layer", (e) => {
                const feature = e.features[0];
                const { nombre, informacion, imagen_url, galery_count, galery_items } = feature.properties;
                const { coordinates } = feature.geometry;
                // let galeryObj = JSON.parse(galery_items);

                const offcanvasContent = document.getElementById("offcanvasContent");
                if (imagen_url) {
                    document.getElementById("imagen_actual").src = `/media/${imagen_url}`;
                }

                if (mapElement.classList.contains("map_user")) {
                    document.getElementById("lateralTitle").innerText = nombre;
                    offcanvasContent.innerHTML = `<div class="feature-info"><p>${informacion}</p></div>`;

                    // const imageGaleryCont = document.getElementById("offcanvasGalery");
                    // imageGaleryCont.innerHTML = "";

                    // galeryObj.forEach((item) => {
                    //     const imageGalery = `<img loading="lazy" src="${item.imagen}" id="img_${item.id}" class="img-fluid img-rounded unfocus-4 none">`;
                    //     imageGaleryCont.insertAdjacentHTML("beforeend", imageGalery);
                    //     const thisItem = $(`#img_${item.id}`);

                    //     setTimeout(() => {
                    //         thisItem.slideDown();
                    //         setTimeout(() => {
                    //             thisItem.removeClass("unfocus-4");
                    //         }, item.id * 40);
                    //     }, item.id * 20);
                    // });
                } else if (mapElement.classList.contains("map_editing")) {
                    $("#offcanvasContent input").removeClass("active is-invalid is-valid").val("");
                    $(".error.bg-danger").slideUp("fast");
                    const { color, door, uuid, ismarker, label } = feature.properties;

                    if ($("#checkIsmarker").is(":checked")) {
                        $("#sizemarkerdiv").slideUp();
                        $("[data-notmarker]").slideDown();
                        // $('[for="puertaCordsEdificio"]').text("Punto de entrada:");
                    }
                    $("#btnDeletedPleace").show();
                    $("#btnOpenGalery").slideDown();
                    $("[data-namePleace]").text(nombre);
                    $("#galeryCount").text(galery_count);
                    $("#isNewEdif").val("notnew");
                    $("#sizemarker").val("0.5");
                    $("#colorPicker").val(color);
                    pickr.setColor(color);

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

                    // $('[for="fotoEdificio"]').html('Cambiar foto <i class="fa-regular fa-image ms-1"></i>');
                    $("#fotoEdificio").attr("required", false);
                    tinymce.get("textTiny").setContent(informacion);

                    //     // Galeria #############################################
                    //     if (window.innerWidth <= 800) {
                    //         setTimeout(() => {
                    //             var canvasGalery = document.getElementById("pleaceGalery");
                    //             var bsOffcanvasGalery = bootstrap.Offcanvas.getInstance(canvasGalery);
                    //             if (bsOffcanvasGalery) {
                    //                 bsOffcanvasGalery.hide();
                    //             }
                    //         }, 100);
                    //     }

                    //     const imageListGalery = document.getElementById("image-list-galery");
                    //     const deleteImgUrl = imageListGalery.getAttribute("data-galery-del");
                    //     document.getElementById("image-list").innerHTML = "";
                    //     imageListGalery.innerHTML = "";

                    //     galeryObj.forEach((item) => {
                    //         const imgFile = item.imagen;
                    //         let imgName = imgFile.replace("/media/imagenes/", "");
                    //         imgName = imgName.split(".");

                    //         const imageItemGalery = `<div id="img_galery_${
                    //             item.id
                    //         }" class="image-item"><img loading="lazy" src="${imgFile}" class="img-rounded unfocus-5"><div class="fs-8"><p class="name-file m-0">${imgName[0]}</p><p class="size-file m-0">(${
                    //             imgName[1]
                    //         }) ${formatBytes(item.img_size)}</p></div><form action="${deleteImgUrl}" method="post" autocomplete="off" data-submit-galery><input type="hidden" name="id" value="${
                    //             item.id
                    //         }"><input type="hidden" name="uuid" value="${uuid}"><button type="submit" id="btnDelImg_${
                    //             item.id
                    //         }" class="btn btn-danger btn-floating"><i class="fa-regular fa-trash-can tscale-1-4"></i></button></form></div>`;
                    //         imageListGalery.insertAdjacentHTML("beforeend", imageItemGalery);

                    //         const thisItem = document.querySelector(`#img_galery_${item.id}`);
                    //         const thisItemImg = document.querySelector(`#img_galery_${item.id} img`);
                    //         const delGaleryButton = document.querySelector(`#btnDelImg_${item.id}`);

                    //         setTimeout(() => {
                    //             thisItem.classList.add("visible");
                    //             setTimeout(() => {
                    //                 thisItemImg.classList.remove("unfocus-5");
                    //             }, item.id * 40);
                    //         }, item.id * 20);

                    //         delGaleryButton.addEventListener("click", () => {
                    //             thisItem.classList.remove("visible");
                    //             setTimeout(() => {
                    //                 thisItem.remove();
                    //             }, 1000);
                    //         });
                    //     });
                    //     $("[data-submit-galery]").submit(jsonSubmit);
                }

                offcanvasInstance.show();
                offcanvasOpen = true;
            });

            const nombresEdificios = geojsonEdificios.features.map((feature) => feature.properties.nombre).sort();
            nombresEdificios.forEach((nombre) => {
                const option = new Option(nombre, nombre);
                document.getElementById("origen").add(option);
                document.getElementById("destino").add(option.cloneNode(true));
            });
            selectOrigin.addEventListener("change", function () {
                const seleccionOrigen = this.value;

                selectDestiny.querySelectorAll("option").forEach((option) => {
                    option.disabled = option.value === seleccionOrigen;
                });

                const params = new URLSearchParams(window.location.search);
                params.set("origin", seleccionOrigen);
                history.replaceState({}, "", `${location.pathname}?${params}`);

                if (selectDestiny.value) {
                    calcularRuta();
                }
            });

            selectDestiny.addEventListener("change", function () {
                const seleccionDestino = this.value;

                selectOrigin.querySelectorAll("option").forEach((option) => {
                    option.disabled = option.value === seleccionDestino;
                });

                const params = new URLSearchParams(window.location.search);
                params.set("destiny", seleccionDestino);
                history.replaceState({}, "", `${location.pathname}?${params}`);

                if (selectOrigin.value) {
                    calcularRuta();
                }
            });

            const { origin, destiny } = getParamsFromURL();
            if (origin && destiny && origin !== destiny) {
                const origenValido = geojsonEdificios.features.find((f) => f.properties.nombre === origin);
                const destinoValido = geojsonEdificios.features.find((f) => f.properties.nombre === destiny);

                if (origenValido && destinoValido) {
                    const originOption = selectOrigin.querySelector(`option[value="${origin}"]`);
                    const destinyOption = selectDestiny.querySelector(`option[value="${destiny}"]`);

                    if (originOption) {
                        originOption.selected = true;
                        selectOrigin.dispatchEvent(new Event("change"));
                    }

                    setTimeout(() => {
                        if (destinyOption) {
                            destinyOption.selected = true;
                            selectDestiny.dispatchEvent(new Event("change"));
                        }

                        calcularRuta();
                    }, 3000);
                }
            }

            document.querySelector("[data-reset_form]").addEventListener("click", function () {
                formRoute.querySelectorAll("option").forEach((option) => {
                    option.disabled = false;
                });

                // Verificar si las capas de la ruta existen y removerlas
                const routeLayers = [
                    "directions-route-line",
                    "directions-route-line-alt",
                    "directions-route-line-casing",
                    "directions-hover-point-casing",
                    "directions-hover-point",
                    "directions-waypoint-point-casing",
                    "directions-waypoint-point",
                    "directions-origin-point",
                    "directions-origin-label",
                    "directions-destination-point",
                    "directions-destination-label",
                ];
                routeLayers.forEach((layer) => {
                    if (mapMapbox.getLayer(layer)) {
                        mapMapbox.removeLayer(layer);
                    }
                });

                // Verificar si la fuente de la ruta existe y removerla
                if (mapMapbox.getSource("directions")) {
                    mapMapbox.removeSource("directions");
                }

                $("#buttons_route").slideUp("slow");
                $("#route-info").slideUp("slow", () => {
                    $("#route-info").empty();
                });

                const params = new URLSearchParams(window.location.search);
                params.delete("origin");
                params.delete("destiny");
                history.replaceState({}, "", `${location.pathname}?${params.toString()}`);
            });
        })
        .catch((error) => {
            console.error("Error al obtener lugares del mapa:");
            console.error(error);
            alertSToast("top", 5000, "error", "Ocurrio un error inesperado. #403");
        });

    // Dibujar poligonos con mapbox Draw ###########################################
    if (mapElement.classList.contains("map_editing")) {
        const draw = new MapboxDraw({
            displayControlsDefault: false,
        });

        mapMapbox.addControl(draw);

        mapMapbox.on("draw.create", updateArea);
        mapMapbox.on("draw.delete", updateArea);
        mapMapbox.on("draw.update", updateArea);

        $("#btnPoligon").click(function () {
            $("#controlsIndic").addClass("show");
            draw.changeMode("draw_polygon");
        });

        $("#delPoligon").click(function () {
            $("#controlsIndic").removeClass("show");
            const all = draw.getAll();
            if (all.features.length > 0) {
                all.features.forEach((feature) => {
                    draw.delete(feature.id);
                });
            }
        });

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
                $("#coords").val(JSON.stringify(coordinates));

                // Calcular perímetro (longitud del borde)
                const perimeter = turf.length(polygon, { units: "kilometers" });
                const rounded_perimeter = Math.round(perimeter * 1000 * 100) / 100; // en metros

                // Calcular centroide (centro geométrico)
                const centroid = turf.centroid(polygon);

                // Mostrar resultados
                $("#controlsIndic .card-body p").html(`
                    <p><strong>Área:</strong> ${rounded_area} m²</p>
                    <p><strong>Perímetro:</strong> ${rounded_perimeter} m</p>
                    <p><strong>Centroide:</strong> [${centroid.geometry.coordinates.map((c) => c).join(", ")}]</p>
                    <p><strong>Puntos del polígono:</strong></p>
                    <ol>${coordinates.map((coord) => `<li>[${coord[0]}, ${coord[1]}]</li>`).join("")}</ol>
                `);
                    // <ol>${coordinates.map((coord) => `<li>[${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}]</li>`).join("")}</ol>
            } else {
                $("#controlsIndic").removeClass("show");
                $("#controlsIndic .card-body p").html("");
                if (e.type !== "draw.delete") alert("Haz clic en el mapa para dibujar un polígono.");
            }
        }
    }
});
