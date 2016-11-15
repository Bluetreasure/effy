var title_name = ['Common','刊物的立場與反省','自由民主的基本概念','法治','表現自由／出版法問題','其他基本權問題',
                      '責任閣制／責任政治','行政中立──國民黨退出軍警特','司法','立法院問題','監察',
                      '考試','在野黨','國民黨體質改造／國民黨問題','地方自治','地方選舉問題','軍隊',
                      '教育／救國團','外交／聯合國問題','總統三連任問題／修憲／國大','反共救國會議',
                      '反共','經濟／財政','文藝'];
//判斷網頁的參數#1/#2/#3 代表Topic的id
var topicid = parseInt(location.hash.slice(1,location.hash.length));
var headerstr = "Topic"+topicid+" <strong>"+title_name[topicid-1]+"</strong>";
document.getElementById("head").innerHTML = headerstr;

var lamData ;
var dat2;

d3.json("data/twords.json",function(error,data){
	lamData =  [];
	for(var i = 0 ; i < data.topics.length ; i ++){
		var obj = {};
		for (var key in data){
			obj[key] = data[key][i];
		}
		lamData.push(obj);
	}
	var dat2 = lamData.filter(function(d){
		//console.log(d);
		return d.topics == "Topic"+topicid;
	})
	var i = 1 
	var str = ""
	dat2.forEach(function(d){
		if (i <= 15){
			var prob = d.probs*100;
			//console.log(document.getElementById("w"+i).innerHTML);
			str = str+d.words+","
			document.getElementById("w"+i).innerHTML = d.words+"： <span class=\"pull-right\">"+prob.toFixed(2)+" % </span>";
			$("#d"+i).linearProgress("setProgress",d.probs*1000);
			$("#w"+i).on("click",function(){window.open("http://52.198.131.106:8080/%E8%94%A1%E8%80%81%E5%B8%AB/%E8%87%AA%E7%94%B1%E4%B8%AD%E5%9C%8B/search?q="+d.words,'_blank')});
			//document.getElementById("w"+i).href = "../%A6U%BA%D8%AD%B7%AE%E6/4/search_corpus_demo.html";
			i = i + 1 ;
			

		}
		
	});
	console.log(str);
});

//原本的Bar Chart
// // Visualization attributes
// //-----------
// var w = 700;
// var h = 500;
// var barPadding = 1;

// // SVG
// //-----------
// var svg = d3.select("#barchart")
//   .append("svg")
//   .attr("width", w)
//   .attr("height", h);

// // Bars
// //-----------
// dataset = [];

// d3.json("data/topic_year_data.json", function(error, data) {

// 	var str = ""
// 	data["years"].forEach(function(d, i) {
// 		//console.log(data[d][topicid - 1]);
// 		str = str + data[d][topicid - 1].toFixed(2) +","
// 		dataset.push(parseFloat(data[d][topicid - 1].toFixed(2) +","))
// 	});
// 	console.log(str)

// 	// Scales
// 	//-----------

// 	var formatPercent = d3.format(".2f");

// 	var xScale = d3.scale.ordinal()
// 		.domain(data["years"])
// 		.rangeRoundBands([100, w], 0.05);

// 	var yScale = d3.scale.linear()
// 		.domain([0, d3.max(dataset)])
// 		.range([h-100, 0]);

// 	var xAxis = d3.svg.axis()
// 			.scale(xScale)
// 			.orient("bottom");

// 	var yAxis = d3.svg.axis()
// 		.scale(yScale)
// 		.orient("left")
// 		.tickFormat(formatPercent);

// 	var bars = svg.selectAll('rect')
// 		.data(dataset)
// 		.enter()
// 		.append('rect')
// 		.attr('x', function(d, i) {
// 			return xScale(data["years"][i]);
// 		})
// 		.attr('y', function(d) {
// 			return yScale(d);
// 		})
// 		.attr('width', xScale.rangeBand())
// 		.attr('height', function(d) {
// 			return h-100-yScale(d);
// 		})
// 		.attr('fill', function(d) {
// 			return 'rgb(0, 0, " + (d * 10) + ")';
// 		})
// 		.on('click', function() {
// 			//sortBars();
// 		})
// 		.on('mouseover', function(d) {
// 			var xPos, yPos;

