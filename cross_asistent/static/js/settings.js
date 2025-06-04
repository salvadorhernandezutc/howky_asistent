var alfabetico = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var alfanumerico = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890123456789";
var caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890123456789@$!%*.?&";
var texto3 = /[a-zA-Z0-9]{3}/;
var formToken = getCSRFToken();
var timerOut = 5000;
var expressions = {
    name: /^[a-zA-ZÀ-ÿ\s]+$/,
    username: /^(?![0-9_-])[a-zA-Z0-9_-]+$/,
    email: /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*.?&])[A-Za-z\d@#<>:;$!%*.?&]{8,}$/,
    title: /^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ0-9\s\-_#]*$/,
};

function getCSRFToken() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        if (cookie.substring(0, 10) == "csrftoken" + "=") {
            return decodeURIComponent(cookie.substring(10));
        }
    }
    const csrfCookie = $("[name=csrfmiddlewaretoken]").val();
    return csrfCookie;
}

// ##############################################################################################
// ###################################### Funciones Jquery ######################################
// ##############################################################################################
$(document).ready(function () {
    try {
        $("#overlayMenu").click(() => {
            $("nav button.navbar-toggler").click();
        });
        // Filtro de busqueda ###################################################################
        var input = $("#searchInput");
        function filtertable() {
            var value = input.val().toLowerCase();
            $("#searchInput").text(value);
            var result = $(".results_item").filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
                return $(this).is(":visible");
            }).length;
        }
        input.on("input", filtertable);

        // iniciar sesion ####################################################
        // Crea usuario nuevo desde programador ##############################
        // Registrar un nuevo articulo con TinyMCE ###########################
        $("[data-submit-form]").submit(jsonSubmit);
        if ($("[data-submit-form]").is("[data-submit-ready]")) {
            setTimeout(() => {
                $('[data-submit-ready] button[type="submit"]').click();
            }, 2000);
        }

        $("[data-submit-blur] .input_blur").on("blur", function () {
            let formulario = $(this).closest("[data-submit-blur]");
            let idButton = formulario.data("submit-blur");
            formulario.find(`button#${idButton}`).click();
        });
        $("[data-submit-blur] .input_change").on("change", function () {
            let formulario = $(this).closest("[data-submit-blur]");
            let idButton = formulario.data("submit-blur");
            setTimeout(() => {
                formulario.find(`button#${idButton}`).click();
            }, 1000);
        });

        $("[data-submit-click]").on("click", function () {
            const btnSubmitThis = $(this).data("submit-click");
            $("#" + btnSubmitThis)
                .click()
                .attr("disabled", "disabled");

            if (!disabledButtons.includes(btnSubmitThis)) {
                disabledButtons.push(btnSubmitThis);
            }
            localStorage.setItem("disabledButtons", JSON.stringify(disabledButtons));
        });

        // Editar/Crear usuario
        // generar nueva contraseña aleatoria #################################
        $("button[data-editinput]").click(function () {
            $(this).addClass("active");
            var newRandomPass = cadenaRandom(10, caracteres);
            var editInputId = $(this).data("editinput");
            setTimeout(() => {
                $(this).removeClass("active");
            }, 1000);
            $("#" + editInputId)
                .val(`UTC#${newRandomPass}`)
                .addClass("active");
        });

        // Toggle de la clase show #####################################
        $("[data-btn_closed]").on("click", function () {
            const targetId = $(this).data("btn_closed");
            $(targetId).toggleClass("show");

            if (targetId.includes("slide")) {
                $(targetId).slideToggle("slow");
            }
        });
        $(document).on("click", "[data-toggle-class]", function () {
            const itemData = $(this).attr("data-toggle-class").split("-");
            const itemSelector = itemData[0];
            const itemClass = itemData[1];

            if (itemClass == "slide") {
                $(itemSelector).slideToggle("slow");
            } else {
                $(itemSelector).toggleClass(itemClass);
            }
        });

        // Remover item #####################################
        $("[data-remove-item]").on("click", function () {
            var thisItemtId = $(this).data("remove-item");
            setTimeout(() => {
                $("#" + thisItemtId).slideUp("fast");
                setTimeout(() => {
                    $("#" + thisItemtId).remove();
                }, 500);
            }, 1000);
        });

        // Transferir Cick #####################################
        $("[data-transfer-click]").on("click", function () {
            const btnThisId = $(this).data("transfer-click");
            const btnClickId = $("#" + btnThisId);
            btnClickId.click();
        });

        // Resetear formulario / vaciar todo el formulario
        $("[data-reset_form]").on("click", resetForm);
        function resetForm() {
            var formId = $(this).data("reset_form");
            var formElement = $("#" + formId)[0];
            if (formElement) formElement.reset();
        }

        // Estilo Texto Google ####################################
        function colorizeGoogle() {
            const colors = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"];
            const googleSpan = $(".style_google");
            const text = googleSpan.text();

            googleSpan.empty();
            for (let i = 0; i < text.length; i++) {
                googleSpan.append(`<span style="color:${colors[i]}">${text[i]}</span>`);
            }
        }
        colorizeGoogle();

        // Cerrar sweetalert toas con ESC ####################################################
        $(document).on("keydown", function (event) {
            if (event.key === "Escape" || event.keyCode === 27) {
                Swal.close();
            }
        });

        // Limpiar valor de input ##################################################################
        const inputCleared = $("input[data-init-clear], textarea[data-init-clear]");
        inputCleared.each(function () {
            $(this).on("input", function () {
                let idInput = $(this).attr("id");
                let btnCleared = $(`[data-clear="${idInput}"]`);

                if ($(this).val() == "") {
                    btnCleared.hide();
                } else {
                    btnCleared.show();
                }
            });
        });
        const btnCleared = $("[data-clear]");
        btnCleared.on("click", function () {
            const dataClear = $(this).attr("data-clear");
            $(`#${dataClear}`).val("");
            $(this).slideUp("fast");
        });

        // Interfaz #########################################################
        // Cambiar colores de la Interfaz
        $("[data-change-color]").on("click", function () {
            $("[data-change-color]").each(function (index, item) {
                $(item).removeClass("active");
            });
            var color = $(this).addClass("active").data("change-color");
            var rgb = $(this).data("rgb");
            $("html").attr("data-color_prefer", color);
            localStorage.setItem("data-color_prefer", color);
            localStorage.setItem("data-color_rgb", rgb);
        });
        const colorPrefer = localStorage.getItem("data-color_prefer");
        if (colorPrefer) {
            $(`[data-change-color="${colorPrefer}"]`).addClass("active");
            $("html").attr("data-color_prefer", colorPrefer);
        } else {
            $('[data-change-color="blue"]').addClass("active");
            $("html").attr("data-color_prefer", "blue");
        }
        // Cambiar tema
        const switchTheme = $("#switchTheme");
        const switchText = $("#switchText");
        const htmlElement = $("html");

        const applyTheme = (theme) => {
            const themeConfig = {
                light: {
                    text: "Claro",
                    dataAttr: "light",
                    lastLayer: "light-v11",
                },
                dark: {
                    text: "Oscuro",
                    dataAttr: "dark",
                    lastLayer: "dark-v11",
                },
            };

            const config = themeConfig[theme];
            switchText.text(config.text);
            htmlElement.attr("data-mdb-theme", config.dataAttr);
            localStorage.setItem("data-mdb-theme", config.dataAttr);
            localStorage.setItem("mapbox-last_layer", config.lastLayer);
            switchTheme.prop("checked", theme === "light");
        };

        // Manejar el evento de click del switch
        switchTheme.on("click", function () {
            applyTheme(switchTheme.is(":checked") ? "light" : "dark");
        });

        // Cargar el tema desde localStorage al iniciar
        const colorTheme = localStorage.getItem("data-mdb-theme");
        if (colorTheme) {
            applyTheme(colorTheme);
        }

        // Colocar imagen del input file en DOM #############################################
        function readURL(input, elementId) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $(`#${elementId}`).attr("src", e.target.result);
                };
                reader.readAsDataURL(input.files[0]);
            }
        }
        $("[data-img_dom]").change(function () {
            idImgDom = $(this).data("img_dom");
            readURL(this, idImgDom);
        });

        // Inputs del perfil ##########################################################
        $("[data-input_transparent]").on({
            focus: function () {
                $(this).toggleClass("input_transparent");
            },
            blur: function () {
                $(this).toggleClass("input_transparent");
            },
        });
        var otherChanges = false;
        function togglePassBlock() {
            if (otherChanges) {
                $("#updatePassBlock").slideUp("fast");
            } else {
                $("#profileSaved").slideUp("fast", function () {
                    $("#updatePassBlock").slideUp("fast");
                });
            }
        }
        // Poner visible la seccion de la password
        $("#updatePassBtn").on("click", function () {
            let thisBtn = $(this);
            $("#updatePassText").toggle();

            if ($("#updatePassBtn").hasClass("bg_blue-green")) {
                $("#profileSaved").slideDown("fast", function () {
                    $("#updatePassBlock").slideDown("fast", function () {
                        $("html, body").scrollTop($(document).height());
                    });
                });
            } else {
                togglePassBlock();
            }
            if (thisBtn.text() == "Cambiar Contraseña") {
                thisBtn.toggleClass("bg_blue-green bg_blue-red");
                thisBtn.text("No Cambiar Contraseña");
                if (!otherChanges) {
                    $("#passwordSend").val("");
                }
                $("#newPass").val("");
                $("#confNewPass").val("");
            } else {
                thisBtn.toggleClass("bg_blue-green bg_blue-red");
                thisBtn.text("Cambiar Contraseña");
            }
        });
        // Detectar cambios en los inputs
        $("[data-input_change]").each(function () {
            const thisInput = $(this);
            const originalNameInput = thisInput.attr("name");
            var oldValueInput = thisInput.val();
            var oldNameInput = originalNameInput;

            thisInput.on("input", function () {
                if (thisInput.val() == oldValueInput) {
                    thisInput.attr("name", `${originalNameInput}`);
                    togglePassBlock();
                    otherChanges = false;
                } else {
                    thisInput.attr("name", `${originalNameInput}Changed`);
                    $("#profileSaved").slideDown("fast");
                    otherChanges = true;

                    if (thisInput.val() == "") {
                        thisInput.attr("name", `${originalNameInput}`);
                    }
                }
            });

            thisInput.on("blur", function () {
                if (thisInput.val() == "") {
                    thisInput.attr("name", `${originalNameInput}`);
                    togglePassBlock();
                    otherChanges = false;
                }
            });

            thisInput.on("click", function () {
                oldNameInput = originalNameInput;
            });
        });
        // Desplegar boton si se elimina la foto de perfil
        $("input#deletePicture").change(function () {
            if ($(this).is(":checked")) {
                $('[for="deletePicture"]').addClass("btn_press");
                $("#profileSaved").slideDown("fast");
                otherChanges = true;
            } else {
                $('[for="deletePicture"]').removeClass("btn_press");
                togglePassBlock();
                otherChanges = false;
            }
        });

        // Editar Evento -Calendario ######################################
        // Cambiar clase del select option
        $("[data-select_addClass]").change(function () {
            const newClass = $(this).val();
            $(this).attr("class", `form-select change_bg ${newClass}`);
        });

        // Poner valor por defecto con blur ######################################
        $("[data-blur-default]").on("blur", function () {
            const setDefault = $(this).attr("data-blur-default");
            const thisValue = $(this).val();
            const newVal = $(this).attr(setDefault);

            if (thisValue == "") {
                $(this).val(newVal);
            }
            if (setDefault == "min" && thisValue < newVal) {
                $(this).val(newVal);
            }
        });

        // Valor del input range ####################
        $('input[type="range"]').on("input", function () {
            const thisId = $(this).attr("id");
            const thisValue = $(this).val();
            $(`[data-range-val="#${thisId}"]`).text(thisValue);
        });

        // Función para obtener los parámetros de la URL
        function getUrlParams() {
            const params = {};
            const queryString = window.location.search.substring(1);
            const pairs = queryString.split("&");

            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i].split("=");
                if (pair.length === 2) {
                    const key = decodeURIComponent(pair[0]);
                    const value = decodeURIComponent(pair[1]);
                    params[key] = value;
                }
            }

            return params;
        }

        // Función principal que evalúa el parámetro "tab"
        function activarTabDesdeParametro() {
            const params = getUrlParams();
            console.log(params);

            if (params.hasOwnProperty("tab")) {
                const selector = params["tab"];
                const $element = $(`#${selector}`);

                if ($element.length) {
                    $element.click();
                }
            }
        }

        if ($("[data-valparams]").length) {
            activarTabDesdeParametro();
        }

        // Cambiar min del siguiente inpput Date ###############################
        $("[data-blur-min]").on("blur", function () {
            const minValue = $(this).val();
            const targetSelector = $(this).attr("data-blur-min");
            $(targetSelector).attr("min", minValue);
        });

        // Sistema para Crear Tags / Etiquetas (Modulos) ###############################
        function initTagGroup($group) {
            const $addTagsInput = $group.find(".addTags");
            const $textareaTags = $group.find(".tags");
            const $tagContainer = $group.find(".allTags");

            function getTags() {
                const val = $textareaTags.val().trim();
                if (!val) return [];

                const cleaned = val
                    .replace(/[\s;:.]+/g, ",")
                    .replace(/,+/g, ",")
                    .replace(/^,|,$/g, "");

                return cleaned
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag !== "");
            }

            function updateTagContainer() {
                $tagContainer.empty();
                const tags = getTags();
                tags.forEach((tag) => {
                    const tagId = tag.replace(/[^a-zA-Z0-9_-]/g, "_");
                    const $tagSpan = $(`
                        <span id="tag-${tagId}" class="badge badge-primary d-flex justify-content-between align-items-center col">
                            ${tag}
                            <button type="button" class="btn-close btn-close-white btn-sm" aria-label="Close" data-tag="${tag}"></button>
                        </span>
                    `);
                    $tagContainer.append($tagSpan);
                });
            }

            function addTag(tag) {
                tag = tag.trim();

                if (!tag || getTags().includes(tag)) {
                    $addTagsInput.addClass("is-invalid");
                    setTimeout(() => {
                        $addTagsInput.removeClass("is-invalid");
                    }, 2000);
                    return;
                }

                const tags = getTags();
                tags.push(tag);
                $textareaTags.val(tags.join(","));
                updateTagContainer();
                $addTagsInput.val("");
            }

            function removeTag(tag) {
                let tags = getTags().filter((t) => t !== tag);
                $textareaTags.val(tags.join(","));
                updateTagContainer();
            }

            $addTagsInput.on("keydown", function (e) {
                if (["Enter", " ", ",", ".", ";", ":"].includes(e.key)) {
                    e.preventDefault();
                    const input = $addTagsInput.val().trim();

                    // Soporta múltiples etiquetas en el mismo input
                    input.split(/[\s,;:.]+/).forEach((subTag) => {
                        if (subTag) addTag(subTag);
                    });
                }
            });

            $tagContainer.on("click", ".btn-close", function () {
                const tag = $(this).data("tag");
                removeTag(tag);
            });

            $textareaTags.on("click", () => updateTagContainer());
            $textareaTags.on("input", function () {
                // let value = $textareaTags.val();

                // // Reemplazar espacios y otros separadores por comas, pero evitando al principio y final
                // value = value
                //     .trim() // elimina espacios al principio/final antes de procesar
                //     .replace(/[\s;:.]+/g, ",") // reemplaza separadores por comas
                //     .replace(/,+/g, ",") // evita múltiples comas seguidas
                //     .replace(/^,|,$/g, ""); // quita coma al principio o final

                // $textareaTags.val(value);
                updateTagContainer();
            });

            updateTagContainer();
        }

        // Inicializa todos los grupos en la página
        $(".tag-group").each(function () {
            initTagGroup($(this));
        });
        $("[data-blur-tags]").on("blur", function () {
            addMoreTags.call(this);
        });

        function addMoreTags() {
            let value = $(this).val();
            value = value.replace(/T\d.*$/, ""); // Campo de Fecha: Elimina la hora
            value = value
                .trim()
                .replace(/[\s;:.\u00A0]+/g, ",")
                .replace(/,+/g, ",")
                .replace(/^,|,$/g, "");

            const $groupElement = $(this).attr("data-blur-tags");
            const $textareaTags = $(`${$groupElement} .tags`);
            let existingValue = $textareaTags.val().trim();

            if (existingValue) {
                existingValue = existingValue.replace(/,+$/g, "");
                value = existingValue + "," + value;
            }

            value = value.replace(/,+/g, ",").replace(/^,|,$/g, ""); // Elimina comas al principio y final
            $textareaTags.val(value).trigger("input");
        }

        //
        //
        //
    } catch (error) {
        console.error("Error Inesperado: ", error);
        alertSToast("center", 8000, "error", `😥 Ah ocurrido un error inesperado. codigo: #304`);
    }
});

