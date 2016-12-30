var tape = require("tape");
var jsdom = require("jsdom");
var d3_bumps_chart = require("../");

tape("Setup should append 4 svg groups.", function (test) {
  var document = jsdom.jsdom('<div id="bumps-chart"><svg width="100%" preserveAspectRatio="xMidYMin"></svg></div>');

  var el = document.getElementById('bumps-chart');
  var chart = d3_bumps_chart.chart();
  chart.setup(el);

  test.equal(document.querySelector('svg').querySelectorAll('g').length, 4);
  test.end();
});
