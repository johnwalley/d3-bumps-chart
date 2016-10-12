var tape = require("tape"),
    d3_bumps_chart = require("../");

tape("Create a bumps chart", function(test) {
  test.doesNotThrow(d3_bumps_chart.chart(), "");
  test.end();
});