// ##############################################################################################
// #################################### Funciones JAVASCRIPT ####################################
// ##############################################################################################

// Crear cadena de caracteres random ###############################3
function cadenaRandom(longitud, caracteres) {
    var cadenaAleatoria = "";
    for (var i = 0; i < longitud; i++) {
        var indice = Math.floor(Math.random() * caracteres.length);
        cadenaAleatoria += caracteres.charAt(indice);
    }
    return cadenaAleatoria;
}

// Copiar al portapapeles ######################################################################
const inputs = document.querySelectorAll("input[data-copy]");
inputs.forEach((input) => {
    const copyText = () => {
        if (!navigator.clipboard) {
            alertSToast("center", 8000, "info", "Tu navegador no admite copiar al portapapeles 😯😥🤔");
            return;
        }
        const textCopy = input.value;
        if (textCopy != "") {
            navigator.clipboard
                .writeText(textCopy)
                .then(() => {
                    alertSToast("top", 5000, "success", "Texto Copiado! 🥳");
                })
                .catch((error) => {
                    const message = "Error al copiar al portapapeles";
                    console.error(message, ":", error);
                    alertSToast("top", 8000, "error", `${message} 🤔😥`);
                });
        }
    };

    input.addEventListener("click", copyText);
    // input.addEventListener("focus", copyText);
});

