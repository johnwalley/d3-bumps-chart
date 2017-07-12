import findKey from 'lodash-es/findKey';
import uniq from 'lodash-es/uniq';
import uniqBy from 'lodash-es/uniqBy';
import padEnd from 'lodash-es/padEnd';
import padStart from 'lodash-es/padStart';

import { csvParse } from 'd3-dsv';
import { min, max } from 'd3-array';

import { widthOfOneYear } from './chart';

export const abbrevCamCollege = {
  'A': 'Addenbrooke\'s',
  'AR': 'Anglia Ruskin',
  'Ca': 'Caius',
  'CC': 'Corpus Christi',
  'CH': 'Clare Hall',
  'Cl': 'Clare',
  'Cr': 'Christ\'s',
  'CT': 'CCAT',
  'Cu': 'Churchill',
  'D': 'Downing',
  'Dw': 'Darwin',
  'E': 'Emmanuel',
  'F': 'Fitzwilliam',
  'G': 'Girton',
  'H': 'Homerton',
  'HH': 'Hughes Hall',
  'HHL': 'Hughes/Lucy',
  'J': 'Jesus',
  'K': 'King\'s',
  'L': 'LMBC',
  'LC': 'Lucy Cavendish',
  'M': 'Magdalene',
  'ME': 'Murray Edwards',
  'N': 'Newnham',
  'NH': 'New Hall',
  'Pb': 'Pembroke',
  'Ph': 'Peterhouse',
  'Q': 'Queens\'',
  'QM': 'QMABC',
  'R': 'Robinson',
  'S': 'Selwyn',
  'SC': 'St Catharine\'s',
  'SE': 'St Edmund\'s',
  'SS': 'Sidney Sussex',
  'T': '1st and 3rd',
  'TC': 'Theological Colleges',
  'TH': 'Trinity Hall',
  'VS': 'Vet School',
  'W': 'Wolfson'
};

export const abbrevOxCollege = {
  'B': 'Balliol',
  'Br': 'Brasenose',
  'Ch': 'Christ Church',
  'Co': 'Corpus Christi',
  'E': 'Exeter',
  'H': 'Hertford',
  'J': 'Jesus',
  'K': 'Keble',
  'L': 'Linacre',
  'Lc': 'Lincoln',
  'LM': 'L.M.H.',
  'Mg': 'Magdalen',
  'Mf': 'Mansfield',
  'Mt': 'Merton',
  'N': 'New College',
  'O': 'Oriel',
  'OG': 'Osler-Green',
  'P': 'Pembroke',
  'Q': 'Queen\'s',
  'R': 'Regent\'s Park',
  'SE': 'S.E.H.',
  'S': 'Somerville',
  'SAn': 'St Anne\'s',
  'SAt': 'St Antony\'s',
  'SB': 'St Benet\'s Hall',
  'SC': 'St Catherine\'s',
  'SHi': 'St Hilda\'s',
  'SHu': 'St Hugh\'s',
  'SJ': 'St John\'s',
  'SP': 'St Peter\'s',
  'T': 'Trinity',
  'U': 'University',
  'Wh': 'Wadham',
  'Wf': 'Wolfson',
  'Wt': 'Worcester'
};

export const abbrevCamTown = {
  'A': 'Addenbrooke\'s',
  'CB': 'Camb Blue',
  'CV': 'Camb Veterans',
  'Ct': 'Cantabs',
  'Cy': 'City',
  'Ca': 'Caius',
  'CT': 'CCAT',
  'Cr': 'Christ\'s',
  'Cu': 'Churchill',
  'CH': 'Clare Hall',
  'Cl': 'Clare',
  'CC': 'Corpus Christi',
  'COT': 'Champs',
  'Dn': 'Domino',
  'Dw': 'Darwin',
  'D': 'Downing',
  'E': 'Emmanuel',
  'F': 'Fitzwilliam',
  'FP': 'Free Press',
  'G': 'Girton',
  'H': 'Homerton',
  'HH': 'Hughes Hall',
  'Hn': 'Hornets',
  'I': 'Ionica',
  'IOE': 'Isle of Ely',
  'J': 'Jesus',
  'K': 'King\'s',
  'L': 'LMBC',
  'LC': 'Lucy Cavendish',
  'LS': 'Lady Somerset',
  'M': 'Magdalene',
  'ME': 'Maximum Entropy',
  'MM': 'Mott MacDonald',
  'NH': 'New Hall',
  'N': 'Newnham',
  'NN': '99',
  'Pb': 'Pembroke',
  'Ph': 'Peterhouse',
  'QM': 'QMABC',
  'Q': 'Queens\'',
  'RR': 'Rob Roy',
  'R': 'Robinson',
  'Sm': 'Simoco',
  'SI': 'St Ives',
  'SN': 'St Neots',
  'SR': 'St Radegund',
  'S': 'Selwyn',
  'SS': 'Sidney Sussex',
  'SC': 'St Catharine\'s',
  'SE': 'St Edmund\'s',
  'T': '1st & 3rd',
  'TC': 'Theological Colleges',
  'Te': 'Telephones',
  'TH': 'Trinity Hall',
  'US': 'Univ Sports',
  'VS': 'Vet School',
  'W': 'Wolfson',
  'X': 'X-Press'
};

