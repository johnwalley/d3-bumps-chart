var tape = require('tape');
var jsdom = require('jsdom');
var d3 = Object.assign({}, require('d3-selection'), require('../'));

tape('chart() without data should append 4 svg groups.', function(test) {
  var dom = new jsdom.JSDOM(
    '<div id="bumps-chart"><svg width="100%" preserveAspectRatio="xMidYMin"></svg></div>'
  );

  // get the window object out of the document
  var win = dom.defaultView;

  // set globals for mocha that make access to document and window feel
  // natural in the test environment
  global.document = dom;
  global.window = win;
  global.Hammer = function() {
    return {
      on: function(name, callback) {},
    };
  };

  // take all properties of the window object and also attach it to the
  // mocha global object
  propagateToGlobal(win);

  // from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
  function propagateToGlobal(window) {
    for (let key in window) {
      if (!window.hasOwnProperty(key)) continue;
      if (key in global) continue;

      global[key] = window[key];
    }
  }

  var chart = d3.bumpsChart();
  var el = dom.window.document.getElementById('bumps-chart');

  d3
    .select(el)
    .datum(undefined)
    .call(chart);

  test.equal(
    dom.window.document.querySelector('svg').querySelectorAll('g').length,
    6
  );
  test.end();
});
