var tape = require("tape");
var bumps = require('../');

tape("Up one every day.", function(test) { 
  var positions = [5, 4, 3, 2, 1];
  
  var expected = true;
  var actual = bumps.isBlades(positions);
  
  test.equal(actual, expected);
  test.end();
})

tape("Up six with a bump every day.", function(test) { 
  var positions = [8, 7, 4, 3, 2];
  
  var expected = true;
  var actual = bumps.isBlades(positions);
  
  test.equal(actual, expected);
  test.end();
})

tape("Headship counts as blades.", function(test) { 
  var positions = [2, 1, 1, 1, 1];
  
  var expected = true;
  var actual = bumps.isBlades(positions);
  
  test.equal(actual, expected);
  test.end();
})

tape("Went up four but no blades due to getting bumped.", function(test) { 
  var positions = [8, 5, 6, 5, 4];
  
  var expected = false;
  var actual = bumps.isBlades(positions);
  
  test.equal(actual, expected);
  test.end();
})

tape("Went up four but no blades due to rowing over twice.", function(test) { 
  var positions = [8, 5, 5, 5, 4];
  
  var expected = false;
  var actual = bumps.isBlades(positions);
  
  test.equal(actual, expected);
  test.end();
})