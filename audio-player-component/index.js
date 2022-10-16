import './lib/webaudio-controls.js';
// import here other components
// ex: my-equalizer

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

let style = `
<style>

#main_div {

}

#canvas_div{ 
  
}
#canvas {
  border-radius : 50%;
  box-shadow: 2px 2px 8px rgba(32, 32, 32, 0.4), -2px -2px 8px rgba(10,10,10,1);

}
#canvas_graph {
  border-radius : 5%;
  box-shadow: 2px 2px 8px rgba(32, 32, 32, 0.4), -2px -2px 8px rgba(10,10,10,1);
  border : 1px solid black;
}
#buttons_div {
  border-radius : 25%;
  background-color: grey;
  box-shadow: 2px 2px 8px rgba(32, 32, 32, 0.4), -2px -2px 8px rgba(10,10,10,1);
}
</style>
`

const template = `
<div id="main_div">

  <div id="audio_players">
    <audio id="player" controls crossorigin="anonymous"></audio>
  </div>

  <div id="canvas_div">
    <canvas id="canvas" width="600" height="600"></canvas><br>
    <canvas id="canvas_graph" width="1000" height="200"></canvas>
  </div>

  <div id="buttons_div">

      <button id="loop">loop</button><br>

      <webaudio-knob 
        id="volume_knob" 
        src="./assets/web-audio/guitar-poti-volume.png" 
        value="0.2" max="1" step="0.1" diameter="70" sprites="10" 
        valuetip="0" tooltip="Volume">
      </webaudio-knob>

      <webaudio-knob 
        id="frequency_knob" 
        src="./assets/web-audio/little-phatty.png" 
        value="40" max="10000" step="10" diameter="90" 
        valuetip="0" tooltip="Frequency">
      </webaudio-knob>
      
      <webaudio-knob 
        id="speed_knob" 
        src="./assets/web-audio/little-phatty.png" 
        value="1" max="5" step="0.1" diameter="90"
        valuetip="0" tooltip="Speed">
      </webaudio-knob>
      
      <webaudio-knob
        id="stereo_knob" 
        src="./assets/web-audio/simple-gray.png" 
        value="1" max="3" step="1" diameter="90"
        valuetip="0" tooltip="Stereo">
      </webaudio-slider>

  </div>
</div>
`

// Pie chart https://code.tutsplus.com/tutorials/how-to-draw-a-pie-chart-and-doughnut-chart-using-javascript-and-html5-canvas--cms-27197
// https://www.codeblocq.com/2016/04/Create-a-Pie-Chart-with-HTML5-canvas/

