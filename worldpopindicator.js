var worldpop = new Array();
var worldpopFiltered = new Array();

var x, y;

function getRegionsData(year) {
    return worldpop.filter((entry) => entry.Type == "Region" && entry.Year == year);
}

function loadScene2(d) {
    worldpopFiltered = getRegionsData(d.Year);
    // console.log(worldpopFiltered);
    let maxPop = Math.max(...worldpopFiltered.map(region => region.Population));

    d3.select("h2")
        .html("World Population by Region for year " + d.Year);

    // clean chart
    d3.selectAll("g").remove();

    // Repopulate barchart
    let regions = [...worldpopFiltered.map((entry) => entry.Region)];
    // console.log(regions);

    x = d3.scaleBand().domain(regions).range([0,200]);
    y = d3.scaleLinear().domain([0,maxPop*1000]).range([200,0]);

    d3.select("svg")
        .attr("width", 400)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(100,50)")
        .selectAll()
        .data(worldpopFiltered)
        .enter()
        .append("rect")
        .attr("height", "20")
        .attr("y", 200)
        .transition()
        .duration(4000)
        .attr("x", function(d,i) { 
            return x(d.Region)+5; 
        })
        .attr("y", function(d) {
            return y(d.Population*1000); 
        })
        .attr("width", x.bandwidth()-5)
        .attr("height", function(d) { 
            return 200 - y(d.Population*1000)
        });
    
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .call(d3.axisLeft(y));

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,250)")
        .call(d3.axisBottom(x));
    
    // Adds mouse events
    d3.selectAll("rect")
        .on("mouseover", handleMouseOver2)
        .on("mouseout", handleMouseOut);
}

function handleMouseOver2(d) {
    d3.select(this)
        .style("fill", "blue");

    d3.select(".tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0.9)
        .style("visibility", "visible");

    d3.select(".tooltip")
        .html(`<strong>Region:</strong> ${d.Region}<br><strong>Total Population:</strong> ${d.Population*1000}<br>`)
        .style("left", `${d3.event.pageX}px`)
        .style("top", `${d3.event.pageY}px`);
}

function handleMouseOver(d) {
    d3.select(this)
        .style("fill", "blue");

    d3.select(".tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0.9)
        .style("visibility", "visible");

    d3.select(".tooltip")
        .html(`<strong>Year:</strong> ${d.Year}<br><strong>Total Population:</strong> ${d.Population*1000}<br>`)
        .style("left", `${d3.event.pageX}px`)
        .style("top", `${d3.event.pageY}px`);
}

function handleMouseOut() {
    d3.select(this)
        .style("fill", "steelblue");

    d3.select(".tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0);
}

function loadScene1() {
    worldpopFiltered = worldpop.filter((entry) => entry.Type == 'World');

    x = d3.scaleBand().domain([2017,2018,2019,2020,2021]).range([0,200]);
    y = d3.scaleLinear().domain([0,8000000000]).range([200,0]);

    d3.select("svg")
        .attr("width", 400)
        .attr("height", 400)
        .append("g")
        .attr("transform", "translate(100,50)")
        .selectAll()
        .data(worldpopFiltered)
        .enter()
        .append("rect")
        .attr("height", "20")
        .attr("y", 200)
        .transition()
        .duration(4000)
        .attr("x", function(d) { 
            return x(d.Year)+5; 
        })
        .attr("y", function(d) {
            return y(d.Population*1000); 
        })
        .attr("width", x.bandwidth()-5)
        .attr("height", function(d) { 
            return 200 - y(d.Population*1000)
        });

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .call(d3.axisLeft(y));

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,250)")
        .call(d3.axisBottom(x));

    // Adds mouse events
    d3.selectAll("rect")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", loadScene2);
}

async function init() {
    // Fetch cars data
    worldpop = await d3.csv("world_pop_filtered.csv");

    // Load scene 1
    loadScene1();
}

init();