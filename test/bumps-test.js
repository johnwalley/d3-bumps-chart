var tape = require('tape');
var bumps = require('../');

tape('read_flat() returns a correct intermediate object.', function (test) {
  var data = 'Year,Club,Sex,Day,Crew,Start position,Position,Division\n\
2013,Cantabs,M,1,1,1,1,1\n\
2013,Cantabs,M,2,1,1,4,1\n\
2013,Cantabs,M,3,1,1,5,1\n\
2013,City,M,1,1,2,2,1\n\
2013,City,M,2,1,2,3,1\n\
2013,City,M,3,1,2,3,1\n\
2013,Rob Roy,M,1,1,3,3,1\n\
2013,Rob Roy,M,2,1,3,2,1\n\
2013,Rob Roy,M,3,1,3,2,1\n\
2013,99,M,1,1,4,4,1\n\
2013,99,M,2,1,4,1,1\n\
2013,99,M,3,1,4,1,1\n\
2013,Cantabs,M,1,2,5,5,2\n\
2013,Cantabs,M,2,2,5,5,2\n\
2013,Cantabs,M,3,2,5,6,2\n\
2013,City,M,1,2,6,7,2\n\
2013,City,M,2,2,6,6,2\n\
2013,City,M,3,2,6,4,2\n\
2013,Champs,M,1,1,7,6,3\n\
2013,Champs,M,2,1,7,7,3\n\
2013,Champs,M,3,1,7,7,3\n';

  var expected = [{
    completed: [[true, true, true], [true, true, true], [true, true, true]],
    days: 3,
    divisions: [['Cantabs 1', 'City 1', 'Rob Roy 1', '99 1'], ['Cantabs 2', 'City 2'], ['Champs 1']],
    finish: [['99 1', 'Rob Roy 1', 'City 1', 'City 2'], ['Cantabs 1', 'Cantabs 2'], ['Champs 1']],
    gender: 'M',
    move: [[[0, 0, 0, 0], [0, -1], [1]], [[-3, -1, 1, 3], [0, -1], [1]], [[0, 0, 0, -1], [-1, 2], [0]]],
    result: '',
    results: 'r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n',
    set: 'Town Bumps',
    small: 'Short',
    year: 2013,
  }];

  var actual = bumps.read_flat(data);

  test.deepEqual(actual, expected);
  test.end();
});

tape('read_tg() returns a correct intermediate object.', function (test) {
  var data = 'Set,Town Bumps\n\
Short,Short\n\
Gender,M\n\
Year,2013\n\
Days,3\n\n\
Division,Cantabs 1,City 1,Rob Roy 1,99 1\n\
Division,Cantabs 2,City 2\n\
Division,Champs 1\n\
\n\
Results\n\
 r\n\
 ur\n\
 rrrrr\n\
 r\n\
 ur\n\
 ro3u\n\
 r\n\
 ru\n\
 urrr\n';

  var expected = {
    completed: [[true, true, true], [true, true, true], [true, true, true]],
    days: 3,
    divisions: [['Cantabs 1', 'City 1', 'Rob Roy 1', '99 1'], ['Cantabs 2', 'City 2'], ['Champs 1']],
    finish: [['99 1', 'Rob Roy 1', 'City 1', 'City 2'], ['Cantabs 1', 'Cantabs 2'], ['Champs 1']],
    gender: 'M',
    move: [[[0, 0, 0, 0], [0, -1], [1]], [[-3, -1, 1, 3], [0, -1], [1]], [[0, 0, 0, -1], [-1, 2], [0]]],
    result: '',
    results: 'r ur rrrrr\n\
r ur ro3u\n\
r ru urrr',
    set: 'Town Bumps',
    small: 'Short',
    year: 2013,
  };

  var actual = bumps.read_tg(data);

  test.deepEqual(actual, expected);
  test.end();
});

tape('read_ad() returns a correct intermediate object.', function (test) {
  var data = 'EIGHTS 2016\n\
 4  3  7   = NDay, NDiv, NCrew\n\
 3  Men\'s Div I (6.45)\n\
Oriel                       0   0   0   0\n\
Christ Church               0  -1   0   0\n\
Pembroke                   -1   0   0  -1\n\
 3  Men\'s Div II (5.45)\n\
Osler-Green                -1  -1  -1   0\n\
St Catherine\'s              2   1   0   0\n\
Pembroke IV                 0   1   0   1\n\
 1  Men\'s Div III (4.45)\n\
Exeter                      0   0   1   0\n';

  var expected = {
    completed: [[true, true, true], [true, true, true], [true, true, true],[true, true, true]],
    days: 4,
    divisions: [['Oriel 1', 'Christ Church 1', 'Pembroke 1'], ['Osler-Green 1', 'St Catherine\'s 1', 'Pembroke 4'], ['Exeter 1']],
    finish: [['Oriel 1', 'St Catherine\'s 1', 'Christ Church 1'], ['Pembroke 4', 'Pembroke 1', 'Exeter 1'], ['Osler-Green 1']],
    gender: 'Men',
    move: [[[0, 0, -1], [-1, 2, 0], [0]], [[0, -1, 1], [0, -1, 1], [0]], [[0, 0, 0], [0, 0, -1], [1]], [[0, 0, 0], [-1, 1, 0], [0]]],
    result: '',
    results: 'r rru urr\n\
r rur rur\n\
r urr rrrr\n\
r rru rrrr\n',
    set: 'Summer Eights',
    small: 'Short',
    year: 2016,
  };

  var actual = bumps.read_ad(data);

  test.deepEqual(actual, expected);
  test.end();
});

