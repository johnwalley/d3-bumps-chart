# d3-bumps-chart

Draw Bumps charts using d3.

## Installing

If you use NPM, `npm install d3-bumps-chart`. Otherwise, download the [latest release](https://github.com/johnwalley/d3-bumps-chart/releases/latest). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `bumpsChart` global is exported:

```html
<script src="https://d3js.org/d3.v4.min.js"></script>
<script src="https://cdn.jsdelivr.net/lodash/4.15.0/lodash.min.js"></script>
<script src="../build/d3-bumps-chart.js"></script>

<script>
  var el = document.getElementById('bumps-chart');
  var chart = bumpsChart.bumpsChart();
  var svg = chart.setup(el);

  d3.json("./example/results.json", function(error, events) {

    var gender = "Women";
    var set = "Town Bumps";

    var transformedEvents = events
      .filter(e => e.gender.toLowerCase() === gender.toLowerCase())
      .filter(e => e.set === set)
      .sort((a, b) => a.year - b.year)
      .map(event => bumpsChart.transformData(event));

    var data = bumpsChart.joinEvents(transformedEvents, set, gender);

    var props = {
      data: data,
      year: { start: 2015, end: 2016 },
      selectedCrews: new Set(),
      highlightedCrew: null,
      addSelectedCrew: bumpsChart.bumpsChart().addSelectedCrew,
      removeSelectedCrew: bumpsChart.bumpsChart().removeSelectedCrew,
      highlightCrew: bumpsChart.bumpsChart().highlightCrew,
      windowWidth: window.width
    };

    chart.update(props, svg);
  });
</script>
```

## API Reference

<a name="bumpsChart" href="#bumpsChart">#</a> bumpsChart.<b>bumpsChart</b>() [<>](https://github.com/johnwalley/d3-bumps-chart/blob/master/src/bumpsChart.js "Source")

Constructs a new bumps chart generator with the default settings.

<a name="bumpsChart_setup" href="#bumpsChart_setup">#</a> <i>bumpsChart</i>.<b>setup</b>(<i>element</i>) [<>](https://github.com/johnwalley/d3-bumps-chart/blob/master/src/bumpsChart.js#L159 "Source")

Sets up the svg elements which are independent of any data. Selects the *element* passed in.

<a name="bumpsChart_update" href="#bumpsChart_update">#</a> <i>bumpsChart</i>.<b>update</b>(<i>props</i>) [<>](https://github.com/johnwalley/d3-bumps-chart/blob/master/src/bumpsChart.js#L198 "Source")

Renders the bumps chart based on *props*.