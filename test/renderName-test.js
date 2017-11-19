var tape = require('tape');
var bumps = require('../');

tape('Expand Cambridge college abbreviation.', function(test) {
  var name = 'Ca';

  var expected = 'Caius';
  var actual = bumps.renderName(name, 'Lent Bumps');

  test.equal(actual, expected);
  test.end();
});

tape('Expand Cambridge college abbreviation with number > 1.', function(test) {
  var name = 'Ca2';

  var expected = 'Caius II';
  var actual = bumps.renderName(name, 'Lent Bumps');

  test.equal(actual, expected);
  test.end();
});

tape('Expand Oxford college abbreviation.', function(test) {
  var name = 'O';

  var expected = 'Oriel';
  var actual = bumps.renderName(name, 'Summer Eights');

  test.equal(actual, expected);
  test.end();
});

tape('Expand Oxford college abbreviation with number > 1.', function(test) {
  var name = 'O7';

  var expected = 'Oriel VII';
  var actual = bumps.renderName(name, 'Summer Eights');

  test.equal(actual, expected);
  test.end();
});

tape('Expand town abbreviation.', function(test) {
  var name = 'Cy';

  var expected = 'City';
  var actual = bumps.renderName(name, 'Town Bumps');

  test.equal(actual, expected);
  test.end();
});

tape('Use Roman numerals for college crews.', function(test) {
  var name = 'SS3';

  var expected = 'Sidney Sussex III';
  var actual = bumps.renderName(name, 'Lent Bumps');

  test.equal(actual, expected);
  test.end();
});

tape('College first boats should not have a number.', function(test) {
  var name = 'Sidney Sussex 1';

  var expected = 'Sidney Sussex';
  var actual = bumps.renderName(name, 'Lent Bumps');

  test.equal(actual, expected);
  test.end();
});

tape('Town first boats should not have a number.', function(test) {
  var name = 'City 1';

  var expected = 'City';
  var actual = bumps.renderName(name, 'Town Bumps');

  test.equal(actual, expected);
  test.end();
});

tape('Town boats > 10 should work.', function(test) {
  var name = 'City 11';

  var expected = 'City 11';
  var actual = bumps.renderName(name, 'Town Bumps');

  test.equal(actual, expected);
  test.end();
});

tape('Unrecognised set should result in returning input', function(test) {
  var name = 'A';

  var expected = 'A';
  var actual = bumps.renderName(name, 'Custom');

  test.equal(actual, expected);
  test.end();
});
