import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { max, range } from 'd3-array';
import 'd3-transition'; // We require the side-effects of importing

import { crewColor, renderName } from './util.js';

export default function () {
  var selectedCrews = new Set();

  function bumpsChart() {
  }

  bumpsChart.setup = function (el) {
    const svg = select(el).select('svg');

    const clipPathId = 'clip' + Math.random(100000); // TODO: Require a unique id

    svg.append('clipPath').attr('id', clipPathId).append('rect')
      .attr('width', 80)
      .attr('height', 800);

    const clipPathUrl = 'url(#' + clipPathId + ')';

    svg.append('g').attr('class', 'divisions').attr('clip-path', clipPathUrl);
    svg.append('g').attr('class', 'years').attr('clip-path', clipPathUrl);
    svg.append('g').attr('class', 'labels');
    svg.append('g').attr('class', 'lines').attr('clip-path', clipPathUrl);

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

    return svg;
  };

  bumpsChart.update = function update(props, svg) {
    const data = props.data;
    const year = props.year;
    const selectedCrews = props.selectedCrews;
    const highlightedCrew = props.highlightedCrew;
    const addSelectedCrew = props.addSelectedCrew;
    const removeSelectedCrew = props.removeSelectedCrew;
    const highlightCrew = props.highlightCrew;
    const windowWidth = props.windowWidth;

    const focus = props.focus;

    if (data === undefined || year === null) {
      return;
    }

    const crews = data.crews;
    const widthOfOneYear = 80;
    const heightOfOneCrew = 20;
    const widthWithoutLines = 310;
    const initialViewBoxX = -165;
    const initialViewBoxY = 0;
    const transitionLength = 500;
    const startLabelPosition = 0;
    const finishLabelPosition = 4;
    const numbersLeftPosition = -8;
    const numbersRightPosition = 7;
    const xRangeMax = widthOfOneYear;
    const numYearsToView = year.end - year.start + 1;
    const yMarginTop = 10;

    crews.forEach(crew => crew.highlighted = selectedCrews.has(crew.name));
    crews.forEach(crew => crew.hover = highlightedCrew === crew.name);

    const x = scaleLinear();
    const y = scaleLinear();

    x.domain([0, 4]);
    x.range([0, xRangeMax]);

    const yDomainMax = max(crews, c => max(c.values.filter(d => d !== null), v => v.pos));

    y.domain([-1, yDomainMax]);
    y.range([yMarginTop, yDomainMax * heightOfOneCrew - yMarginTop]);

    const viewBoxWidth = (widthWithoutLines + widthOfOneYear * 5 / 4 * numYearsToView);
    const viewBoxHeight = yDomainMax * heightOfOneCrew;

    const width = focus ? windowWidth : window.innerWidth;

    svg.attr('height', viewBoxHeight / viewBoxWidth * width)
      .attr('viewBox', `${initialViewBoxX}, ${initialViewBoxY}, ${viewBoxWidth}, ${viewBoxHeight}`);

    const divisionsGroup = svg.select('.divisions');
    const yearsGroup = svg.select('.years');
    const labelsGroup = svg.select('.labels');
    const lines = svg.select('.lines');

    const lineFunc = line()
      .defined(d => d !== null && d.pos > -1)
      .x((d) => x(d.day))
      .y((d) => y(d.pos));

    const startYear = data.startYear;
    const endYear = data.endYear;

    const yearRelative = year.start - startYear;

    const dayShift = yearRelative * 5;
    const startLabelIndex = yearRelative * 5;
    let finishLabelIndex = startLabelIndex + numYearsToView * 5 - 1;

    const maxDays = max(data.crews.map(c => c.values.length));

    if (finishLabelIndex > maxDays - 1) {
      finishLabelIndex = maxDays - 1;
    }

    // ClipPath
    const clipPath = svg.select('clipPath').select('rect')
      .datum(numYearsToView);

    clipPath.transition()
      .duration(transitionLength)
      .attr('width', w => x(5 * w - 1))
      .attr('height', viewBoxHeight);

    // Divisions
    const divisions = divisionsGroup.selectAll('.divisionYear')
      .data(data.divisions, (d, i) => d.gender + d.set.replace(/ /g, '') + i);

    const divisionsEnter = divisions.enter()
      .append('g')
      .attr('class', 'divisionYear')
      .attr('id', d => d.year)
      .attr('transform', `translate(${x(-dayShift)},0)`);

    divisions.transition()
      .duration(transitionLength)
      .attr('transform', `translate(${x(-dayShift)},0)`);

    divisions.exit()
      .remove();

    // DivisionsYear
    const divisionsYear = divisionsEnter.selectAll('rect.division')
      .data(d => d.divisions, d => d.start);

    divisionsYear.enter()
      .append('rect')
      .attr('class', 'division')
      .attr('id', d => d.start)
      .style('stroke', 'black')
      .style('fill', (d, i) => (i % 2 ? '#E0E0E0' : '#FFFFFF'))
      .attr('x', d => x(d.year - startYear) * 5)
      .attr('y', d => y(d.start - 0.5))
      .attr('width', x(4) - x(0))
      .attr('height', d => y(d.start + d.length) - y(d.start))
      .style('opacity', 1e-6)
      .transition()
      .duration(transitionLength)
      .style('opacity', 1);

    divisionsYear
      .transition()
      .duration(transitionLength)
      .attr('x', d => x(d.year - startYear) * 5)
      .attr('y', d => y(d.start - 0.5))
      .attr('width', x(4) - x(0))
      .attr('height', d => y(d.start + d.length) - y(d.start));

    divisionsYear.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();

    // Years
    const years = yearsGroup.selectAll('.year')
      .data(range(startYear, endYear + 1), d => d);

    years.enter()
      .append('text')
      .attr('class', 'year')
      .attr('x', d => x((d - startYear) * 5 + 2))
      .attr('y', y(0))
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${x(-dayShift)},0)`)
      .text(d => d);

    years.transition()
      .duration(transitionLength)
      .attr('x', d => x((d - startYear) * 5 + 2))
      .attr('transform', `translate(${x(-dayShift)},0)`);

    years.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();

    // Crew
    const crew = lines.selectAll('.line')
      .data(crews, d => d.gender + d.set.replace(/ /g, '') + d.name);

    const crewEnter = crew.enter()
      .append('g')
      .attr('class', d => `line ${d.name.replace(/ /g, '-')}`)
      .attr('transform', `translate(${x(-dayShift)},0)`)
      .classed('highlighted', d => d.highlighted)
      .classed('background', d => d.background)
      .style('filter', d => (d.highlighted || d.hover ? 'url(#dropShadow)' : ''))
      .style('stroke', d => (d.highlighted || d.hover ? crewColor(d.name) : '#000000'));

    crew.classed('highlighted', d => d.highlighted)
      .classed('background', d => d.background)
      .style('filter', d => (d.highlighted || d.hover ? 'url(#dropShadow)' : ''))
      .style('stroke', d => (d.highlighted || d.hover ? crewColor(d.name) : '#000000'))
      .transition()
      .duration(transitionLength)
      .attr('transform', `translate(${x(-dayShift)},0)`);

    crew.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();

    // CrewYear
    const crewYear = crewEnter.selectAll('path.active')
      .data(d => d.valuesSplit, d => d.gender + d.set.replace(/ /g, '') + d.name + d.day);

    crewYear.enter()
      .append('path')
      .attr('d', d => lineFunc(d.values))
      .attr('class', 'active')
      .classed('blades', d => d.blades)
      .classed('spoons', d => d.spoons)
      .style('cursor', 'pointer');

    crewYear.transition()
      .duration(transitionLength)
      .attr('d', d => lineFunc(d.values));

    crewYear.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();

    // CrewBackground
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
      .style('cursor', 'pointer');

    crewBackground.transition()
      .duration(transitionLength)
      .attr('d', d => lineFunc(d.values));

    crewBackground.exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 1e-6)
      .remove();

    // FinishLabel
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
      .text(d => renderName(d.name))
      .attr('transform', d =>
        `translate(${x(finishLabelPosition + 5 * (numYearsToView - 1))},${y(d.value.pos)})`)
      .style('cursor', 'pointer');

    finishLabel.classed('highlighted', d => d.highlighted || d.hover)
      .filter(d =>
        d.values[d.values.length === finishLabelIndex ? finishLabelIndex - 1 : finishLabelIndex].pos > -1)
      .transition()
      .duration(transitionLength)
      .attr('transform', d =>
        `translate(${x(finishLabelPosition + 5 * (numYearsToView - 1))},${y(d.values[d.values.length === finishLabelIndex ? finishLabelIndex - 1 : finishLabelIndex].pos)})`);

    finishLabel.exit()
      .remove();

    // StartLabel
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
      .text(d => renderName(d.name))
      .attr('transform', d => `translate(${x(startLabelPosition)},${y(d.value.pos)})`)
      .style('cursor', 'pointer');


    startLabel.classed('highlighted', d => d.highlighted || d.hover)
      .filter(d => d.values[startLabelIndex].pos > -1)
      .transition()
      .duration(transitionLength)
      .attr('transform', d => `translate(${x(startLabelPosition)},${y(d.values[startLabelIndex].pos)})`);

    startLabel.exit()
      .remove();

    // NumbersRight
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
      .attr('transform', (d, i) => `translate(${x(numbersRightPosition + 5 * numYearsToView)},${y(i + 1)})`)
      .transition()
      .duration(transitionLength)
      .style('opacity', 1);

    numbersRight.transition()
      .duration(transitionLength)
      .attr('transform', (d, i) => `translate(${x(numbersRightPosition + 5 * numYearsToView)},${y(i + 1)})`);

    numbersRight.exit()
      .remove();

    // NumbersLeft
    const numbers = [];

    data.divisions[yearRelative].divisions.forEach(d => {
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
      .attr('transform', (d, i) => `translate(${x(numbersLeftPosition)},${y(i + 1)})`)
      .transition()
      .duration(transitionLength)
      .style('opacity', 1);

    numbersLeft.transition()
      .duration(transitionLength)
      .text(d => d)
      .attr('transform', (d, i) => `translate(${x(numbersLeftPosition)},${y(i + 1)})`);

    numbersLeft.exit()
      .remove();
  }

  bumpsChart.addSelectedCrew = function (name) {
    selectedCrews.add(name);
  }

  bumpsChart.removeSelectedCrew = function (name) {
    selectedCrews.delete(name);
  }

  bumpsChart.highlightCrew = function () {
  }

  return bumpsChart;
}
