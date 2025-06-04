var alfabetico = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz12345678901234567890";
var texto3 = /[a-zA-Z0-9]{3}/;
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// ##############################################################################################
// ###################################### Funciones Jquery ######################################
// ##############################################################################################
$(document).ready(function () {
    try {
        // Abrir chat #######################################################################
        const modelViewer = $("#asistent_model");
        let isPaused = false;
        function togglePlayModel() {
            isPaused = !isPaused;
            isPaused ? modelViewer[0].pause() : modelViewer[0].play();
        }
        $("#openChat").on("click", function () {
            $("#model").toggleClass("open");

            togglePlayModel();
        });
        // Abrir mapa #######################################################################
        function toggleMapChat() {
            setTimeout(() => {
                if ($("body").hasClass("open_map")) {
                    $("#chatOpenMap i.fa-solid").addClass("fa-comment-dots").removeClass("fa-map-location-dot");
                    modelViewer.attr("camera-orbit", "-15deg 70deg 5m");
                } else {
                    $("#chatOpenMap i.fa-solid").addClass("fa-map-location-dot").removeClass("fa-comment-dots");
                    modelViewer.attr("camera-orbit", "15deg 70deg 5m");
                }

                if ($("#model").hasClass("open")) {
                    togglePlayModel();
                }
            }, 500);
        }
        $("#chatOpenMap").on("click", toggleMapChat);
        $(document).on("click", "[data-route]", function () {
            toggleMapChat();

            const routeParts = $(this).attr("data-route").split("~");
            const params = new URLSearchParams(window.location.search);
            params.set("origin", routeParts[0]);
            params.set("destiny", routeParts[1]);
            history.replaceState({}, "", `${location.pathname}?${params}`);
        });

        // Enviar chat con enter chatGPT ######################################
        $("#txtQuestion").keydown((evento) => {
            if (evento.keyCode === 13 && !evento.shiftKey) {
                evento.preventDefault();
                $("#chatForm_submit").click();
            }
        });

        // ChatGPT Submit ####################################################
        $("#chatForm").submit(chatSubmit);
    } catch (error) {
        console.error("Error Inesperado: ", error);
        alertSToast("center", 8000, "error", `😥 Ha ocurrido un error inesperado. código: #304`);
    }
});

// ##############################################################################################
// #################################### Funciones JAVASCRIPT ####################################
// ##############################################################################################

// Función de preguntar a chatGPT https://platform.openai.com/ #################################
const contOutput = document.querySelector("#output");
let audioEnabled = true;
let saludoMostrado = true;

// Función para Mostrar y Mandar la Pregunta del Usuario ################
function chatSubmit(e) {
    e.preventDefault();
    const tokendid = cadenaRandom(5, alfabetico);
    const pregunta = txtQuestion.value;
    const chatForm = e.target;
    chatForm.reset();

    const htmlBlock = `<div class="chat_msg d-flex justify-content-end user_submit" data-tokeid="uuid${tokendid}"><div class="msg_user p-2 bg_detail">${pregunta}</div></div>`;
    contOutput.insertAdjacentHTML("beforeend", htmlBlock);
    const user_submit = $(`.user_submit[data-tokeid="uuid${tokendid}"]`);
    setTimeout(() => {
        user_submit.removeClass("active").addClass("show");
        setTimeout(scrollToBottom, 500);
        setTimeout(() => {
            user_submit.addClass("active");
        }, 5000);
    }, 20);

    const loadInfo = `<div class="chat_msg chat_open" data-tokeid="loadInfoDelete"><div class="msg_response"><div class="mx-auto pulse-container"><div class="pulse-bubble bg_detail"></div><div class="pulse-bubble bg_detail"></div><div class="pulse-bubble bg_detail"></div></div></div></div>`;
    contOutput.insertAdjacentHTML("beforeend", loadInfo);
    setTimeout(function () {
        $(`.chat_msg[data-tokeid="loadInfoDelete"]`).addClass("show");
        setTimeout(scrollToBottom, 500);
    }, 200);

    if (!texto3.test(pregunta)) {
        const instructionMessage = "No comprendo a lo que te refieres, por dame mas detalles de lo que deseas saber <br> Mientras mas detalles mejor 😊😉.";
        displayText(instructionMessage);
        return;
    }

    fetch(chatForm.action, {
        method: "POST",
        body: JSON.stringify({ question: pregunta }),
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRFToken": chatForm.querySelector("[name=csrfmiddlewaretoken]").value,
        },
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                    throw new Error(data.message || "Error desconocido");
                });
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                displayResponse(data.answer);
            } else {
                console.error("😥 Error: ------------------------------");
                console.error(data.message);
                console.log();

                const errorMessage =
                    "Lo siento pero en este momento no puedo responderte. <br> La verdad es que hoy me sature de tantas solicitudes y no puedo procesar más. 😥🤒 <br> Estare de nuevo en funcionamineto muy pronto. 😊😉😌";
                displayText(errorMessage);
            }
        })
        .catch((error) => {
            console.error("😥 Error:", error);
            alertSToast("top", 8000, "warning", "Ocurrió un error. Intente nuevamente. 😥");
        });
}

