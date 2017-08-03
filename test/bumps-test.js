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
    completed: [[true, true, true], [true, true, true], [true, true, true], [true, true, true]],
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
    small: 'Eights',
    year: 2016,
  };

  var actual = bumps.read_ad(data);

  test.deepEqual(actual, expected);
  test.end();
});

tape('read_ad() returns a correct intermediate object for Torpids.', function (test) {
  var data = `TORPIDS 2017
 4  5  61   = NDay, NDiv, NCrew
 12  Women's Div I (4.30)
Magdalen                   -4  -4  -1  -2
Oriel                       1   0   0   0
Pembroke                    0  -1  -1   0
Christ Church               2   0  -1   0
Wadham                      1   1   1   0
University                 -2   0   0   0
Wolfson                     1   1   1  -5
Hertford                    1   1   0   2
New College                -1  -1  -2   0
St John's                   1   2   0   1
Balliol                    -1  -1  -1  -2
Keble                       1   1   1   2
 12  Women's Div II (3.30)
S.E.H.                      0  -2  -2  -1
Lincoln                     0   2   1   1
Trinity                    -1  -3   1   1
Jesus                       1   1   2   1
St Catherine's             -3  -5  -1  -1
Somerville                  1   1   1   1
Linacre                     0   1  -2  -1
Green Templeton             2   1   1   1
Worcester                  -1   1  -1  -2
St Anne's                   1   1   1   0
St Hugh's                  -2  -2  -1  -1
Brasenose                   1   0  -2   0
 12  Women's Div III (2.30)
L.M.H.                      1   2   1   1
Mansfield                   0   2   1   1
Corpus Christi             -2  -4  -4  -1
Wolfson II                  1   1   2   1
Wadham II                   1   0   1   1
Exeter                     -1   1   1   1
Queen's                     1   1  -1   0
St Hilda's                  0   1   0   0
St Peter's                 -1   0   0  -1
Merton                      1   1   0   0
St Antony's                 0   0   2   0
New College II             -1  -2  -4  -2
 12  Women's Div IV (1.30)
St John's II               -1   2   0  -1
Pembroke II                 2  -1  -1   2
Regent's Park              -3   1   1   1
Lincoln II                  0   0   1  -3
Oriel II                    2   1   3   1
Worcester II                1  -3  -2  -3
University II              -6  -1   1  -1
Wolfson III                 1   1   1   0
Somerville II               1   1   1   2
Jesus II                    1  -2   0   1
Magdalen II                -1  -1  -3  -3
Linacre II                  2   1   0   1
 13  *Women's Div V (12.30)
Balliol II                  2   1   2   1
Lincoln III                 0   2   0   0
Christ Church II           -5  -1   0  -1
Hertford II                 1  -4   1   0
Trinity II                  1   1   1   3
Wadham III                  1   0  -3   0
St Anne's II                1   2   1   0
Mansfield II                1   1   1   1
St Hilda's II              -1  -1  -1   1
Keble II                    1   1   1   2
Exeter II                  -1  -1   2  -2
Merton II                   1   1  -3   1
L.M.H. II                   0   1   2   1
`;

  var expected = {
    set: 'Torpids',
    small: 'Torpids',
    gender: 'Women',
    result: '',
    year: 2017,
    days: 4,
    divisions:
    [['Magdalen 1',
      'Oriel 1',
      'Pembroke 1',
      'Christ Church 1',
      'Wadham 1',
      'University 1',
      'Wolfson 1',
      'Hertford 1',
      'New College 1',
      'St John\'s 1',
      'Balliol 1',
      'Keble 1'],
    ['S.E.H. 1',
      'Lincoln 1',
      'Trinity 1',
      'Jesus 1',
      'St Catherine\'s 1',
      'Somerville 1',
      'Linacre 1',
      'Green Templeton 1',
      'Worcester 1',
      'St Anne\'s 1',
      'St Hugh\'s 1',
      'Brasenose 1'],
    ['L.M.H. 1',
      'Mansfield 1',
      'Corpus Christi 1',
      'Wolfson 2',
      'Wadham 2',
      'Exeter 1',
      'Queen\'s 1',
      'St Hilda\'s 1',
      'St Peter\'s 1',
      'Merton 1',
      'St Antony\'s 1',
      'New College 2'],
    ['St John\'s 2',
      'Pembroke 2',
      'Regent\'s Park 1',
      'Lincoln 2',
      'Oriel 2',
      'Worcester 2',
      'University 2',
      'Wolfson 3',
      'Somerville 2',
      'Jesus 2',
      'Magdalen 2',
      'Linacre 2'],
    ['Balliol 2',
      'Lincoln 3',
      'Christ Church 2',
      'Hertford 2',
      'Trinity 2',
      'Wadham 3',
      'St Anne\'s 2',
      'Mansfield 2',
      'St Hilda\'s 2',
      'Keble 2',
      'Exeter 2',
      'Merton 2',
      'L.M.H. 2']],
    results: `re1e-1e1e-1e1e1e1e1e1e-5rr e2e2e-1e1e1e1e-6e1e2re-3e2e-1 re-1re1e-1re1e-1e1e1e-2rr e1e1e-2e1e-1e2re1e-3e1e-1rr re1e-1e1e-1e1e1e-2e1e2re1e-4
e1e-1e1e-1e1e-1e1e2re1e-4e2e-1 re-1e1e1e-2e1e1e1e-3re1e2e-2 re-1rre1e1e1e1e-4re1e2e-2 re2re1e1e-5e1e1e1e-3e1e2e-2 re-1e1e-1e2re1e1e-4e1e-1rr
e2e2e-1e-3re1e1e1e-3e1e1e1e-3 rrre2re-2e1e1e1e1e-4e3e-1 rre2re-4rre1e-1e1e-1e2e-1 re1e-2e1e-1e1e1e-2e1e1e-2e2e-1 re1e-2e1e-1rrre1e-1e1e-1r
e1e1e-2e1e-1re2re1e-3re3e-1 rre1e-3e1e1e-2e2re1e-3e2e-1 re-1e1e-1rrrre1e-1e1e-1r re1e1e-2e1e-1re1e-1e1e1e-2r re1e1e-2e2re1e2re-5rrr`,
    move:
    [[[-4, 1, 0, 2, 1, -2, 1, 1, -1, 1, -1, 1],
    [0, 0, -1, 1, -3, 1, 0, 2, -1, 1, -2, 1],
    [1, 0, -2, 1, 1, -1, 1, 0, -1, 1, 0, -1],
    [-1, 2, -3, 0, 2, 1, -6, 1, 1, 1, -1, 2],
    [2, 0, -5, 1, 1, 1, 1, 1, -1, 1, -1, 1, 0]],
    [[0, 0, -1, 1, -4, 1, 1, 0, 2, -1, 1, -1],
    [-2, 2, 1, -3, 1, 1, 1, -5, 1, 1, 0, 2],
    [-2, 2, 1, 0, -4, 1, 1, 1, 1, 0, 0, -1],
    [-2, 2, 1, 0, -3, 1, 1, 1, -2, 1, 1, -1],
    [-1, 2, -4, 1, 0, 2, 1, -1, 1, -1, 1, -1, 1]],
    [[0, -1, 1, -1, 1, 0, 0, 0, -1, 1, -2, 1],
    [-1, 2, -2, 1, 1, -2, 1, 1, -1, 1, -2, 1],
    [-1, 2, -1, 1, -1, 1, 0, 0, -4, 0, 2, 0],
    [-1, 3, -4, 1, 1, 1, 1, -2, 0, 2, 0, 0],
    [-3, 1, 1, 1, -3, 1, 1, 1, 0, -3, -1, 2, 2]],
    [[0, 0, 0, -5, 0, 2, 1, 0, 2, -2, 1, 1],
    [0, -2, 1, 1, -1, 1, 0, -1, 1, -2, 1, 1],
    [0, -1, 1, -1, 1, 0, 0, 0, 0, -1, 1, -1],
    [-1, 2, -3, 1, 0, 2, -2, 1, 1, -3, 1, 0],
    [-1, 3, 0, -3, 1, 0, 2, 0, -1, 1, -2, 1, 1]]],
    finish:
    [['Oriel 1',
      'Wadham 1',
      'Christ Church 1',
      'Hertford 1',
      'Pembroke 1',
      'St John\'s 1',
      'Keble 1',
      'University 1',
      'Wolfson 1',
      'Lincoln 1',
      'Jesus 1',
      'Magdalen 1'],
    ['New College 1',
      'Somerville 1',
      'Green Templeton 1',
      'Balliol 1',
      'Trinity 1',
      'S.E.H. 1',
      'St Anne\'s 1',
      'L.M.H. 1',
      'Linacre 1',
      'Mansfield 1',
      'Wolfson 2',
      'Worcester 1'],
    ['Brasenose 1',
      'Wadham 2',
      'St Catherine\'s 1',
      'Exeter 1',
      'St Hugh\'s 1',
      'Queen\'s 1',
      'St Hilda\'s 1',
      'Merton 1',
      'St Antony\'s 1',
      'Oriel 2',
      'St Peter\'s 1',
      'Pembroke 2'],
    ['St John\'s 2',
      'Corpus Christi 1',
      'Regent\'s Park 1',
      'Somerville 2',
      'Wolfson 3',
      'Lincoln 2',
      'Balliol 2',
      'Linacre 2',
      'New College 2',
      'Jesus 2',
      'Trinity 2',
      'Lincoln 3'],
    ['Worcester 2',
      'University 2',
      'St Anne\'s 2',
      'Mansfield 2',
      'Keble 2',
      'Hertford 2',
      'Magdalen 2',
      'Wadham 3',
      'L.M.H. 2',
      'Christ Church 2',
      'St Hilda\'s 2',
      'Merton 2',
      'Exeter 2']],
    completed:
    [[true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true],
    [true, true, true, true, true]]
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
    results: 'r ur rrr\nr rrr rrr\n',
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
Results\nr ur rrr\n\
r rrr rrr\n';
  var actual = bumps.write_tg(event);

  test.equal(actual, expected);
  test.end();
});

tape('write_ad() returns the correct Anu Dudhia output.', function (test) {
  var event = {
    completed: [],
    days: 2,
    divisions: [['Cantabs 1', 'City 1'], ['Cantabs 2', 'City 2'], ['Champs 1']],
    finish: [],
    gender: 'Men',
    move: [[[0, 0], [0, 0], [0]], [[0, 0], [0, -1], [1]]],
    result: '',
    results: 'rr rrr\nrr rrr\n',
    set: 'Summer Eights',
    small: 'Short',
    year: '2013',
  };

  var expected = 'EIGHTS 2013\n\
 2  3  5   = NDay, NDiv, NCrew\n\
 2  Men\'s Div I\n\
Cantabs                     0   0\n\
City                        0   0\n\
 2  Men\'s Div II\n\
Cantabs II                  0   0\n\
City II                     0  -1\n\
 1  Men\'s Div III\n\
Champs                      0   1\n';

  var actual = bumps.write_ad(event);

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
Short,Town Bumps
Gender,Men
Year,2016

Division,Cantabs 1,Rob Roy 1,Rob Roy 2,99 1,St Neots 1,City 1,X-Press 1,Cantabs 2,City 2,Cantabs 3,99 2,Chesterton 1,Rob Roy 3,City 3,X-Press 2,Champs 1,99 3
Division,City 4,Cantabs 4,City 5,City 6,Champs 2,St Radegund 1,X-Press 3,Cantabs 5,City 7,X-Press 4,99 4,Rob Roy 4,City 8,St Neots 2,Cantabs 6,Chesterton 2,Champs 3
Division,Cantabs 7,Champs 4,City 9,Isle of Ely 1,Cantabs 8,St Radegund 2,Champs 5,City 10,Champs 6,City 11,Cantabs 9,Cantabs 10,99 5,X-Press 5,99 6,X-Press 6,Cantabs 11
Division,X-Press 7,99 7,Chesterton 3,Cantabs 12,Cantabs 13,Camb Veterans 1,Cantabs 14,City 12,Cantabs 15,X-Press 8

Results
rrrurrru uruuruurrrur urrururrurrru o3urrurrrrrrrrrr
urrurur ruruuruurrur rrruo3uruurur rrrurrurrrrurrr
rrurrrru uuruururuur rrrrruo3uuruu uuurrrrrrrrrrrr
rrurrrur ruruuurrrruu ruruurruurur ruuururrrrurr`;

  var expected = data;
  var actual = bumps.write_tg(bumps.read_tg(data));

  test.equal(actual, expected);
  test.end();
});

tape('round-trip ad format.', function (test) {
  var data = `TORPIDS 2016
 4  6  73   = NDay, NDiv, NCrew
 12  Men's Div I
Pembroke                    0   0   0   0
Oriel                       0   0   0   0
Magdalen                    0   0   0   0
Christ Church               0  -1  -1   0
Wolfson                     0   1   0   0
Wadham                      0   0   1   0
Hertford                    0   0   0   0
Trinity                     0  -3   0  -1
St Catherine's              0   1   0   0
Worcester                  -3   0  -1  -1
Balliol                     1   1   0   0
New College                 1   1   0   0
 12  Men's Div II
St John's                   1   0  -1   0
Lincoln                     0  -1  -1  -1
St Anne's                  -1  -1  -1  -1
Pembroke II                 1   1   2   1
S.E.H.                      0   1   1   1
Jesus                       0  -1   0   1
Brasenose                  -1  -1  -2  -1
University                  1   1   1   1
L.M.H.                      0   1   0  -1
Queen's                    -2  -1  -1   0
Merton                      1  -1   1   0
Mansfield                   1   1   1   1
 12  Men's Div III
Somerville                  0   1  -1   0
Christ Church II           -8  -2  -1  -4
Exeter                      1  -1   0   0
Keble                       1   1   2   1
Corpus Christi              1  -1   0  -1
Oriel II                    0  -3  -2  -1
St Peter's                  2   1   0   0
Balliol II                  1   1  -1  -1
Linacre                     1   0   0   1
St Hugh's                   1   2   1   1
New College II             -2  -1  -1  -1
St Antony's                 1   1   1  -1
 12  Men's Div IV
Wadham II                  -1   1   1   1
Wolfson II                  2   1   1   1
St John's II                0  -1  -7   2
Trinity II                 -1  -3   0   0
Jesus II                    1   1   1   1
Hertford II                -1   0   1   0
Green Templeton             1   1   1   2
University II              -3  -1  -1  -2
Keble II                    1   2   1   2
Wadham III                  1   0   2   0
St Catherine's II           1   0   0   0
Brasenose II               -1   0   1   0
 12  Men's Div V
Magdalen II                 1   1   2  -4
Worcester II               -1  -4  -3  -2
Lincoln II                  1   0  -2  -1
Pembroke III               -4  -3  -2  -1
Trinity III                 1   1   1   3
S.E.H. II                   1   1   1   1
Regent's Park               1   1  -1  -3
St Hugh's II                1   1   1   1
St John's III              -4  -4  -1  -1
St Hilda's                  1   1   1   1
Mansfield II               -1  -1  -1   1
Wolfson III                 2   1   1   1
 13  Men's Div VI
Exeter II                  -1   2   1   1
Merton II                   3   1   1   1
L.M.H. II                   0   1   2   1
Balliol III                 0   0   0  -1
Wolfson IV                 -1  -1  -1  -1
St John's IV                1   2   0   0
Keble III                  -1  -1   0   1
St Antony's II              1   1   1   1
Oriel III                  -2  -2   1   1
Christ Church III           0   0   0   0
S.E.H. III                  2   1   1   1
Corpus Christi II           0   1   0  -2
Balliol IV                  0   1  -1   1
`;

  var expected = data;
  var actual = bumps.write_ad(bumps.read_ad(data));

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
