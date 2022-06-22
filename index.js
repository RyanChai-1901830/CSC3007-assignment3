let width = 1000,
    height = 600;

let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)

// Load external data
Promise.all([d3.json("https://chi-loong.github.io/CSC3007/assignments/sgmap.json"), d3.csv("https://chi-loong.github.io/CSC3007/assignments/population2021.csv")]).then(data => {

    // Data successfully loaded
    console.log(data[0]);
    console.log(data[1]);
    console.log(data[0].features);

    // Bind the area name & population together
    // Regex to change - population to 0
    // Set pop to 0 by default to remove undefined
    population_data = [];
    var numberPattern = /^\d+$/;
    data[0].features.forEach(coordinate_data => {
        population_data[coordinate_data.properties.Name] = 0;
        data[1].forEach(pop_data => {
            if (coordinate_data.properties.Name.toLowerCase() == pop_data.Subzone.toLowerCase()) {
                if (!pop_data.Population.match(numberPattern)) {
                    console.log(pop_data.Population);
                    population_data[coordinate_data.properties.Name] = 0;

                } else {
                    population_data[coordinate_data.properties.Name] = pop_data.Population;
                }
            }

        })
    });
    // console.log(population_data);

    // Map and projection
    var projection = d3.geoMercator()
        .center([103.851959, 1.290270])
        .fitExtent([
            [20, 20],
            [980, 580]
        ], data[0]);

    let geopath = d3.geoPath().projection(projection);

    var colorScale = d3.scaleLinear()
        .domain([0, 80000])
        .range(["#5C4033", "#FFFFFF"]);

    var legend = d3.legendColor()
        .scale(colorScale)
        .labelFormat(d3.format(".0f"))
        .shapeWidth(40)
        .cells([0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000])
        .orient('horizontal')
        .title("Population");

    svg.append("path")
        .datum({ type: "Sphere" })
        .attr("id", "ocean")
        .attr("d", geopath)
        .attr("fill", "lightBlue");

    svg.append("g")
        .attr("id", "districts")
        .selectAll("path")
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", geopath)
        .attr("fill", d => colorScale(population_data[d.properties.Name.toUpperCase()]))
        .on("mouseover", (event, d) => {
            d3.select(".tooltip")
                .html("<h6>" + d.properties.Name + "</h6>" + "Population: " + population_data[d.properties.Name])
                .style("position", "absolute")
                .style("background", "#fff")
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "10px")
                .style("opacity", 1)

            let path = d3.select(event.currentTarget)
            path.style("stroke", "red").style("stroke-width", 2);
        })
        .on("mouseout", (event, d) => {
            d3.select(".tooltip")
                .text("")
                .style("opacity", 0);

            let path = d3.select(event.currentTarget)
            path.style("stroke", "gold").style("stroke-width", 0.5);
        });
    svg.append("g")
        .attr("transform", "translate(600,400)")
        .style("font-size", "10px")
        .call(legend)
})