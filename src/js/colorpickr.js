const pickr = Pickr.create({
    el: "#colorpicker",
    theme: "monolith",
    default: "#808080",
    useAsButton: true,
    // defaultRepresentation: 'RGBA',
    // lockOpacity: true,
    // showAlways: true,

    swatches: [
        "rgb(128, 128, 128)",
        "rgb(156, 39, 176)",
        "rgb(103, 58, 183)",
        "rgb(63, 81, 181)",
        "rgb(3, 169, 244)",
        "rgb(0, 188, 212)",
        "rgb(0, 150, 136)",
        "rgb(76, 175, 80)",
        "rgb(139, 195, 74)",
        "rgb(205, 220, 57)",
        "rgb(255, 235, 59)",
        "rgb(255, 193, 7)",
        "rgb(244, 67, 54)",
        "rgb(233, 30, 99)",
    ],

    components: {
        preview: true,
        opacity: true,
        hue: true,

        interaction: {
            input: true,
            save: true,
        },
    },
});
function setColor(thisColor) {
    let [r, g, b, a] = thisColor.toRGBA();
    if (a > 0.9) a = 0.9;

    const toHex = (val) => Math.round(val).toString(16).padStart(2, "0").toUpperCase();
    const alphaHex = Math.round(a * 255).toString(16).padStart(2, "0").toUpperCase();
    const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}${alphaHex}`;

    $("#colorpicker").css("background-color", hexColor);
    $("#colorEdificio").val(hexColor);
}

pickr
    .on("change", (color) => {
        setColor(color);
    })
    .on("save", (color) => {
        setColor(color);
        pickr.hide();
    });