// Función para Manejar y Mostrar la Respuesta del Chatbot #################
function displayResponse(varAnswer) {
    const tokendid = cadenaRandom(5, alfabetico);
    const dataImage = varAnswer.imagenes;
    const dataRedirigir = varAnswer.redirigir;
    let viewImage = "";
    let btnRedir = "";

    if (dataImage != null) {
        viewImage = `<div class="chat_msg show"><img src="${dataImage}" alt="${varAnswer.titulo}" class="chat_img" /></div>`;
    }

    if (dataRedirigir && dataRedirigir.trim() !== "") {
        const isRoute = dataRedirigir.includes("~");
        const tag = isRoute ? 'button type="button" data-toggle-class="body-open_map" data-route' : "a href";
        const text = isRoute ? "Abrir ruta en el Mapa" : "Ver más";

        btnRedir = `
            <div class="chat_msg show msg_link">
                <${tag}="${dataRedirigir}" class="btn btn_detail_inset">
                    ${text} <i class="fas fa-up-right-from-square ms-1"></i>
                </${isRoute ? "button" : "a"}>
            </div>
        `;
    }

    const chatText = varAnswer.informacion.replace(/\n/g, "<br>");
    const htmlBlock = `<div class="chat_msg chat_open" data-tokeid="uuid${tokendid}"><div class="msg_response">${chatText}</div></div>${viewImage} ${btnRedir}`;

    contOutput.insertAdjacentHTML("beforeend", htmlBlock);
    const asistentResponse = document.querySelector(`.chat_msg[data-tokeid="uuid${tokendid}"]`);
    $(`.chat_msg[data-tokeid="loadInfoDelete"]`).remove();
    setTimeout(function () {
        asistentResponse.classList.add("show");
        setTimeout(scrollToBottom, 350);
    }, 20);
}

function displayText(varText) {
    $(`.chat_msg[data-tokeid="loadInfoDelete"]`).remove();

    const tokendid = cadenaRandom(5, alfabetico);
    const chatText = varText.replace(/\n/g, "<br>");
    const htmlBlock = `<div class="chat_msg chat_open" data-tokeid="uuid${tokendid}"><div class="msg_response">${chatText}</div></div>`;

    contOutput.insertAdjacentHTML("beforeend", htmlBlock);
    const asistentResponse = document.querySelector(`.chat_msg[data-tokeid="uuid${tokendid}"]`);
    setTimeout(function () {
        asistentResponse.classList.add("show");
        setTimeout(scrollToBottom, 350);
    }, 20);
}

// Saludo Inicial ##################################################
if (contOutput && saludoMostrado) {
    const initialMessage = `<div class="chat_msg chat_open" data-tokeid="initialMessage"><div class="msg_response">¡Hola! Soy Hawky 👋😁, tu asistente virtual de la Universidad Tecnológica de Coahuila. Puedes preguntarme sobre trámites, carreras, costos u otros temas de la universidad. ¿En qué puedo ayudarte?😉😊😁</div></div>`;

    contOutput.insertAdjacentHTML("beforeend", initialMessage);
    const elementInitMsg = document.querySelector(`.chat_msg[data-tokeid="initialMessage"]`);
    setTimeout(function () {
        elementInitMsg.classList.add("show");
    }, 500);
}

// Hacer scroll con un nuevo mensaje en el chat ################################
function scrollToBottom() {
    contOutput.scrollTop = contOutput.scrollHeight;
}
if (contOutput) {
    const observerOutput = new MutationObserver(() => {
        scrollToBottom();
    });
    scrollToBottom();
    observerOutput.observe(contOutput, { childList: true, subtree: true });
}
