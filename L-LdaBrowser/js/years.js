var topicid = parseInt(location.hash.slice(1,location.hash.length));
var title_name = ['Common','刊物的立場與反省','自由民主的基本概念','法治','表現自由／出版法問題','其他基本權問題',
                      '責任閣制／責任政治','行政中立──國民黨退出軍警特','司法','立法院問題','監察',
                      '考試','在野黨','國民黨體質改造／國民黨問題','地方自治','地方選舉問題','軍隊',
                      '教育／救國團','外交／聯合國問題','總統三連任問題／修憲／國大','反共救國會議',
                      '反共','經濟／財政','文藝'];


d3.json("data/topic_year_data.json", function(error, data1) {
  var data = exampleData();
  data[0].key = "Topic"+topicid+" "+title_name[topicid-1];
  console.log(data[0].values);
  data[0].values.forEach(function(d){
    // console.log(d.label);
    // console.log(data1[d.label][topicid-1])
    d.value = data1[d.label][topicid-1]
  });
  d3.json("data/yearstwords.json", function(d2) {
    var defyear = "1949";
    var wordData = [];
    for (var i = 0; i < d2[defyear].topics.length; i++) {
      var obj = {};
      for (var key in d2[defyear]) {
        obj[key] = d2[defyear][key][i];
      }
      wordData.push(obj);
    }
    var wordData = wordData.filter(function(d3) {
      return (d3.topics == "Topic" + topicid);
    });
    for (var i = 0; i < 5; i++) {
      //console.log(wordData[i]);
      document.getElementById("wt" + (i + 1)).innerHTML = wordData[i].words;
      document.getElementById("yt" + (i + 1)).innerHTML = defyear;

      var svg = "<svg><g><rect x=\"0\" y=\"16\" width=\"" + parseFloat(wordData[i].probs) * 1000 + "\" height=\"13\" fill=\"#03a9f4\"></rect><text x=\"105\" y=\"27\" font-family=\"Verdana\" font-size=\"14px\"> " + (parseFloat(wordData[i].probs)*100) + "% </text></g></svg>";
      //console.log(parseFloat(wordData[i].prob)*10);
      document.getElementById("pt" + (i + 1)).innerHTML = svg;
      $("#wt"+(i+1)).on("click",function(){console.log("!23")});
    }

  })
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
        .datum(data)
        .call(chart);

    d3.selectAll(".nv-bar")
      .on("click",function(d){
        //console.log(d.label);
        d3.json("data/yearstwords.json",function(d2){
          var wordData = [];
          for (var i = 0; i < d2[d.label].topics.length; i++) {
            var obj = {};
            for (var key in d2[d.label]) {
              obj[key] = d2[d.label][key][i];
            }
            wordData.push(obj);
          }
          var wordData = wordData.filter(function(d3){
            return (d3.topics == "Topic"+topicid);
          });
          for (var i = 0 ; i < 5 ; i ++){
            console.log(wordData[i]);
            document.getElementById("wt"+(i+1)).innerHTML = wordData[i].words;
            document.getElementById("yt"+(i+1)).innerHTML = d.label;

            var svg = "<svg><g><rect x=\"0\" y=\"16\" width=\""+parseFloat(wordData[i].probs)*1000+"\" height=\"13\" fill=\"#03a9f4\"></rect><text x=\"105\" y=\"27\" font-family=\"Verdana\" font-size=\"14px\"> "+(parseFloat(wordData[i].probs)*100)+"% </text></g></svg>";
            //console.log(parseFloat(wordData[i].prob)*10);
            document.getElementById("pt"+(i+1)).innerHTML = svg;
          }

        })
      });

    nv.utils.windowResize(chart.update);
    return chart;
  });
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
          "label" : "1950" , 
          "value" : 0,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "1951" , 
          "value" : 32.807804682612,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "1952" , 
          "value" : 196.45946739256,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "1953" ,
          "value" : 0.19434030906893,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "1954" , 
          "value" : 98.079782601442,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "1955" , 
          "value" : 13.925743130903,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "1956" , 
          "value" : 5.1387322875705,
          "color" : "#03a9f4"
        }, 
        { 
          "label" : "1957" , 
          "value" : 12.807804682612,
          "color" : "#03a9f4"
        } , 
        { 
          "label" : "1958" , 
          "value" : 19.45946739256,
          "color" : "#03a9f4"
        },
        { 
          "label" : "1959" , 
          "value" : 19.45946739256,
          "color" : "#03a9f4"
        },
        { 
          "label" : "1960" , 
          "value" : 19.45946739256,
          "color" : "#03a9f4"
        }
      ]
    }
  ]

}