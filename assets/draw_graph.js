var draw_graph = function draw_graph(type, ward, code, title, resize) {
  var url = window.location.href;
  var start_date = parseUri(url)["queryKey"]["start"],
      end_date = parseUri(url)["queryKey"]["end"];

  var params = [],
      filename = "assets/data/";

  if (start_date == null && end_date == null) {
    start_date = "2010-01-01";
    end_date = "2016-05-31";
  } else {
    params.push("start=" + start_date, "end=" + end_date);
  }

  if (type == "code") {
    filename += code + "-" + ward + ".csv";
    params.push("breakdown=service", "ward=" + ward);
  } else if (type == "ward") {
    params.push("breakdown=ward", "code=" + code);

    if (ward == "all-wards") {
      filename += "all-wards-" + code + ".csv";
    } else {
      filename += code + "-" + ward + ".csv";
    }
  }

  link = "/city-analysis/?" + params.join("&");

  var a = document.createElement("a");
  $(a).attr("href", link);
  $(a).attr("class", "graphLink");

  if (resize) {
    var w = Math.round( $("#graphs").width() * 0.95 );
    var h = Math.round( (w * 300) / 400 );
  } else {
    var w = 400,
        h = 300;
  }

  document.getElementById("graphs").appendChild(a);

  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = w - margin.left - margin.right,
      height = h - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y-%m-%d").parse;

  var mindate = new Date(start_date),
      maxdate = new Date(end_date);

  var x = d3.time.scale().domain([mindate, maxdate]).range([0, width]);
  var y = d3.scale.linear().range([height, 0]);

  var xAxis = d3.svg.axis()
      .ticks(5)
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(d3.format("d"));

  var area = d3.svg.area()
      .x(function(d) { return x(d.week); })
      .y0(function(d) { return y(d.closed); })
      .y1(function(d) { return y(d.opened); });

  var highLine = d3.svg.line()
      .x(function(d) { return x(d.week); })
      .y(function(d) { return y(d.opened); });

  var lowLine = d3.svg.line()
      .x(function(d) { return x(d.week); })
      .y(function(d) { return y(d.closed); });

  var svg = d3.select(a)
      .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
      .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.className = "col-sm-6 col-md-4";

  d3.csv(filename, function(error, data) {
    if (error) throw error;

    data = _.filter(data, function(d) {
      return d.week >= start_date && d.week <= end_date;
    });

    data.forEach(function(d) {
      d.week = parseDate(d.week);
      d.opened = +d.opened;
      d.closed = +d.closed;
    });

    var total_issues = d3.max(data, function(d) { return d.opened; });

    if(total_issues < 20) {
      svg.append("text")
          .attr("x", (width / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text(title);

      svg.append("text")
          .attr("x", (width / 2))
          .attr("y", (height / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "14px")
          .text("Graph omitted due to low issue count (< 20 total)");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);

      svg.selectAll(".tick").remove();

      return;
    }

    y.domain([d3.min(data, function(d) { return d.closed; }), total_issues]);

    svg.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

    svg.append("path")
        .datum(data)
        .attr("class", "highLine")
        .attr("d", highLine);

    svg.append("path")
        .datum(data)
        .attr("class", "lowLine")
        .attr("d", lowLine);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Number of issues");

    svg.append("text")
        .attr("x", (width / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(title);
  });
};

var graph_by_code = function graph_by_code(code, resize) {
  var type = "code";
  var graphs = document.getElementById("graphs");
  while (graphs.hasChildNodes()) {
    graphs.removeChild(graphs.lastChild);
  }

  for (i = 1; i < 31; i++) {
    var ward = i.toString();
    draw_graph(type, ward, code, "Ward " + i, resize);
  }
};

var graph_by_ward = function graph_by_ward(ward, resize) {
  var type = "ward";
  var graphs = document.getElementById("graphs");
  while (graphs.hasChildNodes()) {
    graphs.removeChild(graphs.lastChild);
  }

  draw_graph(type, ward, "5743", "Bins for Trash & Recycling", resize);
  draw_graph(type, ward, "122",  "Graffiti", resize);
  draw_graph(type, ward, "6215", "Hangers", resize);

  draw_graph(type, ward, "5185",  "Health Complaints", resize);
  draw_graph(type, ward, "1250",  "Illegal Dumping", resize);
  draw_graph(type, ward, "12386", "Library Issues", resize);

  draw_graph(type, ward, "374",  "Other", resize);
  draw_graph(type, ward, "3018", "Other - city responsibility", resize);
  draw_graph(type, ward, "372",  "Parking Meter", resize);

  draw_graph(type, ward, "121",  "Parking Violation/Abandoned Auto", resize);
  draw_graph(type, ward, "126",  "Parks Request", resize);
  draw_graph(type, ward, "2626", "Policing Issue", resize);

  draw_graph(type, ward, "116",  "Potholes", resize);
  draw_graph(type, ward, "1251", "Private Property Issue", resize);
  draw_graph(type, ward, "1249", "Public Space, Streets and Drains", resize);

  draw_graph(type, ward, "117", "Sidewalks and Curb damage", resize);
  draw_graph(type, ward, "373", "Signs / Bus Shelters / Pavement Markings", resize);
  draw_graph(type, ward, "124", "Street Lamp", resize);

  draw_graph(type, ward, "5251", "Street Sweeping", resize);
  draw_graph(type, ward, "51",   "Traffic Signal / Pedestrian Signal", resize);
  draw_graph(type, ward, "2625", "Traffic/Road Safety", resize);

  draw_graph(type, ward, "1966", "Trash & Recycling", resize);
  draw_graph(type, ward, "1853", "Tree Trimming", resize);
};
