chart("data/topic_year_data.json", "pink");

var datearray = [];
var colorrange = [];

function chart(jsonpath, color) {

  //Set Color
  if (color == "blue") {
    colorrange = ["#045A8D", "#2B8CBE", "#74A9CF", "#A6BDDB", "#D0D1E6", "#F1EEF6"];
  } else if (color == "pink") {
    colorrange = ["#F22929", "#FB966E", "#F76F6F", "#F596AA", "#9F353A", "#E87A90", "#D0104C", "#ed85b0", "#CB1B45", "#BF6766"];
  } else if (color == "orange") {
    colorrange = ["#9D180F", "#DE5050", "#CE3E3F", "#FF636E", "#EF9B92", "#DED3B5"];
  }
  strokecolor = colorrange[0];

  var format = d3.time.format("%y");

  var margin = {
    top: 20,
    right: 150,
    bottom: 70,
    left: 50
  };
  var width = document.body.clientWidth - margin.left - margin.right;
  var height = 600 - margin.top - margin.bottom;

  //init tooltip
  var tooltip1 = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 1.0);

  var tooltip = d3.select("#years")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "20")
    .style("visibility", "hidden")
    .style("top", "30px")
    .style("left", "55px")
    .style("padding", "10px")
    .style("margin", "10px");

  var x = d3.scale.linear()
    .range([0, width]);

  var y = d3.scale.linear()
    .range([height - 10, 0]);

  var z = d3.scale.ordinal()
    .range(colorrange);

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(function(d) {
      return String(d);
    });;

  var yAxis = d3.svg.axis()
    .scale(y);

  var yAxisr = d3.svg.axis()
    .scale(y);

  var stack = d3.layout.stack()
    .values(function(d) {
      return d.values;
    })
    .x(function(d) {
      return d.year;
    })
    .y(function(d) {
      return d.value;
    });

  var nest = d3.nest()
    .key(function(d) {
      return d.key;
    });

  var area = d3.svg.area()
    .interpolate("cardinal")
    .x(function(d) {
      return x(d.year);
    })
    .y0(function(d) {
      return y(d.y0);
    })
    .y1(function(d) {
      return y(d.y0 + d.y);
    });

  var svg = d3.select("#years").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  //data handle
  var graph = d3.json(jsonpath, function(data) {
    var nocommon = true;
    var pre_datas = [];
    //處理資料格式
    for (var i = 0; i < data['topics'].length-1; i++) {
      data["years"].forEach(function(d) {
        var year = data["years"].indexOf(d);
        var pre_data = {
          "topic": i,
          "key": data['topics'][i],
          "value": data[d][i] / 100,
          "year": d
        };
        pre_datas.push(pre_data);
      });
    }
    pre_datas.forEach(function(d) {
      d.value = +d.value;
    });
    var layers = stack(nest.entries(pre_datas));
    //layers 為整理過後的資料

    x.domain(d3.extent(pre_datas, function(d) {
      return String(d.year);
    }));
    y.domain([0, 0.6]);

    //Draw layer
    var layer = svg.selectAll(".layer")
      .data(layers)
      .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) {
        return area(d.values);
      })
      .style("fill", function(d, i) {
        return z(i);
      });

    var XAXIS = svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    var YRAXIS = svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width + ", 0)")
      .call(yAxis.orient("right"));
    var YLAXIS = svg.append("g")
      .attr("class", "y axis")
      .call(yAxis.orient("left"));
    var layer = svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition()
          .duration(250)
          .attr("opacity", function(d, j) {
            return j != i ? 0.6 : 1;
          })
      })
      .on("click", function(d) {
        topicid = parseInt(d["values"][0].topic) + 1;
        window.open("./topic.html#" + topicid)
      })
      .on("mousemove", function(d, i) {
        mousex = d3.mouse(this);
        mousex = mousex[0];
        var invertedx = x.invert(mousex);
        invertedx = Math.round(invertedx);
        var selected = (d.values);
        for (var k = 0; k < selected.length; k++) {
          datearray[k] = selected[k].year
        }
        mouseyear = datearray.indexOf(invertedx.toString());

        pro = d.values[mouseyear].value;
        tooltip1.html(d.key + "<br>" + pro)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY + 20) + "px")
          .style("display", "block");
        d3.select(this)
          .classed("hover", true)
          .attr("stroke", strokecolor)
          .attr("stroke-width", "0.5px"),
          tooltip.html(d.key + "<br>" + pro).style("visibility", "visible");

      })
      .on("mouseout", function(d, i) {
        svg.selectAll(".layer")
          .transition()
          .duration(250)
          .attr("opacity", "1");
        tooltip1.style("display", "none");
        d3.select(this)
          .classed("hover", false)
          .attr("stroke-width", "0px"),
          tooltip.html(d.key + "<br>" + pro).style("visibility", "hidden");
      });
    var vertical = d3.select("#years")
      .append("div")
      .attr("class", "remove")
      .style("position", "absolute")
      .style("z-index", "19")
      .style("width", "1px")
      .style("height", "800px")
      .style("top", "10px")
      .style("bottom", "30px")
      .style("left", "0px")
      .style("background", "#fff");

    d3.select("#years")
      .on("mousemove", function() {
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style("left", mousex + "px")
      })
      .on("mouseover", function() {
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style("left", mousex + "px")
      });

    //處理按按鈕之後 做資料的轉化 (有/無Common)
    var click = d3.select("#iclick")
      .on("click", function() {
        if (nocommon == true) {
          var pre_datas = [];
          for (var i = 0; i < data['topics'].length; i++) {
            data["years"].forEach(function(d) {
              var year = data["years"].indexOf(d);
              var pre_data = {
                "topic": i,
                "key": data['topics'][i],
                "value": data[d][i] / 100,
                "year": d
              };
              pre_datas.push(pre_data);
            });
          }
          pre_datas.forEach(function(d) {
            d.value = +d.value;
          });
          var layers = stack(nest.entries(pre_datas));

          var layer = svg.selectAll(".layer")
            .data(layers);


          layer.transition().duration(500).attr("d", function(d) {
              return area(d.values);
            })
            .style("fill", function(d, i) {
              return z(i);
            }).attr("opacity", 1);

          layer.enter().append("path").transition().delay(500).duration(5000).ease("back").attr("class", "layer")
            .attr("d", function(d) {
              return area(d.values);
            });
          layer.style("fill", function(d, i) {
              return z(i);
            })
            .attr("opacity", 1)
            .on("click", function(d) {
              topicid = parseInt(d["values"][0].topic) + 1;
              window.open("./topic.html#" + topicid)
            })
            .on("mouseover", function(d, i) {
              svg.selectAll(".layer").transition()
                .duration(250)
                .attr("opacity", function(d, j) {
                  return j != i ? 0.6 : 1;
                })
            })
            .on("mousemove", function(d, i) {
              mousex = d3.mouse(this);
              mousex = mousex[0];
              var invertedx = x.invert(mousex);
              invertedx = Math.round(invertedx);
              var selected = (d.values);
              for (var k = 0; k < selected.length; k++) {
                datearray[k] = selected[k].year
              }
              mouseyear = datearray.indexOf(invertedx.toString());

              pro = d.values[mouseyear].value;
              tooltip1.html(d.key + "<br>" + pro)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("display", "block");
              d3.select(this)
                .classed("hover", true)
                .attr("stroke", strokecolor)
                .attr("stroke-width", "0.5px"),
                tooltip.html(d.key + "<br>" + pro).style("visibility", "visible");

            })
            .on("mouseout", function(d, i) {
              svg.selectAll(".layer")
                .transition()
                .duration(250)
                .attr("opacity", "1");
              tooltip1.style("display", "none");
              d3.select(this)
                .classed("hover", false)
                .attr("stroke-width", "0px"),
                tooltip.html(d.key + "<br>" + pro).style("visibility", "hidden");
            });
          document.getElementById("iclick").innerHTML = "包含文藝";
          nocommon = false;

        } else {
          var pre_datas = [];
          for (var i = 0; i < data['topics'].length-1; i++) {
            data["years"].forEach(function(d) {
              var year = data["years"].indexOf(d);
              var pre_data = {
                "topic": i,
                "key": data['topics'][i],
                "value": data[d][i] / 100,
                "year": d
              };
              pre_datas.push(pre_data);
            });
          }
          pre_datas.forEach(function(d) {
            d.value = +d.value;
          });
          var layers = stack(nest.entries(pre_datas));

          var layer = svg.selectAll(".layer")
            .data(layers);
          layer.exit().remove();

          layer.transition().duration(750).attr("d", function(d) {
              return area(d.values);
            })
            .style("fill", function(d, i) {
              return z(i);
            }).attr("opacity", 1);

          layer
            .attr("opacity", 1)
            .on("click", function(d) {
              topicid = parseInt(d["values"][0].topic) + 1;
              window.open("./topic.html#" + topicid)
            })
            .on("mouseover", function(d, i) {
              svg.selectAll(".layer").transition()
                .duration(250)
                .attr("opacity", function(d, j) {
                  return j != i ? 0.6 : 1;
                })
            })
            .on("mousemove", function(d, i) {
              mousex = d3.mouse(this);
              mousex = mousex[0];
              var invertedx = x.invert(mousex);
              invertedx = Math.round(invertedx);
              var selected = (d.values);
              for (var k = 0; k < selected.length; k++) {
                datearray[k] = selected[k].year
              }
              mouseyear = datearray.indexOf(invertedx.toString());

              pro = d.values[mouseyear].value;
              tooltip1.html(d.key + "<br>" + pro)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("display", "block");
              d3.select(this)
                .classed("hover", true)
                .attr("stroke", strokecolor)
                .attr("stroke-width", "0.5px"),
                tooltip.html(d.key + "<br>" + pro).style("visibility", "visible");

            })
            .on("mouseout", function(d, i) {
              svg.selectAll(".layer")
                .transition()
                .duration(250)
                .attr("opacity", "1");
              tooltip1.style("display", "none");
              d3.select(this)
                .classed("hover", false)
                .attr("stroke-width", "0px"),
                tooltip.html(d.key + "<br>" + pro).style("visibility", "hidden");
            });
          document.getElementById("iclick").innerHTML = "不包含文藝";
          nocommon = true;
        }
      });
  });
}