var tape = require("tape");
var bumps = require('../');

tape("Join events correctly.", function (test) {
    var data = [
        {
            crews: [
                { name: 'Cantabs 1', values: [{ day: 0, pos: 1 }, { day: 1, pos: 1 }, { day: 2, pos: 1 }, { day: 3, pos: 1 }, { day: 4, pos: 1 }] },
                { name: 'City 1', values: [{ day: 0, pos: 2 }, { day: 1, pos: 2 }, { day: 2, pos: 2 }, { day: 3, pos: 2 }, { day: 4, pos: 2 }] },
            ],
            divisions: [
                { start: 0, length: 2 },
            ],
            year: 2013,
        },
        {
            crews: [
                { name: 'Cantabs 1', values: [{ day: 0, pos: 1 }, { day: 1, pos: 2 }, { day: 2, pos: 2 }, { day: 3, pos: 2 }, { day: 4, pos: 2 }] },
                { name: 'City 1', values: [{ day: 0, pos: 2 }, { day: 1, pos: 1 }, { day: 2, pos: 1 }, { day: 3, pos: 1 }, { day: 4, pos: 1 }] },
            ],
            divisions: [
                { start: 0, length: 2 },
            ],
            year: 2014,
        }
    ];

    var expected = {
        crews: [
            {
                gender: 'Women',
                name: 'Cantabs 1',
                set: 'Lent Bumps',
                values: [
                    { day: 0, pos: 1 },
                    { day: 1, pos: 1 },
                    { day: 2, pos: 1 },
                    { day: 3, pos: 1 },
                    { day: 4, pos: 1 },
                    { day: 5, pos: 1 },
                    { day: 6, pos: 2 },
                    { day: 7, pos: 2 },
                    { day: 8, pos: 2 },
                    { day: 9, pos: 2 },
                ],
                valuesSplit: [
                    {
                        blades: true, day: 0, gender: 'Women', name: 'Cantabs 1', set: 'Lent Bumps', spoons: false, values: [
                            { day: 0, pos: 1 },
                            { day: 1, pos: 1 },
                            { day: 2, pos: 1 },
                            { day: 3, pos: 1 },
                            { day: 4, pos: 1 },
                        ],
                    },
                    {
                        blades: false, day: 5, gender: 'Women', name: 'Cantabs 1', set: 'Lent Bumps', spoons: true, values: [
                            { day: 5, pos: 1 },
                            { day: 6, pos: 2 },
                            { day: 7, pos: 2 },
                            { day: 8, pos: 2 },
                            { day: 9, pos: 2 },
                        ]
                    },
                ],
            },
            {
                gender: 'Women',
                name: 'City 1',
                set: 'Lent Bumps',
                values: [
                    { day: 0, pos: 2 },
                    { day: 1, pos: 2 },
                    { day: 2, pos: 2 },
                    { day: 3, pos: 2 },
                    { day: 4, pos: 2 },
                    { day: 5, pos: 2 },
                    { day: 6, pos: 1 },
                    { day: 7, pos: 1 },
                    { day: 8, pos: 1 },
                    { day: 9, pos: 1 },
                ],
                valuesSplit: [
                    {
                        blades: false, day: 0, gender: 'Women', name: 'City 1', set: 'Lent Bumps', spoons: true, values: [
                            { day: 0, pos: 2 },
                            { day: 1, pos: 2 },
                            { day: 2, pos: 2 },
                            { day: 3, pos: 2 },
                            { day: 4, pos: 2 },
                        ],
                    },
                    {
                        blades: true, day: 5, gender: 'Women', name: 'City 1', set: 'Lent Bumps', spoons: false, values: [
                            { day: 5, pos: 2 },
                            { day: 6, pos: 1 },
                            { day: 7, pos: 1 },
                            { day: 8, pos: 1 },
                            { day: 9, pos: 1 },
                        ],
                    },
                ],
            },
        ],
        divisions: [
            { divisions: [{ length: 2, start: 0, year: 2013 }], gender: 'Women', set: 'Lent Bumps' },
            { divisions: [{ length: 2, start: 0, year: 2014 }], gender: 'Women', set: 'Lent Bumps' },
        ],
    endYear: 2014,
    maxCrews: 2,
    startYear: 2013,
    };

var actual = bumps.joinEvents(data, 'Lent Bumps', 'Women');

test.deepEqual(actual, expected);
test.end();
})