const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];

export function abbreviate(event) {
  for (let div = 0; div < event.divisions.length; div++) {
    for (let pos = 0; pos < event.divisions[div].length; pos++) {
      event.divisions[div][pos] = abbreviateCrew(event.divisions[div][pos], event.set);
    }
  }

  for (let div = 0; div < event.finish.length; div++) {
    for (let pos = 0; pos < event.finish[div].length; pos++) {
      event.finish[div][pos] = abbreviateCrew(event.finish[div][pos], event.set);
    }
  }

  return event;
}

export function abbreviateCrew(crew, set) {
  const name = crew.replace(/[0-9]+$/, '').trim();
  const num = +crew.substring(name.length);

  let abbrev;

  switch (set) {
    case 'Lent Bumps':
    case 'May Bumps':
      abbrev = abbrevCamCollege;
      break;
    case 'Torpids':
    case 'Summer Eights':
      abbrev = abbrevOxCollege;
      break;
    case 'Town Bumps':
      abbrev = abbrevCamTown;
      break;
    default:
      throw 'Unrecognised set: ' + set;
  }

  if (findKey(abbrev, club => club === name) !== undefined) {
    return findKey(abbrev, club => club === name) + (num > 1 ? num : '');
  } else {
    return crew;
  }
}

export function expandCrew(crew, set) {
  const name = crew.replace(/[0-9]+$/, '').trim();
  const num = +crew.substring(name.length);

  let abbrev;

  switch (set) {
    case 'Lent Bumps':
    case 'May Bumps':
      abbrev = abbrevCamCollege;
      break;
    case 'Torpids':
    case 'Summer Eights':
      abbrev = abbrevOxCollege;
      break;
    case 'Town Bumps':
      abbrev = abbrevCamTown;
      break;
    default:
      throw 'Unrecognised set: ' + set;
  }

  if (abbrev.hasOwnProperty(name)) {
    return abbrev[name] + (num > 1 ? num : '');
  } else {
    return crew;
  }
}

export function renderName(name, set) {
  // College crews are stored as an abbrevation and we replace the number with Roman numerals
  const sh = name.replace(/[0-9]/, '');

  let abbrev;
  let type;

  switch (set) {
    case 'Lent Bumps':
    case 'May Bumps':
      abbrev = abbrevCamCollege;
      type = 'college';
      break;
    case 'Torpids':
    case 'Summer Eights':
      abbrev = abbrevOxCollege;
      type = 'college';
      break;
    case 'Town Bumps':
      abbrev = abbrevCamTown;
      type = 'town';
      break;
    default:
      return name;
  }

  if (abbrev.hasOwnProperty(sh)) {
    const num = name.substring(sh.length);
    name = abbrev[sh];

    if (type === 'college' && num.length > 0) {
      name = name + ' ' + roman[+num - 1];
    } else if (type === 'town' && num.length > 0 && (+num) > 1) {
      name = name + ' ' + (+num);
    }

    return name;
  } else {
    // First boats should not have a number rendered
    if (type === 'college') {
      const num = name.substring(sh.length);

      if (num.length > 0) {
        name = sh.trim() + (((+num) > 1) ? ' ' + roman[+num - 1] : '');
      }

      return name;
    } else if (type === 'town' && name.substring(name.length - 2) === ' 1') {
      return name.substring(0, name.length - 2);
    }
  }

  return name;
}

function normalizeOxfordName(name) {
  const parts = name.split(/\s/);

  let newName = name + ' 1';

  roman.forEach((num, index) => {
    if (parts[parts.length - 1] === num) {
      newName = parts.slice(0, parts.length - 1).join(' ') + ' ' + (index + 1);
    }
  });

  return newName;
}

