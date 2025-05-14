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
    const getColor = thisColor.toHEXA().toString();
    const colorRBGA = thisColor.toRGBA().toString(0);

    const colorLenght = getColor.length;
    let solidColor = getColor;
    if (colorLenght > 7) {
        solidColor = getColor.slice(0, -2);
    }

    const rgbaParts = colorRBGA.replace(/\s+/g, "").replace("(", "").replace(")", "").split(",");
    const opacity = rgbaParts[rgbaParts.length - 1];
    let setOpacity = 0.4;
    if (opacity > 0.85) {
        setOpacity = 0.4;
    } else {
        setOpacity = opacity;
    }

    $("#colorpicker").css("background-color", getColor);
    $("#colorEdificio").val(`${solidColor}-${setOpacity}`);
}

pickr
    .on("change", (color) => {
        setColor(color);
    })
    .on("save", (color) => {
        setColor(color);
        pickr.hide();
    });
