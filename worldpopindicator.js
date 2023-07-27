var worldpop = new Array();
var worldpopFiltered = new Array();

var x, y, xDomain, yDomain, color;
var selectedOption = "population";
var currentScene = 1;

function handleDropdownChangeScene1() {
    selectedOption = document.getElementById("options").value;
    d3.select("h2")
      .html("World " + selectedOption + " from 2010 to 2021");
      
    plotBarChart(xDomain, null, loadScene2, "year", selectedOption);

    let annotations = [
        {
            "note": { 
                "label": "Year-by-year the world " + selectedOption + " gets bigger"
            },
            "x": x(2016)+150,
            "y": 545,
            "dx": 10,
            "dy": 40,
            "type": d3.annotationCalloutElbow,
            "color": "red"
        }
    ];

    if (selectedOption == "deaths") {
        annotations.push(
            {
                note: {
                    label: "COVID19 crisis effect?"
                },
                x: x(2020)+190,
                y: y(60000000)+25,
                dy: -10,
                dx: -162,
                subject: {
                    radius: 90,
                    radiusPadding: 5
                },
                color: "red",
                type: d3.annotationCalloutCircle
            }
        );
    }

    createAnnotations(annotations);
}

function handleDropdownChangeScene2(year) {
    selectedOption = document.getElementById("options").value;

    let annotationText = "Asia is by far the most populous region of the world"
    if (selectedOption == "deaths") 
        annotationText = "Asia is by far region of the world with most deaths"

    let annotations = [{
        "note": { 
            "label": annotationText
        },
        "x": x("ASIA")+180,
        "y": 545,
        "dx": 100,
        "dy": 50,
        "type": d3.annotationCalloutElbow,
        "connector": { "end": "arrow" },
        "color": "red"
    }];

    d3.select("h2")
      .html("World " + selectedOption + " by Region for year " + year);

    let maxY = Math.max(...worldpopFiltered.map(region => region[selectedOption]));
    plotBarChart(xDomain, [0,maxY*1000], loadScene3, "region", selectedOption);

    createAnnotations(annotations);
}

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

    currentScene = 3;

    d3.select("h2")
        .html("World Population x Deaths of " + data.region + " for " + data.year);
    
    // clean scene
    d3.selectAll("g").remove();
    d3.select("select").remove();
    d3.selectAll("text").remove();
    cleanTooltip();

    // update chart
    let deathsDomain = [0,Math.max(...countries.map((country) => country.deaths))*1000];
    let populationDomain = [0,Math.max(...countries.map((country) => country.population))*1000];
    color = d3.scaleOrdinal(d3.schemePaired).domain([...countries.map(country => country.region).sort()]);

    x = d3.scaleLinear().domain(deathsDomain).range([0,1000]);
    y = d3.scaleLinear().domain(populationDomain).range([500,0]);
        
    const annotations = [];
    if (data.region == "ASIA" && data.year <= 2012) {
        annotations.push({
            note: {
                label: "Interestingly Asia is also the only region of the world that the most populous country is not the one that has most deaths before 2013"
            },
            x: x(deathsDomain[1])+70,
            y: y(populationDomain[1])+70,
            dy: 137,
            dx: -162,
            subject: {
                radius: 50,
                radiusPadding: 5
            },
            color: "red",
            type: d3.annotationCalloutCircle
        });

        createAnnotations(annotations);
    }

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .selectAll()
        .data(countries)
        .enter()
        .append("circle")
        .attr("cx", 0)
        .attr("cy", 500)
        .attr("r", 0)
        .transition()
        .duration(3000)
        .attr("cx", function(d) {
            return x(d.deaths*1000);
        })
        .attr("cy", function(d) {
            return y(d.population*1000);
        })
        .attr("fill", function(d) {
            return color(d.region);
        })
        .attr("r", 5);
    
    createAxis(x, y, "deaths", "population");

    createMouseEventsScene3();
}