export function crewColor(name) {
  const camCollegeColor = {
    'A': '#0000ff',
    'AR': '#ffff00',
    'Ca': '#afe9c6',
    'CC': '#800000',
    'CH': '#ffff00',
    'Cl': '#ffff00',
    'Cr': '#000080',
    'CT': '##ffff00',
    'Cu': '#ff55dd',
    'D': '#d400aa',
    'Dw': '#000080',
    'E': '#eeaaff',
    'F': '#808080',
    'G': '#005500',
    'H': '#000000',
    'HH': '#0096ff',
    'HHL': '#0044aa',
    'J': '#8b0000',
    'K': '#5a2ca0',
    'L': '#ff0000',
    'LC': '#0044aa',
    'M': '#672178',
    'ME': '#000000',
    'N': '#010040',
    'NH': '#000000',
    'Pb': '#afe9dd',
    'Ph': '#003380',
    'Q': '#008001',
    'QM': '#808080',
    'R': '#007fff',
    'S': '#f9cc00',
    'SC': '#9d0064',
    'SE': '#0300fd',
    'SS': '#000080',
    'T': '#000080',
    'TC': '#000000',
    'TH': '#000000',
    'VS': '#000000',
    'W': '#5599ff'
  };

  const oxCollegeColor = {
    'Oriel': '#372e63'
  }

  const townColor = {
    'City': '#f44336',
    'Champs': '#f57400',
    'Rob Roy': '#8b0000',
    'Cantabs': '#00008b',
    '99': '#5197ff',
    'Chesterton': '#ffff00',
    'Simoco': '#ffff00',
    'Pye': '#ffff00',
    'St Neots': '#b9dcff',
    'X-Press': '#000000',
    'Camb Blue': '#000000',
    'Free Press': '#000000',
    'St Radegund': '#ffff00',
    'Camb Veterans': '#91b9a4',
    'Isle of Ely': '#9ed5b8',
    'Max Entropy': '#f44336',
    'St Ives': '#e90000',
    'Sharks': '#e90000'
  };

  const sh = name.replace(/[0-9]/, '');

  if (camCollegeColor.hasOwnProperty(sh)) {
    return camCollegeColor[sh];
  }

  const club = name.substring(0, name.length - 2).trim();

  if (townColor.hasOwnProperty(club)) {
    return townColor[club];
  } else if (oxCollegeColor.hasOwnProperty(club)) {
    return oxCollegeColor[club];
  }

  return '#f44336';
}

export function isBlades(positions) {
  for (let i = 0; i < positions.length - 1; i++) {
    if (positions[i + 1] - positions[i] >= 0 && positions[i + 1] !== 1) {
      return false;
    }
  }

  return true;
}

export function isSpoons(positions, bottomPosition = Number.MAX_SAFE_INTEGER) {
  for (let i = 0; i < positions.length - 1; i++) {
    if (positions[i + 1] - positions[i] <= 0 && positions[i + 1] !== bottomPosition) {
      return false;
    }
  }

  return true;
}

export function joinEvents(events, set, gender) {
  const years = [];
  const data = [];
  const divisions = [];
  let crewNames = [];

  events.forEach(event => {
    crewNames = crewNames.concat(event.crews.map(crew => crew.name));
    years.push(event.year);
    divisions.push({
      set: set,
      gender: gender,
      year: event.year,
      divisions: event.divisions.map(d => ({ year: event.year, start: d.start, length: d.length }))
    });
  });

  const startYear = min(years);
  const endYear = max(years);

  const uniqueCrewNames = uniq(crewNames);

  const maxCrews = max(events.map(e => e.crews.length));

  uniqueCrewNames.forEach(crewName => {
    const newCrew = { name: crewName, set: set, gender: gender, values: [], valuesSplit: [] };
    const numDays = 4;

    events.forEach(event => {
      const match = event.crews.filter(c => c.name === crewName);

      const day = (event.year - startYear) * (numDays + 1);

      if (match.length > 0) {
        const values = match[0].values.map(v => ({ day: v.day + day, pos: v.pos }));

        for (let i = values.length; i <= numDays; i++) {
          values.push({ day: i + day, pos: -1 });
        }

        newCrew.values = newCrew.values
          .concat(values);

        const positions = match[0].values.map(v => v.pos);

        const blades = isBlades(positions);
        const spoons = isSpoons(positions, event.crews.length);

        const valuesSplit = { set: set, gender: gender, name: crewName, day: day, blades: blades, spoons: spoons, values: values };
        newCrew.valuesSplit.push(valuesSplit);
      } else {
        const emptyValues = [];
        for (let i = 0; i <= numDays; i++) {
          emptyValues.push({ day: i + day, pos: -1 });
        }

        newCrew.values = newCrew.values.concat(emptyValues);
      }
    });

    data.push(newCrew);
  });

  return {
    crews: data,
    startYear: startYear,
    endYear: endYear,
    maxCrews: maxCrews,
    divisions: divisions
  };
}

