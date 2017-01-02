import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { max, range } from 'd3-array';
import 'd3-transition'; // We require the side-effects of importing

import { crewColor, renderName } from './util.js';

export default function () {
  let svg;
  let state;

  function chart() {
  }

  chart.setup = function setup(el) {
    svg = select(el).select('svg');

    svg.append('g').attr('class', 'divisions');
    svg.append('g').attr('class', 'years');
    svg.append('g').attr('class', 'lines');
    svg.append('g').attr('class', 'labels');

    createClipPath(svg);
    createDropShadowFilter(svg);
  }

  chart.render = function render(props) {
    state = Object.assign({}, props);

    const results = props.data;
    const yearRange = props.year;
    const selectedCrews = props.selectedCrews;
    const highlightedCrew = props.highlightedCrew;
    const addSelectedCrew = props.addSelectedCrew;
    const removeSelectedCrew = props.removeSelectedCrew;
    const highlightCrew = props.highlightCrew;
    const windowWidth = props.windowWidth;

    const fullWidth = !props.focus;

    if (results === undefined || yearRange === null) {
      return;
    }

    const crews = results.crews;

    const widthOfOneYear = 80;
    const heightOfOneCrew = 20;
    const widthWithoutLines = 310;
    const initialViewBoxX = -165;
    const initialViewBoxY = 0;
    const startLabelPosition = 0;
    const finishLabelPosition = 4;
    const numbersLeftPosition = -8;
    const numbersRightPosition = 7;
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

    const width = fullWidth ? window.innerWidth : windowWidth;

    svg.attr('height', viewBoxHeight / viewBoxWidth * width)
      .attr('viewBox', `${initialViewBoxX}, ${initialViewBoxY}, ${viewBoxWidth}, ${viewBoxHeight}`);

    const divisionsGroup = svg.select('.divisions');
    const yearsGroup = svg.select('.years');
    const labelsGroup = svg.select('.labels');
    const linesGroup = svg.select('.lines');

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

    const maxDays = max(results.crews.map(c => c.values.length));

    if (finishLabelIndex > maxDays - 1) {
      finishLabelIndex = maxDays - 1;
    }

    renderClipPath(svg, numYearsToView, viewBoxHeight, xScale);
    const divisionsEnter = renderDivisions(results, divisionsGroup, dayShift, xScale, transitionLength);
    renderDivisionsYear(divisionsEnter, startYear, xScale, yScale, transitionLength);
    renderYears(yearsGroup, startYear, endYear, xScale, yScale, dayShift, transitionLength);
    const crewEnter = renderCrew(crews, linesGroup, selectedCrews, xScale, yScale, dayShift, transitionLength);
    renderCrewYear(crewEnter, lineFunc, transitionLength);
    renderCrewBackground(crews, crewEnter, lineFunc, transitionLength, removeSelectedCrew, addSelectedCrew, highlightCrew);
    renderFinishLabel(crews, labelsGroup, finishLabelIndex, finishLabelPosition, numYearsToView, xScale, yScale, transitionLength, removeSelectedCrew, addSelectedCrew, highlightCrew)
    renderStartLabel(crews, labelsGroup, startLabelIndex, startLabelPosition, xScale, yScale, transitionLength, removeSelectedCrew, addSelectedCrew, highlightCrew);
    renderNumbersRight(crews, labelsGroup, finishLabelIndex, numYearsToView, numbersRightPosition, xScale, yScale, transitionLength)
    renderNumbersLeft(results.divisions, labelsGroup, yearDiff, numbersLeftPosition, xScale, yScale, transitionLength);
  }

  chart.addSelectedCrew = function (name) {
    state.selectedCrews.add(name);
    chart.render(state);
  }

  chart.removeSelectedCrew = function (name) {
    state.selectedCrews.delete(name);
    chart.render(state);
  }

  chart.highlightCrew = function (name) {
    state.highlightedCrew = name;
    chart.render(state);
  }

  function createClipPath(svg) {
    const clipPathId = 'clip' + Math.random(100000); // TODO: Require a unique id

    svg.append('clipPath').attr('id', clipPathId).append('rect')
      .attr('width', 80)
      .attr('height', 800);

    const clipPathUrl = 'url(#' + clipPathId + ')';

    svg.select('.divisions').attr('clip-path', clipPathUrl);
    svg.select('.years').attr('clip-path', clipPathUrl);
    svg.select('.lines').attr('clip-path', clipPathUrl);
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
      .attr('width', w => xScale(5 * w - 1))
      .attr('height', viewBoxHeight);
  }

  function renderDivisions(results, divisionsGroup, dayShift, xScale, transitionLength) {
    const divisions = divisionsGroup.selectAll('.divisionYear')
      .data(results.divisions, (d, i) => d.gender + d.set.replace(/ /g, '') + i);

    const divisionsEnter = divisions.enter()
      .append('g')
      .attr('class', 'divisionYear')
      .attr('id', d => d.year)
      .attr('transform', `translate(${xScale(-dayShift)},0)`);

    divisions.transition()
      .duration(transitionLength)
      .attr('transform', `translate(${xScale(-dayShift)},0)`);

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
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${xScale(-dayShift)},0)`)
      .text(d => d);

    years.transition()
      .duration(transitionLength)
      .attr('x', d => xScale((d - startYear) * 5 + 2))
      .attr('transform', `translate(${xScale(-dayShift)},0)`);

    years.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();
  }

  function renderCrew(crews, linesGroup, selectedCrews, xScale, yScale, dayShift, transitionLength) {
    const crew = linesGroup.selectAll('.line')
      .data(crews, d => d.gender + d.set.replace(/ /g, '') + d.name);

    const crewEnter = crew.enter()
      .append('g')
      .attr('class', d => `line ${d.name.replace(/ /g, '-')}`)
      .attr('transform', `translate(${xScale(-dayShift)},0)`)
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
      .style('stroke-opacity', d => selectedCrews.size > 0 ? (d.highlighted || d.hover ? '1' : '0.5') : '1')
      .transition()
      .duration(transitionLength)
      .attr('transform', `translate(${xScale(-dayShift)},0)`);

    crew.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();

    return crewEnter;
  }

  function renderCrewYear(crewEnter, lineFunc, transitionLength) {
    const crewYear = crewEnter.selectAll('path.active')
      .data(d => d.valuesSplit, d => d.gender + d.set.replace(/ /g, '') + d.name + d.day);

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

  function renderCrewBackground(crews, crewEnter, lineFunc, transitionLength, removeSelectedCrew, addSelectedCrew, highlightCrew) {
    const crewBackground = crewEnter.selectAll('path.background')
      .data(d => [d], d => d.gender + d.set.replace(/ /g, '') + d.name);

    crewBackground.enter()
      .append('path')
      .on('click', d => {
        const index = crews.map(c => c.name).indexOf(d.name);

        if (crews[index].highlighted === true) {
          removeSelectedCrew(d.name);
        } else {
          addSelectedCrew(d.name);
        }
      })
      .on('mouseover', d => {
        highlightCrew(d.name);
      })
      .on('mouseout', () => {
        highlightCrew(null);
      })
      .attr('d', d => lineFunc(d.values))
      .attr('class', 'background')
      .style('stroke-opacity', '0.1')
      .style('cursor', 'pointer');

    crewBackground.transition()
      .duration(transitionLength)
      .attr('d', d => lineFunc(d.values));

    crewBackground.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();
  }

  function renderFinishLabel(crews, labelsGroup, finishLabelIndex, finishLabelPosition, numYearsToView, xScale, yScale, transitionLength, removeSelectedCrew, addSelectedCrew, highlightCrew) {
    const finishLabel = labelsGroup.selectAll('.finish-label')
      .data(crews.filter(d => d.values[d.values.length === finishLabelIndex ? finishLabelIndex - 1 : finishLabelIndex].pos > -1),
      d => d.set.replace(/ /g, '') + d.gender + d.name);

    finishLabel.enter()
      .filter(d =>
        d.values[d.values.length === finishLabelIndex ? finishLabelIndex - 1 : finishLabelIndex].pos > -1)
      .append('text')
      .on('click', d => {
        const index = crews.map(c => c.name).indexOf(d.name);

        if (crews[index].highlighted === true) {
          removeSelectedCrew(d.name);
        } else {
          addSelectedCrew(d.name);
        }
      })
      .on('mouseover', d => {
        highlightCrew(d.name);
      })
      .on('mouseout', () => {
        highlightCrew(null);
      })
      .classed('label finish-label', true)
      .classed('highlighted', d => d.highlighted)
      .datum(d => ({ name: d.name, set: d.set, gender: d.gender, value: d.values[d.values.length === finishLabelIndex ? finishLabelIndex - 1 : finishLabelIndex] }))
      .attr('x', 10)
      .attr('dy', '.35em')
      .text(d => renderName(d.name, d.set))
      .attr('transform', d =>
        `translate(${xScale(finishLabelPosition + 5 * (numYearsToView - 1))},${yScale(d.value.pos)})`)
      .style('cursor', 'pointer');

    finishLabel.classed('highlighted', d => d.highlighted || d.hover)
      .filter(d =>
        d.values[d.values.length === finishLabelIndex ? finishLabelIndex - 1 : finishLabelIndex].pos > -1)
      .transition()
      .duration(transitionLength)
      .attr('transform', d =>
        `translate(${xScale(finishLabelPosition + 5 * (numYearsToView - 1))},${yScale(d.values[d.values.length === finishLabelIndex ? finishLabelIndex - 1 : finishLabelIndex].pos)})`);

    finishLabel.exit()
      .remove();
  }

  function renderStartLabel(crews, labelsGroup, startLabelIndex, startLabelPosition, xScale, yScale, transitionLength, removeSelectedCrew, addSelectedCrew, highlightCrew) {
    const startLabel = labelsGroup.selectAll('.start-label')
      .data(crews.filter(d => d.values[startLabelIndex].pos > -1),
      d => d.set.replace(/ /g, '') + d.gender + d.name);

    startLabel.enter()
      .filter(d => d.values[startLabelIndex].pos > -1)
      .append('text')
      .on('click', d => {
        const index = crews.map(c => c.name).indexOf(d.name);

        if (crews[index].highlighted === true) {
          removeSelectedCrew(d.name);
        } else {
          addSelectedCrew(d.name);
        }
      })
      .on('mouseover', d => {
        highlightCrew(d.name);
      })
      .on('mouseout', () => {
        highlightCrew(null);
      })
      .classed('label start-label', true)
      .classed('highlighted', d => d.highlighted)
      .datum(d => ({ name: d.name, set: d.set, gender: d.gender, value: d.values[startLabelIndex] }))
      .attr('x', -10)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text(d => renderName(d.name, d.set))
      .attr('transform', d => `translate(${xScale(startLabelPosition)},${yScale(d.value.pos)})`)
      .style('cursor', 'pointer');


    startLabel.classed('highlighted', d => d.highlighted || d.hover)
      .filter(d => d.values[startLabelIndex].pos > -1)
      .transition()
      .duration(transitionLength)
      .attr('transform', d => `translate(${xScale(startLabelPosition)},${yScale(d.values[startLabelIndex].pos)})`);

    startLabel.exit()
      .remove();
  }

  function renderNumbersRight(crews, labelsGroup, finishLabelIndex, numYearsToView, numbersRightPosition, xScale, yScale, transitionLength) {
    const numbersRight = labelsGroup.selectAll('.position-label-right')
      .data(range(0, crews.filter(d =>
        d.values[d.values.length === finishLabelIndex ? finishLabelIndex - 1 : finishLabelIndex].pos > -1).length),
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
      .style('opacity', 1);

    numbersRight.transition()
      .duration(transitionLength)
      .attr('transform', (d, i) => `translate(${xScale(numbersRightPosition + 5 * numYearsToView)},${yScale(i + 1)})`);

    numbersRight.exit()
      .remove();
  }

  function renderNumbersLeft(divisions, labelsGroup, yearDiff, numbersLeftPosition, xScale, yScale, transitionLength) {
    const numbers = [];

    divisions[yearDiff].divisions.forEach(d => {
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
      .style('opacity', 1);

    numbersLeft.transition()
      .duration(transitionLength)
      .text(d => d)
      .attr('transform', (d, i) => `translate(${xScale(numbersLeftPosition)},${yScale(i + 1)})`);

    numbersLeft.exit()
      .remove();
  }

  return chart;
}