function loadScene2(data) {
    worldpopFiltered = getRegionsData(data.year);

    currentScene = 2;

    let maxY = Math.max(...worldpopFiltered.map(region => region[selectedOption]));

    d3.select("h2")
        .html(selectedOption + " by Region for year " + data.year);

    // Repopulate barchart
    xDomain = [...worldpopFiltered.map((entry) => entry.region)];
    yDomain = [0,maxY*1000];

    plotBarChart(xDomain, [0,maxY*1000], loadScene3, "region", selectedOption);

    let annotationText = "Asia is by far the most populous region of the world"
    if (selectedOption == "deaths") 
        annotationText = "Asia is by far region of the world with most deaths"

    let annotations = [{
        "note": { 
            "label": annotationText
        },
        "x": x("ASIA")+180,
        "y": 545,
        "dx": 100,
        "dy": 50,
        "type": d3.annotationCalloutElbow,
        "connector": { "end": "arrow" },
        "color": "red"
    }];

    createAnnotations(annotations);

    d3.select("select")
      .on("change", () => handleDropdownChangeScene2(data.year));
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

function handleMouseOverScene3(d) {
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

    d3.select("svg")
        .append('line')
        .attr("transform", "translate(100,50)")
        .attr("stroke", "red")
        .attr("class", "scatter-line")
        .attr('x1',x(d.deaths*1000))
        .attr('y1',y(d.population*1000))
        .attr('x2',x(d.deaths*1000))
        .attr('y2',y(0));
    
    d3.select("svg")
        .append('line')
        .attr("transform", "translate(100,50)")
        .attr("stroke", "red")
        .attr("class", "scatter-line")
        .attr('x1',x(d.deaths*1000))
        .attr('y1',y(d.population*1000))
        .attr('x2',x(0))
        .attr('y2',y(d.population*1000));
}

function createAxis(x, y, xLabel, yLabel) {    
    d3.select("svg")
        .append("g")
        .transition(d3.easeLinear)
        .duration(3000)
        .attr("transform", "translate(100,50)")
        .call(d3.axisLeft(y));

    d3.select("svg")
        .append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .attr("x", -250)
        .text(yLabel);

    d3.select("svg")
        .append("g")
        .transition(d3.easeLinear)
        .duration(3000)
        .attr("transform", "translate(100,550)")
        .call(d3.axisBottom(x));

    d3.select("svg")
        .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", 620)
        .attr("y", y(0)+100)
        .text(xLabel);
}

function handleMouseOutScene3(data) {
    let selectedColor = color ? color(data.region) : "steelblue";
    d3.select(this)
        .style("fill", selectedColor);

    cleanTooltip();
    d3.selectAll(".scatter-line").remove();
}

function handleMouseOut(data) {
    let selectedColor = color ? color(data.region) : "steelblue";
    d3.select(this)
        .style("fill", selectedColor);

    cleanTooltip();
}

function createAnnotations(annotations) {
    d3.select("svg")
      .append("g")
      .call(d3.annotation().annotations(annotations));
}

function createMouseEventsScene3() {
    // Adds mouse events
    d3.selectAll("circle")
        .on("mouseover", handleMouseOverScene3)
        .on("mouseout", handleMouseOutScene3);
}

function createMouseEvents(clickFunc) {
    // Adds mouse events
    d3.selectAll("rect")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut)
        .on("click", clickFunc);
}

function cleanTooltip() {
    d3.select(".tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0);
}

function plotBarChart(xDomain, yDomain, eventFunc, xType, yType) {
    if (yDomain) yDomain = yDomain;
    else yDomain = [0, Math.max(...worldpopFiltered.map((entry) => entry[selectedOption]))*1000];

    x = d3.scaleBand().domain(xDomain).range([0,1000]);
    y = d3.scaleLinear().domain(yDomain).range([500,0]);

    // clean chart
    d3.selectAll("g").remove();
    d3.selectAll("text").remove();
    cleanTooltip();

    d3.select("svg")
        .append("g")
        .attr("transform", "translate(100,50)")
        .selectAll()
        .data(worldpopFiltered)
        .enter()
        .append("rect")
        .attr("height", 0)
        .attr("y", 450)
        .attr("x", function(d) { 
            return x(d[xType])+5; 
        })
        .attr("width", x.bandwidth()-5)
        .transition()
        .duration(3000)
        .attr("y", function(d) {
            return y(d[selectedOption]*1000); 
        })
        .attr("height", function(d) { 
            return 500 - y(d[selectedOption]*1000)
        });

    createAxis(x, y, xType, yType);

    createMouseEvents(eventFunc);
}

function loadScene1() {
    worldpopFiltered = worldpop.filter((entry) => entry.type == 'World');

    xDomain = [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021];

    plotBarChart(xDomain, null, loadScene2, "year", selectedOption);

    let annotations = [
        {
            "note": { 
                "label": "Year-by-year the world " + selectedOption + " gets bigger"
            },
            "x": x(2016)+150,
            "y": 545,
            "dx": 10,
            "dy": 40,
            "type": d3.annotationCalloutElbow,
            "color": "red"
        }
    ];

    createAnnotations(annotations);

    d3.select("select")
      .on("change", handleDropdownChangeScene1);
}

async function init() {
    // Fetch world population data
    worldpop = await d3.csv("pop_deaths.csv");

    // Load scene 1
    loadScene1();
}

init();