tape('read_ad() returns a correct intermediate object.', function (test) {
  var data = 'EIGHTS 2016\n\
 4  3  7   = NDay, NDiv, NCrew\n\
 3  Men\'s Div I (6.45)\n\
Oriel                       0   0   0   0\n\
Christ Church               0  -1   0   0\n\
Pembroke                   -1   0   0  -1\n\
 3  Men\'s Div II (5.45)\n\
Worcester                  -1  -1  -1   0\n\
St Catherine\'s              2   1   0   0\n\
Pembroke III                0   1   0   1\n\
 1  Men\'s Div III (4.45)\n\
Exeter                      0   0   1   0\n';

  var expected = {
    completed: [[true, true, true], [true, true, true], [true, true, true],[true, true, true]],
    days: 4,
    divisions: [['Oriel 1', 'Christ Church 1', 'Pembroke 1'], ['Worcester 1', 'St Catherine\'s 1', 'Pembroke 3'], ['Exeter 1']],
    finish: [['Oriel 1', 'St Catherine\'s 1', 'Christ Church 1'], ['Pembroke 3', 'Pembroke 1', 'Exeter 1'], ['Worcester 1']],
    gender: 'M',
    move: [[[0, 0, -1], [-1, 2, 0], [0]], [[0, -1, 1], [0, -1, 1], [0]], [[0, 0, 0], [0, 0, -1], [1]], [[0, 0, 0], [-1, 1, 0], [0]]],
    result: '',
    results: 'r rru urr\n\
r rur rur\n\
r urr rrrr\n\
r rru rrrr\n',
    set: 'Summer Eights',
    small: 'Short',
    year: 2016,
  };

  var actual = bumps.read_ad(data);

  test.deepEqual(actual, expected);
  test.end();
});

tape('write_flat() returns the correct flat format output.', function (test) {
  var events = [{
      completed: [],
      days: 2,
      divisions: [['Cantabs 1', 'City 1'], ['Cantabs 2', 'City 2'], ['Champs 1']],
      finish: [],
      gender: 'M',
      move: [[[0, 0], [0, -1], [1]], [[0, 0], [0, 0], [0]]],
      result: '',
      results: 'r rrr rrr\nr rrr rrr\n',
      set: 'Town Bumps',
      small: 'Short',
      year: '2013',
    }];

  var expected = 'Year,Club,Sex,Day,Crew,Start position,Position,Division\n\
2013,Cantabs,M,1,1,1,1,1\n\
2013,Cantabs,M,2,1,1,1,1\n\
2013,City,M,1,1,2,2,1\n\
2013,City,M,2,1,2,2,1\n\
2013,Cantabs,M,1,2,3,3,2\n\
2013,Cantabs,M,2,2,3,3,2\n\
2013,City,M,1,2,4,5,2\n\
2013,City,M,2,2,4,5,2\n\
2013,Champs,M,1,1,5,4,3\n\
2013,Champs,M,2,1,5,4,3\n';

  var actual = bumps.write_flat(events);

  test.equal(actual, expected);
  test.end();
});

tape('write_tg() returns the correct Tim Grainger output.', function (test) {
  var event = {
    completed: [],
    days: 2,
    divisions: [['Cantabs 1', 'City 1'], ['Cantabs 2', 'City 2'], ['Champs 1']],
    finish: [],
    gender: 'M',
    move: [[[0, 0], [0, -1], [1]], [[0, 0], [0, 0], [0]]],
    result: '',
    results: 'rr rrr\nrr rrr\n',
    set: 'Town Bumps',
    small: 'Short',
    year: '2013',
  };

  var expected = 'Set,Town Bumps\n\
Short,Short\n\
Gender,M\n\
Year,2013\n\
Days,2\n\
\n\
Division,Cantabs 1,City 1\n\
Division,Cantabs 2,City 2\n\
Division,Champs 1\n\
\n\
Results\nrr rrr\n\
rr rrr\n';
  var actual = bumps.write_tg(event);

  test.equal(actual, expected);
  test.end();
});