// Enviar formulario JSON ######################################################################
function jsonSubmit(e) {
    e.preventDefault = e.preventDefault || function () {};
    e.preventDefault();
    const thisForm = e.target;
    const formData = new FormData(thisForm);

    if (formData.has("contenidoWord")) {
        const contenidoTiny = tinymce.activeEditor.getContent();
        formData.set("htmlTiny", contenidoTiny);

        const contenidoTextTiny = tinymce.activeEditor.getContent({ format: "text" });
        formData.set("textTiny", contenidoTextTiny);
    }

    try {
        formSubmitBtn = thisForm.querySelector('button[type="submit"]');
        if (formSubmitBtn) {
            formSubmitBtn.setAttribute("disabled", "disabled");
        }
    } catch (error) {
        console.warn("Advertencia: Boton de envio no encontrado...");
        console.warn(formSubmitBtn);
        console.error(error);
    }

    fetch(thisForm.action, {
        method: "POST",
        body: formData,
        headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": formToken,
        },
    })
        .then(async (response) => {
            if (!response.ok) {
                const data = await response.json();
                console.error(data);
                throw new Error(data.error || "Error en el formato recivido");
            }
            return response.json();
        })
        .then((data) => {
            dataMessage = data.message;
            if (data.success == true) {
                let dataIcon = data.icon || "success";
                let dataPosition = data.position || "center";

                function dataRedirect() {
                    window.location.href = data.redirect_url;
                }

                let alertfunction;
                switch (data.functions) {
                    case "singin":
                        return dataRedirect();
                    case "reload":
                        alertfunction = () => location.reload();
                        break;
                    case "redirect":
                        alertfunction = dataRedirect;
                        break;
                    case "reset":
                        alertfunction = () => thisForm.reset();
                        break;
                }

                setTimeout(() => thisForm.querySelector('button[type="submit"]').removeAttribute("disabled"), 10000);
                const passwordInputs = document.querySelectorAll('input[type="password"]');
                passwordInputs.forEach((input) => (input.value = ""));

                alertSToast(dataPosition, timerOut, dataIcon, dataMessage, alertfunction);
            } else if (data.success == false) {
                if (data.valSelector) {
                    thisForm.querySelector(`[data-selector-input="${data.valSelector}"]`).classList.add("is-invalid");
                    thisForm.querySelector(`[data-selector-input="${data.valSelector}"]`).classList.remove("is-valid");
                }

                alertSToast("top", timerOut + 6000, "warning", dataMessage, () => {
                    thisForm.querySelector('button[type="submit"]').removeAttribute("disabled");
                });
            }
            if (data.functions == "submit") {
                thisForm.querySelector('button[type="submit"]').removeAttribute("disabled");
            }
        })
        .catch((error) => {
            console.error("😥 Error inesperado:", error);
            errorMessage = error.message || "Ocurrió un error. Intente nuevamente. 😥";
            alertSToast("center", timerOut + 8000, "error", errorMessage, () => {
                thisForm.querySelector('button[type="submit"]').removeAttribute("disabled");
            });
        });
}

