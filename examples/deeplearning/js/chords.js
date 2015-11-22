var chord_view = {
  klass: null,
  correlations: [],
};

chord_view.size = 500;
chord_view.innerRadius = chord_view.size * .39;
chord_view.outerRadius = chord_view.innerRadius * 1.1;

function drawChord(){

  d3.select("#chord svg").remove();

  chord_view.svg = d3.select("#chord").append("svg")
      .attr("width", chord_view.size)
      .attr("height", chord_view.size)
      .append("g")
        .attr("transform", "translate(" + chord_view.size / 2 + "," + chord_view.size / 2 + ")");

  chord_view.svg.append("circle").attr("class", "textcircle").attr("r", chord_view.outerRadius * 1.16);
  chord_view.svg.append("circle").attr("class", "chordcircle").attr("r", chord_view.outerRadius);

  chord_view.layout = d3.layout.chord()
                        .padding(0.0174533);

  chord_view.indexByName = {};
  chord_view.nameByIndex = {};
  chord_view.n = 0;

  chord_view.regions.forEach(function(r) {
    chord_view.nameByIndex[chord_view.n] = r;
    chord_view.indexByName[r] = chord_view.n;
    chord_view.n++;
  });

  var matr = new Array(chord_view.n);
  for(var i = 0; i < chord_view.n; i++){
    matr[i] = new Uint8Array(chord_view.n);
    for(var j = 0; j < chord_view.n; j++)
      matr[i][j] = 1;
  }
  chord_view.layout.matrix(matr);

  var ticks = chord_view.svg.append("g").selectAll("g")
      .data(chord_view.layout.groups)
    .enter().append("g")
      .attr("class", "group")
      .attr("transform", function(d) {
        return "rotate(" + (d.endAngle * 180 / Math.PI - 90) + ")"
            + "translate(" + chord_view.outerRadius + ",0)";
      });

  ticks.append("text")
      .attr("x", function(d) {
        return d.startAngle > Math.PI ? 14 : 2;
      })
      .attr("dy", ".35em")
      .attr("class", "region")
      .attr("fill", function(d) {
        return brain_view.cat_color(chord_view.nameByIndex[d.index]);
      })
      .attr("transform", function(d) {
        return d.startAngle > Math.PI ? "rotate(180)translate(-16)" : null;
      })
      .style("opacity", function(d) {
        var red = chord_view.matrix[d.index].reduce(function(prev, ds) {
          return prev + Math.abs(ds);
        }, 0);
        return red > 0 ? 1 : 0;
      })
      .style("text-anchor", function(d) {
        return d.startAngle > Math.PI ? "end" : null;
      })
      .text(function(d) {
        return chord_view.nameByIndex[d.index];
      })
      .on("click", function(d, i) {
        brain_view.centerAt(chord_view.nameByIndex[d.index]);
      });

  function real(d){
    return chord_view.matrix[d.source.index][d.target.index];
  }

  chord_view.svg.selectAll(".chord")
      .data(
        chord_view.layout.chords().filter(function(d){
          return Math.abs(real(d)) > 0;
        })
      )
    .enter()
      .append("path")
      .attr("class", "chord")
      .style("fill", function(d) {
        return chord_view.correlation_colors(real(d));
      })
      .style("opacity", function(d) {
        return Math.abs(real(d));
      })
      .style('stroke', function(d) {
        return chord_view.correlation_colors(real(d));
      })
      .style('stroke-width', function(d) {
        return Math.abs(real(d)) * 3;
      })
      .attr("d", d3.svg.chord().radius(chord_view.innerRadius))
      .on("mouseover", function(d) {
        d3.select(this)
          .style('stroke-width', 5)
          .style('stroke', chord_view.correlation_colors(real(d)));
      })
      .on("mouseout", function(d) {
        d3.select(this)
          .style('stroke-width', Math.abs(real(d)) * 3);
      })
      .on("click", function(d, i) {
        var f = parseInt(chord_view.nameByIndex[d.source.index]);
        var t = parseInt(chord_view.nameByIndex[d.target.index]);
        console.log([f, t]);
        brain_view.highlight([f, t]);
      });

}

$(document).ready(function () {

  window.brain_view = new NeuroView($, $('#brain'), 'data/cc200.json', ['xy', 'yz', 'xz'], {
    highlight: true
  });

  brain_view.onload(function(){

    chord_view.correlation_colors = d3.scale.linear()
      .domain([-1, 0, 1])
      .range(["blue", "white", "red"]);

    brain_view.cat_color = d3.scale.category20b();
    brain_view.color = function(region){
      if(this._highlight.length > 0){
        if(this._highlight.indexOf(region) > -1){
          var c = this._color_highlight(region);
          return d3.rgb(c, c, c).toString();
        }
        return brain_view.cat_color(0);
      }
      return brain_view.cat_color(region);
    };

    brain_view.contourn = function(){
      return this._highlight.length > 0;
    };

    brain_view.draw();

    d3.json("data/test.json", function(error, correlations) {
      if (error) throw error;

      console.log('Data loaded');
      d3.select("#chord").empty();

      chord_view.regions = correlations.regions;
      chord_view.matrix = correlations.matrix;
      drawChord();

    });

  });
});