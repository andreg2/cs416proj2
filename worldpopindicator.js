var worldpop = new Array();
var worldpopFiltered = new Array();

function loadScatterPlot(cars) {
    var x = d3.scaleLog().domain([10,150]).range([0,200]);
    var y = d3.scaleLog().domain([10,150]).range([200,0]);

    d3.select("svg")
        .attr("width", 400)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(50,50)")
        .selectAll()
        .data(cars)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return x(d.AverageCityMPG);
        })
        .attr("cy", function(d) {
            return y(d.AverageHighwayMPG);
        })
        .attr("r", function(d) {
            return 2+parseInt(d.EngineCylinders);
        });

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50,50)")
        .call(d3.axisLeft(y)
        .tickValues([10,20,50,100])
        .tickFormat(d3.format("~s")));

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(50,250)")
        .call(d3.axisBottom(x)
        .tickValues([10,20,50,100])
        .tickFormat(d3.format("~s")));
}

async function init() {
    // Fetch cars data
    worldpop = await d3.csv("world_pop_filtered.csv");
    console.log(worldpop);

    // Load scatter plot
    // loadScatterPlot(cars);
}

init();