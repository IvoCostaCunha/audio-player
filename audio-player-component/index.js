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
  border-radius: 4%;
  box-shadow: 2px 2px 8px rgba(32, 32, 32, 0.4), -2px -2px 8px rgba(10,10,10,1);
  border: 1px solid black;
  background-color: #72147E;
}
#buttons_div {
  text-align: center;
  border-radius: 8%;
  background-color: grey;
  box-shadow: 2px 2px 8px rgba(32, 32, 32, 0.4), -2px -2px 8px rgba(10,10,10,1);
}
.labels {
  font-family: font-family: "Helvetica Neue", "Arial",  sans-serif;
  color: white;
  font-size: 1.5rem;
  vertical-align: top;
  margin-bottom: 50px;
}
</style>
`

const template = `
<div id="main_div">

  <div id="audio_players">
    <audio id="player" crossorigin="anonymous"></audio>
  </div>

  <div id="canvas_div">
    <canvas id="canvas" width="600" height="600"></canvas><br>
    <canvas id="canvas_graph" width="1000" height="200"></canvas>
  </div>

  <div id="buttons_div">
      <label class="labels">Volume</label>
      <webaudio-knob 
        id="volume_knob" 
        src="./assets/web-audio/little-phatty.png" 
        value="0.1" max="1" step="0.1" diameter="90" sprites="100" 
        valuetip="0" tooltip="Volume">
      </webaudio-knob>

      <label class="labels">Frequency</label>
      <webaudio-knob 
        id="frequency_knob" 
        src="./assets/web-audio/little-phatty.png" 
        value="40" min="0" max="10000" step="10" diameter="90" 
        valuetip="0" tooltip="Frequency">
      </webaudio-knob>
      
      <label class="labels">Speed</label>
      <webaudio-knob 
        id="speed_knob" 
        src="./assets/web-audio/little-phatty.png" 
        value="1" min="" max="2" step="0.1" diameter="90"
        valuetip="0" tooltip="Speed">
      </webaudio-knob>
      
      <label class="labels">Stereo</label>
      <webaudio-knob
        id="stereo_knob" 
        src="./assets/web-audio/little-phatty.png" 
        value="0" min="-1" max="1" step="0.1" diameter="90"
        valuetip="0" tooltip="Stereo directions">
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
      this.volume = 0.1
      this.frequency = 40
      this.speed = 1
      this.stereo_pan_value = 0

      this.color_1 = "#31087B"
      this.color_2 = "#790252"
      this.color_3 = "#F9D371"
      this.color_4 = "#31087B"
      this.color_5 = "#72147E"
      this.color_6 = "#FF6D28"
      this.color_7 = "#7978FF"

      this.song_urls = {
        0: "https://mainline.i3s.unice.fr/mooc/LaSueur.mp3",
        1: "../audio-player-component/assets/mp3/gamemusic.mp3",
        2: "../audio-player-component/assets/mp3/opera-what.mp3",
        3: "../audio-player-component/assets/mp3/retrowave.mp3",
        4: "../audio-player-component/assets/mp3/aaaaaaaaaaaaaaaaaaaaaaaaa.mp3",
        5: "../audio-player-component/assets/mp3/edge-of-space.mp3",
        // add more songs here ...
      }

      this.current_song = 0
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
      let time = time_info_current + " (" + time_info_duration + ")"
      let volume = (this.volume*100).toString()
      volume = "volume : " + volume.substring(0,4)+"%"
      let loop = this.loop ? "loop : on" : "loop : off"

      
      /*for(let i = 30; i <= 360; i += 30) {
        let x = i*Math.round(Math.cos(i))
        let y = i*Math.round(Math.sin(i))
        this.draw_line(x, y)
      }*/
      
      this.draw_crown_section(140,160, this.color_2)
      this.draw_crown_section(120, 140, this.color_2)
      this.draw_crown_section(100, 120, this.color_2)
      this.draw_crown_section(80, 100, this.color_1)
      this.draw_crown_section(60, 80, this.color_2)
      this.draw_crown_section(40, 60, this.color_2)
      this.draw_crown_section(20, 40, this.color_2)
      
      this.draw_crown_section(160, 20, this.color_1)


      this.draw_circle(210, this.color_7)
      // update song time circle
      this.update_time_ui(this.color_2)
      this.draw_circle(200, this.color_5)
      this.draw_circle(100, this.color_3)

      // loop zone (center)
      //this.draw_rect(270, 510, 60, 90)

      // play zone (left center)
      //this.draw_rect(180, 490, 60, 105)

      // pause zone (right center)
      //this.draw_rect(this.ctx, 360, 490, 60, 105)

      // next song zone (right right right center)
      //this.draw_rect(500, 380, 60, 90)

      // previous song zone (left left left center)
      //this.draw_rect(50, 380, 60, 90)

      //this.ctx.strokeText("./pause.png", 360, 510)

      this.draw_circle(this.ctx)

      this.ctx.strokeStyle = "#000000"
      this.ctx.font = "13.5px Arial sans-serif"
      // For a canvas 600*600
      this.ctx.strokeText(file_name, this.get_title_position(file_name), this.canvas_center_y)
      this.ctx.strokeText(time, this.canvas_center_x-35, this.canvas_center_y+40)
      this.ctx.strokeText(volume, this.canvas_center_x-32, this.canvas_center_y+60)
      if(this.loop) this.ctx.strokeStyle = "#2B7A0B"
      this.ctx.strokeText(loop, this.canvas_center_x-24, this.canvas_center_y+80)

      this.ctx.strokeStyle = "#FFFFFF"
      this.ctx.font = "50px Arial"
      this.ctx.strokeText("\u{21BB}", this.canvas_center_x-20, this.canvas_center_y+270)
      this.ctx.strokeText("\u{25B6}", this.canvas_center_x-105, this.canvas_center_y+250)
      this.ctx.strokeText("\u{23F8}", this.canvas_center_x+60, this.canvas_center_y+250)
      this.ctx.strokeText("\u{23EE}", this.canvas_center_x-180, this.canvas_center_y+210)
      this.ctx.strokeText("\u{23ED}", this.canvas_center_x+150, this.canvas_center_y+210)

      this.ctx.font = "35px Arial"
      this.ctx.strokeText("-10s", this.canvas_center_x-260, this.canvas_center_y+140)
      this.ctx.strokeText("+10s", this.canvas_center_x+185, this.canvas_center_y+140)
      
      requestAnimationFrame(() => this.update_ui())
    }

    update_time_ui(color) {
      let percent_done = (this.player.currentTime / this.player.duration)
      //console.log(percent_done)
      let end_angle = 360*percent_done
      //let end_angle = percent_done < 1 ? 90 : 360*percent_done //improve
      this.draw_crown_section(0, end_angle, color, color, 210)
    }

    draw_graph() {
      requestAnimationFrame(() => this.update_graph())
    }

    update_graph(graph_initial_point = 1) {
      //if(!this.play) cancelAnimationFrame(request) TODO

      this.ctx_graph.clearRect(0, 0, this.width_graph, this. height_graph)
      let data = this.get_frequency_data()

      //console.log(data)

      let stick_width = this.width_graph/data.length
      this.ctx_graph.fillStyle = this.color_6

      //this.ctx_graph.fillRect(10,190,stick_width,-100)

      for(let i=0; i<data.length; i++){
        let v_data = data[i] / 512
        let h = -(v_data*this.height_graph)
        this.ctx_graph.fillRect(i*stick_width,197,stick_width,h)
      }

      this.ctx_graph.strokeStyle = this.color_2
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

    set_analyser_node(fftSize = 2048) {
      this.analyser_node = this.audio_ctx.createAnalyser()
      this.analyser_node.fftSize = fftSize // 2048 default
      this.source_node.connect(this.analyser_node).connect(this.audio_ctx.destination)
    }

    get_frequency_data(analyser_node = this.analyser_node) {
      const buffer_length = this.analyser_node.frequencyBinCount
      const data_array = new Uint8Array(buffer_length)
      this.analyser_node.getByteFrequencyData(data_array)
      return data_array
    }


    set_web_audio() {
      this.audio_ctx = new AudioContext()
      this.source_node = this.audio_ctx.createMediaElementSource(this.player)
      
      this.set_filter_node("lowpass")
      this.set_analyser_node(256)
      this.set_audio_stereo_panner_node()
      //this.set_audio_buffer_node()
    }

    set_audio_player() {
      this.player.src = this.song_urls[this.current_song]
      //this.player.muted = false
      console.log("<audio> muted : " + this.player.muted)
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

    set_audio_stereo_panner_node() {
      this.audio_stereo_panner_node = this.audio_ctx.createStereoPanner()
      this.source_node.connect(this.audio_stereo_panner_node).connect(this.audio_ctx.destination)
    }

    set_audio_speed(value) {
      this.speed = value
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
      title = (title.length < 27) ? title : title.substring(0,27)
      return title
    }

    get_title_position(title) {
      let x = title.length > 25 ? (this.canvas_center_x-85): ((this.canvas_center_x)-(title.length*3))
      console.log(x)
      return x
    }

    draw_circle(r = this.radius, background_color = "#FFFFFF", stroke_color = "#000000") {
      this.ctx.save()
      this.ctx.beginPath();
      this.ctx.arc(this.canvas_center_x, this.canvas_center_y, r, 0, 2 * Math.PI, false);
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

    draw_crown_section(initial_angle, end_angle, background_color, stroke_color = "#000000", radius = this.height) {
      this.ctx.save()
      this.ctx.fillStyle = background_color
      this.ctx.strokeStyle = stroke_color
      this.ctx.beginPath()
      this.ctx.moveTo(this.canvas_center_x, this.canvas_center_y)
      this.ctx.arc(this.canvas_center_x, this.canvas_center_y, radius, this.degrees_to_radiants(initial_angle), this.degrees_to_radiants(end_angle))
      this.ctx.closePath()
      this.ctx.fill()
      this.ctx.stroke()
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
      this.loop = this.player.loop
      //console.log("loop : " + this.player.loop)
    }

    play() {
      //console.log("play !")
      this.player.play()
      this.draw_graph()
    }

    pause() {
      //console.log("pause !")
      this.player.pause()
    }

    set_frequency(value) {
      this.filter_node.frequency.value = parseInt(value)
      //console.log("Changed frequency to : " + value)
    }

    set_stereo_direction(value) {
      this.stereo_pan_value = value
      this.audio_stereo_panner_node.pan.value = this.stereo_pan_value
    }

    set_volume(value) {
      this.player.volume = value
      this.volume = value
    }

    set_next_song() {
      this.current_song = this.current_song+1 <= Object.keys(this.song_urls).length-1 ? this.current_song+1 : 0
      console.log(this.current_song)
      this.player.src = this.song_urls[this.current_song]
      this.set_audio_speed(this.speed)
      this.set_frequency(this.frequency) //Doesn't work
      this.set_stereo_direction(this.stereo_pan_value)
      this.set_volume(this.volume)
      this.play()
    }

    set_previous_song() {
      //(Object.keys(this.song_urls).length)
      this.current_song = this.current_song-1 > 0 ? this.current_song-1 : 0
      this.player.src = this.song_urls[this.current_song]
      this.set_audio_speed(this.speed)
      this.set_frequency(this.frequency) // Doesn't work
      this.set_stereo_direction(this.stereo_pan_value)
      this.set_volume(this.volume)
      this.player.play()
    }

    plus_seconds(seconds) {
      this.player.pause()
      this.player.currentTime += seconds
      //console.log("audio time changed : " + this.player.currentTime)
      this.player.play()
    }

    less_seconds(seconds) {
      this.player.pause()
      this.player.currentTime -= seconds
      //console.log("audio time changed : " + this.player.currentTime)
      this.player.play()
    }

    set_listeners() {
      this.shadowRoot.querySelector('#volume_knob').oninput =  (event) => {
        //if(this.audio_ctx.state !== 'running') {this.audio_ctx.resume();}
        this.set_volume(event.target.value)
      }
      this.shadowRoot.querySelector('#frequency_knob').oninput = (event) => {
        //if(this.audio_ctx.state !== 'running') {this.audio_ctx.resume();}
        this.set_frequency(event.target.value)
      }
      this.shadowRoot.querySelector('#speed_knob').oninput = (event) => {
        //if(this.audio_ctx.state !== 'running') {this.audio_ctx.resume();}
        this.set_audio_speed(event.target.value)
      }
      this.shadowRoot.querySelector("#stereo_knob").oninput = (event) => {
        //if(this.audio_ctx.state !== 'running') {this.audio_ctx.resume();}
        this.set_stereo_direction(event.target.value)
      }
      this.shadowRoot.querySelector("#canvas").onclick = (event) => {
        if(this.audio_ctx.state !== 'running') {this.audio_ctx.resume();}

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
        let next_song_zone = {x: 450, y: 440, width: 60, height: 120}
        let previous_song_zone = {x: 90, y: 440, width: 60, height: 120}
        let loop_zone = {x: 270, y: 510, width: 60, height: 90}
        let plus10_zone = {x: 500, y: 380, width: 60, height: 90}
        let less10_zone = {x: 50, y: 380, width: 60, height: 90}

        if (is_inside(mouse_pos, play_zone)) this.play()
        else if (is_inside(mouse_pos, pause_zone)) this.pause() && this.audio_ctx.resume()
        else if (is_inside(mouse_pos, next_song_zone)) this.set_next_song()
        else if (is_inside(mouse_pos, previous_song_zone)) this.set_previous_song()
        else if (is_inside(mouse_pos, loop_zone)) this.set_loop()
        else if (is_inside(mouse_pos, less10_zone)) this.less_seconds(10)
        else if (is_inside(mouse_pos, plus10_zone)) this.plus_seconds(10)
      }
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
      this.set_web_audio()
    }
}

customElements.define("audio-player", AudioPlayer)