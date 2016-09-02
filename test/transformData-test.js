var tape = require("tape");
var bumps = require('../');

tape("Transform data correctly.", function (test) {
    var data = {
        completed: [[true, true, true], [true, true, true], [true, true, true], [true, true, true]],
        days: 4,
        divisions: [['Cantabs 1', 'City 1', 'Rob Roy 1', '99 1'], ['Cantabs 2', 'City 2'], ['Champs 1']],
        finish: [['99 1', 'Rob Roy 1', 'City 1', 'City 2'], ['Cantabs 1', 'Cantabs 2'], ['Champs 1']],
        gender: 'M',
        move: [[[0, 0, 0, 0], [0, -1], [1]], [[-3, -1, 1, 3], [0, -1], [1]], [[0, 0, 0, -1], [-1, 2], [0]], [[0, 0, 0, 0], [0, 0], [0]]],
        result: '',
        results: 'r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n\
r rrr rrrrr',
        set: 'Town Bumps',
        small: 'Short',
        year: 2013,
    }

    var expected = {
        crews: [
            { name: 'Cantabs 1', values: [{ day: 0, pos: 1 }, { day: 1, pos: 1 }, { day: 2, pos: 4 }, { day: 3, pos: 5 }, { day: 4, pos: 5 }] },
            { name: 'City 1', values: [{ day: 0, pos: 2 }, { day: 1, pos: 2 }, { day: 2, pos: 3 }, { day: 3, pos: 3 }, { day: 4, pos: 3 }] },
            { name: 'Rob Roy 1', values: [{ day: 0, pos: 3 }, { day: 1, pos: 3 }, { day: 2, pos: 2 }, { day: 3, pos: 2 }, { day: 4, pos: 2 }] },
            { name: '99 1', values: [{ day: 0, pos: 4 }, { day: 1, pos: 4 }, { day: 2, pos: 1 }, { day: 3, pos: 1 }, { day: 4, pos: 1 }] },
            { name: 'Cantabs 2', values: [{ day: 0, pos: 5 }, { day: 1, pos: 5 }, { day: 2, pos: 5 }, { day: 3, pos: 6 }, { day: 4, pos: 6 }] },
            { name: 'City 2', values: [{ day: 0, pos: 6 }, { day: 1, pos: 7 }, { day: 2, pos: 6 }, { day: 3, pos: 4 }, { day: 4, pos: 4 }] },
            { name: 'Champs 1', values: [{ day: 0, pos: 7 }, { day: 1, pos: 6 }, { day: 2, pos: 7 }, { day: 3, pos: 7 }, { day: 4, pos: 7 }] },
        ],
        divisions: [
            { length: 4, start: 1 },
            { length: 2, start: 5 },
            { length: 1, start: 7 },
        ],
        year: 2013,
    };

    var actual = bumps.transformData(data);

    test.deepEqual(actual, expected);
    test.end();
})

tape("Transform incomplete data correctly.", function (test) {
    var data = {
        completed: [[true, true, true], [true, true, true], [true, true, true], [false, false, false]],
        days: 4,
        divisions: [['Cantabs 1', 'City 1', 'Rob Roy 1', '99 1'], ['Cantabs 2', 'City 2'], ['Champs 1']],
        finish: [['99 1', 'Rob Roy 1', 'City 1', 'City 2'], ['Cantabs 1', 'Cantabs 2'], ['Champs 1']],
        gender: 'M',
        move: [[[0, 0, 0, 0], [0, -1], [1]], [[-3, -1, 1, 3], [0, -1], [1]], [[0, 0, 0, -1], [-1, 2], [0]]],
        result: '',
        results: 'r ur rrrrr\n\
r ur ro3u\n\
r ru urrr\n\
r rrr rrrrr',
        set: 'Town Bumps',
        small: 'Short',
        year: 2013,
    }

    var expected = {
        crews: [
            { name: 'Cantabs 1', values: [{ day: 0, pos: 1 }, { day: 1, pos: 1 }, { day: 2, pos: 4 }, { day: 3, pos: 5 }] },
            { name: 'City 1', values: [{ day: 0, pos: 2 }, { day: 1, pos: 2 }, { day: 2, pos: 3 }, { day: 3, pos: 3 }] },
            { name: 'Rob Roy 1', values: [{ day: 0, pos: 3 }, { day: 1, pos: 3 }, { day: 2, pos: 2 }, { day: 3, pos: 2 }] },
            { name: '99 1', values: [{ day: 0, pos: 4 }, { day: 1, pos: 4 }, { day: 2, pos: 1 }, { day: 3, pos: 1 }] },
            { name: 'Cantabs 2', values: [{ day: 0, pos: 5 }, { day: 1, pos: 5 }, { day: 2, pos: 5 }, { day: 3, pos: 6 }] },
            { name: 'City 2', values: [{ day: 0, pos: 6 }, { day: 1, pos: 7 }, { day: 2, pos: 6 }, { day: 3, pos: 4 }] },
            { name: 'Champs 1', values: [{ day: 0, pos: 7 }, { day: 1, pos: 6 }, { day: 2, pos: 7 }, { day: 3, pos: 7 }] },
        ],
        divisions: [
            { length: 4, start: 1 },
            { length: 2, start: 5 },
            { length: 1, start: 7 },
        ],
        year: 2013,
    };

    var actual = bumps.transformData(data);

    test.deepEqual(actual, expected);
    test.end();
})
