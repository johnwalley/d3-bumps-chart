var tape = require("tape");
var jsdom = require("jsdom");
var d3_bumps_chart = require("../");

tape("Setup should append 4 svg groups.", function (test) {
  var dom = new jsdom.JSDOM('<div id="bumps-chart"><svg width="100%" preserveAspectRatio="xMidYMin"></svg></div>');

  var el = dom.window.document.getElementById('bumps-chart');
  var chart = d3_bumps_chart.chart();
  chart.setup(el);

  test.equal(dom.window.document.querySelector('svg').querySelectorAll('g').length, 6);
  test.end();
});
