nv.addGraph(function() {
  var chart = nv.models.discreteBarChart()
      .x(function(d) { return d.label })    //Specify the data accessors.
      .y(function(d) { return d.value })
      .staggerLabels(false)    //Too many bars and not enough room? Try staggering labels.
      .tooltips(true)        //Don't show tooltips
      .showValues(true)       //...instead, show the bar value right on top of each bar.
      .transitionDuration(250)
      ;

  d3.select('#chart svg')
      .datum(exampleData())
      .call(chart);

  nv.utils.windowResize(chart.update);

  return chart;
});

//Each bar represents a single discrete quantity.
function exampleData() {
 return  [ 
    {
      key: "Cumulative Return",
      values: [
        { 
          "label" : "1949" ,
          "value" : 29.765957771107,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "B Label" , 
          "value" : 0,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "C Label" , 
          "value" : 32.807804682612,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "D Label" , 
          "value" : 196.45946739256,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "E Label" ,
          "value" : 0.19434030906893,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "F Label" , 
          "value" : 98.079782601442,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "G Label" , 
          "value" : 13.925743130903,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "H Label" , 
          "value" : 5.1387322875705,
          "color" : "#03a9f4"
        }, 
        { 
          "label" : "I Label" , 
          "value" : 12.807804682612,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "J Label" , 
          "value" : 19.45946739256,
          "color" : "#03a9f4"
        }
      ]
    }
  ]

}
