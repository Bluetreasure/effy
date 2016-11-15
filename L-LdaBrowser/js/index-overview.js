LDAvis = function(to_select, json_file) {


    var title_name = ['刊物的立場與反省','自由民主的基本概念','法治','表現自由／出版法問題','其他基本權問題',
                      '責任閣制／責任政治','行政中立──國民黨退出軍警特','司法','立法院問題','監察',
                      '考試','在野黨','國民黨體質改造／國民黨問題','地方自治','地方選舉問題','軍隊',
                      '教育／救國團','外交／聯合國問題','總統三連任問題／修憲／國大','反共救國會議',
                      '反共','經濟／財政','文藝'];

    // This section sets up the logic for event handling
    var current_clicked = {
        what: "nothing",
        element: undefined
    },
    current_hover = {
        what: "nothing",
        element: undefined
    },
    old_winning_state = {
        what: "nothing",
        element: undefined
    },
    vis_state = {
        lambda: 1,
        topic: 0,
        term: ""
    };

    // Set up a few 'global' variables to hold the data:
    var K, // number of topics 
    R, // number of terms to display in bar chart
    mdsData, // (x,y) locations and topic proportions
    mdsData3, // topic proportions for all terms in the viz
    lamData, // all terms that are among the top-R most relevant for all topics, lambda values
    lambda = {
        old: 1,
        current: 1
    },
    color1 = "#1f77b4", // baseline color for default topic circles and overall term frequencies
    color2 = "#d62728"; // 'highlight' color for selected topics and term-topic frequencies

    // Set the duration of each half of the transition:
    var duration = 750;

    // Set global margins used for everything
    var margin = {
        top: 100,
        right: 100,
        bottom: 100,
        left: 120
    },
    mdswidth = 700,
    mdsheight = 900,
    barwidth = 900,
    barheight = 300,
    termwidth = 90, // width to add between two panels to display terms
    mdsarea = mdsheight * mdswidth;
    // controls how big the maximum circle can be
    // doesn't depend on data, only on mds width and height:
    var rMax = 60;  

    // proportion of area of MDS plot to which the sum of default topic circle areas is set
    var circle_prop = 0.25;
    var word_prop = 0.25;

    // opacity of topic circles:
    var base_opacity = 0.2,
    highlight_opacity = 0.6;

    // topic/lambda selection names are specific to *this* vis
    var topic_select = to_select + "-topic";
    var lambda_select = to_select + "-lambda";

    // get rid of the # in the to_select (useful) for setting ID values
    var parts = to_select.split("#");
    var visID = parts[parts.length - 1];
    var topicID = visID + "-topic";
    var lambdaID = visID + "-lambda";
    var termID = visID + "-term";
    var topicDown = topicID + "-down";
    var topicUp = topicID + "-up";
    var topicClear = topicID + "-clear";

    //////////////////////////////////////////////////////////////////////////////

    // sort array according to a specified object key name 
    // Note that default is decreasing sort, set decreasing = -1 for increasing
    // adpated from http://stackoverflow.com/questions/16648076/sort-array-on-key-value
    function fancysort(key_name, decreasing) {
        decreasing = (typeof decreasing === "undefined") ? 1 : decreasing;
        return function(a, b) {
            if (a[key_name] < b[key_name])
                return 1 * decreasing;
            if (a[key_name] > b[key_name])
                return -1 * decreasing;
            return 0;
        };
    }

    // The actual read-in of the data and main code:
    d3.json(json_file, function(error, data) {

        // set the number of topics to global variable K:
        K = data['mdsDat'].x.length;

        // R is the number of top relevant (or salient) words whose bars we display
        R = data['R'];

        // a (K x 5) matrix with columns x, y, topics, Freq, cluster (where x and y are locations for left panel)
        mdsData = [];
        for (var i = 0; i < K; i++) {
            var obj = {};
            for (var key in data['mdsDat']) {
                obj[key] = data['mdsDat'][key][i];
            }
            mdsData.push(obj);
        }

        // a huge matrix with 3 columns: Term, Topic, Freq, where Freq is all non-zero probabilities of topics given terms
        // for the terms that appear in the barcharts for this data
        mdsData3 = [];
        for (var i = 0; i < data['token.table'].Term.length; i++) {
            var obj = {};
            for (var key in data['token.table']) {
                obj[key] = data['token.table'][key][i];
            }
            mdsData3.push(obj);
        }

        // large data for the widths of bars in bar-charts. 6 columns: Term, logprob, loglift, Freq, Total, Category
        // Contains all possible terms for topics in (1, 2, ..., k) and lambda in the user-supplied grid of lambda values
	    // which defaults to (0, 0.01, 0.02, ..., 0.99, 1).
        lamData = [];
        for (var i = 0; i < data['tinfo'].Term.length; i++) {
            var obj = {};
            for (var key in data['tinfo']) {
                obj[key] = data['tinfo'][key][i];
            }
            lamData.push(obj);
        }

        // Create the topic input & lambda slider forms. Inspired from:
        // http://bl.ocks.org/d3noob/10632804
        // http://bl.ocks.org/d3noob/10633704
        init_forms(topicID, lambdaID, visID);

        // When the value of lambda changes, update the visualization
        d3.select(lambda_select)
            .on("mouseup", function() {
                // store the previous lambda value
                lambda.old = lambda.current;
                //lambda.current = document.getElementById(lambdaID).value;
                vis_state.lambda = +this.value;
                // adjust the text on the range slider
                d3.select(lambda_select).property("value", vis_state.lambda);
                d3.select(lambda_select + "-value").text(vis_state.lambda);
                // transition the order of the bars
                var increased = lambda.old < vis_state.lambda;
                if (vis_state.topic > 0) reorder_bars(increased);
                // store the current lambda value
                state_save(true);
                //document.getElementById(lambdaID).value = vis_state.lambda;
            });

        d3.select("#" + topicUp)
            .on("click", function() {
		// remove term selection if it exists (from a saved URL)
		var termElem = document.getElementById(termID + vis_state.term);
		if (termElem !== undefined) term_off(termElem);
		vis_state.term = "";
                var value_old = document.getElementById(topicID).value;
                var value_new = Math.min(K, +value_old + 1).toFixed(0);
                // increment the value in the input box
                document.getElementById(topicID).value = value_new;
                topic_off(document.getElementById(topicID + value_old));
                topic_on(document.getElementById(topicID + value_new));
                vis_state.topic = value_new;
                state_save(true);
            })

        d3.select("#" + topicDown)
            .on("click", function() {
		// remove term selection if it exists (from a saved URL)
		var termElem = document.getElementById(termID + vis_state.term);
		if (termElem !== undefined) term_off(termElem);
		vis_state.term = "";
                var value_old = document.getElementById(topicID).value;
                var value_new = Math.max(0, +value_old - 1).toFixed(0);
                // increment the value in the input box
                document.getElementById(topicID).value = value_new;
                topic_off(document.getElementById(topicID + value_old));
                topic_on(document.getElementById(topicID + value_new));
                vis_state.topic = value_new;
                state_save(true);
            })

        d3.select("#" + topicID)
            .on("keyup", function() {
		// remove term selection if it exists (from a saved URL)
		var termElem = document.getElementById(termID + vis_state.term);
		if (termElem !== undefined) term_off(termElem);
		vis_state.term = "";
                topic_off(document.getElementById(topicID + vis_state.topic))
                var value_new = document.getElementById(topicID).value;
                if (!isNaN(value_new) && value_new > 0) {
                    value_new = Math.min(K, Math.max(1, value_new))
                    topic_on(document.getElementById(topicID + value_new));
                    vis_state.topic = value_new;
                    state_save(true);
                    document.getElementById(topicID).value = vis_state.topic;
                }
            })

        d3.select("#" + topicClear)
            .on("click", function() {
                //state_reset();
                state_save(true);
            })

        // create linear scaling to pixels (and add some padding on outer region of scatterplot)
        var xrange = d3.extent(mdsData, function(d) {
            return d.x;
        }); //d3.extent returns min and max of an array
        var xdiff = xrange[1] - xrange[0],
        xpad = 0.05;
        var yrange = d3.extent(mdsData, function(d) {
            return d.y;
        });
        var ydiff = yrange[1] - yrange[0],
        ypad = 0.05;

	if (xdiff > ydiff) {
            var xScale = d3.scale.linear()
		.range([0, mdswidth])
		.domain([xrange[0] - xpad * xdiff, xrange[1] + xpad * xdiff]);
	    
            var yScale = d3.scale.linear()
		.range([mdsheight, 0])
		.domain([yrange[0] - 0.5*(xdiff - ydiff) - ypad*xdiff, yrange[1] + 0.5*(xdiff - ydiff) + ypad*xdiff]);
	} else {
            var xScale = d3.scale.linear()
		.range([0, mdswidth])
		.domain([xrange[0] - 0.5*(ydiff - xdiff) - xpad*ydiff, xrange[1] + 0.5*(ydiff - xdiff) + xpad*ydiff]);
	    
            var yScale = d3.scale.linear()
		.range([mdsheight, 0])
		.domain([yrange[0] - ypad * ydiff, yrange[1] + ypad * ydiff]);
	}

        // Create new svg element (that will contain everything):
        var svg = d3.select(to_select).append("svg")
            .attr("width", mdswidth + barwidth + margin.left + termwidth + margin.right)
            .attr("height", mdsheight + 2 * margin.top + margin.bottom + 2 * rMax);

        // Create a group for the mds plot
        var mdsplot = svg.append("g")
            .attr("id", "leftpanel")
            .attr("class", "points")
            .attr("transform", "translate(" + margin.left + "," + 2 * margin.top + ")");

        // Clicking on the mdsplot should clear the selection
        mdsplot
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", mdsheight)
            .attr("width", mdswidth)
            .style("fill", color1)
            .attr("opacity", 0)
            .on("click", function() {
                //state_reset();
                state_save(true);
            });

    	// new definitions based on fixing the sum of the areas of the default topic circles:
    	var newSmall = Math.sqrt(0.02*mdsarea*circle_prop/Math.PI);
    	var newMedium = Math.sqrt(0.05*mdsarea*circle_prop/Math.PI);
    	var newLarge = Math.sqrt(0.10*mdsarea*circle_prop/Math.PI);
    	var cx = 10 + newLarge,
        cx2 = cx + 1.5 * newLarge;
	
        // circle guide inspired from
        // http://www.nytimes.com/interactive/2012/02/13/us/politics/2013-budget-proposal-graphic.html?_r=0
        circleGuide = function(rSize, size) {
            d3.select("#leftpanel").append("circle")
                .attr('class', "circleGuide" + size)
                .attr('r', rSize)
                .attr('cx', cx)
                .attr('cy', mdsheight + rSize)
                .style('fill', 'none')
                .style('stroke-dasharray', '2 2')
                .style('stroke', '#999');
            d3.select("#leftpanel").append("line")
                .attr('class', "lineGuide" + size)
                .attr("x1", cx)
                .attr("x2", cx2)
                .attr("y1", mdsheight + 2 * rSize)
                .attr("y2", mdsheight + 2 * rSize)
                .style("stroke", "gray")
                .style("opacity", 0.3);
        }

        var defaultLabelSmall = "2%";
        var defaultLabelMedium = "5%";
        var defaultLabelLarge = "10%";

        var outerCircleRadius = 300
        var circle0x = mdswidth/2 +((outerCircleRadius) * Math.sin(0));
        var circle0y = mdsheight/2 -((outerCircleRadius) * Math.cos(0));
        var circle1x = mdswidth/2 +((outerCircleRadius+140) * Math.sin(0));
        var circle1y = mdsheight/2 -((outerCircleRadius+140) * Math.cos(0));


        // bind mdsData to the points in the left panel:
        var mdsplot1 = mdsplot.append("g")
                              .attr("transform", "translate(" + mdsheight/2 + "," + mdswidth/2 + ")");
        var points = mdsplot1.selectAll("points")
            .data(mdsData)
            .enter();
        //console.log(mdsData.length);

        var tooltip = d3.select("body")
                        .append("div")
                        .attr("class","tooltip")
                        .style("opacity",1.0);

        // text to indicate topic
        points.append("text")
            .attr("class", "txt")
            // .attr("x", function(d) {
            //     return circle0x;
            //     //return (xScale(+d.x));
            // })
            // .attr("y", function(d) {
            //     return circle0y;
            //     //return (yScale(+d.y) + 4);
            // })
            .attr("stroke", "black")
            .attr("opacity", 1)
            .attr("transform",function(d,i){
                return 360/mdsData.length*i < 90 || (360/mdsData.length*i >270 && 360/mdsData.length*i < 360) ? "rotate("+360/mdsData.length*i+") translate(300) translate(1)"  : "rotate("+360/mdsData.length*i+") translate(300) rotate(180)translate(-1)";
            })
            .style("text-anchor", "middle")
            .style("font-size", "11px")
            .style("fontWeight", 100)

            .text(function(d) {
                topic_num = Number(d.topics);
                return title_name[topic_num-1][0];
            });

        points.append("text")
            .attr("class", "txt")
            // .attr("x", function(d) {
            //     return circle1x;
            //     //return (xScale(+d.x));
            // })
            // .attr("y", function(d) {
            //     return circle1y;
            //     //return (yScale(+d.y) + 4);
            // })
            .attr("stroke", "black")
            .attr("opacity", 1)
            .attr("transform",function(d,i){
                return 360/mdsData.length*i < 90 || (360/mdsData.length*i >270 && 360/mdsData.length*i < 360) ? "rotate("+360/mdsData.length*i+") translate(460) translate(8)"  : "rotate("+360/mdsData.length*i+") translate(460) rotate(180)translate(-8)";
            })
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("fontWeight", 50)
            .text(function(d) {
                topic_num = Number(d.topics);
                return title_name[topic_num-1];
            });

        // draw circles
        points.append("circle")
            .attr("class", "dot")
            .style("opacity", 0.2)
            .style("fill", color1)
            .attr("r", function(d) {
                //return (rScaleMargin(+d.Freq));
                return (Math.sqrt((d.Freq/100)*mdswidth*mdsheight*circle_prop/Math.PI));
                //return 20
            })
            // .attr("cx", function(d) {
            //     return circle0x;
            //     //return (xScale(+d.x));
            // })
            // .attr("cy", function(d) {
            //     return circle0y;
            //     //return (yScale(+d.y));
            // })
            .attr("stroke", "black")
            .attr("id", function(d) {
                return (topicID + d.topics)
            })
            .attr("transform",function(d,i){
                return "rotate("+360/mdsData.length*i+") translate(300)"
            })
            .on("mouseover", function(d) {
                var old_topic = topicID + vis_state.topic;
                if (vis_state.topic > 0 && old_topic != this.id) {
                    topic_off(document.getElementById(old_topic));
                }
                topic_on(this);

                topic_num = Number(d.topics);
                console.log(title_name[topic_num-1]);
                tooltip.html(title_name[topic_num-1])
                       .style("left", (d3.event.pageX) + "px")
                       .style("top", (d3.event.pageY + 20) + "px")
                       .style("display","block");
            })
            .on("click", function(d) {
                // prevent click event defined on the div container from firing 
                // http://bl.ocks.org/jasondavies/3186840
                    var old_topic = topicID + vis_state.topic;
                if (vis_state.topic > 0 && old_topic != this.id) {
                    topic_off(document.getElementById(old_topic));
                }
                // make sure topic input box value and fragment reflects clicked selection
                vis_state.topic = d.topics;
                state_save(true);
                topic_on(this);
            })
            .on("mouseout", function(d) {
                if (vis_state.topic != d.topics) topic_off(this);
                if (vis_state.topic > 0) topic_on(document.getElementById(topicID + vis_state.topic));
                tooltip.style("display","none");
            });

        // establish layout and vars for bar chart
        var barDefault2 = lamData.filter(function(d) {
            return d.Category == "Default"
        });

        for (var i = 1 ; i <=23 ; i++){
            var topic_name = "Topic"+i
            console.log(topic_name);
            var arr = [];
            var dat2 = lamData.filter(function(d){
                return d.Category == topic_name
            })

            for (var j = 0; j < dat2.length; j++) {
                dat2[j].relevance = vis_state.lambda * dat2[j].logprob +
                    (1 - vis_state.lambda) * dat2[j].loglift;
            }
            dat2.sort(fancysort("relevance"));

            // truncate to the top R tokens:
            var dat3 = dat2.slice(0, R);
            dat3.forEach(function(d){
                var x = 1 ;
                if (d.Category == topic_name && x < 15 ) 
                    arr.push(d.Term);
                    x = x+1;

            })
            console.log(arr);
        }

        var y = d3.scale.ordinal()
            .domain(barDefault2.map(function(d) {
                return d.Term;
            }))
            .rangeRoundBands([150, barheight+300], 0.15);
        var x = d3.scale.linear()
            .domain([0, d3.max(barDefault2, function(d) {
                return d.Total;
            })])
            .range([0, barwidth])
            .nice();
        var yAxis = d3.svg.axis()
            .scale(y);

        // Add a group for the bar chart
        var chart = svg.append("g")
            .attr("transform", "translate(" + +(mdswidth + margin.left + termwidth) + "," + 2 * margin.top + ")")
            .attr("id", "bar-freqs");

        // bar chart legend/guide:
        var barguide = {"width": 100, "height": 15};

	// footnotes:

        // Bind 'default' data to 'default' bar chart
        var basebars = mdsplot.selectAll(".bar-totals")
            .data(barDefault2)
            .enter();

        basebars
            .append("text")
            .attr("x", 450)
            .attr("class", "terms")
            .attr("y", function(d) {
                return y(d.Term) + 12;
            })
            .attr("cursor", "pointer")
            .attr("id", function(d) {
                return (termID + d.Term)
            })
            .style("text-anchor", "end") // right align text - use 'middle' for center alignment
            .text(function(d) {
                return d.Term;
            })
            .on("mouseover", function() {
                term_hover(this);
            })
            .on("mouseout", function() {
                vis_state.term = "";
                term_off(this);
                state_save(true);
            });

        

        // Draw the gray background bars defining the overall frequency of each word

        // Add word labels to the side of each bar


	// dynamically create the topic and lambda input forms at the top of the page:
        function init_forms(topicID, lambdaID, visID) {

     //        // create container div for topic and lambda input:
	    // var inputDiv = document.createElement("div");
	    // inputDiv.setAttribute("id", "top");
	    // inputDiv.setAttribute("style", "width: 1210px"); // to match the width of the main svg element
	    // document.getElementById(visID).appendChild(inputDiv);

	    // // topic input container:
	    // var topicDiv = document.createElement("div");
	    // topicDiv.setAttribute("style", "padding: 5px; background-color: #e8e8e8; display: inline-block; width: " + mdswidth + "px; height: 50px; float: left");
	    // inputDiv.appendChild(topicDiv);

     //        var topicLabel = document.createElement("label");
     //        topicLabel.setAttribute("for", topicID);
     //        topicLabel.setAttribute("style", "font-family: sans-serif; font-size: 14px");
     //        topicLabel.innerHTML = "Selected Topic: <span id='" + topicID + "-value'></span>";
     //        topicDiv.appendChild(topicLabel);

     //        var topicInput = document.createElement("input");
     //        topicInput.setAttribute("style", "width: 50px");
     //        topicInput.type = "text";
     //        topicInput.min = "0";
     //        topicInput.max = K; // assumes the data has already been read in
     //        topicInput.step = "1";
     //        topicInput.value = "0"; // a value of 0 indicates no topic is selected
     //        topicInput.id = topicID;
     //        topicDiv.appendChild(topicInput);
        }

        // function to re-order the bars (gray and red), and terms:
        function reorder_bars(increase) {
            // grab the bar-chart data for this topic only:
            var dat2 = lamData.filter(function(d) {
                //return d.Category == "Topic" + Math.min(K, Math.max(0, vis_state.topic)) // fails for negative topic numbers...
                return d.Category == "Topic" + vis_state.topic;
            });
            // define relevance:
            for (var i = 0; i < dat2.length; i++) {
                dat2[i].relevance = vis_state.lambda * dat2[i].logprob +
                    (1 - vis_state.lambda) * dat2[i].loglift;
            }

            // sort by relevance:
            dat2.sort(fancysort("relevance"));

            // truncate to the top R tokens:
            var dat3 = dat2.slice(0, R);

            var y = d3.scale.ordinal()
                .domain(dat3.map(function(d) {
                    return d.Term;
                }))
                .rangeRoundBands([150, barheight+300], 0.15);
            var x = d3.scale.linear()
                .domain([0, d3.max(dat3, function(d) {
                    return d.Total;
                })])
                .range([0, barwidth])
                .nice();

            // Change Total Frequency bars
            var graybars = d3.select("#bar-freqs")
                .selectAll(".bar-totals")
                .data(dat3, function(d) {
                    return d.Term;
                });

            // Change word labels
            var labels = d3.select("#bar-freqs")
                .selectAll(".terms")
                .data(dat3, function(d) {
                    return d.Term;
                });

            // Create red bars (drawn over the gray ones) to signify the frequency under the selected topic
            var redbars = d3.select("#bar-freqs")
                .selectAll(".overlay")
                .data(dat3, function(d) {
                    return d.Term;
                });

            // adapted from http://bl.ocks.org/mbostock/1166403
            var xAxis = d3.svg.axis().scale(x)
                .orient("top")
                .tickSize(-barheight)
                .tickSubdivide(true)
                .ticks(6);

            // New axis definition:
            var newaxis = d3.selectAll(".xaxis");

            // define the new elements to enter:

            var labelsEnter = labels.enter()
                .append("text")
                .attr("x", 450)
                .attr("class", "terms")
                .attr("y", function(d) {
                    return y(d.Term) + 12 + barheight + margin.bottom + 2 * rMax;
                })
                .attr("cursor", "pointer")
                .style("text-anchor", "end")
                .attr("id", function(d) {
                    return (termID + d.Term)
                })
                .text(function(d) {
                    return d.Term;
                })
                .on("mouseover", function() {
                    term_hover(this);
                })
                .on("mouseout", function() {
                    vis_state.term = "";
                    term_off(this);
                    state_save(true);
                });

            var redbarsEnter = redbars.enter().append("rect")
                .attr("class", "overlay")
                .attr("x", 0)
                .attr("y", function(d) {
                    return y(d.Term) + barheight + margin.bottom + 2 * rMax;
                })
                .attr("height", y.rangeBand())
                .style("fill", color2)
                .attr("opacity", 0.8);


            if (increase) {
                graybarsEnter
                    .attr("width", function(d) {
                        return x(d.Total);
                    })
                    .transition().duration(duration)
                    .delay(duration)
                    .attr("y", function(d) {
                        return y(d.Term);
                    });
                labelsEnter
                    .transition().duration(duration)
                    .delay(duration)
                    .attr("y", function(d) {
                        return y(d.Term) + 12;
                    });
                redbarsEnter
                    .attr("width", function(d) {
                        return x(d.Freq);
                    })
                    .transition().duration(duration)
                    .delay(duration)
                    .attr("y", function(d) {
                        return y(d.Term);
                    });

                graybars.transition().duration(duration)
                    .attr("width", function(d) {
                        return x(d.Total);
                    })
                    .transition().duration(duration)
                    .attr("y", function(d) {
                        return y(d.Term);
                    });
                labels.transition().duration(duration)
                    .delay(duration)
                    .attr("y", function(d) {
                        return y(d.Term) + 12;
                    });
                redbars.transition().duration(duration)
                    .attr("width", function(d) {
                        return x(d.Freq);
                    })
                    .transition().duration(duration)
                    .attr("y", function(d) {
                        return y(d.Term);
                    });

                // Transition exiting rectangles to the bottom of the barchart:
                graybars.exit()
                    .transition().duration(duration)
                    .attr("width", function(d) {
                        return x(d.Total);
                    })
                    .transition().duration(duration)
                    .attr("y", function(d, i) {
                        return barheight + margin.bottom + 6 + i * 18;
                    })
                    .remove();
                labels.exit()
                    .transition().duration(duration)
                    .delay(duration)
                    .attr("y", function(d, i) {
                        return barheight + margin.bottom + 18 + i * 18;
                    })
                    .remove();
                redbars.exit()
                    .transition().duration(duration)
                    .attr("width", function(d) {
                        return x(d.Freq);
                    })
                    .transition().duration(duration)
                    .attr("y", function(d, i) {
                        return barheight + margin.bottom + 6 + i * 18;
                    })
                    .remove();
                // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                newaxis.transition().duration(duration)
                    .call(xAxis)
                    .transition().duration(duration);
            } else {
                graybarsEnter
                    .attr("width", 100) // FIXME by looking up old width of these bars
                    .transition().duration(duration)
                    .attr("y", function(d) {
                        return y(d.Term);
                    })
                    .transition().duration(duration)
                    .attr("width", function(d) {
                        return x(d.Total);
                    });
                labelsEnter
                    .transition().duration(duration)
                    .attr("y", function(d) {
                        return y(d.Term) + 12;
                    });
                redbarsEnter
                    .attr("width", 50) // FIXME by looking up old width of these bars
                    .transition().duration(duration)
                    .attr("y", function(d) {
                        return y(d.Term);
                    })
                    .transition().duration(duration)
                    .attr("width", function(d) {
                        return x(d.Freq);
                    });

                graybars.transition().duration(duration)
                    .attr("y", function(d) {
                        return y(d.Term);
                    })
                    .transition().duration(duration)
                    .attr("width", function(d) {
                        return x(d.Total);
                    });
                labels.transition().duration(duration)
                    .attr("y", function(d) {
                        return y(d.Term) + 12;
                    });
                redbars.transition().duration(duration)
                    .attr("y", function(d) {
                        return y(d.Term);
                    })
                    .transition().duration(duration)
                    .attr("width", function(d) {
                        return x(d.Freq);
                    });

                // Transition exiting rectangles to the bottom of the barchart:
                graybars.exit()
                    .transition().duration(duration)
                    .attr("y", function(d, i) {
                        return barheight + margin.bottom + 6 + i * 18 + 2 * rMax;
                    })
                    .remove();
                labels.exit()
                    .transition().duration(duration)
                    .attr("y", function(d, i) {
                        return barheight + margin.bottom + 18 + i * 18 + 2 * rMax;
                    })
                    .remove();
                redbars.exit()
                    .transition().duration(duration)
                    .attr("y", function(d, i) {
                        return barheight + margin.bottom + 6 + i * 18 + 2 * rMax;
                    })
                    .remove();

                // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                newaxis.transition().duration(duration)
                    .transition().duration(duration)
                    .call(xAxis);
            }
        }

        //////////////////////////////////////////////////////////////////////////////

        // function to update bar chart when a topic is selected
        // the circle argument should be the appropriate circle element
        function topic_on(circle) {
            if (circle == null) return null;
            //console.log(circle);
            
	    // grab data bound to this element
            var d = circle.__data__
            var Freq = Math.round(d.Freq * 10) / 10,
            topics = d.topics;
            console.log(d);
            
	    // change opacity and fill of the selected circle
            circle.style.opacity = highlight_opacity;
            circle.style.fill = color2;
            
	    // Remove 'old' bar chart title
            var text = d3.select(".bubble-tool");
            text.remove();
	    
            // grab the bar-chart data for this topic only:
            var dat2 = lamData.filter(function(d) {
                return d.Category == "Topic" + topics
            });
	    
            // define relevance:
            for (var i = 0; i < dat2.length; i++) {
                dat2[i].relevance = lambda.current * dat2[i].logprob +
                    (1 - lambda.current) * dat2[i].loglift;
            }
	    
            // sort by relevance:
            dat2.sort(fancysort("relevance"));
	    
            // truncate to the top R tokens:
            var dat3 = dat2.slice(0, R);

            // scale the bars to the top R terms:
            var y = d3.scale.ordinal()
                .domain(dat3.map(function(d) {
                    return d.Term;
                }))
                .rangeRoundBands([150, barheight+300], 0.15);
            var x = d3.scale.linear()
                .domain([0, d3.max(dat3, function(d) {
                    return d.Total;
                })])
                .range([0, barwidth])
                .nice();

            // remove the red bars if there are any:
            d3.selectAll(".overlay").remove();

            // Change Total Frequency bars

            // Change word labels
            d3.selectAll(".terms")
                .data(dat3)
                .attr("x", 450)
                .attr("y", function(d) {
                    return y(d.Term) + 12;
                })
                .attr("id", function(d) {
                    return (termID + d.Term)
                })
                .style("text-anchor", "end") // right align text - use 'middle' for center alignment
                .text(function(d) {
                    return d.Term;
                });

            // Create red bars (drawn over the gray ones) to signify the frequency under the selected topic

            // adapted from http://bl.ocks.org/mbostock/1166403
            var xAxis = d3.svg.axis().scale(x)
                .orient("top")
                .tickSize(-barheight)
                .tickSubdivide(true)
                .ticks(6);

            // redraw x-axis
            d3.selectAll(".xaxis")
                .call(xAxis);
        }


        function topic_off(circle) {
            if (circle == null) return circle;
            // go back to original opacity/fill
            circle.style.opacity = base_opacity;
            circle.style.fill = color1;

            // remove the red bars
            d3.selectAll(".overlay").remove();

            // go back to 'default' bar chart
            var dat2 = lamData.filter(function(d) {
                return d.Category == "Default"
            });

            var y = d3.scale.ordinal()
                .domain(dat2.map(function(d) {
                    return d.Term;
                }))
                .rangeRoundBands([150, barheight+300], 0.15);
            var x = d3.scale.linear()
                .domain([0, d3.max(dat2, function(d) {
                    return d.Total;
                })])
                .range([0, barwidth])
                .nice();

            // Change Total Frequency bars
            d3.selectAll(".bar-totals")
                .data(dat2)
                .attr("x", 120)
                .attr("y", function(d) {
                    return y(d.Term);
                })
                .attr("height", y.rangeBand())
                .attr("width", function(d) {
                    return x(d.Total);
                })
                .style("fill", color1)
                .attr("opacity", 0.4);

            //Change word labels
            d3.selectAll(".terms")
                .data(dat2)
                .attr("x", 450)
                .attr("y", function(d) {
                    return y(d.Term) + 12;
                })
                .style("text-anchor", "end") // right align text - use 'middle' for center alignment
                .text(function(d) {
                    return d.Term;
                });

            // adapted from http://bl.ocks.org/mbostock/1166403
            var xAxis = d3.svg.axis().scale(x)
                .orient("top")
                .tickSize(-barheight)
                .tickSubdivide(true)
                .ticks(6);

            // redraw x-axis
            d3.selectAll(".xaxis")
                .attr("class", "xaxis")
                .call(xAxis);
        }

        // event definition for mousing over a term
        function term_hover(term) {
            var old_term = termID + vis_state.term;
            if (vis_state.term != "" && old_term != term.id) {
                term_off(document.getElementById(old_term));
            }
            vis_state.term = term.innerHTML;
            term_on(term);
            state_save(true);
        }
        // updates vis when a term is selected via click or hover
        function term_on(term) {
            if (term == null) return null;
            term.style["fontWeight"] = "bold";
            var d = term.__data__
            var Term = d.Term;
            var dat2 = mdsData3.filter(function(d2) {
                return d2.Term == Term
            });

            var k = dat2.length; // number of topics for this token with non-zero frequency

            var radius = [];
            for (var i = 0; i < K; ++i) {
                radius[i] = 0;
            }
            for (i = 0; i < k; i++) {
                radius[dat2[i].Topic - 1] = dat2[i].Freq;
            }

            var size = [];
            for (var i = 0; i < K; ++i) {
                size[i] = 0;
            }
            for (i = 0; i < k; i++) {
                // If we want to also re-size the topic number labels, do it here
                // 11 is the default, so leaving this as 11 won't change anything.
                size[dat2[i].Topic - 1] = 11;
            }

            var rScaleCond = d3.scale.sqrt()
                .domain([0, 1]).range([0, rMax]);

            // Change size of bubbles according to the word's distribution over topics
            d3.selectAll(".dot")
                .data(radius)
                .transition()
                .attr("r", function(d) {
                    //return (rScaleCond(d));
		            return (Math.sqrt(d/5*mdswidth*mdsheight*word_prop/Math.PI)); 
                    //return 20
                });

            // re-bind mdsData so we can handle multiple selection
            d3.selectAll(".dot")
                .data(mdsData)

            // Change sizes of topic numbers:
            d3.selectAll(".txt")
                .data(size)
                .transition()
                .style("font-size", function(d) {
                    return +d;
                });

            // Alter the guide
            d3.select(".circleGuideTitle")
                .text("Conditional topic distribution given term = '" + term.innerHTML + "'");
        }

        function term_off(term) {
            if (term == null) return null;
            term.style["fontWeight"] = "normal";

            d3.selectAll(".dot")
                .data(mdsData)
                .transition()
                .attr("r", function(d) {
                    //return (rScaleMargin(+d.Freq));
                    return (Math.sqrt((d.Freq/100)*mdswidth*mdsheight*circle_prop/Math.PI));
                    //return 20 ;
                });

            // Change sizes of topic numbers:
            d3.selectAll(".txt")
                .transition()
                .style("font-size", "11px");

            // Go back to the default guide
            d3.select(".circleGuideTitle")
                .text("Marginal topic distribution");
            d3.select(".circleGuideLabelLarge")
                .text(defaultLabelLarge);
            d3.select(".circleGuideLabelSmall")
                .attr("y", mdsheight + 2 * newSmall)
                .text(defaultLabelSmall);
            d3.select(".circleGuideSmall")
                .attr("r", newSmall)
                .attr("cy", mdsheight + newSmall);
            d3.select(".lineGuideSmall")
                .attr("y1", mdsheight + 2 * newSmall)
                .attr("y2", mdsheight + 2 * newSmall);
        }


        // serialize the visualization state using fragment identifiers -- http://en.wikipedia.org/wiki/Fragment_identifier
        // location.hash holds the address information
        
        var params = location.hash.split("&");
        if (params.length > 1) {
            vis_state.topic = params[0].split("=")[1];
            vis_state.lambda = params[1].split("=")[1];
            vis_state.term = params[2].split("=")[1];

	    // Idea: write a function to parse the URL string
	    // only accept values in [0,1] for lambda, {0, 1, ..., K} for topics (any string is OK for term)
	    // Allow for subsets of the three to be entered:
	    // (1) topic only (lambda = 1 term = "")
	    // (2) lambda only (topic = 0 term = "") visually the same but upon hovering a topic, the effect of lambda will be seen
	    // (3) term only (topic = 0 lambda = 1) only fires when the term is among the R most salient
	    // (4) topic + lambda (term = "")
	    // (5) topic + term (lambda = 1)
	    // (6) lambda + term (topic = 0) visually lambda doesn't make a difference unless a topic is hovered
	    // (7) topic + lambda + term

	    // Short-term: assume format of "#topic=k&lambda=l&term=s" where k, l, and s are strings (b/c they're from a URL)

	    // Force k (topic identifier) to be an integer between 0 and K:
	    vis_state.topic = Math.round(Math.min(K, Math.max(0, vis_state.topic)));

	    // Force l (lambda identifier) to be in [0, 1]:
	    vis_state.lambda = Math.min(1, Math.max(0, vis_state.lambda));

            // impose the value of lambda:
            //document.getElementById(lambdaID).value = vis_state.lambda;
	    //document.getElementById(lambdaID + "-value").innerHTML = vis_state.lambda;

            // select the topic and transition the order of the bars (if approporiate)
	    lambda.current = vis_state.lambda;
            var termElem = document.getElementById(termID + vis_state.term);
            if (termElem !== undefined) term_on(termElem);
        }

        function state_url() {
            return location.origin + location.pathname + "#topic=" + vis_state.topic +
                "&lambda=" + vis_state.lambda + "&term=" + vis_state.term;
        }

        function state_save(replace) {
            if (replace)
                history.replaceState(vis_state, "Query", state_url());
            else
                history.pushState(vis_state, "Query", state_url());
        }

    });

}

