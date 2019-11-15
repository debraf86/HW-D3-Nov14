// @TODO: YOUR CODE HERE!

// Set up the chart
//= ================================
const
    svgWidth = 960,
    svgHeight = 500;

const margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================
const svg = d3.select("#scatter")
    .append("div")
    .classed("chart", true);

const svg2 = d3.select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

const chartGroup = svg2.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
let chosenYAxis = "healthcare";

// function used for updating x-scale const upon click on axis label
function xScale(censusData, chosenXAxis){
    // create scales
    const xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8, 
        d3.max(censusData, d => d[chosenXAxis]) * 1.0
    ])
        .range([0, width]);

    return xLinearScale;
}

function yScale(censusData, chosenYAxis){
    // create scales
    const yLinearScale = d3.scaleLinear()
        .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8, 
        d3.max(censusData, d => d[chosenYAxis]) * 1.2
    ])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis cont upon click on axis label
function renderXAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;

}

// function used for updating circles group with a transition to 
// new circles
function  renderXCircles(circlesGroup, newXScale, chosenXAxis){
    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

function updateCirclesText(chosenXAxis, textGroup, censusData, newXScale){
    textGroup.transition()
    .attr("x", d => newXScale(d[chosenXAxis])-5)
    .attr("font-size", "12px")   
    .text(d => d.abbr)

    return textGroup;
}

// function used for update circles group with new tooltip
function updateToolTip(chosenAxis, circlesGroup){
    let label ="";
    if (chosenAxis === "age") {
        label = "Age: ";
    }
    else if (chosenAxis === "poverty"){
        label = "Poverty: ";
    }
    else {
        label = "Obesity: ";
    }

    const toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d){
            return(`${label} ${d[chosenXAxis]}`);
         } );
    
    circlesGroup.call(toolTip);

    circlesGroup.on ("mouseover", function(data){
        toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data, index){
        toolTip.hide(data, this);
    });

    return circlesGroup;
        
}


// retrieve data from the CSV file and execute everything below
(async function(){

    // Import data from the data.csv file
    // =================================
    const censusData = await d3.csv("assets/data/data.csv");

    // Parse the data
    // Format the data and convert to numerical and date values
    // =================================

    // Format the data
    censusData.forEach(function(data) {
        data.id = +data.id;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;                  
    });
    console.log (censusData);

    // Create Scales
    //=============================================
    
    // initial : poverty vs healthcare
    console.log (chosenXAxis);
    let xLinearScale = xScale(censusData, chosenXAxis);
  
    const yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(censusData, d => d[chosenYAxis])])
        .range([height, 0]);

    // Step 6: Create Axes
    // =============================================

    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);
    
    // Step 7: Append the axes to the chartGroup - ADD STYLING
    // ==============================================
    // Add bottomAxis (x axis)
    let xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // add y axis on the left
    let yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx",d => xLinearScale(d[chosenXAxis]))
        .attr("cy",d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "#1995ad") // teal-ish blue
        .attr("opacity", ".75");

    // add the State Abbreviate to the center of the circles
    let textGroup = chartGroup
        .selectAll("text.my-text")
        .data(censusData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis])-5)
        .attr("y", d => yLinearScale(d[chosenYAxis])+5)
        .attr("font-size", "12px")   //  font-size: 12px;
        .text(d => d.abbr)

    // Create group for axis labels
    const labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const labelsGroup2 = chartGroup;
    const povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("Poverty (%)");

    const ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (median)");

    const obesityLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)");

    // append y axis
    const healthcareLabel = labelsGroup2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height/2)-30)
        .attr("dy", "1em")
        .attr ("value", "healthcare")
        .classed("axis-text", true)
        .text("Lacks Healthcare (%)");

    const incomeLabel = labelsGroup2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height/2)-50)
        .attr("dy", "1em")
        .attr ("value", "income")
        .classed("axis-text", true)
        .text("Household Income (median)");

    const smokesLabel = labelsGroup2.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 2)-10)
        .attr("dy", "1em")
        .attr ("value", "smokes")
        .classed("axis-text", true)
        .text("Smokes (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x and y axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            //get value of selection
            const value = d3.select(this).attr("value");
            console.log (value);
            if ((value != chosenXAxis) && (value != chosenYAxis)){
                // replaces chosenAxis with value
                if (value === 'poverty' || value ==='age' || value === 'obesity') {
                    // update x scale for new data
                    let chosenXAxis = value;

                    xLinearScale = xScale(censusData, chosenXAxis);
                
                    //update x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);

                    // updates circles with new x values and circle text (state abbr)
                    circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
                    textGroup = updateCirclesText(chosenXAxis, textGroup, censusData, xLinearScale);

                    // updates toottips with new info
                    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                    // changes classes to change bold text -- x axis
                    if (chosenXAxis === 'poverty') {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel 
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else if (chosenXAxis === 'age') {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel 
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else { // (chosenXAxis === 'obesity')   
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel 
                            .classed("active", true)
                            .classed("inactive", false);

                    }
                }
                // changes classes to change bold text - Y axis
                else {  // value === 'healthcare' || 'income' || 'smokers'
                    let chosenYAxis = value;

                    yLinearScale = yScale(censusData, chosenYAxis);
                
                    //update x axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles with new x values and circle text (state abbr)
                    circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
                    // textGroup = updateCirclesText(chosenXAxis, textGroup, censusData, xLinearScale);

                    // updates toottips with new info
                    circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
                
                    if (chosenYAxis === 'healthcare') {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokersLabel 
                            .classed("active", false)
                            .classed("inactive", true);

                    }
                    else if (chosenYAxis === 'income') {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokersLabel 
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else { // chosenYAxix === 'smokers'
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokersLabel 
                            .classed("active", true)
                            .classed("inactive", false);

                    }
                }

            }
         
          }  );

})()
