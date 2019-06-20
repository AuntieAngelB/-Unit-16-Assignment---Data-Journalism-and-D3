var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 50,
  right: 40,
  bottom: 150,
  left: 150
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "income";//

// function used for updating x-scale var upon click on axis label
function xScale(govData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(govData, d => d[chosenXAxis]),
      d3.max(govData, d => d[chosenXAxis])
    ])
    .range([0, width])
    .nice();
  return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(500)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}
function renderCirclesFiller(circlesFiller, newXScale, chosenXAxis) {

  circlesFiller.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesFiller;
}

// function used for updating circles group with new tooltip

function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "income") { //
    var label = "Household Income (Median)"; //
  }
  else {
    var label = "Age (Median)"; //
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}${label} ${d[chosenXAxis]}<br>Poverty ${d.poverty}%`); //
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data, this);
    });

  return circlesGroup;
}
// /Users/rebeccajbooth/Documents/16-D3/Homework/StarterCode/assets/data/data.csv
d3.csv("assets/data/data.csv", function(err, govData) {
  if (err) throw err;

  govData.forEach(function (data) {//
    data.income = +data.income;//
    data.age = +data.age;//
    data.poverty = +data.poverty;//
    data.abbr = data.abbr//
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(govData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(govData, d => d.age)*1.2])//
    .range([height, 0])
    .nice();

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);//
  var leftAxis = d3.axisLeft(yLinearScale);//

  // append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesFiller = chartGroup.selectAll("circle")
    .data(govData)
    .enter()
    .append("text")
    .attr("class", "abbr")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.obesity))//
    .text(d=> d.appr)


  var circlesGroup = chartGroup.selectAll("circle")
    .data(govData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))//
    .attr("r", 15)
    .attr("fill", "turquoise")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var householdIncomeLabel = labelsGroup.append("text")//
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)//
    .text("Household Income (Median)");//

    var povertryLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener //
    .classed("inactive", true)
    .text("In Poverty (%)"); //

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        circlesFiller = rendercirclesFiller(circlesFiller, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          householdIncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          householdIncomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
// http://0.0.0.0:8000/index.html 
