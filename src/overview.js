import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { max, scan } from 'd3-array';
import { dispatch } from 'd3-dispatch';

import { crewColor } from './util.js';

export const widthOfOneYear = 110;

export default function() {
  let svg;
  let _data;

  let year;
  let yearRange;
  let numYearsToView;
  let highlightedCrew;
  let selectedCrews = new Set();
  let windowWidth;

  let container;
  let g;
  let divisionsGroup;
  let linesGroup;
  let xScale;
  let dayShift;

  let setupComplete = false;

  const listeners = dispatch(
    'selectYear',
    'highlightCrew',
    'toggleSelectedCrew'
  );

  function chart(selection) {
    selection.each(function(data) {
      _data = data;

      if (!setupComplete) {
        setup(selection);
        setupComplete = true;
      }

      render();
    });
  }

  function setup(el) {
    svg = el.select('svg');
    container = svg.append('g').attr('class', 'results-container');
    g = container.append('g').attr('class', 'results');

    divisionsGroup = g.append('g').attr('class', 'divisions');
    linesGroup = g.append('g').attr('class', 'lines');
  }

  function render() {
    const results = _data;

    // If we have no results or no range of years return early
    if (
      results === undefined ||
      results.crews.length === 0 ||
      yearRange === null
    ) {
      return;
    }

    numYearsToView = _data.divisions.length;

    let i = scan(
      _data.divisions,
      (a, b) => Math.abs(a.year - year) - Math.abs(b.year - year)
    );

    // Too far to the right
    if (i + numYearsToView > _data.divisions.length) {
      i = _data.divisions.length - numYearsToView;
    }

    yearRange = {
      start: _data.divisions[i].year,
      end: _data.divisions[i + numYearsToView - 1].year,
    };

    const width = windowWidth;
    const crews = results.crews;
    const transitionLength = 400;
    const widthOfOneYear = width / numYearsToView;

    crews.forEach(crew => (crew.highlighted = selectedCrews.has(crew.name)));
    crews.forEach(crew => (crew.hover = highlightedCrew === crew.name));

    const yDomainMax =
      crews.length > 0
        ? max(crews, c => max(c.values.filter(d => d !== null), v => v.pos))
        : 0;

    const xDomain = [];
    const xRange = [];
    let count = 0;

    crews[0].valuesSplit.forEach(d => {
      xDomain.push(d.values[0].day);
      xDomain.push(d.values[d.values.length - 1].day);
      xRange.push(((count * 5) / 4) * widthOfOneYear);
      xRange.push(((count * 5) / 4) * widthOfOneYear + widthOfOneYear);
      count += 1;
    });

    xScale = scaleLinear()
      .domain(xDomain)
      .range(xRange);

    const yScale = scaleLinear()
      .domain([1, yDomainMax])
      .range([0, 100]);

    svg.attr('height', 100);

    const startDay = results.divisions.find(d => d.year === yearRange.start)
      .startDay;

    const endDay =
      results.divisions.find(d => d.year === yearRange.end).startDay +
      results.divisions.find(d => d.year === yearRange.end).numDays;

    dayShift = startDay;
    let finishLabelIndex = endDay;

    // Check for incomplete last event, e.g. only 2 days completed of the 4
    const maxDays = max(
      results.crews.map(c =>
        max(c.values.filter(v => v.pos > -1 || v.day < finishLabelIndex - 5))
      )
    );

    if (finishLabelIndex > maxDays - 1) {
      finishLabelIndex = maxDays - 1;
    }

    renderDivisions(results, divisionsGroup, xScale, yScale);

    renderCrews(
      crews,
      linesGroup,
      xScale,
      yScale,
      selectedCrews,
      transitionLength
    );
  }

  function selectYear(start, end) {
    yearRange = { start: start, end: end };
    render();
    listeners.call('selectYear', chart, start, end);
  }

  function toggleSelectedCrew(name) {
    if (selectedCrews.has(name)) {
      selectedCrews.delete(name);
    } else {
      selectedCrews.add(name);
    }

    render();
    listeners.call('toggleSelectedCrew', chart, name);
  }

  function highlightCrew(name) {
    highlightedCrew = name;
    render();
    listeners.call('highlightCrew', chart, name);
  }

  function renderDivisions(results, g, xScale, yScale) {
    const divisionContainer = g
      .selectAll('.division-year')
      .data(results.divisions, d => d.year);

    divisionContainer.exit().remove();

    const divisionContainerEnter = divisionContainer
      .enter()
      .append('g')
      .attr('class', 'division-year')
      .attr('id', d => d.year);

    divisionContainerEnter
      .selectAll('rect.division')
      .data(d =>
        d.divisions.map(division => ({
          start: division.start,
          size: division.size,
          startDay: d.startDay,
          numDays: d.numDays,
        }))
      )
      .enter()
      .append('rect')
      .attr('class', 'division')
      .attr('id', d => d.start)
      .style('fill', (d, i) => (i % 2 ? '#C4C4C4' : '#FFFFFF'))
      .attr('y', d => yScale(d.start - 0.5))
      .attr('width', widthOfOneYear)
      .attr('height', d => yScale(d.start + d.size) - yScale(d.start));

    divisionContainerEnter
      .merge(divisionContainer)
      .attr('transform', d => `translate(${xScale(d.startDay)},0)`);

    const division = divisionContainer.selectAll('rect.division').data(d =>
      d.divisions.map(division => ({
        start: division.start,
        size: division.size,
        startDay: d.startDay,
        numDays: d.numDays,
      }))
    );

    division
      .enter()
      .append('rect')
      .attr('class', 'division')
      .attr('id', d => d.start)
      .style('fill', (d, i) => (i % 2 ? '#C4C4C4' : '#D4D4D4'))
      .attr('y', d => yScale(d.start - 0.5))
      .attr('width', widthOfOneYear)
      .attr('height', d => yScale(d.start + d.size) - yScale(d.start));

    const rects = divisionContainer.selectAll('rect.division').data(d =>
      d.divisions.map(division => ({
        start: division.start,
        size: division.size,
        startDay: d.startDay,
        numDays: d.numDays,
      }))
    );

    rects.exit().remove();

    rects
      .attr('y', d => yScale(d.start - 0.5))
      .attr('width', widthOfOneYear)
      .attr('height', d => yScale(d.start + d.size) - yScale(d.start));

    rects
      .enter()
      .append('rect')
      .attr('class', 'division')
      .attr('id', d => d.start)
      .style('stroke', 'black')
      .style('fill', (d, i) => (i % 2 ? '#C4C4C4' : '#D4D4D4'))
      .attr('y', d => yScale(d.start - 0.5))
      .attr('width', widthOfOneYear)
      .attr('height', d => yScale(d.start + d.size) - yScale(d.start));
  }

  function renderCrews(data, g, xScale, yScale, selectedCrews) {
    const lineFunc = line()
      .defined(d => d !== null && d.pos > -1)
      .x(d => xScale(d.day))
      .y(d => yScale(d.pos));

    const crewContainer = g
      .selectAll('.line')
      .data(data.filter(d => selectedCrews.has(d.name)), d => d.name);

    crewContainer.exit().remove();

    const crewContainerEnter = crewContainer
      .enter()
      .append('g')
      .attr('class', d => `line ${d.name.replace(/ /g, '-')}`)
      .classed('highlighted', d => d.highlighted)
      .style('fill', 'none')
      .style(
        'stroke',
        d => (d.highlighted || d.hover ? crewColor(d.name) : '#000000')
      )
      .style('stroke-width', '2px');

    crewContainerEnter
      .selectAll('path.background')
      .data(d => [d], d => d.name)
      .enter()
      .append('path')
      .attr('class', 'background')
      .attr('d', d => lineFunc(d.values));

    crewContainerEnter
      .merge(crewContainer)
      .classed('highlighted', d => d.highlighted)
      .style('fill', 'none')
      .style(
        'stroke',
        d => (d.highlighted || d.hover ? crewColor(d.name) : '#000000')
      )
      .style('stroke-width', '2px');

    const crewsBackground = crewContainer
      .selectAll('path.background')
      .data(d => [d], d => d.name);

    crewsBackground.exit().remove();

    crewsBackground
      .enter()
      .append('path')
      .attr('class', 'background')
      .attr('d', d => lineFunc(d.values))
      .style(
        'stroke',
        d => (d.highlighted || d.hover ? crewColor(d.name) : '#000000')
      )
      .style('stroke-width', '2px');

    crewsBackground
      .attr('d', d => lineFunc(d.values))
      .style(
        'stroke',
        d => (d.highlighted || d.hover ? crewColor(d.name) : '#000000')
      )
      .style('stroke-width', '2px');
  }

  chart.year = function(_) {
    if (!arguments.length) return year;
    year = _;
    return chart;
  };

  chart.highlightedCrew = function(_) {
    if (!arguments.length) return highlightedCrew;
    highlightedCrew = _;
    return chart;
  };

  chart.selectedCrews = function(_) {
    if (!arguments.length) return selectedCrews;
    selectedCrews = _;
    return chart;
  };

  chart.windowWidth = function(_) {
    if (!arguments.length) return windowWidth;
    windowWidth = _;
    return chart;
  };

  chart.on = function() {
    const value = listeners.on.apply(listeners, arguments);
    return value === listeners ? chart : value;
  };

  return chart;
}
