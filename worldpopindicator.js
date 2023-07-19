var worldpop = new Array();
var worldpopFiltered = new Array();

function loadScene1() {
    worldpopFiltered = worldpop.filter(function(entry) { 
        console.log(entry);
        return entry.Type == "World"; 
    });
    console.log(worldpopFiltered);

    var x = d3.scaleBand().domain([2017,2018,2019,2020,2021]).range([0,200]);
    var y = d3.scaleLinear().domain([0,8000000]).range([200,0]);

    d3.select("svg")
        .attr("width", 400)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(50,50)")
        .selectAll()
        .data(worldpopFiltered)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(+d.Year); })
        .attr("y", function(d) { return y(+d.Population); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return 200 - y(+d.Population); });

    d3.select("svg").append("g")
        .attr("transform", "translate(50,50)")
        .call(d3.axisLeft(y));

    d3.select("svg").append("g")
        .attr("transform", "translate(50,250)")
        .call(d3.axisBottom(x));
}

async function init() {
    // Fetch cars data
    worldpop = await d3.csv("world_pop_filtered.csv");

    // Load scene 1
    loadScene1();
}

init();