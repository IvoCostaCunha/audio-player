import './lib/webaudio-controls.js';
// import here other components
// ex: my-equalizer

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

let style = `
<style>

#main_div {
  width: 100px;
  height:100px;
  margin: 0px auto;
}

#canvas_div{
  align-items: center;
  text-align: center
  display: flex-table;
  align-content: center;
  background-color: beige;
  
}
#canvas {
  border-radius : 50%;
  box-shadow: 2px 2px 8px rgba(32, 32, 32, 0.4), -2px -2px 8px rgba(10,10,10,1);

}
#buttons_div {
  border-radius : 25%;
  padding: 5%;
  background-color: beige;
  box-shadow: 2px 2px 8px rgba(32, 32, 32, 0.4), -2px -2px 8px rgba(10,10,10,1);
}
</style>
`

const template = `
<div id="main_div>
  <div id="canvas_div">
    <canvas id="canvas" width="600" height="600"></canvas><br>
  </div>
  <div id="buttons_div">
    <audio id="player"></audio><br>
    <button id="play">play</button>
    <button id="pause">pause</button>
    <button id="loop">loop</button><br>
    <input type="range" min="0" max="1" step="0.05" value="0.2" id="volume" /><br>
    <label id="volume-value">volume : 20</label><br>
    <!--<button id="mute">mute</button>-->
    <button id="plus">+10s</button>
    <button id="less">-10s</button> 
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

      let file_name = this.player.src.substring(this.player.src.lastIndexOf ('/')+1)
      let time_info = this.shadowRoot.querySelector("#player").duration

      
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
      this.ctx.strokeText(file_name, this.canvas_center_x-45, this.canvas_center_y)
      this.ctx.strokeText(time_info, this.canvas_center_x-20, this.canvas_center_y+40)

      requestAnimationFrame(() => this.update_ui())
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

    set_audio_player() {
      this.player = this.shadowRoot.querySelector("#player")
      this.player.src = "https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
      
      this.set_listeners()

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
    }

    pause() {
      console.log("pause !")
      this.player.pause()
    }

    set_volume(e) {
      const volume = e.target.value
      this.player.volume = volume
      const label_text = "volume : " + (volume*100)
      this.shadowRoot.querySelector("#volume-value").textContent = label_text
    }

    plus_seconds(seconds) {

    }

    less_seconds(seconds) {

    }

    set_listeners() {
      this.shadowRoot.querySelector("#play").onclick = () => {
        this.play()
      }
      this.shadowRoot.querySelector("#pause").onclick = () => {
        this.pause()
      }
      this.shadowRoot.querySelector("#loop").onclick = () => {
        this.set_loop()
      }
      this.shadowRoot.querySelector("#volume").oninput = (event) => {
       this.set_volume(event)
      }
      this.shadowRoot.querySelector("canvas").onclick = (event) => {

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
        else if (is_inside(mouse_pos, pause_zone)) this.pause()
        else if (is_inside(mouse_pos, plus10_zone)) this.plus_seconds(10)
        else if (is_inside(mouse_pos, less10_zone)) this.less_seconds(10)
        else if (is_inside(mouse_pos, loop_zone)) this.set_loop()
      }

      /*this.shadowRoot.querySelector("#mute").onclick = () => {
        this.player.mute = this.player.mute ? false : true
        console.log("muted : " + this.player.mute)
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
      this.shadowRoot.innerHTML = this.html;
      this.canvas = this.shadowRoot.querySelector("canvas")
      this.ctx = this.canvas.getContext("2d")
      this.height = this.canvas.height
      this.width = this.canvas.width
      this.canvas_center_x = this.width/2
      this.canvas_center_y = this.height/2
      console.log("canvas center : x : " + this.canvas_center_x  + " y : " + this.canvas_center_y)
      this.radius = this.canvas.width/2
      console.log("radius : " + this.radius)
      this.fix_relative_urls()
      this.set_audio_player()
      this.draw_ui()
    }
}

customElements.define("audio-player", AudioPlayer)