/*window.onload = () => {
    // To make sur html page is loaded
    let player  = document.querySelector("#player")
    let audio_ctx = new AudioContext()

    draw_ui("#canvas")
    
    // WebAudio is written in C++
    // WebAudio has priority over any UI
    // AnalyserNode provides data on audio
    // AnalyserNode allows to display music grahps
    player.onplay = () => {
        audio_ctx.resume()
        // Player in on pause by default  due to a W3C standart and must be resumed
    }

    function create_graph() {
        // biquad filter node
        // Peaking
        let source  = audio_ctx.createMediaElementSource(player)
        let filter_node = audio_ctx.createBiquadFilter()
        filter_node.type = "peaking"
        filter_node.frequency.value = 150 // 150 hz


    }

    function draw_ui(id) {
        let canvas = document.querySelector(id)
        let ctx = canvas.getContext("2d")
        ctx.fillStyle = "#FF0000";
        ctx.beginPath()
        ctx.font("20px", )
        ctx.arc(400, 400, 100, 0, 2 * Math.PI)
        ctx.stroke()

        requestAnimationFrame(draw_ui)
    }

    function animatio

}

// maps a value from [istart, istop] into [ostart, ostop]
function map(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}*/