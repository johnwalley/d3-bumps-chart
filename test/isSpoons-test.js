var tape = require("tape");
var bumps = require('../');

tape("Down one every day.", function(test) { 
  var positions = [5, 6, 7, 8, 9];
  
  var expected = true;
  var actual = bumps.isSpoons(positions);
  
  test.equal(actual, expected);
  test.end();
})

tape("Down six and bumped every day.", function(test) { 
  var positions = [8, 9, 12, 13, 14];
  
  var expected = true;
  var actual = bumps.isSpoons(positions);
  
  test.equal(actual, expected);
  test.end();
})

tape("Bottom of the river counts as spoons.", function(test) { 
  var positions = [17, 18, 18, 18, 18];
  
  var expected = true;
  var actual = bumps.isSpoons(positions, 18);
  
  test.equal(actual, expected);
  test.end();
})

tape("Went down four but no spoons due to getting a bump.", function(test) { 
  var positions = [8, 11, 10, 11, 12];
  
  var expected = false;
  var actual = bumps.isSpoons(positions);
  
  test.equal(actual, expected);
  test.end();
})

tape("Went down four but no spoons due to rowing over twice.", function(test) { 
  var positions = [8, 11, 11, 11, 12];
  
  var expected = false;
  var actual = bumps.isSpoons(positions);
  
  test.equal(actual, expected);
  test.end();
})