export function transformData(event) {
  if (event.days !== event.completed.length) {
    throw new RangeError(`Expected ${event.days} but found ${event.completed.length} completed days`);
  }

  let starty = 1;
  const crews = [];
  const divisions = [];
  for (let div = 0; div < event.divisions.length; div++) {
    divisions.push({ start: starty, length: event.divisions[div].length });

    for (let crew = 0; crew < event.divisions[div].length; crew++) {
      const position = [];

      let xpos = 0;
      let ypos = starty;

      position.push({ day: xpos, pos: ypos });

      let c = crew;
      let d = div;
      for (let m = 0; m < event.days; m++) {
        if (event.completed[m][d] === false) {
          break;
        }

        const up = event.move[m][d][c];
        xpos += 1;
        ypos -= up;
        position.push({ day: xpos, pos: ypos });

        c -= up;
        while (c < 0) {
          d--;
          c += event.divisions[d].length;
        }
        while (c >= event.divisions[d].length) {
          c -= event.divisions[d].length;
          d++;
        }
      }

      crews.push({ name: event.finish[d][c], values: position });
      starty += 1;
    }
  }

  return { year: event.year, crews: crews, divisions: divisions };
}

// TODO: Make these constants DRY
export function calculateNumYearsToview(width) {
  const widthWithoutLines = 310;

  return Math.max(0, Math.ceil((width - widthWithoutLines) / widthOfOneYear));
}

export function calculateYearRange(current, data, desiredWidth) {
  let start;
  let end;

  if (current === null || current === undefined) {
    current = data;
  }

  if (current.end > data.end) {
    end = data.end;

    if (end - desiredWidth < data.start) {
      start = data.start;
    } else {
      start = end - desiredWidth;
    }
  } else {
    if (current.end < data.start) {
      if (data.start + desiredWidth > data.end) {
        end = data.end;
        start = data.start;
      } else {
        end = data.start + desiredWidth;
        start = data.start;
      }
    } else {
      end = current.end;

      if (end - desiredWidth < data.start) {
        start = data.start;

        if (start + desiredWidth > current.end) {
          end = Math.min(start + desiredWidth, data.end);
        }
      } else {
        start = end - desiredWidth;
      }
    }
  }

  return { start, end };
}

function calculateDivision(position, numDivisions, divisionBreaks) {
  for (let divNum = 0; divNum < numDivisions; divNum++) {
    if (position < divisionBreaks[divNum]) {
      return divNum;
    }
  }
}

function calculatePositionInDivision(position, numDivisions, divisionSizes) {
  for (let divNum = 0; divNum < numDivisions; divNum++) {
    if (position < divisionSizes[divNum]) {
      break;
    } else {
      position -= divisionSizes[divNum];
    }
  }

  return position;
}

function calculateDivisionBreaks(divisions) {
  const divisionSizes = divisions
    .map(d => d.length);

  const divisionBreaks = divisionSizes.reduce((r, a) => {
    if (r.length > 0) {
      a += r[r.length - 1];
    }

    r.push(a);
    return r;
  }, []);

  return divisionBreaks;
}

function calculateResults(event) {
  let results = '';

  const move = event.move;
  const completed = event.completed;

  const numDivisions = event.divisions.length;

  for (let dayNum = 0; dayNum < event.days; dayNum++) {
    let sandwichSuccess = false;
    for (let divNum = numDivisions - 1; divNum >= 0; divNum--) {
      completed[dayNum][divNum] = true;

      const m = move[dayNum][divNum];

      if (sandwichSuccess) {
        results += 'u';
        sandwichSuccess = false;
      } else if (divNum < numDivisions - 1) {
        results += 'r';
      }

      let crew = m.length - 1;

      while (crew >= 0) {
        if (m[crew] === 0) {
          results += 'r';
          crew -= 1;
        } else if (m[crew] === 1 && crew === 0) {
          results += 'r';
          crew -= 1;
        } else if (m[crew] === 1 && crew > 0) {
          results += 'u';
          crew -= 2;
        } else if (m[crew] === 2 && crew === 1) {
          results += 'u';
          crew -= 2;
        } else if (m[crew] === 3) {
          results += 'o3';
          crew -= 1;
        } else if (m[crew] === -3) {
          crew -= 1;
        } else {
          crew -= 1;
        }
      }

      if (m[0] === 1 || m[1] === 2 || m[1] === 4) {
        sandwichSuccess = true;
      }

      if (divNum > 0) {
        results += ' ';
      }
    }
    results += '\n';
  }

  event.results = results;

  return event;
}


function addcrew(div, crew) {
  if (crew.length === 0) {
    return;
  }

  div.push(crew);
}

function processBump(move, divNum, crew, up) {
  if (crew - up < 1) {
    console.error('Bumping up above the top of the division: div ' + divNum + ', crew ' + crew + ', up ' + up);
    return false;
  }

  if (move[divNum - 1][crew - 1 - up] !== 0) {
    console.error('Bumping a crew that has already got a result');
    return false;
  }

  move[divNum - 1][crew - 1 - up] = -up;
  if (crew > move[divNum - 1].length) {
    // sandwich crew, need to find where it started
    for (var p = 0; p < move[divNum].length; p++) {
      if (p - move[divNum][p] == 0) {
        move[divNum][p] += up;
        break;
      }
    }
  } else {
    move[divNum - 1][crew - 1] = up;
  }

  return true;
}

