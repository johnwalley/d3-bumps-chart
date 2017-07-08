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

tape("Render should create the expected elements.", function (test) {
  var dom = new jsdom.JSDOM('<div id="bumps-chart"><svg width="100%" preserveAspectRatio="xMidYMin"></svg></div>');

  var el = dom.window.document.getElementById('bumps-chart');
  var chart = d3_bumps_chart.chart();
  chart.setup(el);

  var data = {
    crews: [
      {
        gender: 'Women',
        name: 'Cantabs 1',
        set: 'Lent Bumps',
        values: [
          { day: 0, pos: 1 },
          { day: 1, pos: 1 },
          { day: 2, pos: 1 },
          { day: 3, pos: 1 },
          { day: 4, pos: 1 },
          { day: 5, pos: 1 },
          { day: 6, pos: 2 },
          { day: 7, pos: 2 },
          { day: 8, pos: 2 },
          { day: 9, pos: 2 },
        ],
        valuesSplit: [
          {
            blades: true, day: 0, gender: 'Women', name: 'Cantabs 1', set: 'Lent Bumps', spoons: false, values: [
              { day: 0, pos: 1 },
              { day: 1, pos: 1 },
              { day: 2, pos: 1 },
              { day: 3, pos: 1 },
              { day: 4, pos: 1 },
            ],
          },
          {
            blades: false, day: 5, gender: 'Women', name: 'Cantabs 1', set: 'Lent Bumps', spoons: true, values: [
              { day: 5, pos: 1 },
              { day: 6, pos: 2 },
              { day: 7, pos: 2 },
              { day: 8, pos: 2 },
              { day: 9, pos: 2 },
            ]
          },
        ],
      },
      {
        gender: 'Women',
        name: 'City 1',
        set: 'Lent Bumps',
        values: [
          { day: 0, pos: 2 },
          { day: 1, pos: 2 },
          { day: 2, pos: 2 },
          { day: 3, pos: 2 },
          { day: 4, pos: 2 },
          { day: 5, pos: 2 },
          { day: 6, pos: 1 },
          { day: 7, pos: 1 },
          { day: 8, pos: 1 },
          { day: 9, pos: 1 },
        ],
        valuesSplit: [
          {
            blades: false, day: 0, gender: 'Women', name: 'City 1', set: 'Lent Bumps', spoons: true, values: [
              { day: 0, pos: 2 },
              { day: 1, pos: 2 },
              { day: 2, pos: 2 },
              { day: 3, pos: 2 },
              { day: 4, pos: 2 },
            ],
          },
          {
            blades: true, day: 5, gender: 'Women', name: 'City 1', set: 'Lent Bumps', spoons: false, values: [
              { day: 5, pos: 2 },
              { day: 6, pos: 1 },
              { day: 7, pos: 1 },
              { day: 8, pos: 1 },
              { day: 9, pos: 1 },
            ],
          },
        ],
      },
    ],
    divisions: [
      { divisions: [{ length: 2, start: 0, year: 2013 }], gender: 'Women', set: 'Lent Bumps' },
      { divisions: [{ length: 2, start: 0, year: 2014 }], gender: 'Women', set: 'Lent Bumps' },
    ],
    endYear: 2014,
    maxCrews: 2,
    startYear: 2013,
  };

  var props = {
    data: data,
    year: { start: 2013, end: 2014 },
    selectedCrews: new Set(),
    highlightedCrew: null,
    toggleSelectedCrew: chart.toggleSelectedCrew,
    highlightCrew: chart.highlightCrew,
    windowWidth: 200
  };

  chart.render(props);

  test.equal(dom.window.document.querySelector('svg').querySelector('.years').querySelectorAll('text').length, 2);
  test.equal(dom.window.document.querySelector('svg').querySelector('.divisions').querySelector('.division-year').querySelectorAll('rect').length, 1);
  test.equal(dom.window.document.querySelector('svg').querySelector('.lines').querySelectorAll('g').length, 2);
  test.equal(dom.window.document.querySelector('svg').querySelector('.labels').querySelectorAll('text').length, 8);

  test.end();
});

