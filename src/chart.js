import { select, event } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { max, min, range } from 'd3-array';
import { drag } from 'd3-drag';
import 'd3-transition'; // We require the side-effects of importing

import { crewColor, renderName } from './util.js';

export const widthOfOneYear = 110;

export default function () {
  let svg;
  let state;

  let container;
  let g;
  let divisionsGroup;
  let yearsGroup;
  let labelsGroup;
  let linesGroup;

  let startDrag;

  function chart() {
  }

  chart.setup = function setup(el) {
    svg = select(el).select('svg');
    container = svg.append('g').attr('class', 'results-container');
    g = container.append('g').attr('class', 'results');

    container.append('rect')
      .attr('class', 'touch-target');

    divisionsGroup = g.append('g').attr('class', 'divisions');
    yearsGroup = g.append('g').attr('class', 'years');
    linesGroup = g.append('g').attr('class', 'lines');
    labelsGroup = svg.append('g').attr('class', 'labels');

    createClipPath(svg);
    createDropShadowFilter(svg);
  }

  chart.render = function render(props) {
    state = Object.assign({}, props);

    const results = props.data;
    const yearRange = props.year;
    const selectedCrews = props.selectedCrews;
    const highlightedCrew = props.highlightedCrew;
    const selectYear = props.selectYear;
    const toggleSelectedCrew = props.toggleSelectedCrew;
    const highlightCrew = props.highlightCrew;
    const windowWidth = props.windowWidth;

    // If we have no results or no range of years return early
    if (results === undefined || yearRange === null) {
      return;
    }

    const crews = results.crews;

    const heightOfOneCrew = 34;
    const widthWithoutLines = 310;
    const initialViewBoxX = -165;
    const initialViewBoxY = 0;
    const startLabelPosition = 0;
    const finishLabelPosition = 4;
    const numbersLeftPosition = -5.6;
    const numbersRightPosition = 5;
    const numYearsToView = yearRange.end - yearRange.start + 1;
    const yMarginTop = 10;

    const transitionLength = 400;

    crews.forEach(crew => crew.highlighted = selectedCrews.has(crew.name));
    crews.forEach(crew => crew.hover = highlightedCrew === crew.name);

    const xRangeMax = widthOfOneYear;
    const yDomainMax = crews.length > 0 ? max(crews, c => max(c.values.filter(d => d !== null), v => v.pos)) : 0;

    const xScale = scaleLinear()
      .domain([0, 4])
      .range([0, xRangeMax]);

    const yScale = scaleLinear()
      .domain([-1, yDomainMax])
      .range([yMarginTop, yDomainMax * heightOfOneCrew - yMarginTop]);

    const viewBoxWidth = (widthWithoutLines + widthOfOneYear * 5 / 4 * numYearsToView);
    const viewBoxHeight = yDomainMax * heightOfOneCrew;

    const width = windowWidth;

    svg.attr('height', viewBoxHeight / viewBoxWidth * width)
      .attr('viewBox', `${initialViewBoxX}, ${initialViewBoxY}, ${viewBoxWidth}, ${viewBoxHeight}`);

    const lineFunc = line()
      .defined(d => d !== null && d.pos > -1)
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.pos));

    const startYear = results.startYear;
    const endYear = results.endYear;

    const yearDiff = yearRange.start - startYear;

    const dayShift = yearDiff * 5;
    const startLabelIndex = yearDiff * 5;
    let finishLabelIndex = startLabelIndex + numYearsToView * 5 - 1;

    // Check for incomplete last event, e.g. only 2 days completed of the 4
    const maxDays = max(results.crews.map(c => c.values.filter(v => v.pos > -1 || v.day < finishLabelIndex - 5).length));

    if (finishLabelIndex > maxDays - 1) {
      finishLabelIndex = maxDays - 1;
    }

    container.select('.touch-target')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', viewBoxHeight + 2)
      .attr('fill', 'transparent');

    g.transition()
      .duration(transitionLength)
      .attr('transform', `translate(${xScale(-dayShift)},0)`);

    container.call(drag()
      .on('start', () => {
        startDrag = event.x;
      })
      .on('drag', () => {
        g.attr('transform', `translate(${event.x - startDrag - xScale(dayShift)},0)`);
      })
      .on('end', () => {
        const shift = max([startYear, min([endYear - numYearsToView + 1, Math.round(xScale.invert(-event.x + startDrag - xScale(-dayShift)) / 5) + startYear])]);
        selectYear(shift, shift + numYearsToView - 1);
      })
    );

    renderClipPath(svg, numYearsToView, viewBoxHeight, xScale);
    const divisionsEnter = renderDivisions(results, divisionsGroup, dayShift, xScale, transitionLength);
    renderDivisionsYear(divisionsEnter, startYear, xScale, yScale, transitionLength);
    renderYears(yearsGroup, startYear, endYear, xScale, yScale, dayShift, transitionLength);
    const crewEnter = renderCrew(crews, linesGroup, selectedCrews, xScale, yScale, dayShift, transitionLength);
    renderCrewYear(crewEnter, lineFunc, transitionLength);
    renderCrewBackground(crews, crewEnter, lineFunc, transitionLength);
    renderFinishLabel(crews, labelsGroup, finishLabelIndex, finishLabelPosition, numYearsToView, xScale, yScale, transitionLength, toggleSelectedCrew, highlightCrew)
    renderStartLabel(crews, labelsGroup, startLabelIndex, startLabelPosition, xScale, yScale, transitionLength, toggleSelectedCrew, highlightCrew);
    renderNumbersRight(crews, labelsGroup, finishLabelIndex, numYearsToView, numbersRightPosition, xScale, yScale, transitionLength)
    renderNumbersLeft(results.divisions, labelsGroup, yearRange.start, numbersLeftPosition, xScale, yScale, transitionLength);
  }

  chart.selectYear = function (start, end) {
    state.year = { start: start, end: end };
    chart.render(state);
  }

  chart.toggleSelectedCrew = function (name) {
    if (state.selectedCrews.has(name)) {
      state.selectedCrews.delete(name);
    } else {
      state.selectedCrews.add(name);
    }

    chart.render(state);
  }

  chart.highlightCrew = function (name) {
    state.highlightedCrew = name;
    chart.render(state);
  }

  function createKey(set, gender, postfix = '') {
    return set.replace(/ /g, '') + gender + postfix;
  }

  function createClipPath(svg) {
    const clipPathId = 'clip' + (Math.random() * 100000 | 0); // TODO: Require a unique id

    svg.append('clipPath').attr('id', clipPathId).append('rect')
      .attr('width', 80)
      .attr('height', 800);

    const clipPathUrl = 'url(#' + clipPathId + ')';

    svg.select('.results-container').attr('clip-path', clipPathUrl);
  }

  function createDropShadowFilter(svg) {
    const defs = svg.append('defs');

    const dropShadowFilter = defs.append('filter')
      .attr('filterUnits', 'userSpaceOnUse')
      .attr('width', 10000) // FIXME: Should depend on data
      .attr('id', 'dropShadow');

    dropShadowFilter.append('feGaussianBlur')
      .attr('stdDeviation', 0)
      .attr('in', 'SourceAlpha');

    dropShadowFilter.append('feOffset')
      .attr('dx', 0)
      .attr('dy', 2);

    const dropShadowMerge = dropShadowFilter.append('feMerge');

    dropShadowMerge.append('feMergeNode');

    dropShadowMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
  }

  function renderClipPath(svg, numYearsToView, viewBoxHeight, xScale) {
    svg.select('clipPath').select('rect')
      .datum(numYearsToView)
      .attr('width', w => xScale(5 * w - 1) - xScale(0))
      .attr('height', viewBoxHeight + 2); // TODO: Work out why we need to extend the height
  }

  function renderDivisions(results, divisionsGroup, dayShift, xScale, transitionLength) {
    const divisions = divisionsGroup.selectAll('.division-year')
      .data(results.divisions, (d, i) => createKey(d.set, d.gender, i));

    const divisionsEnter = divisions.enter()
      .append('g')
      .attr('class', 'division-year')
      .attr('id', d => d.year);

    divisions.transition()
      .duration(transitionLength);

    divisions.exit()
      .remove();

    return divisionsEnter;
  }

  function renderDivisionsYear(divisionsEnter, startYear, xScale, yScale, transitionLength) {
    const divisionsYear = divisionsEnter.selectAll('rect.division')
      .data(d => d.divisions, d => d.start);

    divisionsYear.enter()
      .append('rect')
      .attr('class', 'division')
      .attr('id', d => d.start)
      .style('stroke', 'black')
      .style('fill', (d, i) => (i % 2 ? '#F4F4F4' : '#FFFFFF'))
      .attr('x', d => xScale(d.year - startYear) * 5)
      .attr('y', d => yScale(d.start - 0.5))
      .attr('width', xScale(4) - xScale(0))
      .attr('height', d => yScale(d.start + d.length) - yScale(d.start))
      .style('opacity', 1e-6)
      .transition()
      .duration(transitionLength)
      .style('opacity', 1);

    divisionsYear
      .transition()
      .duration(transitionLength)
      .attr('x', d => xScale(d.year - startYear) * 5)
      .attr('y', d => yScale(d.start - 0.5))
      .attr('width', xScale(4) - xScale(0))
      .attr('height', d => yScale(d.start + d.length) - yScale(d.start));

    divisionsYear.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();
  }

  function renderYears(yearsGroup, startYear, endYear, xScale, yScale, dayShift, transitionLength) {
    const years = yearsGroup.selectAll('.year')
      .data(range(startYear, endYear + 1), d => d);

    years.enter()
      .append('text')
      .attr('class', 'year')
      .attr('x', d => xScale((d - startYear) * 5 + 2))
      .attr('y', yScale(0))
      .style('font-size', '22px')
      .attr('text-anchor', 'middle')
      .text(d => d);

    years.transition()
      .duration(transitionLength)
      .attr('x', d => xScale((d - startYear) * 5 + 2));

    years.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();
  }

  function renderCrew(crews, linesGroup, selectedCrews, xScale, yScale, dayShift, transitionLength) {
    const crew = linesGroup.selectAll('.line')
      .data(crews, d => createKey(d.set, d.gender, d.name));

    const crewEnter = crew.enter()
      .append('g')
      .attr('class', d => `line ${d.name.replace(/ /g, '-')}`)
      .classed('highlighted', d => d.highlighted)
      .style('filter', d => (d.highlighted || d.hover ? 'url(#dropShadow)' : ''))
      .style('fill', 'none')
      .style('stroke', d => (d.highlighted || d.hover ? crewColor(d.name) : '#000000'))
      .style('stroke-width', d => (d.highlighted || d.hover ? '3px' : '2px'))
      .style('stroke-opacity', d => selectedCrews.size > 0 ? (d.highlighted || d.hover ? '1' : '0.5') : '1');

    crew.classed('highlighted', d => d.highlighted)
      .style('filter', d => (d.highlighted || d.hover ? 'url(#dropShadow)' : ''))
      .style('stroke', d => (d.highlighted || d.hover ? crewColor(d.name) : '#000000'))
      .style('stroke-width', d => (d.highlighted || d.hover ? '3px' : '2px'))
      .style('stroke-opacity', d => selectedCrews.size > 0 ? (d.highlighted || d.hover ? '1' : '0.5') : '1');

    crew.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();

    return crewEnter;
  }

  function renderCrewYear(crewEnter, lineFunc, transitionLength) {
    const crewYear = crewEnter.selectAll('path.active')
      .data(d => d.valuesSplit, d => createKey(d.set, d.gender, d.name + d.day));

    crewYear.enter()
      .append('path')
      .attr('d', d => lineFunc(d.values))
      .attr('class', 'active')
      .classed('blades', d => d.blades)
      .classed('spoons', d => d.spoons)
      .style('stroke-dasharray', d => d.blades ? '10,5' : (d.spoons ? '5,5' : null))
      .style('cursor', 'pointer');

    crewYear.transition()
      .duration(transitionLength)
      .attr('d', d => lineFunc(d.values));

    crewYear.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();
  }

  function renderCrewBackground(crews, crewEnter, lineFunc, transitionLength) {
    const crewBackground = crewEnter.selectAll('path.background')
      .data(d => [d], d => createKey(d.set, d.gender, d.name));

    crewBackground.enter()
      .append('path')
      .attr('d', d => lineFunc(d.values))
      .attr('class', 'background')
      .style('stroke-opacity', '0.1');

    crewBackground.transition()
      .duration(transitionLength)
      .attr('d', d => lineFunc(d.values));

    crewBackground.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();
  }

  function renderFinishLabel(crews, labelsGroup, finishLabelIndex, finishLabelPosition, numYearsToView, xScale, yScale, transitionLength, toggleSelectedCrew, highlightCrew) {
    const calculateFinishLabelPosition = d => d.values[(d.values[finishLabelIndex].pos === -1) && (finishLabelIndex % 5 !== 0) ? finishLabelIndex - 1 : finishLabelIndex].pos;

    const finishLabel = labelsGroup.selectAll('.finish-label')
      .data(crews.filter(d => calculateFinishLabelPosition(d) > -1), d => createKey(d.set, d.gender, d.name));

    finishLabel.enter()
      .append('text')
      .on('click', d => {
        toggleSelectedCrew(d.name);
      })
      .on('mouseover', d => {
        highlightCrew(d.name);
      })
      .on('mouseout', () => {
        highlightCrew(null);
      })
      .classed('label finish-label', true)
      .classed('highlighted', d => d.highlighted)
      .style('font-weight', d => d.highlighted ? 'bold' : 'normal')
      .datum(d => ({ name: d.name, set: d.set, gender: d.gender, pos: calculateFinishLabelPosition(d) }))
      .attr('x', 10)
      .attr('dy', '.35em')
      .text(d => renderName(d.name, d.set))
      .attr('transform', d =>
        `translate(${xScale(finishLabelPosition + 5 * (numYearsToView - 1))},${yScale(d.pos)})`)
      .style('font-size', '16px')
      .style('cursor', 'pointer');

    finishLabel.classed('highlighted', d => d.highlighted || d.hover)
      .style('font-weight', d => d.highlighted || d.hover ? 'bold' : 'normal')
      .transition()
      .duration(transitionLength)
      .attr('transform', d =>
        `translate(${xScale(finishLabelPosition + 5 * (numYearsToView - 1))},${yScale(calculateFinishLabelPosition(d))})`);

    finishLabel.exit()
      .remove();
  }

  function renderStartLabel(crews, labelsGroup, startLabelIndex, startLabelPosition, xScale, yScale, transitionLength, toggleSelectedCrew, highlightCrew) {
    const calculateStartLabelPosition = d => {
      let startValue = d.values.find(x => x.day === startLabelIndex);

      if (startValue === undefined) {
        startValue = d.values.find(x => x.day === startLabelIndex - 1)
      }

      return startValue.pos;
    }

    const startLabel = labelsGroup.selectAll('.start-label')
      .data(crews.filter(d => calculateStartLabelPosition(d) > -1), d => createKey(d.set, d.gender, d.name));

    startLabel.enter()
      .append('text')
      .on('click', d => {
        toggleSelectedCrew(d.name);
      })
      .on('mouseover', d => {
        highlightCrew(d.name);
      })
      .on('mouseout', () => {
        highlightCrew(null);
      })
      .classed('label start-label', true)
      .classed('highlighted', d => d.highlighted)
      .style('font-weight', d => d.highlighted ? 'bold' : 'normal')
      .datum(d => ({ name: d.name, set: d.set, gender: d.gender, pos: calculateStartLabelPosition(d) }))
      .attr('x', -10)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text(d => renderName(d.name, d.set))
      .attr('transform', d => `translate(${xScale(startLabelPosition)},${yScale(d.pos)})`)
      .style('font-size', '16px')
      .style('cursor', 'pointer');

    startLabel.classed('highlighted', d => d.highlighted || d.hover)
      .style('font-weight', d => d.highlighted || d.hover ? 'bold' : 'normal')
      .transition()
      .duration(transitionLength)
      .attr('transform', d => `translate(${xScale(startLabelPosition)},${yScale(calculateStartLabelPosition(d))})`);

    startLabel.exit()
      .remove();
  }

  function renderNumbersRight(crews, labelsGroup, finishLabelIndex, numYearsToView, numbersRightPosition, xScale, yScale, transitionLength) {
    const calculateFinishLabelPosition = d => d.values[d.values[finishLabelIndex].pos === -1 ? finishLabelIndex - 1 : finishLabelIndex].pos;

    const numbersRight = labelsGroup.selectAll('.position-label-right')
      .data(range(0, crews.filter(d => calculateFinishLabelPosition(d) > -1).length),
      d => d);

    numbersRight.enter()
      .append('text')
      .attr('class', 'position-label-right')
      .text((d, i) => i + 1)
      .style('fill', '#888888')
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr('transform', (d, i) => `translate(${xScale(numbersRightPosition + 5 * numYearsToView)},${yScale(i + 1)})`)
      .transition()
      .duration(transitionLength)
      .style('font-size', '16px')
      .style('opacity', 1);

    numbersRight.transition()
      .duration(transitionLength)
      .attr('transform', (d, i) => `translate(${xScale(numbersRightPosition + 5 * numYearsToView)},${yScale(i + 1)})`);

    numbersRight.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 0)
      .remove();
  }

  function renderNumbersLeft(divisions, labelsGroup, startYear, numbersLeftPosition, xScale, yScale, transitionLength) {
    const numbers = [];

    let startYearDivisions = divisions.find(x => x.year === startYear);

    if (startYearDivisions === undefined) {
      startYearDivisions = divisions.find(x => x.year === startYear - 1);
    }

    startYearDivisions.divisions.forEach(d => {
      for (let i = 0; i < d.length; i++) {
        numbers.push(i + 1);
      }
    });

    const numbersLeft = labelsGroup.selectAll('.position-label-left')
      .data(numbers, (d, i) => i);

    numbersLeft.enter()
      .append('text')
      .attr('class', 'position-label-left')
      .text(d => d)
      .style('fill', '#888888')
      .attr('dy', '.35em')
      .attr('text-anchor', 'start')
      .attr('transform', (d, i) => `translate(${xScale(numbersLeftPosition)},${yScale(i + 1)})`)
      .transition()
      .duration(transitionLength)
      .style('font-size', '16px')
      .style('opacity', 1);

    numbersLeft.transition()
      .duration(transitionLength)
      .text(d => d)
      .attr('transform', (d, i) => `translate(${xScale(numbersLeftPosition)},${yScale(i + 1)})`);

    numbersLeft.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 0)
      .remove();
  }

  return chart;
}