function processResults(event) {
  let res = [];

  if (event.results.length > 0) {
    res = event.results.match(/r|t|u|o[0-9]*|e-?[0-9]*/g);
  }

  let dayNum = 0;
  let divNum = 0;
  let crew = 0;
  let move = null;

  for (let i = 0; i < res.length; i++) {
    while (move != null
      && crew <= move[divNum - 1].length && crew > 0
      && move[divNum - 1][crew - 1] !== 0) {
      crew = crew - 1;
    }

    if (crew === 0) {
      if (res[i] === 't') {
        continue;
      }

      if (divNum <= 1) {
        if (dayNum === event.days) {
          console.error('Run out of days of racing with more results still to go');
          return;
        }
        move = event.move[dayNum];
        dayNum += 1;
        divNum = event.divisions.length + 1;
      }

      divNum--;
      crew = move[divNum - 1].length;
      if (divNum < event.divisions.length) {
        crew++; // Sandwich crew
      }
    }

    event.completed[dayNum - 1][divNum - 1] = true;

    if (res[i] === 'r') {
      // rowover
      crew--;
    } else if (res[i] === 'u') { // bump up
      if (!processBump(move, divNum, crew, 1)) {
        return;
      }

      crew -= 2;
    } else if (res[i].indexOf('o') === 0) {
      // overbump
      const up = parseInt(res[i].substring(1), 10);
      if (!processBump(move, divNum, crew, up)) {
        return;
      }

      crew--;
    } else if (res[i].indexOf('e') === 0) {
      // exact move
      const up = parseInt(res[i].substring(1), 10);
      if (crew > move[divNum - 1].length) {
        move[divNum][0] += up;
      } else {
        move[divNum - 1][crew - 1] = up;
      }

      crew--;
    } else if (res[i] === 't') {
      crew = 0;
    }
  }

  for (let div = 0; div < event.divisions.length; div++) {
    event.finish.push(new Array(event.divisions[div].length));
  }

  for (let div = 0; div < event.divisions.length; div++) {
    for (let crewPos = 0; crewPos < event.divisions[div].length; crewPos++) {
      let d = div;
      let c = crewPos;
      for (let m = 0; m < event.days; m++) {
        c = c - event.move[m][d][c];

        while (c < 0) {
          d--;
          c += event.move[m][d].length;
        }
        while (c >= event.move[m][d].length) {
          c -= event.move[m][d].length;
          d++;
        }
      }

      event.finish[d][c] = event.divisions[div][crewPos];
    }
  }
}

function calculateMoves(event, crewsFirstDay, crewsAllDays, divisionSizes) {
  const numDivisions = event.divisions.length;

  const divisions = event.divisions;
  const move = event.move;
  const finish = event.finish;

  for (let dayNum = 0; dayNum < event.days; dayNum++) {
    for (let crew = 0; crew < crewsFirstDay.length; crew++) {
      if (dayNum === 0) {
        const division = +crewsFirstDay[crew].Division - 1;

        const position = +crewsFirstDay[crew]['Start position'] - 1;
        const positionInDivision = calculatePositionInDivision(position, numDivisions, divisionSizes);

        divisions[division][positionInDivision] = `${crewsFirstDay[crew].Club} ${crewsFirstDay[crew].Crew}`;
        move[dayNum][division][positionInDivision] = +crewsFirstDay[crew]['Start position'] - +crewsAllDays[event.days * crew + dayNum].Position;
      } else {
        let position = +crewsAllDays[event.days * crew + dayNum - 1].Position - 1;
        const divisionBreaks = calculateDivisionBreaks(divisions);
        let division = calculateDivision(position, numDivisions, divisionBreaks);

        let positionInDivision = calculatePositionInDivision(position, numDivisions, divisionSizes);
        move[dayNum][division][positionInDivision] = +crewsAllDays[event.days * crew + dayNum - 1].Position - +crewsAllDays[event.days * crew + dayNum].Position;

        if (dayNum === event.days - 1) {
          position = +crewsAllDays[event.days * crew + dayNum].Position - 1;
          division = calculateDivision(position, numDivisions, divisionBreaks);

          positionInDivision = calculatePositionInDivision(position, numDivisions, divisionSizes);
          finish[division][positionInDivision] = `${crewsFirstDay[crew].Club} ${crewsFirstDay[crew].Crew}`;
        }
      }
    }
  }

  return event;
}

