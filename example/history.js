let team = 'City';

const width = document.querySelector('.container').clientWidth;

const max_width = Math.min(width, 1024);
const max_height = width < 1024 ? 0.82 * max_width : 0.625 * max_width;

const e = 768 <= max_width ? 32 : 0;
const n = 768 <= max_width ? 62 : 0;
const r = window.innerWidth <= 479;

const margin = {
  top: 10,
  right: max_width < 480 ? 0 : 22,
  bottom: e + 42 + n / 2,
  left: r ? 0 : 63,
};

const chart_width = max_width - margin.left - margin.right;
const chart_height = max_height - margin.top - margin.bottom;

const o = chart_height + n;
const s = margin.left;
const u = e;

const svg = d3
  .select('.chart')
  .append('svg')
  .attr('width', max_width)
  .attr('height', max_height);

svg
  .append('rect')
  .attr('class', 'chart-background')
  .attr('width', chart_width)
  .attr('height', chart_height)
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

svg
  .append('defs')
  .append('clipPath')
  .attr('id', 'clip')
  .append('rect')
  .attr('width', chart_width)
  .attr('height', chart_height);

const focus = svg
  .append('g')
  .attr('class', 'focus')
  .attr('width', chart_width)
  .attr('height', chart_height)
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

const context = svg
  .append('g')
  .attr('class', 'context')
  .attr('transform', 'translate(' + s + ',' + o + ')');

context
  .append('rect')
  .attr('class', 'context-background')
  .attr('y', 0)
  .attr('width', chart_width)
  .attr('height', u);

var x = d3.scaleLinear().range([0, chart_width]);
var x2 = d3.scaleLinear().range([0, chart_width]);
var y = d3.scaleLinear().range([0, chart_height]);
var y2 = d3.scaleLinear().range([0, u]);

var xAxis = d3.axisBottom(x);
var xAxis2 = d3.axisBottom(x2);
var yAxis = d3.axisLeft(y);

var brush = d3
  .brushX()
  .extent([[0, 0], [chart_width, u]])
  .on('brush end', brushed);

var zoom = d3
  .zoom()
  .scaleExtent([1, Infinity])
  .translateExtent([[0, 0], [chart_width, chart_height]])
  .extent([[0, 0], [chart_width, chart_height]])
  .on('zoom', zoomed);

var area = d3
  .line()
  .defined(function(d) {
    return d.pos !== -1;
  })
  .x(function(d) {
    return x(d.day);
  })
  .y(function(d) {
    return y(d.pos);
  });

var area2 = d3
  .line()
  .defined(function(d) {
    return d.pos !== -1;
  })
  .x(function(d) {
    return x2(d.day);
  })
  .y(function(d) {
    return y2(d.pos);
  });

focus
  .append('g')
  .attr('clip-path', 'url(#clip)')
  .attr('class', 'divisions');

focus
  .append('g')
  .attr('clip-path', 'url(#clip)')
  .attr('class', 'teams');

focus.append('g').attr('class', 'axis axis--x');
focus.append('g').attr('class', 'axis axis--y');

context.append('path');

const gBrush = context
  .append('g')
  .attr('class', 'brush')
  .call(brush);

const handle = gBrush
  .selectAll('.brush-handle')
  .data([{ type: 'w' }, { type: 'e' }])
  .enter()
  .append('path')
  .attr('class', 'brush-handle')
  .attr('cursor', 'ew-resize')
  .attr(
    'd',
    d3
      .arc()
      .innerRadius(0)
      .outerRadius(8)
      .startAngle(0)
      .endAngle(function(d, i) {
        return i ? Math.PI : -Math.PI;
      })
  );

gBrush.call(brush.move, x.range());

context.append('g').attr('class', 'axis axis--x');

svg
  .append('rect')
  .attr('class', 'zoom')
  .attr('width', chart_width)
  .attr('height', chart_height)
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  .call(zoom);

let crews = null;

d3.json('./website_results.json').then(function(data) {
  crews = data;
  updateChart();
});

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom

  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));

  focus
    .selectAll('rect')
    .attr('x', d => x((d.year - 1950) * 5))
    .attr('width', d => x(4) - x(0));

  focus.select('.area').attr('d', area);
  focus.select('.axis--x').call(xAxis);

  svg
    .select('.zoom')
    .call(
      zoom.transform,
      d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
    );

  handle.attr('transform', function(d, i) {
    return 'translate(' + s[i] + ',' + u / 2 + ')';
  });
}

function zoomed() {
  if (
    d3.event.sourceEvent &&
    (d3.event.sourceEvent.type === 'brush' ||
      d3.event.sourceEvent.type === 'end')
  )
    return; // ignore zoom-by-brush

  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  focus.select('.area').attr('d', area);

  focus
    .selectAll('rect')
    .attr('x', d => x((d.year - 1950) * 5))
    .attr('y', d => y(d.start))
    .attr('width', d => x(4) - x(0))
    .attr('height', d => y(d.size));

  focus.select('.axis--x').call(xAxis);
  context.select('.brush').call(brush.move, x.range().map(t.invertX, t));
}

const secondSelection = d3.select('#second-selection');

d3.select('.compare-lead').on('click', function() {
  secondSelection.classed('hidden', false),
    d3.select('.remove-second-team').classed('hidden', false),
    d3.select('.compare-lead').style('display', 'none');
});

d3.select('.remove-second-team').on('click', function() {
  secondSelection.classed('hidden', true),
    secondSelection.selectAll('option').property('selected', function() {
      return 'none' === d3.select(this).attr('value');
    }),
    d3.select('.remove-second-team').classed('hidden', true),
    d3.select('.compare-lead').style('display', null),
    d3.selectAll('.compare').remove();
});

d3.select('#teamselector').on('change', function() {
  update();
});

d3.select('#secondselector').on('change', function() {
  var t = d3.select('#secondselector').node().value;
  'none' !== t && e.secondTeam(t);
});

function update() {
  team = d3.select('#teamselector').node().value;
  updateChart();
}

function updateChart() {
  const data = crews.crews.find(c => c.name === team + ' 1').values;

  x.domain(
    d3.extent(data, function(d) {
      return d.day;
    })
  );

  y.domain([0, 65]);

  x2.domain(x.domain());
  y2.domain(y.domain());

  focus
    .select('.divisions')
    .selectAll('.year')
    .data(crews.divisions)
    .enter()
    .append('g')
    .attr('class', 'year')
    .selectAll('rect')
    .data(d => d.divisions)
    .enter()
    .append('rect')
    .attr('x', d => x((d.year - 1950) * 5))
    .attr('y', d => y(d.start))
    .attr('width', d => x(4) - x(0))
    .attr('height', d => y(d.size))
    .attr('fill', (d, i) => (i % 2 === 0 ? '#eeeeee' : '#cccccc'));

  focus
    .select('.teams')
    .selectAll('.area')
    .data([data])
    .enter()
    .append('path')
    .attr('class', 'area')
    .attr('d', area)
    .style('stroke', 'red')
    .style('stroke-width', 2);

  focus
    .select('.teams')
    .selectAll('.area')
    .attr('d', area);

  focus
    .select('.axis.axis--x')
    .attr('transform', 'translate(0,' + chart_height + ')')
    .call(xAxis);

  focus.select('axis axis--y').call(yAxis);

  context
    .select('path')
    .datum(data)
    .attr('class', 'area')
    .attr('d', area2)
    .style('stroke', 'red');

  context
    .select('.axis.axis--x')
    .attr('transform', 'translate(0,' + u + ')')
    .call(xAxis2);
}
