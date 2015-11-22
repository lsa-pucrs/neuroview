$(document).ready(function () {
  var axis = d3.svg.axis().orient("top").ticks(4);

  chord_view.slider = d3.slider()
                        .axis(axis)
                        .min(55)
                        .max(chord_view.max_threshold)
                        .value(chord_view.threshold)
                        .on("slide", function(evt, value) {
                          updateThreshold(value);
                        });

  d3.select("#threshold").call(chord_view.slider);
});