// 			//Get this bar's x/y values, then augment for the tooltip
// 			xPos = parseFloat(d3.select(this).attr("x")) + xScale.rangeBand() / 2;
// 			yPos = parseFloat(d3.select(this).attr("y")) / 2 + h / 2;
// 			console.log(d);
// 			d3.select('#tooltip')
// 				.style('left', xPos + 'px')
// 				.style('top', yPos + 'px')
// 				.select('#value')
// 				.text(d);

// 			//Show the tooltip
// 			d3.select('#tooltip').classed('hidden', false);
// 		})
// 		.on('mouseout', function() {
// 			//Remove the tooltip
// 			d3.select('#tooltip').classed('hidden', true);
// 		});

// 	// Labels
// 	//-----------

// 	var labels = svg.selectAll("text")
// 		.data(dataset)
// 		.enter()
// 		.append("text")
// 		.style("pointer-events", "none")
// 		.text(function(d) {
// 			return d;
// 		})
// 		.attr("text-anchor", "middle")
// 		.attr("x", function(d, i) {
// 			return xScale(data["years"][i]) + xScale.rangeBand() / 2;
// 		})
// 		.attr("y", function(d) {
// 			return yScale(d) + 14;
// 		})
// 		.attr("font-family", "sans-serif")
// 		.attr("font-size", "11px")
// 		.attr("fill", "white");
// 		// .on('click', function() {
// 		// 	sortBars();
// 		// });
// 	var xg = 
// 	svg.append("g")
// 		.attr("class", "x axis")
// 		.attr("transform", "translate(0," + 400+ ")")
// 		.call(xAxis)
// 		.selectAll("text1")
// 		.style("text-anchor", "end")
// 		.attr("dx", "-.8em")
// 		.attr("dy", "-.55em")
// 		.attr("fill","black")
// 		.attr("transform", "rotate(-90)");

// 	var yg = svg.append("g")
//       			.call(yAxis)
//       			.attr("transform","translate(100,0)")
//       			.append("text")
//       			.attr("transform","rotate(-90)");
// 	// Sorting utilities
// 	//-----------

// 	// var sortOrder = false;

// 	// var sortBars = function() {
// 	// 	sortOrder = !sortOrder;

// 	// 	var xScale0 = d3.scale.ordinal()
// 	// 	.domain(data["years"].sort(function(a,b){
// 	// 		if (sortOrder) {
// 	// 			return d3.ascending(a, b);
// 	// 		} else {
// 	// 			return d3.descending(a, b);
// 	// 		}
// 	// 	}))
// 	// 	.rangeRoundBands([100, w], 0.05);

// 	// 	var xAxis0 = d3.svg.axis()
// 	// 		.scale(xScale)
// 	// 		.orient("bottom");

// 	// 	svg.selectAll('rect')
// 	// 		.sort(function(a, b) {
// 	// 			return sortCallback(a, b, sortOrder);
// 	// 		})
// 	// 		.transition()
// 	// 		.delay(function(d, i) {
// 	// 			return i * 50;
// 	// 		})
// 	// 		.duration(1000)
// 	// 		.attr("x", function(d, i) {
// 	// 			return xScale(data["years"][i]);
// 	// 		});

// 	// 	labels
// 	// 		.sort(function(a, b) {
// 	// 			return sortCallback(a, b, sortOrder);
// 	// 		})
// 	// 		.transition()
// 	// 		.delay(function(d, i) {
// 	// 			return i * 50;
// 	// 		})
// 	// 		.duration(1000)
// 	// 		.attr("x", function(d, i) {
// 	// 			return xScale(data["years"][i]) + xScale.rangeBand() / 2;
// 	// 		});
// 	// 	xg.selectAll(".x.axis").call(xAxis).selectAll("g");

// 	// };

// 	// var sortCallback = function(a, b, order) {
// 	// 	if (order) {
// 	// 		return d3.ascending(a, b);
// 	// 	} else {
// 	// 		return d3.descending(a, b);
// 	// 	}
// 	// };
// });


