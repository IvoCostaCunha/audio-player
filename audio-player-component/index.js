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
  background-color: beige;
  border-radius : 50%;
  box-shadow: 2px 2px 8px rgba(32, 32, 32, 0.4), -2px -2px 8px rgba(10,10,10,1);

}
#buttons_div {
  background-color: blue;
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

class AudioPlayer extends HTMLElement {
    constructor() {
      super()
      this.attachShadow({mode: 'open'})
      this.html = style
      this.html = this.html + template
      this.song = "Song A"
      this.artist = "Artist A"
      this.album = "Album A"
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
      let canvas = this.shadowRoot.querySelector("#canvas")
      let ctx = canvas.getContext("2d")
      ctx.antialias = true
      ctx.font = '12px Arial'

      requestAnimationFrame(() => {this.update_ui(ctx)})
    }

    update_ui(ctx) {
      let file_name = this.player.src.substring(this.player.src.lastIndexOf ('/')+1)
      let time_info = this.shadowRoot.querySelector("#player").duration

      this.draw_circle(ctx)
      
      for(let i = 30; i <= 360; i += 30) {
        let x = i*Math.round(Math.cos(i))
        let y = i*Math.round(Math.sin(i))
        //console.log("x : " + x + " y : " + y)
        this.draw_line(ctx, x, y)
      }
      
      this.draw_circle(ctx, 210)
      this.draw_circle(ctx, 200)
      this.draw_circle(ctx, 100)

      console.log("song duration : " + time_info)
      
      // For a canvas 600*600
      ctx.strokeText(file_name, this.canvas_center_x-45, this.canvas_center_y)
      ctx.strokeText(time_info, this.canvas_center_x-20, this.canvas_center_y+40)

      ctx.clearRect(0, 0, this.width, this.height)


      setTimeout(() => {console.log("waiting 2s")},"10000")

      //this.height += 1

      requestAnimationFrame(this.update_ui)
    }

    draw_circle(ctx, r = this.radius, center_x = this.canvas_center_x, center_y = this.canvas_center_y, background_color = "#FFFFFF", stroke_color = "#000000") {
      ctx.beginPath();
      ctx.arc(center_x, center_y, r, 0, 2 * Math.PI, false);
      ctx.fillStyle = background_color;
      ctx.lineWidth = 1;
      ctx.strokeStyle = stroke_color;
      ctx.fill();
      ctx.stroke();
    }

    draw_line(ctx, end_x, end_y, start_x = this.canvas_center_x, start_y = this.canvas_center_y,  stroke_color = "#000000") {
      ctx.beginPath();
      ctx.moveTo(start_x, start_y)
      ctx.lineTo(end_x, end_y)
      ctx.lineWidth = 1;
      ctx.strokeStyle = stroke_color
      ctx.stroke();
    }

    set_audio_player() {
      this.player = this.shadowRoot.querySelector("#player")
      this.player.src = "https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
      
      this.set_listeners()

    }

    set_listeners() {
      this.shadowRoot.querySelector("#play").onclick = () => {
        console.log("play !")
        this.player.play()
      }
      this.shadowRoot.querySelector("#pause").onclick = () => {
        console.log("pause !")
        this.player.pause()
      }
      this.shadowRoot.querySelector("#loop").onclick = () => {
        // condition ? exprIfTrue : exprIfFalse
        this.player.loop = this.player.loop ? false : true
        console.log("loop : " + this.player.loop)
      }
      this.shadowRoot.querySelector("#volume").oninput = (event) => {
        const volume = event.target.value
        this.player.volume = volume
        const label_text = "volume : " + (volume*100)
        this.shadowRoot.querySelector("#volume-value").textContent = label_text
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
      this.height = this.shadowRoot.querySelector("canvas").height
      this.width = this.shadowRoot.querySelector("canvas").width
      this.canvas_center_x = this.width/2
      this.canvas_center_y = this.height/2
      console.log("canvas center : x : " + this.canvas_center_x  + " y : " + this.canvas_center_y)
      this.radius = this.shadowRoot.querySelector("canvas").width/2
      console.log("radius : " + this.radius)
      this.fix_relative_urls()
      this.set_audio_player()
      this.draw_ui()
    }
}

customElements.define("audio-player", AudioPlayer)