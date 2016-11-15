d3.json('vendor/nvd3/examples/cumulativeLineData.json', function(data) {
nv.addGraph(function() {
  var chart = nv.models.pieChart()
      .x(function(d) { return d.label })
      .y(function(d) { return d.value })
      .showLabels(true);

    d3.select('#chart svg')
        .datum(data)
        .transition().duration(350)
        .call(chart);

    //TODO: Figure out a good way to do this automatically
    nv.utils.windowResize(chart.update);

    return chart;
  });
});

