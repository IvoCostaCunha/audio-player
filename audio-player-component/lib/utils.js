update_graph(stick_width = 10, graph_last_point = 2, graph_initial_point = 2) {
    let graph_point = graph_last_point < this.width_graph ? graph_last_point + stick_width + 2 : graph_initial_point
    let clear = graph_point >= this.width_graph
    this.ctx_graph.save()
    if(clear) this.ctx_graph.clearRect(0, 0, this.width_graph, this.height_graph)
    
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

    let frequency_value = Math.random()*10-100 // should be music values

    this.ctx_graph.fillRect(graph_point, 196, stick_width, frequency_value)
    this.ctx_graph.restore()
    requestAnimationFrame(() => this.update_graph(stick_width, graph_point))
  }
