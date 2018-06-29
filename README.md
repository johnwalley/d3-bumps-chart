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
  d3.json("./results.json", function (error, events) {
    var gender = d3.GENDER.WOMEN;
    var set = d3.SET.TORPIDS;
    var el = document.getElementById('bumps-chart');

    var chart = d3.bumpsChart();

    chart
      .year({ start: 2014, end: 2017 })
      .windowWidth(window.document.body.clientWidth)
      .on("selectYear", (start, end) => console.log(start + '-' + end))
      .on("highlightCrew", crew => console.log(crew))
      .on("toggleSelectedCrew", crew => console.log(crew));

    var transformedEvents = events
      .filter(e => e.gender.toLowerCase() === gender.toLowerCase())
      .filter(e => e.set === set)
      .sort((a, b) => a.year - b.year)
      .map(event => d3.transformData(event));

    var data = d3.joinEvents(transformedEvents, set, gender);

    d3.select(el).datum(data).call(chart);
  });
</script>
```

## API Reference

<a name="bumpsChart" href="#bumpsChart">#</a> d3.<b>bumpsChart</b>() [<>](https://github.com/johnwalley/d3-bumps-chart/blob/master/src/chart.js 'Source')

Constructs a new bumps chart generator with the default settings.

<a name="bumpsChart" href="#bumpsChart">#</a> <i>bumpsChart</i>(<i>selection</i>) [<>](https://github.com/johnwalley/d3-bumps-chart/blob/master/src/chart.js#L43 'Source')

Render the bumps chart to the given _[selection](https://github.com/d3/d3-selection)_.

<a href="#bumpsChart_on" name="bumpsChart_on">#</a> <i>bumpsChart</i>.<b>on</b>(<i>typenames</i>, [<i>listener</i>]) [<>](https://github.com/johnwalley/d3-bumps-chart/blob/master/src/chart.js#L879 'Source')

If _listener_ is specified, sets the event _listener_ for the specified _typenames_ and returns the bumps chart. If an event listener was already registered for the same type and name, the existing listener is removed before the new listener is added. If _listener_ is null, removes the current event listeners for the specified _typenames_, if any. If _listener_ is not specified, returns the first currently-assigned listener matching the specified _typenames_, if any. When a specified event is dispatched, each _listener_ will be invoked with the same context and arguments as [_selection_.on](https://github.com/d3/d3-selection#selection_on) listeners: the current datum `d` and index `i`, with the `this` context as the current DOM element.

The _typenames_ is a string containing one or more _typename_ separated by whitespace. Each _typename_ is a _type_, optionally followed by a period (`.`) and a _name_, such as `drag.foo` and `drag.bar`; the name allows multiple listeners to be registered for the same _type_. The _type_ must be one of the following:

- `selectYear` - after the year range has changed.
- `toggleSelectedCrew` - after a crew's selected status has been toggled.
- `highlightCrew` - after the highlighted crew has changed.

See [_dispatch_.on](https://github.com/d3/d3-dispatch#dispatch_on) for more.
