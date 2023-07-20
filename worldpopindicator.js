var worldpop = new Array();
var worldpopFiltered = new Array();

var x, y;

function getRegionsData(year) {
    return worldpop.filter((entry) => entry.type == "Region" && entry.year == year);
}

function getCountriesData(data) {
    let countries = new Array();
    let subregions = new Array();

    worldpop.forEach((entry) => {
        if (entry.year == data.year && entry.parent_code == data.location_code) {
            if (entry.type == "Country/Area") countries.push(entry);
            else if (entry.type == "Subregion") subregions.push(entry); 
        }
    });

    subregions.forEach((subregion) => {
        worldpop.forEach((entry) => {
            if (entry.year == subregion.year && entry.parent_code == subregion.location_code) {
                if (entry.type == "Country/Area") countries.push(entry);
            }
        });
    });

    return countries;
}

function loadScene3(data) {
    let countries = getCountriesData(data);
    // console.log(countries);

    d3.select("h2")
        .html("World Population x Deaths of " + data.region + " for " + data.year);
    
    // clean chart
    d3.selectAll("g").remove();

    // update chart
    let deathsDomain = [0,Math.max(...countries.map((country) => country.deaths))*1000];
    let populationDomain = [0,Math.max(...countries.map((country) => country.population))*1000];

    x = d3.scaleLinear().domain(deathsDomain).range([0,1000]);
    y = d3.scaleLinear().domain(populationDomain).range([500,0]);

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .selectAll()
        .data(countries)
        .enter()
        .append("circle")
        .transition()
        .duration(3000)
        .attr("cx", function(d) {
            return x(d.deaths*1000);
        })
        .attr("cy", function(d) {
            return y(d.population*1000);
        })
        .attr("r", 5);
    
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .call(d3.axisLeft(y));

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,550)")
        .call(d3.axisBottom(x));

    // Adds mouse events
    d3.selectAll("circle")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);
}

function loadScene2(d) {
    worldpopFiltered = getRegionsData(d.year);

    let maxPop = Math.max(...worldpopFiltered.map(region => region.population));

    d3.select("h2")
        .html("World Population by Region for year " + d.year);

    // clean chart
    d3.selectAll("g").remove();

    // Repopulate barchart
    let regions = [...worldpopFiltered.map((entry) => entry.region)];

    x = d3.scaleBand().domain(regions).range([0,1000]);
    y = d3.scaleLinear().domain([0,maxPop*1000]).range([500,0]);

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .selectAll()
        .data(worldpopFiltered)
        .enter()
        .append("rect")
        .attr("height", "20")
        .attr("y", 200)
        .transition()
        .duration(3000)
        .attr("x", function(d) { 
            return x(d.region)+5; 
        })
        .attr("y", function(d) {
            return y(d.population*1000); 
        })
        .attr("width", x.bandwidth()-5)
        .attr("height", function(d) { 
            return 500 - y(d.population*1000)
        });
    
    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .call(d3.axisLeft(y));

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,550)")
        .call(d3.axisBottom(x));
    
    // Adds mouse events
    d3.selectAll("rect")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", loadScene3);
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
        .html(`<strong>Year:</strong> ${d.year}<br><strong>Region:</strong> ${d.region}<br><strong>Total Population:</strong> ${d.population*1000}<br><strong>Total Deaths:</strong> ${d.deaths*1000}<br>`)
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
    worldpopFiltered = worldpop.filter((entry) => entry.type == 'World');

    let xDomain = [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021]

    x = d3.scaleBand().domain(xDomain).range([0,1000]);
    y = d3.scaleLinear().domain([0,8000000000]).range([500,0]);

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .selectAll()
        .data(worldpopFiltered)
        .enter()
        .append("rect")
        .attr("height", "20")
        .attr("y", 200)
        .transition()
        .duration(3000)
        .attr("x", function(d) { 
            return x(d.year)+5; 
        })
        .attr("y", function(d) {
            return y(d.population*1000); 
        })
        .attr("width", x.bandwidth()-5)
        .attr("height", function(d) { 
            return 500 - y(d.population*1000)
        });

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .call(d3.axisLeft(y));

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,550)")
        .call(d3.axisBottom(x));

    // Adds mouse events
    d3.selectAll("rect")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", loadScene2);
    
    // Add annotations
    const annotations = [
        {
            "note": { "label": "hi"},
            "x": 150,
            "y": 545,
            "dx": 100,
            "dy": 50,
            "type": d3.annotationCalloutElbow,
            "connector": { "end": "arrow" },
            "color": "red"
        }
    ];

    d3.select("svg").append("g").call(d3.annotation().annotations(annotations));
}

async function init() {
    // Fetch world population data
    worldpop = await d3.csv("pop_deaths.csv");

    // Load scene 1
    loadScene1();
}

init();