export function read_flat(data) {
  data = csvParse(data);
  const year = uniqBy(data.map(d => d.Year));
  const gender = uniqBy(data.map(d => d.Sex));

  const events = [];

  for (let yearNum = 0; yearNum < year.length; yearNum++) {
    for (let genderNum = 0; genderNum < gender.length; genderNum++) {
      let event = {
        set: 'Set',
        small: 'Short',
        gender: 'Gender',
        result: '',
        year: 1970,
        days: 4,
        divisions: [],
        results: [],
        move: [],
        finish: [],
        completed: []
      };

      event.set = 'Town Bumps';
      event.gender = gender[genderNum];
      event.year = +year[yearNum];

      const crewsFirstDay = data.filter(d => +d.Year === event.year && d.Sex === event.gender && d.Day === '1');
      crewsFirstDay.sort((a, b) => +a['Start position'] - +b['Start position']);

      const crewsAllDays = data.filter(d => +d.Year === event.year && d.Sex === event.gender);
      crewsAllDays.sort((a, b) => {
        const equality = +a['Start position'] - +b['Start position'];
        if (equality === 0) {
          return +a.Day - +b.Day;
        }
        return equality;
      });

      event.days = uniqBy(crewsAllDays.map(c => c.Day)).length;

      const numDivisions = uniqBy(crewsFirstDay.map(c => c.Division)).length;
      const divisionSizes = new Array(numDivisions);

      for (let division = 0; division < numDivisions; division++) {
        divisionSizes[division] = crewsFirstDay.filter(c => +c.Division === (division + 1)).length;
      }

      event.divisions = new Array(numDivisions);
      event.finish = new Array(numDivisions);
      event.move = new Array(event.days);
      event.completed = new Array(event.days);

      for (let dayNum = 0; dayNum < event.days; dayNum++) {
        event.move[dayNum] = new Array(numDivisions);
        event.completed[dayNum] = new Array(numDivisions);

        for (let divNum = 0; divNum < numDivisions; divNum++) {
          event.divisions[divNum] = new Array(divisionSizes[divNum]);
          event.finish[divNum] = new Array(divisionSizes[divNum]);
          event.move[dayNum][divNum] = new Array(divisionSizes[divNum]);
          event.completed[dayNum][divNum] = false;
        }
      }

      event = calculateMoves(event, crewsFirstDay, crewsAllDays, divisionSizes);
      event = calculateResults(event);
      events.push(event);
    }
  }

  return events;
}

export function read_tg(input) {
  input = input.split('\n');

  const event = {
    set: 'Set',
    small: 'Short',
    gender: 'Gender',
    result: '',
    year: 1970,
    days: 4,
    divisions: [], results: [], move: [], finish: [], completed: []
  };

  let curdiv = [];
  let inresults = 0;
  let indivision = 0;

  for (let i = 0; i < input.length; i++) {
    const m = input[i].split(',');
    if (m[0] === 'Set') {
      if (m.length > 1) {
        event.set = m[1];
      }
    } else if (m[0] === 'Short') {
      event.small = m[1];
    } else if (m[0] === 'Gender') {
      event.gender = m[1];
    } else if (m[0] === 'Year') {
      const year = parseInt(m[1], 10);
      if (!isNaN(year)) {
        event.year = year;
      }
    } else if (m[0] === 'Days') {
      event.days = parseInt(m[1], 10);
    } else if (m[0] === 'Division') {
      indivision = 1;

      if (curdiv.length > 0) {
        event.divisions.push(curdiv);
        curdiv = [];
      }
      for (let j = 1; j < m.length; j++) {
        addcrew(curdiv, m[j]);
      }
    } else if (m[0] === 'Results') {
      inresults = 1;

      if (curdiv.length > 0) {
        event.divisions.push(curdiv);
        curdiv = [];
      }

      for (let j = 1; j < m.length; j++) {
        if (m[j].indexOf('#') !== 0) {
          Array.prototype.push.apply(event.results, m[j].split(' '));
        }
      }
    } else {
      for (let j = 0; j < m.length; j++) {
        if (inresults === 1 && m[j].indexOf('#') !== 0) {
          Array.prototype.push.apply(event.results, m[j].split(' '));
        } else if (indivision === 1) {
          addcrew(curdiv, m[j]);
        }
      }
    }
  }

  const results = [];

  for (let i = 0; i < event.days; i++) {
    results.push([]);
  }

  event.results.filter(r => r !== '').map((r, i) => results[Math.floor(i / event.divisions.length)].push(r.trim()));

  event.results = results.filter(r => r.length > 0).map(r => r.join(' ')).join('\n');

  if (curdiv.length > 0) {
    event.divisions.push(curdiv);
  }

  for (let i = 0; i < event.days; i++) {
    const mday = new Array(event.divisions.length);
    const cday = [];

    for (let d = 0; d < event.divisions.length; d++) {
      const mdd = new Array(event.divisions[d].length);
      for (let c = 0; c < event.divisions[d].length; c++) {
        mdd[c] = 0;
      }

      mday[d] = mdd;
      cday.push(false);
    }

    event.move.push(mday);
    event.completed.push(cday);
  }

  processResults(event);

  return event;
}

