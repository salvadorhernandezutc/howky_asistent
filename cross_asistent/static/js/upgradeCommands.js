const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    $("#chatMicrophone").remove();
    $("#chatListeningGroup").remove();
    $("#chatListeningAll").prop("checked", false);
    return;
}

const recognition = new SpeechRecognition();
recognition.lang = "es-ES";
recognition.continuous = true;
recognition.interimResults = false;

let isListening = false;
let autoListen = localStorage.getItem("chatListening") === "true";

$("#chatListeningAll").prop("checked", autoListen);
$("#chatListeningText").text(autoListen ? "Sí" : "No");

function startListening() {
    if (!isListening) {
        recognition.start();
        isListening = true;
        $("#chatMicrophone").html('<i class="ic-solar litening_bars"></i>');
        console.log("🎤 Iniciado reconocimiento de voz.");
    }
}

function stopListening() {
    if (isListening) {
        recognition.stop();
        isListening = false;
        $("#chatMicrophone").html('<i class="fa-solid fa-microphone"></i>');
        console.log("🛑 Reconocimiento detenido.");
    }
}

$("#chatMicrophone").on("click", () => (isListening ? stopListening() : startListening()));

$("#chatListeningAll").on("change", function () {
    const checked = $(this).is(":checked");
    localStorage.setItem("chatListening", checked);
    checked ? startListening() : stopListening();
});

if (autoListen) startListening();

// ---------------- COMANDOS -----------------------
const comandosVoz = [
    {
        nombre: "abrirMapa",
        expresiones: [/abre el mapa/, /muestra el mapa/, /abrir mapa/],
        accion: () => {
            if (!$("body").hasClass("open_map")) $("#chatOpenMap").click();
        },
    },
    {
        nombre: "cerrarMapa",
        expresiones: [/cerrar el mapa/, /ocultar el mapa/],
        accion: () => {
            if ($("body").hasClass("open_map")) $("#chatOpenMap").click();
        },
    },
    {
        nombre: "abrirChat",
        expresiones: [/abre el chat/, /mostrar chat/, /abrir chat/],
        accion: () => {
            if (!$("body").hasClass("open_chat")) $("#chatOpen").click();
        },
    },
    {
        nombre: "cerrarChat",
        expresiones: [/cerrar el chat/, /ocultar el chat/],
        accion: () => {
            if ($("body").hasClass("open_chat")) $("#chatOpen").click();
        },
    },
    {
        nombre: "iniciarRuta",
        expresiones: [/cómo ir/, /como llegar/, /ruta a/, /indicaciones/],
        accion: () => {
            setTimeout(() => {
                $("[data-route]").last().click();
            }, 2000);
        },
    },
    {
        nombre: "borrarRuta",
        expresiones: [/borrar ruta/, /eliminar ruta/, /borrar el camino/],
        accion: () => {
            $('[data-reset_form="form_route"]').click();
        },
    },
];

// ---------------- PROCESAMIENTO DE RECONOCIMIENTO -----------------------
recognition.onresult = function (event) {
    const raw = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("🗣️ Detectado:", raw);

    const palabrasClave = ["howky", "hockey", "hawkie", "hawking", "hauki", "houki", "asistente", "okay", "ok"];
    const primeraPalabra = raw.split(" ")[0];

    if (!palabrasClave.includes(primeraPalabra)) return;

    const comando = raw.replace(primeraPalabra, "").trim();
    console.log("🎯 Comando filtrado:", comando);

    for (let cmd of comandosVoz) {
        if (cmd.expresiones.some((exp) => exp.test(comando))) {
            console.log("✅ Ejecutando:", cmd.nombre);
            cmd.accion();
            return;
        }
    }

    // Si no coincide con ningún comando, se trata como pregunta
    if (comando) {
        $("#txtQuestion").text(comando);
        setTimeout(() => {
            $("#chatForm").submit();
            setTimeout(() => $("#txtQuestion").text(""), 500);
        }, 1000);
    }
};

recognition.onend = () => {
    console.log("🔁 Reconocimiento finalizado automáticamente.");
    if (localStorage.getItem("chatListening") === "true") startListening();
};

recognition.onerror = (event) => {
    console.error("❌ Error de reconocimiento:", event.error);
    if (autoListen && event.error === "no-speech") stopListening();

    if (autoListen && event.error === "not-allowed") {
        alertSToast("center", 8000, "error", "No se permiten permisos de micrófono. 😥");
        $("#chatListeningAll").prop("checked", false);
        localStorage.setItem("chatListening", false);
    }
};

// ########################################################################################
// ###################################### Mejora ##########################################
// ########################################################################################

recognition.onresult = function (event) {
    const raw = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("🗣️ Detectado:", raw);

    const palabrasClave = ["howky", "hockey", "hawkie", "hawking", "hauki", "houki", "asistente", "okay", "ok"];
    const primeraPalabra = raw.split(" ")[0];

    if (!palabrasClave.includes(primeraPalabra)) return;

    const comando = raw.replace(primeraPalabra, "").trim();
    console.log("🎯 Comando filtrado:", comando);

    let seEjecutoComando = false;

    for (let cmd of comandosVoz) {
        if (cmd.expresiones.some((exp) => exp.test(comando))) {
            console.log("✅ Ejecutando:", cmd.nombre);
            cmd.accion();

            // Si el comando es iniciarRuta, también enviamos al chat
            if (cmd.nombre === "iniciarRuta") {
                enviarAlChat(comando);
            }

            seEjecutoComando = true;
            break;
        }
    }

    // Si no se ejecutó ningún comando, enviarlo como pregunta al chat
    if (!seEjecutoComando && comando) {
        enviarAlChat(comando);
    }
};

function enviarAlChat(texto) {
    console.log("💬 Enviando al chat:", texto);
    $("#txtQuestion").text(texto);
    setTimeout(() => {
        $("#chatForm").submit();
        setTimeout(() => $("#txtQuestion").text(""), 500);
    }, 1000);
}
