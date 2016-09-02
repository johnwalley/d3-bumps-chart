var tape = require("tape");
var bumps = require('../');

tape("Calculate correct year range.", function(test) { 
  var expected = { start: 2012, end: 2014 };
  var actual = bumps.calculateYearRange(null, { start: 2010, end: 2014 }, 2);
  
  test.deepEqual(actual, expected);
  test.end();
})

tape("Calculate correct year range.", function(test) { 
  var expected = { start: 2011, end: 2014 };
  var actual = bumps.calculateYearRange({ start: 2012, end: 2014 }, { start: 2010, end: 2014 }, 3);
  
  test.deepEqual(actual, expected);
  test.end();
})

tape("Calculate correct year range.", function(test) { 
  var expected = { start: 2012, end: 2014 };
  var actual = bumps.calculateYearRange({ start: 2012, end: 2014 }, { start: 2010, end: 2016 }, 2);
  
  test.deepEqual(actual, expected);
  test.end();
})

tape("Calculate correct year range.", function(test) { 
  var expected = { start: 2011, end: 2013 };
  var actual = bumps.calculateYearRange({ start: 2012, end: 2014 }, { start: 2010, end: 2013 }, 2);
  
  test.deepEqual(actual, expected);
  test.end();
})

tape("Calculate correct year range.", function(test) { 
  var expected = { start: 2012, end: 2013 };
  var actual = bumps.calculateYearRange({ start: 2010, end: 2014 }, { start: 2012, end: 2013 }, 4);
  
  test.deepEqual(actual, expected);
  test.end();
})

tape("Calculate correct year range.", function(test) { 
  var expected = { start: 2003, end: 2006 };
  var actual = bumps.calculateYearRange({ start: 2006, end: 2006 }, { start: 1999, end: 2014 }, 3);
  
  test.deepEqual(actual, expected);
  test.end();
})

tape("Calculate correct year range.", function(test) { 
  var expected = { start: 2012, end: 2015 };
  var actual = bumps.calculateYearRange({ start: 1999, end: 2014 }, { start: 2012, end: 2015 }, 15);
  
  test.deepEqual(actual, expected);
  test.end();
})

tape("Current year before any data.", function(test) { 
  var expected = { start: 2010, end: 2013 };
  var actual = bumps.calculateYearRange({ start: 2006, end: 2006 }, { start: 2010, end: 2015 }, 3);
  
  test.deepEqual(actual, expected);
  test.end();
})

tape("Current year after any data.", function(test) { 
  var expected = { start: 2010, end: 2012 };
  var actual = bumps.calculateYearRange({ start: 2014, end: 2014 }, { start: 2010, end: 2012 }, 3);
  
  test.deepEqual(actual, expected);
  test.end();
})