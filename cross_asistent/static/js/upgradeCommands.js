// ---------------- COMANDOS -----------------------


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