// Formatear fecha de Django a HTML ###################################################
function convertToDateInputFormat(isoDateString) {
    const date = new Date(isoDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Drag and Drop ###################################################
const dropArea = document.getElementById("drop-area");
if (dropArea) {
    const fileInput = document.getElementById("file-input");
    const imageList = document.getElementById("image-list");

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    }

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    ["dragenter", "dragover"].forEach((eventName) => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add("hover"), false);
    });
    ["dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove("hover"), false);
    });

    dropArea.addEventListener("drop", handleDrop, false);
    dropArea.addEventListener("click", () => fileInput.click(), false);
    fileInput.addEventListener("change", handleFiles, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;
        handleFiles({ target: { files } });
    }
    function handleFiles(e) {
        let files = e.target.files;
        let validFiles = [];
        let i = 1;

        [...files].forEach((file) => {
            if (validateImage(file)) {
                validFiles.push(file);
                previewImage(file, i);
                ++i;
                console.log(++i);
            }
        });

        if (validFiles.length > 0) {
            alertSToast("top-end", 6000, "success", `${validFiles.length} imágenes cargadas <br>correctamente 😋🤘🥳`);
        } else {
            alertSToast("center", 6000, "error", "No se admite este tipo de archivo ⚠️😯😥");
        }
    }
    function validateImage(file) {
        const acceptedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
        return acceptedImageTypes.includes(file.type);
    }
    function previewImage(file, itemId) {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = function () {
            const fileName = file.name;
            let fileType = fileName.lastIndexOf(".");
            fileType = fileName.substring(fileType + 1);
            const imgID = cadenaRandom(5, alfanumerico);

            const imageItem = `<div id="img_${imgID}" class="image-item"><img src="${
                reader.result
            }" class="img-rounded unfocus-5"><div class="fs-8"><p class="name-file m-0">${fileName}</p><p class="size-file m-0">(${fileType}) ${formatBytes(file.size)}</p></div></div>`;
            imageList.insertAdjacentHTML("beforeend", imageItem);

            setTimeout(() => {
                document.querySelector(`#img_${imgID}`).classList.add("visible");
                setTimeout(() => {
                    document.querySelector(`#img_${imgID} img`).classList.remove("unfocus-5");
                }, itemId * 110);
            }, itemId * 90);
        };
    }
}

