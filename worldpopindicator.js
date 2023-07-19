var worldpop = new Array();
var worldpopFiltered = new Array();

function handleMouseOver(d) {
    let entry = d.toElement.__data__;
    d3.select(this).style("fill", "orange");
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`<strong>Make:</strong> ${entry.Year}<br><strong>Average City MPG:</strong> ${entry.Population}<br>`)
        .style("left", `${d3.event.pageX}px`)
        .style("top", `${d3.event.pageY}px`);
}

function handleMouseOut() {
    d3.select(this).style("fill", "steelblue");
    tooltip.transition().duration(200).style("opacity", 0);
}

function loadScene1() {
    worldpopFiltered = worldpop.filter((entry) => entry.Type == 'World');

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
        .attr("x", function(d) { 
            return x(Number(d.Year)); 
        })
        .attr("y", function(d) {
            return y(Number(d.Population)); 
        })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { 
            return 200 - y(Number(d.Population))
        })
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

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