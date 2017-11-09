# d3-bumps-chart

[![Build Status](https://travis-ci.org/johnwalley/d3-bumps-chart.svg?branch=master)](https://travis-ci.org/johnwalley/d3-bumps-chart)

Draw Bumps charts using d3.

See a demo [here](https://bl.ocks.org/johnwalley/a0734cf335b44365026adae40cce5945).

## Installing

If you use NPM, `npm install d3-bumps-chart`. Otherwise, download the [latest release](https://github.com/johnwalley/d3-bumps-chart/releases/latest). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3` global is exported:

```html
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="../build/d3-bumps-chart.js"></script>

<script>
  var el = document.getElementById('bumps-chart');
  var chart = d3.chart();
  chart.setup(el);

  d3.json("./example/results.json", function(error, events) {

    var gender = "Women";
    var set = "Town Bumps";

    var transformedEvents = events
      .filter(e => e.gender.toLowerCase() === gender.toLowerCase())
      .filter(e => e.set === set)
      .sort((a, b) => a.year - b.year)
      .map(event => d3.transformData(event));

    var data = d3.joinEvents(transformedEvents, set, gender);

    var props = {
      data: data,
      year: { start: 2015, end: 2016 },
      selectedCrews: new Set(),
      highlightedCrew: null,
      toggleSelectedCrew: chart.toggleSelectedCrew,
      highlightCrew: chart.highlightCrew,
      windowWidth: window.width
    };

    chart.update(props);
  });
</script>
```

## API Reference

<a name="chart" href="#chart">#</a> d3.<b>chart</b>() [<>](https://github.com/johnwalley/d3-bumps-chart/blob/master/src/chart.js "Source")

Constructs a new bumps chart generator with the default settings.

<a name="chart_setup" href="#chart_setup">#</a> <i>chart</i>.<b>setup</b>(<i>element</i>) [<>](https://github.com/johnwalley/d3-bumps-chart/blob/master/src/chart.js#L16 "Source")

Sets up the svg elements which are independent of any data. Selects the *element* passed in.

<a name="chart_update" href="#chart_update">#</a> <i>chart</i>.<b>update</b>(<i>props</i>) [<>](https://github.com/johnwalley/d3-bumps-chart/blob/master/src/chart.js#L28 "Source")

Renders the bumps chart based on *props*.
