const pickr = Pickr.create({
    el: "#color-picker",
    theme: "monolith",
    default: "#808080",
    useAsButton: true,
    lockOpacity: true,
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
        opacity: false,
        hue: true,

        interaction: {
            input: true,
            save: true,
        },
    },
});
function setColor(thisColor) {
    const getColor = thisColor.toHEXA().toString();
    $("#color-picker").css("background-color", getColor);
    alertSToast('center', 8000, 'info', getColor);
    $("#colorpicker").val(getColor);
}
pickr.on("change", (color) => {
    setColor(color);
});
pickr.on("save", (color) => {
    setColor(color);
    pickr.hide();
});