class AudioPlayer extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({mode: 'open'})
      this.html = style
      this.html = this.html + template
      this.loop = false
      this.volume = 0.2
      this.frequency = 40

      this.song_urls = {
        1: "https://ia600207.us.archive.org/25/items/midsummer_2006/01_jam_with_tim_180606.mp3",
        2: "https://ia800302.us.archive.org/17/items/J_DAgostino_More/03_Little_Hope_of_an_Early_Settlement.mp3",

      }
    }
    
    fix_relative_urls() {
        // pour les knobs
        let knobs = this.shadowRoot.querySelectorAll('webaudio-knob, webaudio-switch, webaudio-slider');
        knobs.forEach((e) => {
            let path = e.getAttribute('src');
            e.src = getBaseURL() + '/' + path;
        });
    }

    draw_ui() {
      this.ctx.antialias = true
      this.ctx.font = '12px Arial'
      requestAnimationFrame(() => this.update_ui())
    }

    update_ui() {

      this.ctx.clearRect(0, 0, this.width, this.height)

      let file_name = this.get_audio_name()
      let time_info_current = this.get_current_audio_time()
      let time_info_duration = this.get_total_audio_time()
      let time = time_info_current + "(" + time_info_duration + ")"
      let volume = (this.volume*100).toString()
      volume = volume.substring(0,4)+"%"

      
      for(let i = 30; i <= 360; i += 30) {
        let x = i*Math.round(Math.cos(i))
        let y = i*Math.round(Math.sin(i))
        this.draw_line(x, y)
      }
      
      this.draw_circle(210)
      this.draw_circle(200)
      this.draw_circle(100)

      // loop zone (center)
      this.draw_rect(270, 510, 60, 90)

      // play zone (left center)
      this.draw_rect(180, 490, 60, 105)

      // pause zone (right center)
      //this.draw_rect(this.ctx, 360, 490, 60, 105)

      // +10s zone (right right center)
      this.draw_rect(450, 440, 60, 120)

      // -10s zone (left left center)
      this.draw_rect(90, 440, 60, 120)

      this.ctx.strokeText("./pause.png", 360, 510)

      this.draw_circle(this.ctx)
      
      // For a canvas 600*600
      this.ctx.strokeText(file_name, this.get_title_position(file_name), this.canvas_center_y)
      this.ctx.strokeText(time, this.canvas_center_x-40, this.canvas_center_y+40)
      this.ctx.strokeText(volume, this.canvas_center_x-12.5, this.canvas_center_y+60)

      requestAnimationFrame(() => this.update_ui())
    }

    draw_graph() {
      requestAnimationFrame(() => this.update_graph())
    }

    update_graph(graph_initial_point = 2) {
      let data = this.get_frequency_data()
      let stick_width = this.width/data.lenght
      let stick_height
      let x = 0
      let y = null

      this.ctx_graph.save()

      for(let i=0; i<=data.lenght; i++) {
        console.log("tetsé")
        stick_height = data[i]/2
        console.log(stick_height)
        y = Math.random()*10-100 // should be music values
        //y = this.height_graph-this/2 
        this.ctx_graph.fillRect(x, 196, 50, -20)
        x += stick_width + 10
      }

      //if(clear) this.ctx_graph.clearRect(0, 0, this.width_graph, this.height_graph)
      
      this.ctx_graph.beginPath();
      this.ctx_graph.moveTo(0, 198)
      this.ctx_graph.lineTo(1000, 198)
      this.ctx_graph.lineWidth = 2;
      this.ctx_graph.stroke();

      this.ctx_graph.beginPath();
      this.ctx_graph.moveTo(0, 2)
      this.ctx_graph.lineTo(1000, 2)
      this.ctx_graph.lineWidth = 2;
      this.ctx_graph.stroke();

      

      //this.ctx_graph.fillRect(graph_point, 196, stick_width, frequency_value)
      this.ctx_graph.restore()
      requestAnimationFrame(() => this.update_graph(graph_initial_point))
    }

    set_audio_player() {
      this.player.src = this.song_urls[2]
      //this.player.muted = false
      console.log("<audio> muted : " + this.player.muted)
    }

    set_web_audio() {
      //this.player.play()
      this.audio_ctx = new AudioContext()
      this.source_node = this.audio_ctx.createMediaElementSource(this.player)
      
      this.set_filter_node("lowpass")
      this.set_analyser_node(256)
      this.set_audio_panner_node
      //this.set_audio_buffer_node()
    }

    set_filter_node(type) {
      this.filter_node = this.audio_ctx.createBiquadFilter()
      this.filter_node.type = type
      this.filter_node.frequency.value = this.frequency
      this.filter_node.Q.value = 8.81
      this.source_node.connect(this.filter_node).connect(this.audio_ctx.destination)
    }

    set_audio_buffer_node() {
      // used with decodeAudioData() ...
      this.audio_buffer_node = this.audio_ctx.createBufferSource()
      this.source_node.connect(this.audio_buffer_node).connect(this.audio_ctx.destination)
    }

    set_audio_panner_node() {
      this.audio_panner_node = this.audio_ctx.createStereoPanner()
      this.source_node.connect(this.audio_panner_node).connect(this.audio_ctx.destination)
    }

    set_analyser_node(fftSize = 256) {
      this.analyser_node = this.audio_ctx.createAnalyser()
      this.analyser_node.fftSize = fftSize // 2048 default
      this.source_node.connect(this.analyser_node).connect(this.audio_ctx.destination)
    }

    get_frequency_data(analyser_node = this.analyser_node) {
      const buffer_lenght = this.analyser_node.frequencyBinCount
      const data_array = new Uint8Array(buffer_lenght)
      this.analyser_node.getByteTimeDomainData(data_array)
      return data_array
    }

    set_audio_speed(value) {
      this.player.playbackRate = value
    }

    get_current_audio_time() {
      let minutes = Math.floor(this.player.currentTime / 60);
      let seconds = Math.floor(this.player.currentTime - minutes*60)
      let expr = minutes + "m " + seconds + "s"
      return(expr)
    }

    get_total_audio_time() {
      let minutes = Math.floor(this.player.duration / 60);
      let seconds = Math.floor(this.player.duration - minutes*60)
      let expr = minutes + "m " + seconds + "s"
      return(expr)
    }

    get_audio_name() {
      let title = this.player.src.substring(this.player.src.lastIndexOf ('/')+1)
      title = (title.lenght < 30) ? title : title.substring(0,30)
      return title
    }

    get_title_position(title) {
      let x = (title.lenght > 30) ? ((this.canvas_center_x-90) + (30-title.lenght)) : (this.canvas_center_x-90)
      return x
    }

    draw_circle(r = this.radius, center_x = this.canvas_center_x, center_y = this.canvas_center_y, background_color = "#FFFFFF", stroke_color = "#000000") {
      this.ctx.save()
      this.ctx.beginPath();
      this.ctx.arc(center_x, center_y, r, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = background_color;
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = stroke_color;
      this.ctx.fill();
      this.ctx.stroke();
      this.ctx.restore()
    }

    draw_line(end_x, end_y, start_x = this.canvas_center_x, start_y = this.canvas_center_y,  stroke_color = "#000000") {
      this.ctx.save()
      this.ctx.beginPath();
      this.ctx.moveTo(start_x, start_y)
      this.ctx.lineTo(end_x, end_y)
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = stroke_color
      this.ctx.stroke();
      this.ctx.restore()
    }

    draw_rect(x ,y , width, height) {
      this.ctx.save()
      this.ctx.fillStyle = "#000000"
      this.ctx.fillRect(x, y, width, height);
      this.ctx.restore()
    }

    draw_img(src, x, y) {
      this.ctx.save()
      let img = new Image()
      img.src = src
      this.ctx.drawImage(img, x, y)
      img.onload= (img, x, y) => {
        this.ctx.drawImage(img, x, y)
      }
      this.ctx.restore()
    }

    set_loop() {
      // condition ? exprIfTrue : exprIfFalse
      this.player.loop = this.player.loop ? false : true
      this.shadowRoot.querySelector("#loop").style.backgroundColor = this.player.loop ? "green" : "blue"
      console.log("loop : " + this.player.loop)
    }

    play() {
      console.log("play !")
      this.player.play()
      this.get_frequency_data()
    }

    pause() {
      console.log("pause !")
      this.player.pause()
    }

    set_frequency(value) {
      this.filter_node.frequency.value = parseInt(value)
      console.log("Changed frequency to : " + value)
    }

    set_volume(value) {
      this.player.volume = value
      this.volume = value
    }

    plus_seconds(seconds) {
      this.player.currrentTime += seconds
      console.log("audio time changed : " + this.player.currentTime)
    }

    less_seconds(seconds) {
      this.player.currrentTime -= seconds
      console.log("audio time changed : " + this.player.currentTime)
    }

    set_listeners() {
      this.shadowRoot.querySelector("#loop").onclick = () => {
        this.set_loop()
      }
      this.shadowRoot.querySelector('#volume_knob').oninput =  (event) => {
        this.set_volume(event.target.value)
      }
      this.shadowRoot.querySelector('#frequency_knob').oninput = (event) => {
        this.set_frequency(event.target.value)
      }
      this.shadowRoot.querySelector('#speed_knob').oninput = (event) => {
        this.set_audio_speed(event.target.value)
      }
      this.shadowRoot.querySelector("#canvas").onclick = (event) => {

        let get_mouse_position = (canvas,event) => {
          let rect = canvas.getBoundingClientRect();
          return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
          }
        }

        let is_inside = (pos, rect) => {
          return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
        }

        var mouse_pos = get_mouse_position(this.canvas, event);
        
        let play_zone = {x: 180, y: 490, width: 60, height: 105}
        let pause_zone = {x: 360, y: 490, width: 60, height: 105}
        let plus10_zone = {x: 450, y: 440, width: 60, height: 120}
        let less10_zone = {x: 90, y: 440, width: 60, height: 120}
        let loop_zone = {x: 270, y: 510, width: 60, height: 90}

        if (is_inside(mouse_pos, play_zone)) this.play()
        else if (is_inside(mouse_pos, pause_zone)) this.pause() && this.audio_ctx.resume()
        else if (is_inside(mouse_pos, plus10_zone)) this.plus_seconds(3)
        else if (is_inside(mouse_pos, less10_zone)) this.less_seconds(10)
        else if (is_inside(mouse_pos, loop_zone)) this.set_loop()
      }

      /*this.shadowRoot.querySelector("#mute").onclick = () => {
        this.player.mute = this.player.mute ? false : true
        console.log("muted : " + this.player.mute)
      }*/

      /*this.shadowRoot.querySelector("#volume").oninput = (event) => {
       this.set_volume(event)
      }
      this.shadowRoot.querySelector("#play").onclick = () => {
        this.play()
      }
      this.shadowRoot.querySelector("#pause").onclick = () => {
        this.pause()
      }*/
    }
      
    degrees_to_radiants(degrees) {
      return degrees*(Math.PI/180)
    }

    // Observables attributes example
    static get observedAttributes() { // MVC
      return ['html'];
    }
      
    attributeChangedCallback(attr, old, newAtt) { // MVC
      // sera appelé par ex. lors d’un this.setAttribute(’volume’, val);
    }
  
    connectedCallback() {
      // called on instanciation
      this.shadowRoot.innerHTML = this.html

      this.canvas_graph = this.shadowRoot.querySelector("#canvas_graph")
      this.ctx_graph = this.canvas_graph.getContext("2d")

      this.height_graph = this.canvas_graph.height
      this.width_graph = this.canvas_graph.width

      this.canvas = this.shadowRoot.querySelector("#canvas")
      this.ctx = this.canvas.getContext("2d")

      this.height = this.canvas.height
      this.width = this.canvas.width
      this.canvas_center_x = this.width/2
      this.canvas_center_y = this.height/2
      this.radius = this.canvas.width/2
      //console.log("canvas center : x : " + this.canvas_center_x  + " y : " + this.canvas_center_y)
      //console.log("radius : " + this.radius)

      this.player = this.shadowRoot.querySelector("#player")

      this.fix_relative_urls()
      this.set_audio_player()
      this.set_listeners()
      this.draw_ui()
      this.draw_graph()
      this.set_web_audio()
    }
}

customElements.define("audio-player", AudioPlayer)