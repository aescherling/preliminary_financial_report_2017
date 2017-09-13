// Expenditures bubble chart script.
// 

// Organization and style taken from https://github.com/vlandham/bubble_chart/blob/gh-pages/src/bubble_chart.js
// which was in turn inspired by https://bost.ocks.org/mike/chart/

function bubbleChart() {

  // Constants for sizing
  var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight|| e.clientHeight|| g.clientHeight;

  // maintain a ratio of 9 width to 5 height, but scale to window. Max width of 1000.
  var width = d3.min([1000, y * 1.2, x * 0.75]),
      height = width * 5 / 9;

  // scale the toolbars
  var label_size = d3.min([d3.max([12, (height / 25)]), 15]) + "px",
      entry_size = d3.min([d3.max([10, (height / 30)]), 14]) + "px"
  d3.selectAll('.toolbar_label').attr('style', "padding:0px 0px 0px 10px; font-weight: bold; font-size: " + label_size);
  d3.selectAll('.btn-group').selectAll('.btn').attr('style', "font-size: " + entry_size);
  d3.select('.typeahead').attr('style', 'font-size: ' + label_size);

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  // create and activate the tooltip for displaying data on each item
  var floating_tooltip = floatingTooltip('floatingTooltip', "285px");
  d3.select('#floatingTooltip').classed('active', true);

  // Location to move bubbles towards
  var center = { x: width * 0.35, y: height * 0.5 };
  var categoryCenters = {
    "Budgetary department": { x: width * 0.25, y: height * 0.51 },
    "Non-departmental": { x: width * 0.45, y: height * 0.51 }
  };

  // X locations of the category titles.
  var categoryTitleX = {
    "Budgetary department": width * 0.15,
    "Non-departmental": width * 0.5
  };

  // Create the force layout
  var damper = 0.1;
  var force = d3.layout.force()
    .size([width, height])
    .charge(function (d) {return -Math.pow(d.radius, 2.0)/8;})
    .gravity(-0.01)
    .friction(0.9);

  // Create scale for bubbles. The value is linked to area instead of raw radius.
  // Note that the scale is based on the svg height.
  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([3, height/7.5]);


  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */

  function createNodes(rawData) {
    //// create a list of item names
    //itemNames = [];
    //rawData.forEach(function (d) {itemNames.push(d.Name)});

    // calculate the total expenditures for each year
    var total17 = d3.sum(rawData, function (d) { return +d.FY17Expenditures; });
    var total16 = d3.sum(rawData, function (d) { return +d.FY16Expenditures; });
    var total15 = d3.sum(rawData, function (d) { return +d.FY15Expenditures; });
    var total14 = d3.sum(rawData, function (d) { return +d.FY14Expenditures; });
    var total13 = d3.sum(rawData, function (d) { return +d.FY13Expenditures; });
    var total12 = d3.sum(rawData, function (d) { return +d.FY12Expenditures; });
    var total11 = d3.sum(rawData, function (d) { return +d.FY11Expenditures; });
    var total10 = d3.sum(rawData, function (d) { return +d.FY10Expenditures; });
    var total09 = d3.sum(rawData, function (d) { return +d.FY09Expenditures; });
    var total08 = d3.sum(rawData, function (d) { return +d.FY08Expenditures; });

    // Use map() to convert raw data into node data
    var myNodes = rawData.map(function (d) {
      return {
        x: Math.random() * 900,
        y: Math.random() * 800,
        id: d.id,
        category: d.category,
        radius: radiusScale(+d.fy17expenditures),
        value: +d.fy17expenditures,
        name: d.name,
        description: d.description,
        FY17Expenditures: +d.fy17salaries + +d.fy17other,
        FY16Expenditures: +d.fy16salaries + +d.fy16other,
        FY15Expenditures: +d.fy15salaries + +d.fy15other,
        FY14Expenditures: +d.fy14salaries + +d.fy14other,
        FY13Expenditures: +d.fy13salaries + +d.fy13other,
        FY12Expenditures: +d.fy12salaries + +d.fy12other,
        FY11Expenditures: +d.fy11salaries + +d.fy11other,
        FY10Expenditures: +d.fy10salaries + +d.fy10other,
        FY09Expenditures: +d.fy09salaries + +d.fy09other,
        FY08Expenditures: +d.fy08salaries + +d.fy08other,
        FY17Budget: +d.fy17budget,
        FY16Budget: +d.fy16budget,
        FY15Budget: +d.fy15budget,
        FY14Budget: +d.fy14budget,
        FY13Budget: +d.fy13budget,
        FY12Budget: +d.fy12budget,
        FY11Budget: +d.fy11budget,
        FY10Budget: +d.fy10budget,
        FY09Budget: +d.fy09budget,
        FY08Budget: +d.fy08budget,
        FY17Salaries: +d.fy17salaries,
        FY16Salaries: +d.fy16salaries,
        FY15Salaries: +d.fy15salaries,
        FY14Salaries: +d.fy14salaries,
        FY13Salaries: +d.fy13salaries,
        FY12Salaries: +d.fy12salaries,
        FY11Salaries: +d.fy11salaries,
        FY10Salaries: +d.fy10salaries,
        FY09Salaries: +d.fy09salaries,
        FY08Salaries: +d.fy08salaries,        
        FY17Other: +d.fy17other,
        FY16Other: +d.fy16other,
        FY15Other: +d.fy15other,
        FY14Other: +d.fy14other,
        FY13Other: +d.fy13other,
        FY12Other: +d.fy12other,
        FY11Other: +d.fy11other,
        FY10Other: +d.fy10other,
        FY09Other: +d.fy09other,
        FY08Other: +d.fy08other,
        FY17Percent: 100 * d.fy17expenditures / total17,
        FY16Percent: 100 * d.fy16expenditures / total16,
        FY15Percent: 100 * d.fy15expenditures / total15,
        FY14Percent: 100 * d.fy14expenditures / total14,
        FY13Percent: 100 * d.fy13expenditures / total13,
        FY12Percent: 100 * d.fy12expenditures / total12,
        FY11Percent: 100 * d.fy11expenditures / total11,
        FY10Percent: 100 * d.fy10expenditures / total10,
        FY09Percent: 100 * d.fy09expenditures / total09,
        FY08Percent: 100 * d.fy08expenditures / total08
      };
    });

    // sort them to prevent occlusion of smaller nodes (large circles made first)
    myNodes.sort(function (a, b) { return b.value - a.value; });

    return myNodes;
  }

  // Default to coloring by category (general funds or special funds)
  var categoryColor = d3.scale.ordinal().domain(['Budgetary department', 'Non-departmental']).range(['#7aa25c', '#509CE7']);

  // color scale for colors based on % growth
  var growthColor = d3.scale.pow()
            .exponent(0.5)
            .domain([-100,0, 100])
            .range(['#C00000', '#FFFFFF', '#00C000']);

  // function for generating legends
  function makeLegend(x, y, size, colors, labels) {
    // make the legend object
    legend = d3.select('svg').append('g')
      .classed('legend', true)
      .classed('bubble', true)
      .classed('notSelected', true);

    // only make the legend visible in "bubble view"
    var opacity = 1 - d3.select('.detail').attr('opacity');
    legend.attr('opacity', opacity);

    // # of items in the legend
    var n = colors.length;

    // loop to place the items
    var yTmp = y + (size * 0.25) - (n * size * 0.75);
    for (var i=0; i<n; i++){
      legend.append('rect')
        .attr('x', x)
        .attr('y', yTmp + 1.5 * size * i)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', d3.rgb(colors[i]))
        .attr('stroke', d3.rgb(colors[i]).darker())
        .attr('stroke-width', 2);
      legend.append('text')
        .attr('x', x + 1.5 * size)
        .attr('y', 4 + size/2 + yTmp + 1.5 * size * i)
        .attr('text-anchor', 'center')
        .attr('style', "font-size: " + d3.min([d3.max([10, (size / 2)]), 16]) + "px")
        .text(labels[i]);
    }
  }

  function makeLegend2(x, y, size, colors, labels) {
    // make the legend object
    legend = d3.select('svg').append('g')
      .classed('legend', true)
      .classed('bubble', true)
      .classed('notSelected', true);

    // only make the legend visible in "bubble view"
    var opacity = 1 - d3.select('.detail').attr('opacity');
    legend.attr('opacity', opacity);

    // # of items in the legend
    var n = colors.length;

    // loop to place the items
    //var yTmp = y + (size * 0.25) - (n * size * 0.75);
    var yTmp = y - (n * size * 0.5);
    for (var i=0; i<n; i++){
      legend.append('rect')
        .attr('x', x)
        .attr('y', yTmp + size * i)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', d3.rgb(colors[i]))
        .attr('stroke', d3.rgb(colors[i]));
      legend.append('text')
        .attr('x', x + 1.5 * size)
        .attr('y', 4 + size/2 + yTmp + size * i)
        .attr('text-anchor', 'center')
        .attr('style', "font-size: " + d3.min([d3.max([10, (size / 2)]), 16]) + "px")
        .text(labels[i]);
    }
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData) {
    // Use the max FY_2017_Actual_Receipts in the data as the max in the scale's domain
    // note we have to ensure the FY_2017_Actual_Receipts is a number by converting it
    // with `+`.
    var maxAmount = d3.max(rawData, function (d) { return +d.fy17expenditures; });
    radiusScale.domain([0, maxAmount]);

    var nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // The detail box. A description and time series plot will appear here
    // when a bubble is clicked. 
    // Draw this box first so it goes underneath the bubbles.
    var detailX = width * 0.167;
    var detailY = height * 0.05;
    var detailW = width * 0.66;
    var detailH = height * 0.9;
    svg.append('rect')
      .classed('detail', true)
      .attr('x', detailX)
      .attr('y', detailY)
      .attr('rx', 10)
      .attr('ry', 10)
      .attr('width', detailW)
      .attr('height', detailH)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#000000')
      .attr('opacity', 0);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('g')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter().append('circle')
      .classed('bubble', true)
      .classed('notSelected', true)
      .attr('name', function (d) {return d.name;})
      .attr('r', 0)
      .attr('fill', function (d) { return categoryColor(d.category); })
      .attr('stroke', function (d) { return d3.rgb(categoryColor(d.category)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showFloatingTooltip)
      .on('mouseout', hideFloatingTooltip)
      .on('click', showDetailView);


    // Transition to make bubbles appear, ending with the correct radius
    bubbles.transition()
      .duration(100)
      .attr('r', function (d) { return d.radius; });

    // Add a legend
    makeLegend(width * 0.7, center.y, width / 24, ['#7aa25c', '#509CE7'], ['Budgetary department', 'Non-departmental']);

    /*
    Content for the detailed view.
    */

    // make a button for hiding the detail
    // (won't make it class="button" until the detail is shown)
    svg.append('text')
      .classed('exitButton', true)
      .classed('detail', true)
      .attr('x', detailX + detailW - 30)
      .attr('y', detailY+20)
      .attr('font-size', 14)
      .text('')
      .attr('opacity', 0)
      .on('click', hideDetailView);

    // detail: item description
    svg.append('g')
      .classed('detail', true)
      .classed('description', true)
      .attr('font-style', 'italic')
      .attr('opacity', 0);

    // detail: item name
    svg.append('text')
      .classed('detail', true)
      .classed('name', true)
      .attr('x', detailX+10)
      .attr('y', detailY+25)
      .text('Item name')
      .attr('font-weight', 'bold')
      .attr('font-size', 13)
      .attr('opacity', 0);

    // Set initial layout
    groupBubbles();

  };

  // function for calculating percent growth
  pct_growth = function(d) {
    fiscal_years = ["2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008"];
    expenditures = [d.FY17Expenditures, d.FY16Expenditures, d.FY15Expenditures, d.FY14Expenditures, d.FY13Expenditures, d.FY12Expenditures, d.FY11Expenditures, d.FY10Expenditures, d.FY09Expenditures, d.FY08Expenditures];
    index = fiscal_years.indexOf(currentYear);
    return 100 * (expenditures[index] - expenditures[index+1]) / expenditures[index+1];
  };

  function colorCategories() {
    svg.selectAll('circle')
      .transition()
      .duration(400)
      .attr('fill', function (d) {return categoryColor(d.category); })
      .attr('stroke', function (d) {return d3.rgb(categoryColor(d.category)).darker(); });
  }


  function colorGrowth() {
    // select current year, for calcuating percent growth
    currentYear = d3.select('#year_toolbar').selectAll('.btn').filter('.active').attr('id');

    // change colors based on percent growth
    svg.selectAll('circle')
      .transition()
      .duration(400)
      .attr('fill', function (d) {
        value = pct_growth(d);
        if (isNaN(value)) {
          out = '#000000';          
        } else {
          out = growthColor(value);
        }
        return out;
      })
      .attr('stroke', function (d) {
        value = pct_growth(d);
        if (isNaN(value)) {
          out = '#000000';          
        } else {
          out = d3.rgb(growthColor(value)).darker();
        }
        return out;
      });

  }


  /*
   * Sets visualization in "single group mode".
   */
  function groupBubbles() {
    hideCategories();

    force.on('tick', function (e) {
      bubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Splits apart the categories
   */
  function splitBubbles() {
    showCategories();

    force.on('tick', function (e) {
      bubbles.each(moveToCategories(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "single group mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it toward the center of
   * the visualization.
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
   */
  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  function moveToCategories(alpha) {
    return function (d) {
      var target = categoryCenters[d.category];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  /*
   * Hides category title displays.
   */
  function hideCategories() {
    svg.selectAll('.category').remove();
  }

  /*
   * Shows category title displays.
   */
  function showCategories() {
    // Another way to do this would be to create
    // the category texts once and then just hide them.
    var categoryData = d3.keys(categoryTitleX);
    var category = svg.selectAll('.category')
      .data(categoryData);

    category.enter().append('text')
      .classed('category', true)
      .classed('bubble', true)
      .attr('x', function (d) { return categoryTitleX[d]; })
      .attr('y', height * 0.15)
      .attr('text-anchor', 'middle')
      .attr('style', "font-size: " + d3.min([d3.max([12, (height / 20)]), 16]) + "px")
      .text(function (d) { return d; });
  }

  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showFloatingTooltip(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    // select current fiscal year for generating content
    currentYear = d3.select('#year_toolbar').selectAll('.btn').filter('.active').attr('id');

    // necessary variables for generating content
    fiscal_years = ["2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008"];
    budgets = [d.FY17Budget, d.FY16Budget, d.FY15Budget, d.FY14Budget, d.FY13Budget, d.FY12Budget, d.FY11Budget, d.FY10Budget, d.FY09Budget, d.FY08Budget];
    expenditures = [d.FY17Expenditures, d.FY16Expenditures, d.FY15Expenditures, d.FY14Expenditures, d.FY13Expenditures, d.FY12Expenditures, d.FY11Expenditures, d.FY10Expenditures, d.FY09Expenditures, d.FY08Expenditures];
    salaries = [d.FY17Salaries, d.FY16Salaries, d.FY15Salaries, d.FY14Salaries, d.FY13Salaries, d.FY12Salaries, d.FY11Salaries, d.FY10Salaries, d.FY09Salaries, d.FY08Salaries];
    others = [d.FY17Other, d.FY16Other, d.FY15Other, d.FY14Other, d.FY13Other, d.FY12Other, d.FY11Other, d.FY10Other, d.FY09Other, d.FY08Other];
    percents = [d.FY17Percent, d.FY16Percent, d.FY15Percent, d.FY14Percent, d.FY13Percent, d.FY12Percent, d.FY11Percent, d.FY10Percent, d.FY09Percent, d.FY08Percent];

    // index of current year
    index = fiscal_years.indexOf(currentYear);

    // generate content
    fyText = fiscal_years[index];
    salaries_tmp = salaries[index];
    others_tmp = others[index];
    expenditures_tmp = expenditures[index];
    budget_tmp = budgets[index];
    pct_growth_tmp = Math.ceil(100 * 100 * (expenditures[index] - expenditures[index+1]) / expenditures[index+1])/100;

    var content = '<span class="name">' + d.name + '</span>' +
                  '<span class="heading"><p style="text-align: center">Fiscal Year ' + fyText + '</p></span>' +
                  '<table><tr><td>Salaries</td><td style="text-align: center">' + formatAmount(salaries_tmp) + '</td></tr>' +
                  '<tr><td>Other</td><td style="text-align: center">' + formatAmount(others_tmp) + '</td></tr>' +
                  '<tr><td>Total expenditures</td><td style="text-align: center">' + formatAmount(expenditures_tmp) + '</td></tr>' +
                  '<tr><td>Budget</td><td style="text-align: center">' + formatAmount(budget_tmp) + '</td></tr>' +
                  '<tr><td>Percent of total budget</td><td style="text-align: center">' + formatPercent(percents[index]) + '</td></tr>' + 
                  '<tr><td>Annual growth</td><td style="text-align: center">' + formatPercent(pct_growth_tmp) + '</td></tr></table>' + 
                  '<div style="height: 5px"></div>' + 
                  '<p style="text-align: center">(Click bubble for more info)</p>';

    // check that the tooltip is active before displaying it
    // (tooltip is de-activated when detail chart is being shown)
    tooltipActive = d3.select('#floatingTooltip').classed('active');
    if (tooltipActive) {
      floating_tooltip.revealTooltip(content, d3.event);
    }
  }

  /*
   * Hides tooltip
   */
  function hideFloatingTooltip(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(d3.select(this).attr('fill')).darker());

    floating_tooltip.hideTooltip();
  }

  function showDetailView(d){

    // disable the floating tooltip
    d3.select('#floatingTooltip').classed('active', false);

    // disable bubble click functionality
    d3.selectAll('.bubble').on('click', function () {});

    // show detail objects
    d3.selectAll('.detail')
      .transition()
      .duration(100)
      .attr('opacity', 1);

    // hide everything else
    d3.selectAll('.bubble').classed('hidden', true);

    // hide the tooltip
    floating_tooltip.hideTooltip();

    // keep a pointer to the canvas
    var svg = d3.select('svg');

    // activate the exit button
    d3.select('.exitButton')
      .classed('button', true)
      .text('Exit');

    // make the graph
    var yearArray = ['2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017'];
    var salaryArray = [+d.FY08Salaries, +d.FY09Salaries, +d.FY10Salaries, +d.FY11Salaries, +d.FY12Salaries, +d.FY13Salaries, +d.FY14Salaries, +d.FY15Salaries, +d.FY16Salaries, +d.FY17Salaries];
    var otherArray = [+d.FY08Other, +d.FY09Other, +d.FY10Other, +d.FY11Other, +d.FY12Other, +d.FY13Other, +d.FY14Other, +d.FY15Other, +d.FY16Other, +d.FY17Other];
    var budgetArray = [+d.FY08Budget, +d.FY09Budget, +d.FY10Budget, +d.FY11Budget, +d.FY12Budget, +d.FY13Budget, +d.FY14Budget, +d.FY15Budget, +d.FY16Budget, +d.FY17Budget];
    var myData = yearArray.map(function(val, index) {
      return {year: val, budget: budgetArray[index]/1e6, salary: salaryArray[index]/1e6, other: otherArray[index]/1e6}
    });

    // get the location and size of the rectangle we're drawing in
    var detailX = d3.selectAll('rect').filter('.detail').attr('x');
    var detailY = d3.selectAll('rect').filter('.detail').attr('y');
    var detailW = d3.selectAll('rect').filter('.detail').attr('width');
    var detailH = d3.selectAll('rect').filter('.detail').attr('height');

    var graphX = +detailX + 60;
    var graphWidth = +detailW - 110;
    var graphY = +detailY + 150;
    var graphHeight = +detailH - +graphY - 40;
    var graphBottom = graphY + graphHeight;

    // item description font size
    var description_size = d3.min([d3.max([8, (height / 35)]), 13]) + "px";

    // item description
    var myDesc = d.description;
    itemDesc = d3.selectAll('g').filter('.description');
    itemDesc.append("foreignObject")
      .attr('id', 'descriptionObject')
      .attr('x', +detailX + 10)
      .attr('y', +detailY + 15)
      .attr("width", +detailW - 40)
      .attr('height', 100)
      .append("xhtml:body")
      .html('<p id="itemDescription" style="font-size: 13px">'+ myDesc + '</p>');

    // resize the text to fit in the box
    // https://stackoverflow.com/questions/6112660/how-to-automatically-change-the-text-size-inside-a-div
    $(function() {
      while( $('#itemDescription').height() + 20 > $('#descriptionObject').height() ) {
        $('#itemDescription').css('font-size', (parseInt($('#itemDescription').css('font-size')) - 1) + "px" );
      }
    });

    // item name
    itemName = d3.selectAll('text').filter('.name');
    itemName.text(d.name);

    // putting together the graph
    var parseTime = d3.time.format("%Y").parse;

    var ymin = d3.min([d3.min(salaryArray), d3.min(otherArray)])/1e6;
    var ymax = d3.max([d3.max(salaryArray), d3.max(otherArray)])/1e6;
    //var ymin = d3.min([d3.min(salaryArray), d3.min(otherArray), d3.min(budgetArray)])/1e6;
    //var ymax = d3.max([d3.max(salaryArray), d3.max(otherArray), d3.max(budgetArray)])/1e6;

    var xScale = d3.time.scale()
      .range([graphX, graphX + graphWidth])
      .domain([parseTime(d3.min(yearArray)),parseTime(d3.max(yearArray))]);
    var yScale = d3.scale.linear()
      .range([graphY + graphHeight, graphY])
      .domain([ymin, ymax])
      .nice();

    var budgetLine = d3.svg.line()
      .x(function(d) { return xScale(parseTime(d.year)); })
      .y(function(d) { return yScale(d.budget); });

    var salaryLine = d3.svg.line()
      .x(function(d) { return xScale(parseTime(d.year)); })
      .y(function(d) { return yScale(d.salary); });

    var otherLine = d3.svg.line()
      .x(function(d) { return xScale(parseTime(d.year)); })
      .y(function(d) { return yScale(d.other); });
    
    svg.append("g")
        .attr("class", "axis axis--x")
        .classed('detail', true)
        .attr("transform", "translate(0,"+ graphBottom + ")")
        .call(d3.svg.axis().scale(xScale).orient('bottom'))
        .attr('opacity', 1);
    
    svg.append("g")
        .attr("class", "axis axis--y")
        .classed('detail', true)
        .attr('transform', 'translate(' + graphX + ',0)')
        .call(d3.svg.axis().scale(yScale).ticks(7).orient('left'))
        .append("text")
        .attr('x', -45)
        .attr('y', graphY - 25)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("$ (Millions)")
        .attr('opacity', 1);

    var item = svg.selectAll('.item')
      .data([myData])
      .enter().append('g')
      .attr('class', 'item');

    //item.append('path')
    //  .attr('class', 'line')
    //  .classed('detail', true)
    //  .attr('d', function (d) {return budgetLine(myData);})
    //  .attr('stroke', 'black')
    //  .attr('opacity', 1);

    item.append('path')
      .attr('class', 'line')
      .classed('detail', true)
      .attr('d', function (d) {return salaryLine(myData);})
      .attr('stroke', 'steelblue')
      .attr('opacity', 1);

    item.append('path')
      .attr('class', 'line')
      .classed('detail', true)
      .attr('d', function (d) {return otherLine(myData);})
      .attr('stroke', 'darkgreen')
      .attr('opacity', 1);

    // Make a legend
    plotLegend = d3.select('svg').append('g')
      .classed('plotLegend', true)
      .classed('detail', true);

    // legend parameters/variables
    var x = graphX + graphWidth/2 - 60;
    var y = graphY + graphHeight + 35;
    var size = 10;
    //var colors = ['black', 'steelblue', 'darkgreen'];
    //var labels = ['Budget', 'Salaries', 'Other'];
    var colors = ['steelblue', 'darkgreen'];
    var labels = ['Salaries', 'Other'];
    var n = colors.length;

    // loop to place the items
    var xTmp = x + (size * 0.25) - (n * size * 0.75);
    for (var i=0; i<n; i++){
      plotLegend.append('rect')
        .attr('x', xTmp + 10 * size * i)
        .attr('y', y)
        .attr('width', size)
        .attr('height', size)
        .attr('fill', d3.rgb(colors[i]))
        .attr('stroke', d3.rgb(colors[i]).darker())
        .attr('stroke-width', 2);
      plotLegend.append('text')
        .attr('font-size', 12)
        .attr('x', 15 + xTmp + 10 * size * i)
        .attr('y', y + 10)
        .attr('text-anchor', 'center')
        .text(labels[i]);
    } 

  }

  function hideDetailView() {

    // enable the bubble click functionality
    d3.selectAll('.bubble').on('click', showDetailView);
    
    // make details invisible
    d3.selectAll('.detail')
      .transition()
      .duration(100)
      .attr('opacity', 0);

    // make bubbles visible
    d3.selectAll('.bubble').classed('hidden', false);

    // remove graph
    d3.selectAll('.axis').remove();
    d3.selectAll('.line').remove();
    d3.selectAll('.item').remove();
    d3.selectAll('.plotLegend').remove();

    // remove text
    d3.selectAll('text').filter('.name').text('');
    d3.selectAll('foreignObject').remove();

    // unselect all bubbles
    d3.selectAll('.bubble')
      .classed('selected', false);

    // activate the tooltip
    d3.select('#floatingTooltip')
      .classed('active', true);

    // deactivate the exit button
    d3.select('.exitButton').classed('button', false);
  }

  /*
   * Externally accessible functions
   */
  chart.toggleDisplay = function () {
    // get the active setting
    currentScheme = d3.select('#split_toolbar').selectAll('.btn').filter('.active').attr('id');
    if (currentScheme === 'category') {
      splitBubbles();
    } else {
      groupBubbles();
    }
  };

  chart.toggleColor = function () {
    // find the active color scheme
    colorScheme = d3.select('#color_toolbar').selectAll('.btn').filter('.active').attr('id');

    if (colorScheme === 'category') {
      colorCategories();
      d3.selectAll('.legend').remove();
      makeLegend(width * 0.7, center.y, width / 25, ['#7aa25c', '#509CE7'], ['Budgetary department','Non-departmental']);
    } else if (colorScheme === 'growth') {
      colorGrowth();
      d3.selectAll('.legend').remove();
      makeLegend2(width * 0.7, center.y, width / 30, 
        [growthColor(100), growthColor(50), growthColor(25), growthColor(12.5), growthColor(0), 
        growthColor(-12.5), growthColor(-25), growthColor(-50), growthColor(-100), '#000000'], 
        ['100% +', '50%', '25%', '12.5%', '0%', '-12.5%', '-25%', '-50%', '-100%', 'Undefined']);
    }
  };

  // return the radius for a particular bubble, given a scale variable and year
  findRadius = function (d, scaleVar, year) {
    // pick out the index of the current year
    fiscal_years = ["2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008"];
    index = fiscal_years.indexOf(currentYear);

    // set "values" array equal to array of scale variable
    if (scaleVar=='total') {
      values = [+d.FY17Expenditures, +d.FY16Expenditures, +d.FY15Expenditures, +d.FY14Expenditures, +d.FY13Expenditures, +d.FY12Expenditures, +d.FY11Expenditures, +d.FY10Expenditures, +d.FY09Expenditures, +d.FY08Expenditures];
    } else if (scaleVar=='salaries'){
      values = [+d.FY17Salaries, +d.FY16Salaries, +d.FY15Salaries, +d.FY14Salaries, +d.FY13Salaries, +d.FY12Salaries, +d.FY11Salaries, +d.FY10Salaries, +d.FY09Salaries, +d.FY08Salaries];
    } else if (scaleVar=='other') {
      values = [+d.FY17Other, +d.FY16Other, +d.FY15Other, +d.FY14Other, +d.FY13Other, +d.FY12Other, +d.FY11Other, +d.FY10Other, +d.FY09Other, +d.FY08Other];
    }

    // return the desired value
    return radiusScale(values[index]);
  }


  chart.toggleYear = function () {

    // find the active year, color scheme, and scaling variable
    currentYear = d3.select('#year_toolbar').selectAll('.btn').filter('.active').attr('id');
    colorScheme = d3.select('#color_toolbar').selectAll('.btn').filter('.active').attr('id');
    currentScale = d3.select('#scale_toolbar').selectAll('.btn').filter('.active').attr('id');

    // select all the circles and bubbles
    circles = d3.selectAll('circle');

    // change the radius
    circles.transition().duration(400)
      .attr('r', function (d) {return findRadius(d, currentScale, currentYear);})
      .attr('fill', function (d) {
        if (colorScheme == 'category') {
          return categoryColor(d.category);
        } else if (colorScheme = 'growth'){
          value = pct_growth(d);
          if (isNaN(value)) {
            out = '#000000';          
          } else {
            out = growthColor(value);
          }
          return out;
        }
      })
      .attr('stroke', function (d) {
        if (colorScheme == 'category') {
          return d3.rgb(categoryColor(d.category)).darker(); 
        } else if (colorScheme == 'growth') {
          value = pct_growth(d);
          if (isNaN(value)) {
            out = '#000000';          
          } else {
            out = d3.rgb(growthColor(value)).darker();
          }
          return out;          
        }
      });

    // change the charge
    force.charge(function (d) {return -Math.pow(findRadius(d, currentScale, currentYear), 2.0)/8;});
    force.start();

  };


  chart.toggleScale = function () {
    // find the active scale, year, and color schemes
    currentScale = d3.select('#scale_toolbar').selectAll('.btn').filter('.active').attr('id');
    currentYear = d3.select('#year_toolbar').selectAll('.btn').filter('.active').attr('id');
    colorScheme = d3.select('#color_toolbar').selectAll('.btn').filter('.active').attr('id');

    // select all the circles and bubbles
    circles = d3.selectAll('circle');

    // change the radius
    circles.transition().duration(400)
      .attr('r', function (d) {return findRadius(d, currentScale, currentYear);})

    // change the charge
    force.charge(function (d) {return -Math.pow(findRadius(d, currentScale, currentYear), 2.0)/8;});
    force.start();
  };


  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #main_vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3.select('#scale_toolbar')
    .selectAll('.btn')
    .on('click', function () {
      // Remove "active" class from all buttons, then set the clicked button as active
      d3.select('#scale_toolbar').selectAll('.btn').classed('active', false);
      d3.select(this).classed('active', true);

      // Toggle the bubble chart scale
      myBubbleChart.toggleScale();
    });

  d3.select('#split_toolbar')
    .selectAll('.btn')
    .on('click', function () {
      // Remove "active" class from all buttons, then set the clicked button as active
      d3.select('#split_toolbar').selectAll('.btn').classed('active', false);
      d3.select(this).classed('active', true);

      // Toggle the bubble chart display
      myBubbleChart.toggleDisplay();
    });

  d3.select('#color_toolbar')
    .selectAll('.btn')
    .on('click', function () {
      // Remove "active" class from all buttons, then set the clicked button as active
      d3.select('#color_toolbar').selectAll('.btn').classed('active', false);
      d3.select(this).classed('active', true);

      // Toggle the bubble chart color
      myBubbleChart.toggleColor();
    });

  d3.select('#year_toolbar')
    .selectAll('.btn')
    .on('click', function () {
      // Remove "active" class from all buttons, then set the clicked button as active
      d3.select('#year_toolbar').selectAll('.btn').classed('active', false);
      d3.select(this).classed('active', true);

      // Toggle the bubble chart year
      myBubbleChart.toggleYear();
    });

}

// data...
var expenditureData = [{"id":1,"name":"Aging","description":"This Department plans, contracts, and directly administers programs for older adults residing in the City of Los Angeles and their family caregivers through a network of 16 multi-purpose senior centers and Citywide service providers. For more information see <a href='http://aging.lacity.org'>http://aging.lacity.org</a>.","category":"Budgetary department","fy08budget":4376859,"fy08salaries":3833070,"fy08other":277339,"fy09budget":4835617,"fy09salaries":3744684,"fy09other":208378,"fy10budget":4789730,"fy10salaries":3397279,"fy10other":207193,"fy11budget":4434886,"fy11salaries":3306358,"fy11other":145241,"fy12budget":4789021,"fy12salaries":3249633,"fy12other":236137,"fy13budget":4328550,"fy13salaries":3242403,"fy13other":162202,"fy14budget":4092088,"fy14salaries":3345697,"fy14other":150691,"fy15budget":4744077,"fy15salaries":3176006,"fy15other":411594,"fy16budget":4900092,"fy16salaries":3292891,"fy16other":644066,"fy17budget":5842739,"fy17salaries":3424373,"fy17other":1483564},
{"id":2,"name":"Animal Services","description":"This Department enforces all laws and ordinances regulating the care, custody, control, and prevention of cruelty to all animals, including wildlife, within the City. For more information see <a href='http://www.laanimalservices.com'>http://www.laanimalservices.com</a>.","category":"Budgetary department","fy08budget":21462011,"fy08salaries":18872682,"fy08other":1997552,"fy09budget":21490826,"fy09salaries":19779291,"fy09other":1573129,"fy10budget":20403101,"fy10salaries":18796825,"fy10other":1440895,"fy11budget":20499953,"fy11salaries":18633086,"fy11other":1465481,"fy12budget":20385428,"fy12salaries":18732779,"fy12other":1408287,"fy13budget":20274261,"fy13salaries":18496062,"fy13other":1493002,"fy14budget":21940274,"fy14salaries":19663191,"fy14other":2076427,"fy15budget":23191449,"fy15salaries":19793699,"fy15other":1565149,"fy16budget":23052748,"fy16salaries":20230641,"fy16other":2004849,"fy17budget":23716220,"fy17salaries":20232557,"fy17other":2094839},
{"id":3,"name":"Building and Safety","description":"This Department enforces all ordinances and laws relating to the construction, alteration, repair, demolition, removal or relocation of buildings or structures as well as the installation, alteration, repair, use and operation of heating, plumbing, lighting, ventilating, refrigerating, electrical and mechanical appliances, and equipment therein. For more information see <a href='http://www.ladbs.org'>http://www.ladbs.org</a>.","category":"Budgetary department","fy08budget":85371562,"fy08salaries":79945481,"fy08other":2185497,"fy09budget":87221253,"fy09salaries":81884526,"fy09other":2357080,"fy10budget":72386079,"fy10salaries":69221891,"fy10other":2032810,"fy11budget":69378706,"fy11salaries":66531546,"fy11other":1923293,"fy12budget":71764509,"fy12salaries":68666439,"fy12other":1876692,"fy13budget":76158579,"fy13salaries":69124443,"fy13other":1829597,"fy14budget":80682901,"fy14salaries":74383257,"fy14other":1711323,"fy15budget":92732932,"fy15salaries":79645582,"fy15other":1781910,"fy16budget":108429152,"fy16salaries":85687432,"fy16other":1771290,"fy17budget":105972482,"fy17salaries":96013588,"fy17other":2060382},
{"id":4,"name":"City Administrative Officer","description":"The City Administrative Officer is the chief financial advisor to the Mayor and the Council and reports directly to both.  This Office conducts studies and investigations, carries out research, and makes recommendations on a wide variety of City management matters. For more information see <a href='http://cao.lacity.org'>http://cao.lacity.org</a>.","category":"Budgetary department","fy08budget":13889066,"fy08salaries":11854524,"fy08other":1315639,"fy09budget":14561157,"fy09salaries":12932449,"fy09other":1336827,"fy10budget":13194895,"fy10salaries":11973457,"fy10other":903180,"fy11budget":11939615,"fy11salaries":10560383,"fy11other":699962,"fy12budget":14089791,"fy12salaries":11087799,"fy12other":1703969,"fy13budget":14800609,"fy13salaries":11547253,"fy13other":1403475,"fy14budget":16420192,"fy14salaries":12114500,"fy14other":1767718,"fy15budget":17424728,"fy15salaries":13157319,"fy15other":1125855,"fy16budget":19066725,"fy16salaries":13336930,"fy16other":3933893,"fy17budget":20948390,"fy17salaries":14013078,"fy17other":3756057},
{"id":5,"name":"City Attorney","description":"The City Attorney acts as legal advisor to the City, prosecutes all misdemeanor offenses occurring within the City of Los Angeles and defends the City in civil litigation. For more information see <a href='http://www.lacityattorney.org'>http://www.lacityattorney.org</a>.","category":"Budgetary department","fy08budget":113163181,"fy08salaries":97841017,"fy08other":14683498,"fy09budget":116132900,"fy09salaries":103374606,"fy09other":12545542,"fy10budget":109160287,"fy10salaries":97514888,"fy10other":10974551,"fy11budget":106926230,"fy11salaries":92899906,"fy11other":13969380,"fy12budget":103504744,"fy12salaries":90896957,"fy12other":11539114,"fy13budget":109238397,"fy13salaries":92654655,"fy13other":15998221,"fy14budget":118903930,"fy14salaries":102922446,"fy14other":14874896,"fy15budget":123428190,"fy15salaries":109342407,"fy15other":11105639,"fy16budget":125940268,"fy16salaries":112302291,"fy16other":11913665,"fy17budget":131047123,"fy17salaries":115658374,"fy17other":14619124},
{"id":6,"name":"City Clerk","description":"The City Clerk serves as Clerk of the Council and Superintendent of Elections and has primary responsibility for providing legislative and personnel support services to the Mayor and Council, managing the City records, and administering certain City programs. For more information see <a href='http://clerk.lacity.org'>http://clerk.lacity.org</a>.","category":"Budgetary department","fy08budget":16152118,"fy08salaries":10834582,"fy08other":4420490,"fy09budget":32024986,"fy09salaries":15308760,"fy09other":14006388,"fy10budget":13958368,"fy10salaries":10640307,"fy10other":1574922,"fy11budget":24237611,"fy11salaries":13811283,"fy11other":8622522,"fy12budget":13554356,"fy12salaries":9093116,"fy12other":2008513,"fy13budget":25164592,"fy13salaries":15354772,"fy13other":8145891,"fy14budget":10105576,"fy14salaries":8821277,"fy14other":626417,"fy15budget":26261888,"fy15salaries":13234903,"fy15other":7569159,"fy16budget":10154035,"fy16salaries":9093801,"fy16other":532230,"fy17budget":27116707,"fy17salaries":13098189,"fy17other":11603661},
{"id":7,"name":"City Planning","description":"The Department of City Planning's mission is to create and implement plans, policies, and programs that realize a vision of Los Angeles as a collection of healthy and sustainable neighborhoods, each with a distinct sense of place, based on a foundation of mobility, economic vitality, and improved quality of life for all residents. For more information see <a href='http://cityplanning.lacity.org'>http://cityplanning.lacity.org</a>.","category":"Budgetary department","fy08budget":30633901,"fy08salaries":23797204,"fy08other":5759750,"fy09budget":31916489,"fy09salaries":25140708,"fy09other":3714598,"fy10budget":26524229,"fy10salaries":21829197,"fy10other":3435866,"fy11budget":27424893,"fy11salaries":20624241,"fy11other":3265144,"fy12budget":25345021,"fy12salaries":19909195,"fy12other":2440994,"fy13budget":29938653,"fy13salaries":21545437,"fy13other":4435103,"fy14budget":32829847,"fy14salaries":22719362,"fy14other":6466167,"fy15budget":36620281,"fy15salaries":24433524,"fy15other":6050937,"fy16budget":42325984,"fy16salaries":26727511,"fy16other":7424845,"fy17budget":46165954,"fy17salaries":30604836,"fy17other":10704106},
{"id":8,"name":"Commission on Children, Youth & Families","description":"In 2010 the Commission on Children, Youth, and Families was subsumed into the Human Relations Commission.","category":"Budgetary department","fy08budget":1555634,"fy08salaries":1094469,"fy08other":320176,"fy09budget":1847221,"fy09salaries":1318456,"fy09other":228020,"fy10budget":0,"fy10salaries":0,"fy10other":0,"fy11budget":0,"fy11salaries":0,"fy11other":0,"fy12budget":0,"fy12salaries":0,"fy12other":0,"fy13budget":0,"fy13salaries":0,"fy13other":0,"fy14budget":0,"fy14salaries":0,"fy14other":0,"fy15budget":0,"fy15salaries":0,"fy15other":0,"fy16budget":0,"fy16salaries":0,"fy16other":0,"fy17budget":0,"fy17salaries":0,"fy17other":0},
{"id":9,"name":"Commission on Status of Women","description":"In 2010 the Commission on the Status of Women was subsumed into the Human Relations Commission. It was later re-introduced by Mayor Eric Garcetti under the Housing and Community Investment Department. For more information see <a href='http://hcidla.lacity.org/commission-status-women'>http://hcidla.lacity.org/commission-status-women</a>.","category":"Budgetary department","fy08budget":806115,"fy08salaries":777665,"fy08other":23159,"fy09budget":237974,"fy09salaries":187420,"fy09other":28800,"fy10budget":0,"fy10salaries":0,"fy10other":0,"fy11budget":0,"fy11salaries":0,"fy11other":0,"fy12budget":0,"fy12salaries":0,"fy12other":0,"fy13budget":0,"fy13salaries":0,"fy13other":0,"fy14budget":0,"fy14salaries":0,"fy14other":0,"fy15budget":0,"fy15salaries":0,"fy15other":0,"fy16budget":0,"fy16salaries":0,"fy16other":0,"fy17budget":0,"fy17salaries":0,"fy17other":0},
{"id":10,"name":"Controller","description":"The City Controller, an independently elected Citywide official, is the taxpayers' watchdog and the City's chief auditor and accountant. For more information see <a href='http://www.lacontroller.org'>http://www.lacontroller.org</a>.","category":"Budgetary department","fy08budget":20470674,"fy08salaries":15040276,"fy08other":3580024,"fy09budget":18671804,"fy09salaries":16005204,"fy09other":2086598,"fy10budget":17155758,"fy10salaries":14613135,"fy10other":1487345,"fy11budget":16692642,"fy11salaries":14603397,"fy11other":1066685,"fy12budget":16825231,"fy12salaries":14359492,"fy12other":1714397,"fy13budget":17167916,"fy13salaries":14283327,"fy13other":1671436,"fy14budget":17449389,"fy14salaries":14497795,"fy14other":1164187,"fy15budget":18495815,"fy15salaries":15290194,"fy15other":2000404,"fy16budget":18218260,"fy16salaries":15221605,"fy16other":1949624,"fy17budget":18072215,"fy17salaries":15648094,"fy17other":1550600},
{"id":11,"name":"Convention & Tourism Development","description":"The Department of Convention and Tourism Development is responsible for strategic planning for tourism and managing the contracts with the operator of the facility and the City's Convention and Visitors Bureau for the purpose of increasing the competitiveness of Los Angeles as a convention and tourist destination. For more information see <a href='http://ctd.lacity.org'>http://ctd.lacity.org</a>.","category":"Budgetary department","fy08budget":25677288,"fy08salaries":16211465,"fy08other":8751051,"fy09budget":26584831,"fy09salaries":16295637,"fy09other":7925089,"fy10budget":23378431,"fy10salaries":13412179,"fy10other":7325785,"fy11budget":22919884,"fy11salaries":14383694,"fy11other":7862330,"fy12budget":24824733,"fy12salaries":14923623,"fy12other":8814297,"fy13budget":22905142,"fy13salaries":14323500,"fy13other":7940592,"fy14budget":21837111,"fy14salaries":7025428,"fy14other":5534343,"fy15budget":1641823,"fy15salaries":1268153,"fy15other":120906,"fy16budget":1588937,"fy16salaries":1283465,"fy16other":201392,"fy17budget":1577644,"fy17salaries":1320529,"fy17other":166691},
{"id":12,"name":"Council","description":"The Council is the governing body of the City, except as otherwise provided in the Charter, and enacts ordinances subject to the approval or veto of the Mayor. For more information see <a href='https://www.lacity.org/city-government/city-council'>https://www.lacity.org/city-government/city-council</a>.","category":"Budgetary department","fy08budget":33915578,"fy08salaries":24783611,"fy08other":2639419,"fy09budget":37005109,"fy09salaries":27278350,"fy09other":2089088,"fy10budget":35246357,"fy10salaries":24365821,"fy10other":2262513,"fy11budget":35039305,"fy11salaries":23870134,"fy11other":1771344,"fy12budget":36869378,"fy12salaries":24524333,"fy12other":2453542,"fy13budget":35759965,"fy13salaries":25903933,"fy13other":2235519,"fy14budget":36527239,"fy14salaries":25648890,"fy14other":2283580,"fy15budget":38929668,"fy15salaries":26773946,"fy15other":3230429,"fy16budget":40123622,"fy16salaries":27685181,"fy16other":3254104,"fy17budget":41244553,"fy17salaries":28744656,"fy17other":3544385},
{"id":13,"name":"Cultural Affairs","description":"The mission of the Department of Cultural Affairs is to strengthen the quality of life in the City of Los Angeles by stimulating and supporting cultural activities and ensuring access to such activities for residents and visitors to the City. For more information see <a href='http://culturela.org'>http://culturela.org</a>.","category":"Budgetary department","fy08budget":10229021,"fy08salaries":5311091,"fy08other":4501266,"fy09budget":10422494,"fy09salaries":5370181,"fy09other":4521975,"fy10budget":9411541,"fy10salaries":4870874,"fy10other":4182235,"fy11budget":8883338,"fy11salaries":4232520,"fy11other":4396670,"fy12budget":8141493,"fy12salaries":4231956,"fy12other":3186149,"fy13budget":9040592,"fy13salaries":4212322,"fy13other":4406919,"fy14budget":9328945,"fy14salaries":4420526,"fy14other":4021841,"fy15budget":10427420,"fy15salaries":4715221,"fy15other":4540809,"fy16budget":11642601,"fy16salaries":5141849,"fy16other":5244116,"fy17budget":13441441,"fy17salaries":5931298,"fy17other":5453773},
{"id":14,"name":"Disability","description":"This Department oversees the City's compliance with federal and state disability law. It also plans, administers, and implements activities relevant to the accessibility of all City programs and facilities. For more information see <a href='http://disability.lacity.org'>http://disability.lacity.org</a>.","category":"Budgetary department","fy08budget":1895871,"fy08salaries":1424149,"fy08other":448121,"fy09budget":1865747,"fy09salaries":1459136,"fy09other":391822,"fy10budget":1657305,"fy10salaries":1270066,"fy10other":386953,"fy11budget":1602263,"fy11salaries":1211602,"fy11other":385129,"fy12budget":1479665,"fy12salaries":1037585,"fy12other":348205,"fy13budget":2023116,"fy13salaries":1141470,"fy13other":444933,"fy14budget":1897662,"fy14salaries":1410297,"fy14other":401112,"fy15budget":1954731,"fy15salaries":1382198,"fy15other":410274,"fy16budget":2721322,"fy16salaries":1450998,"fy16other":1250073,"fy17budget":3141521,"fy17salaries":1521167,"fy17other":1464400},
{"id":15,"name":"Economic and Workforce Development","description":"The Economic and Workforce Development Department initiates and promotes economic development projects to build local businesses and provide residents with tools for quality employment. The Department promotes economic and workforce development in the City through the implementation of various federal and other grant funded programs. For more information see <a href='http://ewddlacity.com'>http://ewddlacity.com</a>.","category":"Budgetary department","fy08budget":33915652,"fy08salaries":22877432,"fy08other":4827199,"fy09budget":30531199,"fy09salaries":22224573,"fy09other":4380105,"fy10budget":32005653,"fy10salaries":20933449,"fy10other":4601553,"fy11budget":35476446,"fy11salaries":28842217,"fy11other":791306,"fy12budget":30878922,"fy12salaries":23775800,"fy12other":4942331,"fy13budget":28114949,"fy13salaries":22460802,"fy13other":3744861,"fy14budget":19819713,"fy14salaries":14127937,"fy14other":3266318,"fy15budget":19989688,"fy15salaries":13136490,"fy15other":2979685,"fy16budget":20680091,"fy16salaries":12763061,"fy16other":3091022,"fy17budget":20185170,"fy17salaries":12632239,"fy17other":3553269},
{"id":16,"name":"El Pueblo de Los Angeles","description":"This Department operates and maintains the El Pueblo de Los Angeles Historical Monument including special events and festivals, cultural exhibits and tours, the park and historic buildings, and parking and business operations. For more information see <a href='http://elpueblo.lacity.org'>http://elpueblo.lacity.org</a>.","category":"Budgetary department","fy08budget":2104220,"fy08salaries":1571550,"fy08other":403293,"fy09budget":2116573,"fy09salaries":1470639,"fy09other":452716,"fy10budget":2011597,"fy10salaries":1396304,"fy10other":379120,"fy11budget":1638731,"fy11salaries":1220369,"fy11other":396515,"fy12budget":1643555,"fy12salaries":1169198,"fy12other":384267,"fy13budget":1633260,"fy13salaries":1197799,"fy13other":413333,"fy14budget":1777818,"fy14salaries":1173292,"fy14other":472829,"fy15budget":1737244,"fy15salaries":1174497,"fy15other":393333,"fy16budget":1758680,"fy16salaries":1240212,"fy16other":404272,"fy17budget":1770220,"fy17salaries":1322802,"fy17other":404130},
{"id":17,"name":"Emergency Management","description":"The Emergency Management Department works with City departments, municipalities and an array of community-based organizations to ensure that the City and its residents have the resources and information they need to prepare, respond and recover from emergencies, disasters and significant events. For more information see <a href='http://emergency.lacity.org'>http://emergency.lacity.org</a>.","category":"Budgetary department","fy08budget":2361032,"fy08salaries":2160472,"fy08other":156321,"fy09budget":2707412,"fy09salaries":2477658,"fy09other":65382,"fy10budget":2688982,"fy10salaries":2271501,"fy10other":74829,"fy11budget":2497063,"fy11salaries":2362643,"fy11other":56449,"fy12budget":2891456,"fy12salaries":2403141,"fy12other":66188,"fy13budget":2872395,"fy13salaries":2551907,"fy13other":67304,"fy14budget":3361908,"fy14salaries":2515227,"fy14other":64222,"fy15budget":3173119,"fy15salaries":2649473,"fy15other":71021,"fy16budget":3318626,"fy16salaries":2957917,"fy16other":69926,"fy17budget":3314164,"fy17salaries":2982297,"fy17other":67718},
{"id":18,"name":"Employee Relations Board","description":"The Employee Relations Board determines representation units for City employees, arranges for elections in such units, determines the validity of charges of unfair practices by management or employee organizations, and maintains lists of impartial third parties for use in the resolution of impasses. For more information see <a href='http://erb.lacity.org'>http://erb.lacity.org</a>.","category":"Budgetary department","fy08budget":372987,"fy08salaries":225279,"fy08other":121436,"fy09budget":432244,"fy09salaries":243532,"fy09other":156073,"fy10budget":349729,"fy10salaries":273174,"fy10other":65209,"fy11budget":372953,"fy11salaries":294133,"fy11other":75860,"fy12budget":383143,"fy12salaries":277955,"fy12other":28317,"fy13budget":400284,"fy13salaries":244388,"fy13other":84775,"fy14budget":411943,"fy14salaries":251254,"fy14other":87333,"fy15budget":402007,"fy15salaries":289287,"fy15other":46613,"fy16budget":416747,"fy16salaries":278859,"fy16other":70378,"fy17budget":420264,"fy17salaries":284245,"fy17other":54433},
{"id":19,"name":"Environmental Affairs","description":"In 2011 the Environmental Affairs Department was eliminated. Its key functions were absorbed by different City agencies, including the Bureau of Sanitation, the Department of Transportation, The Department of Building and Safety, and the Mayor's Office.","category":"Budgetary department","fy08budget":3239248,"fy08salaries":2995865,"fy08other":111898,"fy09budget":3096876,"fy09salaries":2942840,"fy09other":49954,"fy10budget":3130919,"fy10salaries":2413599,"fy10other":95158,"fy11budget":0,"fy11salaries":0,"fy11other":0,"fy12budget":0,"fy12salaries":0,"fy12other":0,"fy13budget":0,"fy13salaries":0,"fy13other":0,"fy14budget":0,"fy14salaries":0,"fy14other":0,"fy15budget":0,"fy15salaries":0,"fy15other":0,"fy16budget":0,"fy16salaries":0,"fy16other":0,"fy17budget":0,"fy17salaries":0,"fy17other":0},
{"id":20,"name":"Ethics Commission","description":"The Ethics Commission helps to preserve the public trust by promoting elections and government decisions that are fair, transparent, and accountable.  The Commission acts through its voter mandate to shape, administer, and enforce laws regarding governmental ethics, conflicts of interests, campaign financing, and lobbying. For more information see <a href='http://ethics.lacity.org'>http://ethics.lacity.org</a>.","category":"Budgetary department","fy08budget":2600065,"fy08salaries":2222842,"fy08other":101152,"fy09budget":2457368,"fy09salaries":2329940,"fy09other":94222,"fy10budget":2248272,"fy10salaries":2048563,"fy10other":57854,"fy11budget":2111330,"fy11salaries":1898392,"fy11other":128607,"fy12budget":2086038,"fy12salaries":1690107,"fy12other":133783,"fy13budget":2269501,"fy13salaries":1967136,"fy13other":71039,"fy14budget":2488982,"fy14salaries":2141840,"fy14other":156014,"fy15budget":2805356,"fy15salaries":2270115,"fy15other":139837,"fy16budget":2932856,"fy16salaries":2457636,"fy16other":379122,"fy17budget":2956339,"fy17salaries":2500710,"fy17other":285078},
{"id":21,"name":"Finance","description":"The Office of Finance is responsible for the collection of over $2.5 billion in revenue from various sources including taxes, licenses, fees, and permits which pay for numerous essential municipal services to City residents and businesses.  For more information see <a href='https://www.finance.lacity.org'>https://www.finance.lacity.org</a>.","category":"Budgetary department","fy08budget":26938577,"fy08salaries":23857530,"fy08other":2863992,"fy09budget":28310252,"fy09salaries":25640523,"fy09other":1963298,"fy10budget":25749260,"fy10salaries":23692474,"fy10other":1609549,"fy11budget":25636955,"fy11salaries":23461851,"fy11other":1806817,"fy12budget":42467467,"fy12salaries":26004277,"fy12other":16054652,"fy13budget":36225462,"fy13salaries":26690883,"fy13other":9021884,"fy14budget":38156204,"fy14salaries":27410313,"fy14other":9682983,"fy15budget":39025010,"fy15salaries":27171034,"fy15other":10319738,"fy16budget":38728705,"fy16salaries":27475502,"fy16other":9359499,"fy17budget":38943221,"fy17salaries":28593135,"fy17other":9167090},
{"id":22,"name":"Fire","description":"This Department provides rescue and emergency medical services; controls and extinguishes dangerous fires; protects life and property from fire risks by inspecting buildings for fire hazards and enforcing fire prevention laws; carries on a fire prevention educational program; and investigates suspected cases of arson. For more information see <a href='http://www.lafd.org'>http://www.lafd.org</a>.","category":"Budgetary department","fy08budget":551259085,"fy08salaries":522121741,"fy08other":24849176,"fy09budget":569742591,"fy09salaries":539227279,"fy09other":23671585,"fy10budget":509132730,"fy10salaries":481003630,"fy10other":22918785,"fy11budget":506231950,"fy11salaries":477956680,"fy11other":21089158,"fy12budget":506842888,"fy12salaries":480712635,"fy12other":22149542,"fy13budget":526674517,"fy13salaries":499678254,"fy13other":23506836,"fy14budget":566120158,"fy14salaries":529468580,"fy14other":30317170,"fy15budget":601652050,"fy15salaries":554847543,"fy15other":36939592,"fy16budget":636048506,"fy16salaries":579193477,"fy16other":40513417,"fy17budget":660530087,"fy17salaries":596378877,"fy17other":53899905},
{"id":23,"name":"General Services","description":"This Department provides internal support for City programs. Services include the following: fleet, building services, procurement and stores inventory, fuel, construction and alterations, custodial, real estate, mail and messenger, parking, emergency management and special event coordination, materials testing, and printing services. For more information see <a href='http://gsd.lacity.org'>http://gsd.lacity.org</a>.","category":"Budgetary department","fy08budget":361303752,"fy08salaries":164240828,"fy08other":157222183,"fy09budget":377202160,"fy09salaries":173902309,"fy09other":163921437,"fy10budget":326406982,"fy10salaries":153959321,"fy10other":140709969,"fy11budget":291577234,"fy11salaries":133900685,"fy11other":130465205,"fy12budget":314555920,"fy12salaries":134821603,"fy12other":144512557,"fy13budget":296527984,"fy13salaries":122728178,"fy13other":141071957,"fy14budget":285127827,"fy14salaries":119607968,"fy14other":141059303,"fy15budget":300893321,"fy15salaries":119941314,"fy15other":147665472,"fy16budget":341613570,"fy16salaries":124750119,"fy16other":188458509,"fy17budget":302140698,"fy17salaries":123330983,"fy17other":145803776},
{"id":24,"name":"Housing and Community Investment","description":"The Housing and Community Investment Department develops Citywide housing policy and supports viable urban communities by advocating for safe and livable neighborhoods. For more information see <a href='http://hcidla.lacity.org'>http://hcidla.lacity.org</a>.","category":"Budgetary department","fy08budget":46619235,"fy08salaries":37573698,"fy08other":8120708,"fy09budget":48968839,"fy09salaries":39619679,"fy09other":7789910,"fy10budget":52145608,"fy10salaries":38382384,"fy10other":7904484,"fy11budget":56925615,"fy11salaries":42869614,"fy11other":8157128,"fy12budget":55084872,"fy12salaries":44210838,"fy12other":6072973,"fy13budget":54073979,"fy13salaries":42385049,"fy13other":6191618,"fy14budget":64594297,"fy14salaries":50690064,"fy14other":7618948,"fy15budget":69547987,"fy15salaries":50430993,"fy15other":10721644,"fy16budget":71272702,"fy16salaries":51776879,"fy16other":12719366,"fy17budget":73739769,"fy17salaries":51016582,"fy17other":14982711},
{"id":25,"name":"Human Relations Commission","description":"In 2011 the Human Relations Commission was eliminated. It was absorbed into the Community Development Department, which itself was later eliminated and absorbed into various other City departments.","category":"Budgetary department","fy08budget":1345914,"fy08salaries":1244441,"fy08other":65070,"fy09budget":880236,"fy09salaries":835459,"fy09other":18057,"fy10budget":1608822,"fy10salaries":1271750,"fy10other":112281,"fy11budget":0,"fy11salaries":0,"fy11other":0,"fy12budget":0,"fy12salaries":0,"fy12other":0,"fy13budget":0,"fy13salaries":0,"fy13other":0,"fy14budget":0,"fy14salaries":0,"fy14other":0,"fy15budget":0,"fy15salaries":0,"fy15other":0,"fy16budget":0,"fy16salaries":0,"fy16other":0,"fy17budget":0,"fy17salaries":0,"fy17other":0},
{"id":26,"name":"Information Technology Agency","description":"The Information Technology Agency has the primary responsibility for planning, designing, implementing, operating and coordinating the City's enterprise information technology systems, and data, voice, and radio networks; providing all cable franchise regulatory and related services; and the delivery of 311 related services Citywide. For more information see <a href='http://ita.lacity.org'>http://ita.lacity.org</a>.","category":"Budgetary department","fy08budget":116463809,"fy08salaries":67470054,"fy08other":45910038,"fy09budget":114281046,"fy09salaries":68625555,"fy09other":40288500,"fy10budget":102602347,"fy10salaries":58990948,"fy10other":41319569,"fy11budget":88964288,"fy11salaries":51702034,"fy11other":36106847,"fy12budget":90582389,"fy12salaries":49694302,"fy12other":39885735,"fy13budget":88858913,"fy13salaries":48397456,"fy13other":38466652,"fy14budget":89026180,"fy14salaries":49376142,"fy14other":37310223,"fy15budget":96477763,"fy15salaries":49730517,"fy15other":44102511,"fy16budget":100046006,"fy16salaries":51228031,"fy16other":45804142,"fy17budget":93289195,"fy17salaries":47332652,"fy17other":42356632},
{"id":27,"name":"Mayor","description":"The Mayor is the executive officer of the City and exercises supervision over all of its affairs. The Mayor submits proposals and recommendations to the Council, approves or vetoes ordinances passed by the Council, and is active in the enforcement of the ordinances of the City. For more information see <a href='https://www.lamayor.org'>https://www.lamayor.org</a>.","category":"Budgetary department","fy08budget":17564594,"fy08salaries":11993180,"fy08other":1043322,"fy09budget":36615844,"fy09salaries":13417276,"fy09other":16238867,"fy10budget":35635309,"fy10salaries":14258906,"fy10other":19508195,"fy11budget":34443015,"fy11salaries":12948073,"fy11other":19558439,"fy12budget":36789864,"fy12salaries":13817892,"fy12other":20710412,"fy13budget":37844452,"fy13salaries":13868418,"fy13other":22399355,"fy14budget":36543827,"fy14salaries":11638465,"fy14other":22558048,"fy15budget":41524499,"fy15salaries":12804126,"fy15other":23324653,"fy16budget":47928962,"fy16salaries":14342978,"fy16other":28697160,"fy17budget":48624336,"fy17salaries":15757474,"fy17other":28726631},
{"id":28,"name":"Neighborhood Empowerment","description":"The Department of Neighborhood Empowerment has the mission of promoting citizen participation in government and making government more responsive to local needs by developing a citywide system of neighborhood councils. For more information see <a href='http://empowerla.org'>http://empowerla.org</a>.","category":"Budgetary department","fy08budget":3812248,"fy08salaries":3177836,"fy08other":587625,"fy09budget":3747941,"fy09salaries":3316534,"fy09other":309789,"fy10budget":2664542,"fy10salaries":2518838,"fy10other":81484,"fy11budget":1630855,"fy11salaries":1495462,"fy11other":114014,"fy12budget":1923381,"fy12salaries":1485150,"fy12other":198352,"fy13budget":2404128,"fy13salaries":1758944,"fy13other":527425,"fy14budget":2622032,"fy14salaries":1935685,"fy14other":207802,"fy15budget":2317441,"fy15salaries":1950336,"fy15other":264264,"fy16budget":3123977,"fy16salaries":2275917,"fy16other":606241,"fy17budget":2467861,"fy17salaries":1837053,"fy17other":547300},
{"id":29,"name":"Personnel","description":"This Department classifies all civil service positions and assigns appropriate titles. It recruits employees, holds competitive examinations, and establishes eligible lists for employment. It establishes rules and regulations governing the appointment, promotion, transfer, and removal of City employees. The Department also provides centralized human resources support for 23 City departments. For more information see <a href='http://personnel.lacity.org'>http://personnel.lacity.org</a>.","category":"Budgetary department","fy08budget":63980947,"fy08salaries":38149012,"fy08other":25143766,"fy09budget":65219319,"fy09salaries":38616208,"fy09other":26081878,"fy10budget":60816611,"fy10salaries":33463041,"fy10other":24332744,"fy11budget":42234488,"fy11salaries":31104396,"fy11other":7467120,"fy12budget":42687033,"fy12salaries":31939647,"fy12other":7659884,"fy13budget":49878145,"fy13salaries":39643570,"fy13other":6690824,"fy14budget":53961878,"fy14salaries":43172660,"fy14other":7786752,"fy15budget":55802414,"fy15salaries":45160971,"fy15other":8057846,"fy16budget":58695556,"fy16salaries":47351896,"fy16other":8996005,"fy17budget":60147529,"fy17salaries":48346027,"fy17other":9449028},
{"id":30,"name":"Police","description":"This Department has the duty and power to enforce the penal divisions of the City Charter, the ordinances of the City, and state and federal laws for the purpose of protecting persons and property and for the preservation of the peace of the community. For more information see <a href='http://www.lapdonline.org'>http://www.lapdonline.org</a>.","category":"Budgetary department","fy08budget":1269831766,"fy08salaries":1197715667,"fy08other":63632479,"fy09budget":1333820327,"fy09salaries":1258099062,"fy09other":63901998,"fy10budget":1253606212,"fy10salaries":1189450532,"fy10other":48218296,"fy11budget":1208715123,"fy11salaries":1155859708,"fy11other":44913242,"fy12budget":1243643139,"fy12salaries":1187657421,"fy12other":46739868,"fy13budget":1264524341,"fy13salaries":1200084475,"fy13other":49528778,"fy14budget":1345839854,"fy14salaries":1255251116,"fy14other":73397571,"fy15budget":1430732899,"fy15salaries":1345458221,"fy15other":72048287,"fy16budget":1459300631,"fy16salaries":1362616683,"fy16other":82367251,"fy17budget":1526004243,"fy17salaries":1420080619,"fy17other":94290340},
{"id":31,"name":"Board of Public Works","description":"The Board of Public Works manages the Department of Public Works and is responsible for operation of the Public Works bureaus (Contract Administration, Engineering, Sanitation, Street Lighting, and Street Services). For more information see <a href='http://dpw.lacity.org/commissioners-boardroom'>http://dpw.lacity.org/commissioners-boardroom</a>.","category":"Budgetary department","fy08budget":26717495,"fy08salaries":11922363,"fy08other":14378234,"fy09budget":23541759,"fy09salaries":10065313,"fy09other":13142307,"fy10budget":21905229,"fy10salaries":8605522,"fy10other":12219098,"fy11budget":21335387,"fy11salaries":7741127,"fy11other":12977636,"fy12budget":20275831,"fy12salaries":7831017,"fy12other":11950353,"fy13budget":16945646,"fy13salaries":6486817,"fy13other":9769099,"fy14budget":19055688,"fy14salaries":6815259,"fy14other":11496464,"fy15budget":19491548,"fy15salaries":7632862,"fy15other":10983283,"fy16budget":22459175,"fy16salaries":7700982,"fy16other":14182542,"fy17budget":22918206,"fy17salaries":8536513,"fy17other":13765592},
{"id":32,"name":"Bureau of Contract Administration","description":"This Bureau is responsible for administering contracts and permits for construction of public works such as buildings, streets, bridges, sewers, storm drains, and related improvements. For more information see <a href='http://bca.lacity.org'>http://bca.lacity.org</a>.","category":"Budgetary department","fy08budget":37309623,"fy08salaries":29911386,"fy08other":1785578,"fy09budget":38274809,"fy09salaries":31437282,"fy09other":1842110,"fy10budget":33615887,"fy10salaries":27564469,"fy10other":1574634,"fy11budget":34415711,"fy11salaries":26440350,"fy11other":1486570,"fy12budget":32150994,"fy12salaries":26472126,"fy12other":1652553,"fy13budget":31730452,"fy13salaries":25992284,"fy13other":1531008,"fy14budget":32671618,"fy14salaries":27523311,"fy14other":1872024,"fy15budget":32076587,"fy15salaries":27622958,"fy15other":1512848,"fy16budget":32765926,"fy16salaries":27877675,"fy16other":1887557,"fy17budget":35679056,"fy17salaries":29555021,"fy17other":2383434},
{"id":33,"name":"Bureau of Engineering","description":"The Bureau of Engineering is the City's lead agency for the planning, design and construction management of public buildings, infrastructure and open space projects. For more information see <a href='http://eng.lacity.org'>http://eng.lacity.org</a>.","category":"Budgetary department","fy08budget":96681391,"fy08salaries":83693148,"fy08other":2560355,"fy09budget":94912281,"fy09salaries":82907604,"fy09other":2350080,"fy10budget":82149082,"fy10salaries":70440592,"fy10other":1985254,"fy11budget":76959174,"fy11salaries":68007260,"fy11other":1786093,"fy12budget":76866092,"fy12salaries":68597667,"fy12other":1684247,"fy13budget":79945621,"fy13salaries":66211534,"fy13other":2389666,"fy14budget":81186691,"fy14salaries":68949798,"fy14other":1723505,"fy15budget":81913937,"fy15salaries":72378803,"fy15other":2495262,"fy16budget":85791506,"fy16salaries":75935789,"fy16other":2886859,"fy17budget":93217914,"fy17salaries":83545253,"fy17other":2728506},
{"id":34,"name":"Bureau of Sanitation","description":"The primary responsibility of the Bureau of Sanitation is to collect, clean, and recycle solid and liquid waste generated by residential, commercial and industrial users in the City of Los Angeles and surrounding communities. For more information see <a href='https://www.lacitysan.org'>https://www.lacitysan.org</a>.","category":"Budgetary department","fy08budget":255906556,"fy08salaries":185540380,"fy08other":64119705,"fy09budget":264711710,"fy09salaries":192555693,"fy09other":63221467,"fy10budget":263395585,"fy10salaries":180763852,"fy10other":61899423,"fy11budget":215284572,"fy11salaries":193850165,"fy11other":7018126,"fy12budget":221397272,"fy12salaries":193601400,"fy12other":5729128,"fy13budget":222844618,"fy13salaries":193701946,"fy13other":6066203,"fy14budget":224327619,"fy14salaries":204547581,"fy14other":7420752,"fy15budget":231233172,"fy15salaries":212532729,"fy15other":6534354,"fy16budget":249824805,"fy16salaries":224013318,"fy16other":7707904,"fy17budget":263722834,"fy17salaries":235214760,"fy17other":12764623},
{"id":35,"name":"Bureau of Street Lighting","description":"The Bureau of Street Lighting is responsible for the design, construction, operation, maintenance and repair of the street lighting system within the City of Los Angeles. For more information see <a href='http://bsl.lacity.org'>http://bsl.lacity.org</a>.","category":"Budgetary department","fy08budget":27660793,"fy08salaries":17085138,"fy08other":6048690,"fy09budget":27782734,"fy09salaries":17191971,"fy09other":5353507,"fy10budget":24780568,"fy10salaries":16180487,"fy10other":4724620,"fy11budget":26038375,"fy11salaries":17829430,"fy11other":4649093,"fy12budget":30217358,"fy12salaries":18857609,"fy12other":6047193,"fy13budget":27257051,"fy13salaries":19280570,"fy13other":4941344,"fy14budget":28811359,"fy14salaries":20261619,"fy14other":5462817,"fy15budget":31879340,"fy15salaries":20600497,"fy15other":4993144,"fy16budget":36043256,"fy16salaries":23827238,"fy16other":6694508,"fy17budget":37455667,"fy17salaries":26092354,"fy17other":5976705},
{"id":36,"name":"Bureau of Street Services","description":"The Bureau's objective is to enhance public safety, mobility, health, and neighborhood quality of life by revitalizing the streetscape. Its three outcome goals are to improve the quality of the road surface; maintain a safe, clean and green public right-of-way; and build streetscape improvements. For more information see <a href='http://bss.lacity.org'>http://bss.lacity.org</a>.","category":"Budgetary department","fy08budget":177581649,"fy08salaries":95544297,"fy08other":78928062,"fy09budget":200364509,"fy09salaries":93935821,"fy09other":92261400,"fy10budget":179334781,"fy10salaries":79886682,"fy10other":74140815,"fy11budget":167983071,"fy11salaries":72789667,"fy11other":75690614,"fy12budget":181735594,"fy12salaries":76484387,"fy12other":90643975,"fy13budget":181710379,"fy13salaries":75388508,"fy13other":87869322,"fy14budget":190921056,"fy14salaries":75839372,"fy14other":94315301,"fy15budget":189786826,"fy15salaries":76617039,"fy15other":88325304,"fy16budget":187814618,"fy16salaries":76868992,"fy16other":85192061,"fy17budget":189825013,"fy17salaries":85836584,"fy17other":87756620},
{"id":37,"name":"Transportation","description":"This Department leads transportation planning, design, construction, maintenance and operations in the City. It collaborates with other agencies to provide safe, accessible transportation services and infrastructure in the city and region. For more information see <a href='http://ladot.lacity.org'>http://ladot.lacity.org</a>.","category":"Budgetary department","fy08budget":153952735,"fy08salaries":115304806,"fy08other":28258824,"fy09budget":177928667,"fy09salaries":122005823,"fy09other":27806807,"fy10budget":142355614,"fy10salaries":108908306,"fy10other":21232981,"fy11budget":140442457,"fy11salaries":110058929,"fy11other":16377984,"fy12budget":140048046,"fy12salaries":115377819,"fy12other":18713695,"fy13budget":139659298,"fy13salaries":115505458,"fy13other":21100862,"fy14budget":140131879,"fy14salaries":119765562,"fy14other":17239418,"fy15budget":148078350,"fy15salaries":120141217,"fy15other":18426501,"fy16budget":155401986,"fy16salaries":122245874,"fy16other":19050979,"fy17budget":162856291,"fy17salaries":129728012,"fy17other":22299764},
{"id":38,"name":"Treasurer","description":"The Office of the Treasurer served as the banker, investor, and custodian of public funds for the City of Los Angeles. Effective July 2011, the Office of the City Treasurer was consolidated into the Office of Finance.","category":"Budgetary department","fy08budget":5052284,"fy08salaries":2725345,"fy08other":2219138,"fy09budget":7486724,"fy09salaries":3209499,"fy09other":4273245,"fy10budget":11398381,"fy10salaries":3043754,"fy10other":8238887,"fy11budget":14489815,"fy11salaries":2638157,"fy11other":11528545,"fy12budget":0,"fy12salaries":0,"fy12other":0,"fy13budget":0,"fy13salaries":0,"fy13other":0,"fy14budget":0,"fy14salaries":0,"fy14other":0,"fy15budget":0,"fy15salaries":0,"fy15other":0,"fy16budget":0,"fy16salaries":0,"fy16other":0,"fy17budget":0,"fy17salaries":0,"fy17other":0},
{"id":39,"name":"Zoo","description":"This Department is responsible for the operation and maintenance of the Los Angeles Zoo and Botanical Gardens including curatorial services, animal exhibit and health services, public information and education, facility maintenance, capital improvement administration, and business operations. For more information see <a href='http://www.lazoo.org/about/'>http://www.lazoo.org/about/</a>.","category":"Budgetary department","fy08budget":19215182,"fy08salaries":15027241,"fy08other":3595983,"fy09budget":19010892,"fy09salaries":14469123,"fy09other":3478891,"fy10budget":16261512,"fy10salaries":12855468,"fy10other":2806032,"fy11budget":17478911,"fy11salaries":13390936,"fy11other":2879682,"fy12budget":18242383,"fy12salaries":14206506,"fy12other":2820010,"fy13budget":17803619,"fy13salaries":14401141,"fy13other":3028617,"fy14budget":18249880,"fy14salaries":14921906,"fy14other":2570088,"fy15budget":19674621,"fy15salaries":15486207,"fy15other":2825166,"fy16budget":19874600,"fy16salaries":16103364,"fy16other":3124161,"fy17budget":20495935,"fy17salaries":16359416,"fy17other":2905723},
{"id":40,"name":"Library","description":"This Department operates and maintains: a Central Library which is organized into subject departments and specialized service units; eight regional branches providing reference and circulating service in their respective regions of the City; and 64 branches providing neighborhood service. For more information see <a href='http://www.lapl.org'>http://www.lapl.org</a>.","category":"Non-departmental","fy08budget":64325712,"fy08salaries":59532907,"fy08other":4792805,"fy09budget":69773143,"fy09salaries":60839843,"fy09other":8933300,"fy10budget":75463926,"fy10salaries":56750811,"fy10other":18713115,"fy11budget":75902051,"fy11salaries":53262367,"fy11other":22639684,"fy12budget":89247557,"fy12salaries":54959562,"fy12other":34287995,"fy13budget":102307213,"fy13salaries":55299715,"fy13other":47007498,"fy14budget":118966839,"fy14salaries":59283422,"fy14other":59683417,"fy15budget":139401339,"fy15salaries":61281144,"fy15other":78120195,"fy16budget":147623777,"fy16salaries":63969254,"fy16other":83654523,"fy17budget":157909299,"fy17salaries":65703246,"fy17other":92206053},
{"id":41,"name":"Recreation & Parks","description":"This Department operates and maintains parks, playgrounds, swimming pools, public golf courses, recreation centers, recreation camps and educational facilities, and structures of historic significance; and supervises all recreational activities at such facilities. For more information see <a href='http://www.laparks.org'>http://www.laparks.org</a>.","category":"Non-departmental","fy08budget":132227040,"fy08salaries":144421065,"fy08other":-12194025,"fy09budget":134225730,"fy09salaries":143477096,"fy09other":-9251366,"fy10budget":140267292,"fy10salaries":133763980,"fy10other":6503312,"fy11budget":142160953,"fy11salaries":122025395,"fy11other":20135558,"fy12budget":148615795,"fy12salaries":118584945,"fy12other":30030850,"fy13budget":144223983,"fy13salaries":119001842,"fy13other":25222141,"fy14budget":151900170,"fy14salaries":122308355,"fy14other":29591815,"fy15budget":159879509,"fy15salaries":124226496,"fy15other":35653013,"fy16budget":166347015,"fy16salaries":127420119,"fy16other":38926896,"fy17budget":178363168,"fy17salaries":128858492,"fy17other":49504676},
{"id":42,"name":"City Employees' Retirement System","description":"Charter Section 1160 requires the City to pay the cost of maintenance of the retirement fund, which provides retirement, disability, and death benefits for officers and employees of the City except members of the Fire and Police Pensions System and members of the Water and Power Employees' Retirement Plan. ","category":"Non-departmental","fy08budget":58541507,"fy08salaries":0,"fy08other":58541507,"fy09budget":57532368,"fy09salaries":0,"fy09other":57532368,"fy10budget":57554192,"fy10salaries":0,"fy10other":57554192,"fy11budget":72701328,"fy11salaries":0,"fy11other":72701328,"fy12budget":75978843,"fy12salaries":0,"fy12other":75978843,"fy13budget":74719463,"fy13salaries":0,"fy13other":74719463,"fy14budget":83759067,"fy14salaries":0,"fy14other":83759067,"fy15budget":94050116,"fy15salaries":0,"fy15other":94050116,"fy16budget":102940315,"fy16salaries":0,"fy16other":102940315,"fy17budget":107568091,"fy17salaries":0,"fy17other":107568091},
{"id":44,"name":"Tax and Revenue Anticipation Notes","description":"A sum is appropriated to this Fund for payment of the entire debt service on tax and revenue anticipation notes, a type of municipal bond that is issued to pay the annual contributions to both the Los Angeles City Employees' Retirement System and the Fire and Police Pension Fund.","category":"Non-departmental","fy08budget":699056371,"fy08salaries":0,"fy08other":699056371,"fy09budget":657950594,"fy09salaries":0,"fy09other":653365594,"fy10budget":665527709,"fy10salaries":0,"fy10other":657949403,"fy11budget":742088328,"fy11salaries":0,"fy11other":734432503,"fy12budget":798081315,"fy12salaries":0,"fy12other":798081315,"fy13budget":860620300,"fy13salaries":0,"fy13other":851355871,"fy14budget":955905263,"fy14salaries":0,"fy14other":946559147,"fy15budget":1038882250,"fy15salaries":0,"fy15other":1038882250,"fy16budget":1063266583,"fy16salaries":0,"fy16other":1063266583,"fy17budget":1085728613,"fy17salaries":0,"fy17other":1085728613},
{"id":45,"name":"Bond Redemption and Interest","description":"These are the amounts required for the payment of principal and interest on the General Obligation Bonds of the City.","category":"Non-departmental","fy08budget":171624632,"fy08salaries":0,"fy08other":171624632,"fy09budget":166637701,"fy09salaries":0,"fy09other":166637701,"fy10budget":167132553,"fy10salaries":0,"fy10other":167132553,"fy11budget":174545768,"fy11salaries":0,"fy11other":174318519,"fy12budget":182116089,"fy12salaries":0,"fy12other":175062961,"fy13budget":164475922,"fy13salaries":0,"fy13other":164475921,"fy14budget":160695452,"fy14salaries":0,"fy14other":160695452,"fy15budget":148889669,"fy15salaries":0,"fy15other":148889669,"fy16budget":137526469,"fy16salaries":0,"fy16other":137526469,"fy17budget":122494656,"fy17salaries":0,"fy17other":119638157},
{"id":46,"name":"Capital Finance and Administration","description":"An annual sum is appropriated to make lease and other payments, including trustee and arbitrage fees, required by various non-general obligation, long-term City financing programs that are used to acquire facilities and equipment items for use by City departments.","category":"Non-departmental","fy08budget":149987305,"fy08salaries":0,"fy08other":149986662,"fy09budget":170489678,"fy09salaries":0,"fy09other":170482421,"fy10budget":204170495,"fy10salaries":0,"fy10other":197611253,"fy11budget":223554561,"fy11salaries":0,"fy11other":213558498,"fy12budget":211376482,"fy12salaries":0,"fy12other":205562462,"fy13budget":215258251,"fy13salaries":0,"fy13other":211219473,"fy14budget":256706618,"fy14salaries":0,"fy14other":245219541,"fy15budget":242018806,"fy15salaries":0,"fy15other":231471056,"fy16budget":237163066,"fy16salaries":0,"fy16other":204605587,"fy17budget":221395879,"fy17salaries":0,"fy17other":211486829},
{"id":47,"name":"Capital Improvement Expenditure Program","description":"The City's Capital Improvement Expenditure Program (CIEP) provides for the purchase, renovation or upgrade of new and existing municipal facilities, or physical plant infrastructure. Multiple sources fund the CIEP depending on the type of project and the use of the facility. ","category":"Non-departmental","fy08budget":282518316,"fy08salaries":0,"fy08other":148239484,"fy09budget":294764648,"fy09salaries":0,"fy09other":216471400,"fy10budget":266753638,"fy10salaries":0,"fy10other":145404561,"fy11budget":162746855,"fy11salaries":0,"fy11other":95788097,"fy12budget":91871712,"fy12salaries":0,"fy12other":37299050,"fy13budget":166153119,"fy13salaries":0,"fy13other":95472195,"fy14budget":114687786,"fy14salaries":0,"fy14other":51931785,"fy15budget":229385931,"fy15salaries":0,"fy15other":168224331,"fy16budget":230594988,"fy16salaries":0,"fy16other":229441541,"fy17budget":208728751,"fy17salaries":0,"fy17other":207499721},
{"id":48,"name":"General City Purposes","description":"The General City Purposes fund provides funding for the costs of special services or purposes not readily chargeable to a specific department of the City, including items related to the Promotion of the Image of the City, Governmental Services, and Intergovernmental Relations. ","category":"Non-departmental","fy08budget":70050563,"fy08salaries":0,"fy08other":62165421,"fy09budget":80666965,"fy09salaries":0,"fy09other":77340723,"fy10budget":86300286,"fy10salaries":0,"fy10other":78171790,"fy11budget":77458835,"fy11salaries":0,"fy11other":70745456,"fy12budget":57407023,"fy12salaries":0,"fy12other":52640862,"fy13budget":61731188,"fy13salaries":0,"fy13other":56107704,"fy14budget":65614928,"fy14salaries":0,"fy14other":59143025,"fy15budget":76697273,"fy15salaries":0,"fy15other":70080251,"fy16budget":73199057,"fy16salaries":0,"fy16other":65460597,"fy17budget":81405120,"fy17salaries":0,"fy17other":70229724},
{"id":49,"name":"Human Resources Benefits","description":"An annual sum is appropriated to each line item in this Fund for the following purposes: (1) payment of all workers' compensation and rehabilitation bills, claims, and awards; (2) payment of subsidies for the City's benefits program; and (3) payment of unemployment insurance claims.","category":"Non-departmental","fy08budget":468037000,"fy08salaries":0,"fy08other":467961740,"fy09budget":471236000,"fy09salaries":0,"fy09other":469188738,"fy10budget":503780559,"fy10salaries":0,"fy10other":499690559,"fy11budget":541886165,"fy11salaries":0,"fy11other":541426777,"fy12budget":549786127,"fy12salaries":0,"fy12other":546134290,"fy13budget":580535553,"fy13salaries":0,"fy13other":575300819,"fy14budget":592640770,"fy14salaries":0,"fy14other":584204291,"fy15budget":601516383,"fy15salaries":0,"fy15other":579370861,"fy16budget":618916838,"fy16salaries":0,"fy16other":615950631,"fy17budget":650645100,"fy17salaries":0,"fy17other":648486758},
{"id":51,"name":"Liability Claims","description":"An annual sum is appropriated to this Fund for the payment or settlement of any monetary claims or legal action brought by or against the City of Los Angeles, or any officer or employee for which the City may be ultimately liable. ","category":"Non-departmental","fy08budget":37070000,"fy08salaries":0,"fy08other":36637818,"fy09budget":36838996,"fy09salaries":0,"fy09other":36750720,"fy10budget":77483334,"fy10salaries":0,"fy10other":77473945,"fy11budget":48722395,"fy11salaries":0,"fy11other":46792826,"fy12budget":49175000,"fy12salaries":0,"fy12other":49057456,"fy13budget":56943613,"fy13salaries":0,"fy13other":56941648,"fy14budget":55920000,"fy14salaries":0,"fy14other":55561632,"fy15budget":66005000,"fy15salaries":0,"fy15other":65846393,"fy16budget":110110000,"fy16salaries":0,"fy16other":110013225,"fy17budget":204829807,"fy17salaries":0,"fy17other":200768055},
{"id":52,"name":"Proposition A Local Transit Assistance Trust","description":"The Proposition A Local Transit Assistance Fund provides for the utilization of one-half cent sales tax revenues for the planning, administration, and operation of Citywide public transportation programs.","category":"Non-departmental","fy08budget":148712827,"fy08salaries":0,"fy08other":85606262,"fy09budget":155214606,"fy09salaries":0,"fy09other":96699308,"fy10budget":172929564,"fy10salaries":0,"fy10other":99486471,"fy11budget":115340805,"fy11salaries":0,"fy11other":77489072,"fy12budget":139593010,"fy12salaries":0,"fy12other":72557018,"fy13budget":185742316,"fy13salaries":0,"fy13other":67416895,"fy14budget":178566634,"fy14salaries":0,"fy14other":81715818,"fy15budget":283828119,"fy15salaries":0,"fy15other":91157696,"fy16budget":312744512,"fy16salaries":0,"fy16other":110850322,"fy17budget":209378028,"fy17salaries":0,"fy17other":94222852},
{"id":57,"name":"Wastewater Special Purpose","description":"An annual sum is appropriated to reimburse the General Fund for the related costs (including General City Overhead) of City departments, offices and bureaus providing support to the Wastewater System Improvement Program.","category":"Non-departmental","fy08budget":406532898,"fy08salaries":0,"fy08other":344990148,"fy09budget":397845484,"fy09salaries":0,"fy09other":333469691,"fy10budget":419940634,"fy10salaries":0,"fy10other":346804334,"fy11budget":422481971,"fy11salaries":0,"fy11other":359069648,"fy12budget":436323621,"fy12salaries":0,"fy12other":381272197,"fy13budget":471926855,"fy13salaries":0,"fy13other":408482870,"fy14budget":457653104,"fy14salaries":0,"fy14other":387072311,"fy15budget":460118426,"fy15salaries":0,"fy15other":393498154,"fy16budget":464794608,"fy16salaries":0,"fy16other":390066263,"fy17budget":490103101,"fy17salaries":0,"fy17other":427490160},
{"id":59,"name":"Other Special Purpose Funds","description":"Special Revenue Funds are supported by special levies and fees, grants or intergovernmental revenues. Expenditures in these funds are strictly limited to the mandates of the funding source. Special Revenue Funds are not to be used to subsidize other funds, except as required or permitted by program regulations.","category":"Non-departmental","fy08budget":720993333,"fy08salaries":0,"fy08other":477446711,"fy09budget":849878859,"fy09salaries":0,"fy09other":495583991,"fy10budget":709638423,"fy10salaries":0,"fy10other":472359376,"fy11budget":784303664,"fy11salaries":0,"fy11other":535914211,"fy12budget":835869474,"fy12salaries":0,"fy12other":565864994,"fy13budget":926562791,"fy13salaries":0,"fy13other":594651954,"fy14budget":1018156783,"fy14salaries":0,"fy14other":612697672,"fy15budget":1064320455,"fy15salaries":0,"fy15other":573496957,"fy16budget":1196393488,"fy16salaries":0,"fy16other":691291562,"fy17budget":1255180638,"fy17salaries":0,"fy17other":782816977}]; 

// Load the data and call the "display" function
//d3.csv('expenditures.csv', display);
myBubbleChart('#vis', expenditureData);

// set up the buttons.
setupButtons();