export function read_ad(input) {
  input = input.split('\n');

  let event = {
    set: 'Set',
    small: 'Short',
    gender: 'Gender',
    result: '',
    year: 1970,
    days: 1,
    divisions: [], results: [], move: [], finish: [], completed: []
  };

  const info = input[0].split(/\s+/);

  switch (info[0]) {
    case 'EIGHTS':
      event.set = 'Summer Eights';
      break;
    case 'TORPIDS':
      event.set = 'Torpids';
      break;
  }

  event.year = +info[1];

  const info2 = input[1].trim().split(/\s+/);

  event.days = +info2[0];

  const numDivisions = +info2[1];
  const numCrews = parseInt(info2[2], 10);

  let currentDivision;
  let currentMove = [];
  let currentPos = [];

  for (let day = 0; day < event.days + 1; day++) {
    currentMove.push([]);
    currentPos.push([]);
    for (let crew = 0; crew < numCrews; crew++) {
      currentPos[day].push(crew);
    }
  }

  switch (input[2].split(' ')[3]) {
    case 'Mens':
    case 'Men\'s':
      event.gender = 'Men';
      break;
    case 'Womens':
    case 'Women\'s':
      event.gender = 'Women';
      break;
  }

  for (let line = 2; line < numDivisions + numCrews + 2; line++) {
    if (input[line][0] === ' ') {
      currentDivision = [];
      event.divisions.push(currentDivision)
    } else {
      const crewName = input[line].replace(/-?[0-9]+/g, '').trim();
      const moves = input[line].replace(/([^\d- ]|-\D)/g, '').trim().split(/\s+/g);

      for (let day = 0; day < event.days; day++) {
        currentMove[day].push(+moves[day]);
      }

      currentDivision.push(normalizeOxfordName(crewName));
      currentMove.push()
    }
  }

  for (let day = 1; day < event.days + 1; day++) {
    for (let crew = 0; crew < numCrews; crew++) {
      currentPos[day][crew] = currentPos[day - 1][crew] - currentMove[day - 1][crew];
    }
  }

  for (let day = 0; day < event.days; day++) {
    let count = 0;
    event.move.push([]);
    event.completed.push([]);
    for (let div = 0; div < numDivisions; div++) {
      event.move[day].push([]);
      event.completed[day].push(true);
      for (let crew = 0; crew < event.divisions[div].length; crew++) {
        event.move[day][div].push(currentMove[day][currentPos[day].indexOf(count)]);
        count++;
      }
    }
  }

  const initialPositions = [];
  for (let div = 0; div < numDivisions; div++) {
    for (let crew = 0; crew < event.divisions[div].length; crew++) {
      initialPositions.push(event.divisions[div][crew]);
    }
  }

  let count = 0;
  for (let div = 0; div < numDivisions; div++) {
    event.finish.push([]);
    for (let crew = 0; crew < event.divisions[div].length; crew++) {
      event.finish[div].push(initialPositions[currentPos[event.days].indexOf(count)]);
      count++;
    }
  }

  event = calculateResults(event);

  return event;
}

export function read_ad(input) {
  input = input.split('\n');

  let event = {
    set: 'Set',
    small: 'Short',
    gender: 'Gender',
    result: '',
    year: 1970,
    days: 1,
    divisions: [], results: [], move: [], finish: [], completed: []
  };

  const info = input[0].split(/\s+/);

  switch (info[0]) {
    case 'EIGHTS':
      event.set = 'Summer Eights';
      break;
    case 'TORPIDS':
      event.set = 'Torpids';
      break;
  }

  event.year = +info[1];

  const info2 = input[1].trim().split(/\s+/);

  event.days = +info2[0];

  const numDivisions = +info2[1];
  const numCrews = parseInt(info2[2], 10);

  let currentDivision;
  let currentMove = [];
  let currentPos = [];

  for (let day = 0; day < event.days + 1; day++) {
    currentMove.push([]);
    currentPos.push([]);
    for (let crew = 0; crew < numCrews; crew++) {
      currentPos[day].push(crew);
    }
  }

  switch (input[2].split(' ')[3]) {
    case 'Mens':
    case 'Men\'s':
      event.gender = 'Men';
      break;
    case 'Womens':
    case 'Women\'s':
      event.gender = 'Women';
      break;
  }

  for (let line = 2; line < numDivisions + numCrews + 2; line++) {
    if (input[line][0] === ' ') {
      currentDivision = [];
      event.divisions.push(currentDivision)
    } else {
      const crewName = input[line].replace(/-?[0-9]+/g, '').trim();
      const moves = input[line].replace(/([^\d- ]|-\D)/g, '').trim().split(/\s+/g);

      for (let day = 0; day < event.days; day++) {
        currentMove[day].push(+moves[day]);
      }

      currentDivision.push(normalizeOxfordName(crewName));
      currentMove.push()
    }
  }

  for (let day = 1; day < event.days + 1; day++) {
    for (let crew = 0; crew < numCrews; crew++) {
      currentPos[day][crew] = currentPos[day - 1][crew] - currentMove[day - 1][crew];
    }
  }

  for (let day = 0; day < event.days; day++) {
    let count = 0;
    event.move.push([]);
    event.completed.push([]);
    for (let div = 0; div < numDivisions; div++) {
      event.move[day].push([]);
      event.completed[day].push(true);
      for (let crew = 0; crew < event.divisions[div].length; crew++) {
        event.move[day][div].push(currentMove[day][currentPos[day].indexOf(count)]);
        count++;
      }
    }
  }

  const initialPositions = [];
  for (let div = 0; div < numDivisions; div++) {
    for (let crew = 0; crew < event.divisions[div].length; crew++) {
      initialPositions.push(event.divisions[div][crew]);
    }
  }

  let count = 0;
  for (let div = 0; div < numDivisions; div++) {
    event.finish.push([]);
    for (let crew = 0; crew < event.divisions[div].length; crew++) {
      event.finish[div].push(initialPositions[currentPos[event.days].indexOf(count)]);
      count++;
    }
  }

  event = calculateResults(event);

  return event;
}

