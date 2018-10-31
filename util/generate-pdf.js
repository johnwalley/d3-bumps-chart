const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent('<body><div id="bumps-chart"></div></body>');
  await page.addScriptTag({ url: 'https://d3js.org/d3.v4.min.js' });
  await page.addScriptTag({ path: './build/d3-bumps-chart.js' });
  await page.setViewport({ width: 1200, height: 800 });
  await page.evaluate(() => {
    d3.json('./example/results.json', function(error, events) {
      const chart = d3
        .bumpsChart()
        .year(2008)
        .numYearsToView(5)
        .windowWidth(600);

      var gender = d3.WOMEN;
      var set = d3.TOWN;
      var el = document.getElementById('bumps-chart');

      var transformedEvents = events
        .filter(e => e.gender.toLowerCase() === gender.toLowerCase())
        .filter(e => e.set === set)
        .sort((a, b) => a.year - b.year)
        .map(event => d3.transformData(event));

      var data = d3.joinEvents(transformedEvents, set, gender);

      d3.select(el)
        .datum(data)
        .call(chart);
    });
  });
  await page.pdf({ path: 'bumps.pdf', format: 'A4' });

  await browser.close();
})();
