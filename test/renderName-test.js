var tape = require("tape");
var bumps = require('../');

tape("Expand college abbreviation.", function(test) { 
  var name = 'Ca';
  
  var expected = 'Caius';
  var actual = bumps.renderName(name);
  
  test.equal(actual, expected);
  test.end();
})

tape("Use Roman numerals for college crews.", function(test) { 
  var name = 'SS3';
  
  var expected = 'Sidney Sussex III';
  var actual = bumps.renderName(name);
  
  test.equal(actual, expected);
  test.end();
})

tape("Town first boats should not have a number.", function(test) { 
  var name = 'City 1';
  
  var expected = 'City';
  var actual = bumps.renderName(name);
  
  test.equal(actual, expected);
  test.end();
})

tape("Town boats > 10 should work.", function(test) { 
  var name = 'City 11';
  
  var expected = 'City 11';
  var actual = bumps.renderName(name);
  
  test.equal(actual, expected);
  test.end();
})

