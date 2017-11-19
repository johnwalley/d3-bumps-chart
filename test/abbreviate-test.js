var tape = require('tape');
var bumps = require('../');

tape('Abbreviate club names correctly.', function(test) {
  var data = {
    completed: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
    days: 4,
    divisions: [
      ['Cantabs 1', 'City 1', 'Rob Roy 1', '99 1'],
      ['Cantabs 2', 'City 2'],
      ['Champs 1'],
    ],
    finish: [
      ['99 1', 'Rob Roy 1', 'City 1', 'City 2'],
      ['Cantabs 1', 'Cantabs 2'],
      ['Champs 1'],
    ],
    gender: 'M',
    move: [
      [[0, 0, 0, 0], [0, -1], [1]],
      [[-3, -1, 1, 3], [0, -1], [1]],
      [[0, 0, 0, -1], [-1, 2], [0]],
      [[0, 0, 0, 0], [0, 0], [0]],
    ],
    result: '',
    results: 'r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n\
r rrr rrrrr',
    set: 'Town Bumps',
    small: 'Short',
    year: 2013,
  };

  var expected = {
    completed: [
      [true, true, true],
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ],
    days: 4,
    divisions: [['Ct', 'Cy', 'RR', 'NN'], ['Ct2', 'Cy2'], ['COT']],
    finish: [['NN', 'RR', 'Cy', 'Cy2'], ['Ct', 'Ct2'], ['COT']],
    gender: 'M',
    move: [
      [[0, 0, 0, 0], [0, -1], [1]],
      [[-3, -1, 1, 3], [0, -1], [1]],
      [[0, 0, 0, -1], [-1, 2], [0]],
      [[0, 0, 0, 0], [0, 0], [0]],
    ],
    result: '',
    results: 'r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n\
r rrr rrrrr',
    set: 'Town Bumps',
    small: 'Short',
    year: 2013,
  };

  var actual = bumps.abbreviate(data);

  test.deepEqual(actual, expected);
  test.end();
});