export function write_flat(events) {
  let ret = 'Year,Club,Sex,Day,Crew,Start position,Position,Division\n';

  for (let eventNum = 0; eventNum < events.length; eventNum++) {
    const event = events[eventNum];

    const divisions = event.divisions.slice();
    divisions.unshift([]);
    const divisionBreaks = calculateDivisionBreaks(divisions);

    for (let divNum = 0; divNum < event.divisions.length; divNum++) {
      const division = event.divisions[divNum];

      for (let crew = 0; crew < division.length; crew++) {
        const c = division[crew].split(' ');
        const crewNumber = c.pop();
        const club = c.join(' ');

        let position = crew;
        let correctedPosition;
        let correctedDivision = divNum;
        let startPosition;

        for (let dayNum = 0; dayNum < event.days; dayNum++) {
          if (dayNum === 0) {
            startPosition = divisionBreaks[divNum] + position + 1;
          }

          position -= event.move[dayNum][correctedDivision][position];

          if (position < 0 && divNum > 0) {
            position += event.divisions[correctedDivision - 1].length;
            correctedDivision -= 1;
          } else if (position >= event.divisions[correctedDivision].length && divNum < event.divisions.length) {
            position -= event.divisions[correctedDivision].length;
            correctedDivision += 1;
          }

          correctedPosition = divisionBreaks[correctedDivision] + position + 1;

          ret += `${event.year},${club},${event.gender},${(dayNum + 1)},${crewNumber},${startPosition},${correctedPosition},${divNum + 1}
`;
        }
      }
    }
  }

  return ret;
}

export function write_tg(event) {
  let ret = `Set,${event.set}
Short,${event.small}
Gender,${event.gender}
Year,${event.year}
`;

  if (event.days !== 4) {
    ret += `Days,${event.days}
`;
  }

  ret += `
`;

  for (let div = 0; div < event.divisions.length; div++) {
    ret += 'Division';
    for (let c = 0; c < event.divisions[div].length; c++) {
      const name = event.divisions[div][c];
      ret += `,${name}`;
    }
    ret += `
`;
  }

  ret += `
Results
${event.results}`;

  return ret;
}

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

export function write_ad(event) {
  let setStr;

  switch (event.set) {
    case 'Summer Eights':
      setStr = 'EIGHTS';
      break;
    case 'Torpids':
      setStr = 'TORPIDS';
      break;
  }

  const numCrews = event.divisions.reduce((sum, div) => sum += div.length, 0);

  let ret = `${setStr} ${event.year}
 ${event.days}  ${event.divisions.length}  ${numCrews}   = NDay, NDiv, NCrew
`;

  event.divisions.forEach((div, index) => {
    let genderStr;
    switch (event.gender) {
      case 'Men':
        genderStr = 'Men\'s';
        break;
      case 'Women':
        genderStr = 'Women\'s';
        break;
    }

    let currentMove = [];
    let currentPos = [];

    for (let day = 0; day < event.days + 1; day++) {
      currentMove.push([]);
      currentPos.push([]);
      for (let crew = 0; crew < numCrews; crew++) {
        currentPos[day].push(crew);
      }
    }

    let divStr = ` ${div.length}  ${genderStr} Div ${roman[index]}\n`;

    div.forEach((crew, crewIndex) => {
      divStr += `${padEnd(renderName(crew, event.set), 25)}`;
      for (let day = 0; day < event.days; day++) {
        divStr += padStart(event.move[day][index][crewIndex], 4);
      }
      divStr += '\n';
    });

    ret += divStr;

  });

  return ret;
}
