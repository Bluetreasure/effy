var title_name = ['刊物的立場與反省', '自由民主的基本概念', '法治', '表現自由／出版法問題', '其他基本權問題',
    '責任閣制／責任政治', '行政中立──國民黨退出軍警特', '司法', '立法院問題', '監察',
    '考試', '在野黨', '國民黨體質改造／國民黨問題', '地方自治', '地方選舉問題', '軍隊',
    '教育／救國團', '外交／聯合國問題', '總統三連任問題／修憲／國大', '反共救國會議',
    '反共', '經濟／財政', '文藝'
];

var tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 1.0);

tooltip.style("display", "none").style("padding", "10px")
    .style("margin", "10px");

var Terms = [];
d3.json("data/data.json", function(error, data) {
    //整理data.json 的資料
    var lamData = [];
    for (var i = 0; i < data['tinfo'].Term.length; i++) {
        var obj = {};
        for (var key in data['tinfo']) {
            obj[key] = data['tinfo'][key][i];
        }
        lamData.push(obj);
    }

    var num = 1;
    var preCategory = "";
    lamData = lamData.filter(function(d) {
        return d.Category != "Default";
    });
    lamData.forEach(function(d) {
        if (d.Category != "Default")
            if (d.Category != preCategory)
                preCategory = d.Category
        num = 1
        if (Terms.indexOf(d.Term) == -1 && num < 10)
            Terms.push(d.Term);
        num = num + 1
    });

    
    Terms.forEach(function(d, i) {
        var nums = i % 6;
        var col_name = "c" + (nums + 1).toString();
        var col_div = d3.select("#" + col_name);
        var row_div = col_div.append("div")
            .text(d)
            .attr("class", "col-lg-12")
            .on("mouseover", function() {
                this.style.color = '#ff9800';
                var data = lamData.filter(function(d1) {
                    return (d1.Term == d)
                });

                tooltip.style("left", (d3.event.pageX - 70) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("display", "block")
                    .html(function() {
                        termlist = ""
                        data.forEach(function(d) {
                            console.log(d);
                            var n = d.Category.substring(5, d.Category.length)
                            termlist = termlist + "<li>" + title_name[n - 1] + "</li>";
                        })

                        return "<strong>此字出現於以下主題：</strong><br>" + termlist;
                    });

                var x = d3.scale.linear().range([0, 70]);
                x.domain([0, d3.max(data, function(d, i) {
                    return d.Freq;
                })]);

                // svg1.selectAll("text")
                //     .data(data)
                //     .enter()
                //     .append("text")
                //     .attr("x",0)
                //     .attr("y",function(d,i){
                //         return 20+i*20
                //     })
                //     .text(function(d){
                //         console.log(d.Category.substring(5,d.Category.length));
                //         var n = d.Category.substring(5,d.Category.length);
                //         return "此字出現於以下主題："　+ title_name[n-1];
                //     })



            })
            .on("click",function(){
                console.log(d);
                window.open("http://52.198.131.106:8080/%E8%94%A1%E8%80%81%E5%B8%AB/%E8%87%AA%E7%94%B1%E4%B8%AD%E5%9C%8B/search?q="+d,'_blank')
                //document.location.href = 'http://52.198.131.106:8080/%E8%94%A1%E8%80%81%E5%B8%AB/%E8%87%AA%E7%94%B1%E4%B8%AD%E5%9C%8B/search?q='+d;
            })
            .on("mouseout", function() {
                this.style.color = 'black';
                tooltip.style("display", "none");
            });;
    })
});