// Template Alertas switalert ###################################################
function alertSToast(posittionS, timerS, iconS, titleS, didDestroyS) {
    const Toast = Swal.mixin({
        toast: true,
        position: posittionS,
        showConfirmButton: false,
        showCloseButton: true,
        timer: timerS,
        timerProgressBar: true,
        customClass: {
            icon: "icon_alert",
            title: "title_alert",
            timerProgressBar: "progressbar_alert",
            closeButton: "close_button_alert",
        },
        didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
        didDestroy: didDestroyS,
    });
    Toast.fire({
        icon: iconS,
        title: titleS,
    });
}

// context menu disabled ######################################################################
// document.oncontextmenu = () => false;
// document.addEventListener("keydown", (event) => {
//     const forbiddenKeys = [
//         { ctrl: true, shift: true, key: "C" },
//         { ctrl: true, shift: true, key: "E" },
//         { ctrl: true, shift: true, key: "I" },
//         { ctrl: true, shift: true, key: "J" },
//         { ctrl: true, shift: true, key: "K" },
//         { ctrl: true, shift: true, key: "M" },
//         { ctrl: false, shift: false, key: "F12" },
//     ];

//     if (forbiddenKeys.some((k) => event.ctrlKey === k.ctrl && event.shiftKey === k.shift && event.key === k.key)) {
//         event.preventDefault();
//     }
// });