tape('round-trip flat format.', function (test) {
  var data = 'Year,Club,Sex,Day,Crew,Start position,Position,Division\n\
2013,Cantabs,M,1,1,1,1,1\n\
2013,Cantabs,M,2,1,1,1,1\n\
2013,City,M,1,1,2,2,1\n\
2013,City,M,2,1,2,2,1\n\
2013,Cantabs,M,1,2,3,3,2\n\
2013,Cantabs,M,2,2,3,3,2\n\
2013,City,M,1,2,4,5,2\n\
2013,City,M,2,2,4,5,2\n\
2013,Champs,M,1,1,5,4,3\n\
2013,Champs,M,2,1,5,4,3\n';

  var expected = data;
  var actual = bumps.write_flat(bumps.read_flat(data));

  test.equal(actual, expected);
  test.end();
});

tape('round-trip tg format.', function (test) {
  var data = `Set,Town Bumps
Short,Short
Gender,Men
Year,2013
Days,2

Division,Cantabs 1,City 1
Division,Cantabs 2,City 2
Division,Champs 1

Results
r ur rrr
r rrr rrr`;

  var expected = data;
  var actual = bumps.write_tg(bumps.read_tg(data));

  test.equal(actual, expected);
  test.end();
});

tape('round-trip from flat format to tg format.', function (test) {
  var data = 'Year,Club,Sex,Day,Crew,Start position,Position,Division\n\
2013,Cantabs,M,1,1,1,1,1\n\
2013,Cantabs,M,2,1,1,4,1\n\
2013,Cantabs,M,3,1,1,5,1\n\
2013,City,M,1,1,2,2,1\n\
2013,City,M,2,1,2,3,1\n\
2013,City,M,3,1,2,3,1\n\
2013,Rob Roy,M,1,1,3,3,1\n\
2013,Rob Roy,M,2,1,3,2,1\n\
2013,Rob Roy,M,3,1,3,2,1\n\
2013,99,M,1,1,4,4,1\n\
2013,99,M,2,1,4,1,1\n\
2013,99,M,3,1,4,1,1\n\
2013,Cantabs,M,1,2,5,5,2\n\
2013,Cantabs,M,2,2,5,5,2\n\
2013,Cantabs,M,3,2,5,6,2\n\
2013,City,M,1,2,6,7,2\n\
2013,City,M,2,2,6,6,2\n\
2013,City,M,3,2,6,4,2\n\
2013,Champs,M,1,1,7,6,3\n\
2013,Champs,M,2,1,7,7,3\n\
2013,Champs,M,3,1,7,7,3\n';

  var expected = 'Set,Town Bumps\n\
Short,Short\n\
Gender,M\n\
Year,2013\n\
Days,3\n\n\
Division,Cantabs 1,City 1,Rob Roy 1,99 1\n\
Division,Cantabs 2,City 2\n\
Division,Champs 1\n\
\n\
Results\n\
r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n';
  var actual = bumps.write_tg(bumps.read_flat(data)[0]);

  test.equal(actual, expected);
  test.end();
});

tape('round-trip from tg format to flat format.', function (test) {
  var data = 'Set,Town Bumps\n\
Short,Short\n\
Gender,M\n\
Year,2013\n\
Days,3\n\n\
Division,Cantabs 1,City 1,Rob Roy 1,99 1\n\
Division,Cantabs 2,City 2\n\
Division,Champs 1\n\
\n\
Results\n\
r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n';
  var expected = 'Year,Club,Sex,Day,Crew,Start position,Position,Division\n\
2013,Cantabs,M,1,1,1,1,1\n\
2013,Cantabs,M,2,1,1,4,1\n\
2013,Cantabs,M,3,1,1,5,1\n\
2013,City,M,1,1,2,2,1\n\
2013,City,M,2,1,2,3,1\n\
2013,City,M,3,1,2,3,1\n\
2013,Rob Roy,M,1,1,3,3,1\n\
2013,Rob Roy,M,2,1,3,2,1\n\
2013,Rob Roy,M,3,1,3,2,1\n\
2013,99,M,1,1,4,4,1\n\
2013,99,M,2,1,4,1,1\n\
2013,99,M,3,1,4,1,1\n\
2013,Cantabs,M,1,2,5,5,2\n\
2013,Cantabs,M,2,2,5,5,2\n\
2013,Cantabs,M,3,2,5,6,2\n\
2013,City,M,1,2,6,7,2\n\
2013,City,M,2,2,6,6,2\n\
2013,City,M,3,2,6,4,2\n\
2013,Champs,M,1,1,7,6,3\n\
2013,Champs,M,2,1,7,7,3\n\
2013,Champs,M,3,1,7,7,3\n';

  var actual = bumps.write_flat([bumps.read_tg(data)]);

  test.equal(actual, expected);
  test.end();
});