tape("Join incomplete events correctly.", function (test) {
    var data = [
        {
            crews: [
                { name: 'Cantabs 1', values: [{ day: 0, pos: 1 }, { day: 1, pos: 1 }, { day: 2, pos: 1 }, { day: 3, pos: 1 }, { day: 4, pos: 1 }] },
                { name: 'City 1', values: [{ day: 0, pos: 2 }, { day: 1, pos: 2 }, { day: 2, pos: 2 }, { day: 3, pos: 2 }, { day: 4, pos: 2 }] },
            ],
            divisions: [
                { start: 0, length: 2 },
            ],
            year: 2013,
        },
        {
            crews: [
                { name: 'Cantabs 1', values: [{ day: 0, pos: 1 }] },            ],
            divisions: [
                { start: 0, length: 1 },
            ],
            year: 2014,
        }
    ];

    var expected = {
        crews: [
            {
                gender: 'Women',
                name: 'Cantabs 1',
                set: 'Lent Bumps',
                values: [
                    { day: 0, pos: 1 },
                    { day: 1, pos: 1 },
                    { day: 2, pos: 1 },
                    { day: 3, pos: 1 },
                    { day: 4, pos: 1 },
                    { day: 5, pos: 1 },
                    { day: 6, pos: -1 },
                    { day: 7, pos: -1 },
                    { day: 8, pos: -1 },
                    { day: 9, pos: -1 },
                ],
                valuesSplit: [
                    {
                        blades: true, day: 0, gender: 'Women', name: 'Cantabs 1', set: 'Lent Bumps', spoons: false, values: [
                            { day: 0, pos: 1 },
                            { day: 1, pos: 1 },
                            { day: 2, pos: 1 },
                            { day: 3, pos: 1 },
                            { day: 4, pos: 1 },
                        ],
                    },
                    {
                        blades: true, day: 5, gender: 'Women', name: 'Cantabs 1', set: 'Lent Bumps', spoons: true, values: [
                            { day: 5, pos: 1 },
                            { day: 6, pos: -1 },
                            { day: 7, pos: -1 },
                            { day: 8, pos: -1 },
                            { day: 9, pos: -1 },
                        ]
                    },
                ],
            },
            {
                gender: 'Women',
                name: 'City 1',
                set: 'Lent Bumps',
                values: [
                    { day: 0, pos: 2 },
                    { day: 1, pos: 2 },
                    { day: 2, pos: 2 },
                    { day: 3, pos: 2 },
                    { day: 4, pos: 2 },
                    { day: 5, pos: -1 },
                    { day: 6, pos: -1 },
                    { day: 7, pos: -1 },
                    { day: 8, pos: -1 },
                    { day: 9, pos: -1 },
                ],
                valuesSplit: [
                    {
                        blades: false, day: 0, gender: 'Women', name: 'City 1', set: 'Lent Bumps', spoons: true, values: [
                            { day: 0, pos: 2 },
                            { day: 1, pos: 2 },
                            { day: 2, pos: 2 },
                            { day: 3, pos: 2 },
                            { day: 4, pos: 2 },
                        ],
                    },
                ],
            },
        ],
        divisions: [
            { divisions: [{ length: 2, start: 0, year: 2013 }], gender: 'Women', set: 'Lent Bumps' },
            { divisions: [{ length: 1, start: 0, year: 2014 }], gender: 'Women', set: 'Lent Bumps' },
        ],
    endYear: 2014,
    maxCrews: 2,
    startYear: 2013,
    };

var actual = bumps.joinEvents(data, 'Lent Bumps', 'Women');

test.deepEqual(actual, expected);
test.end();
})