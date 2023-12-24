import 'd3-transition'; // We require the side-effects of importing

import { crewColor, renderName } from './util.js';
import { max, range, scan } from 'd3-array';

import { dispatch } from 'd3-dispatch';
import { line } from 'd3-shape';
import { scaleLinear } from 'd3-scale';

export const widthOfOneYear = 110;

export default function () {
  let svg;
  let _data;

  let hammertime;

  let year;
  let yearRange;
  let numYearsToView = 5;
  let highlightedCrew;
  let selectedCrews = new Set();
  let windowWidth;

  let container;
  let g;
  let divisionsGroup;
  let yearsGroup;
  let labelsGroup;
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
    selection.each(function (data) {
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
    container.append('rect').attr('class', 'touch-target');

    hammertime = new Hammer(svg.node()); // eslint-disable-line no-undef

    hammertime.on('panmove', function (ev) {
      g.attr('transform', `translate(${ev.deltaX - xScale(dayShift)},0)`);
    });

    hammertime.on('panend', function (ev) {
      const x = xScale.invert(-ev.deltaX + xScale(dayShift));

      let i = scan(
        _data.divisions,
        (a, b) => Math.abs(a.startDay - x) - Math.abs(b.startDay - x)
      );

      // Too far to the right
      if (i + numYearsToView > _data.divisions.length) {
        i = _data.divisions.length - numYearsToView;
      }

      year = _data.divisions[i].year;

      selectYear(
        _data.divisions[i].year,
        _data.divisions[i + numYearsToView - 1].year
      );
    });

    divisionsGroup = g.append('g').attr('class', 'divisions');
    yearsGroup = g.append('g').attr('class', 'years');
    linesGroup = g.append('g').attr('class', 'lines');
    labelsGroup = svg.append('g').attr('class', 'labels');

    createClipPath(svg);
    createDropShadowFilter(svg);
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

    const crews = results.crews;

    const heightOfOneCrew = 34;
    const widthWithoutLines = 310;
    const initialViewBoxX = -165;
    const initialViewBoxY = 0;
    const yMarginTop = 10;
    const transitionLength = 400;

    crews.forEach((crew) => (crew.highlighted = selectedCrews.has(crew.name)));
    crews.forEach((crew) => (crew.hover = highlightedCrew === crew.name));

    const yDomainMax =
      crews.length > 0
        ? max(crews, (c) =>
            max(
              c.values.filter((d) => d !== null),
              (v) => v.pos
            )
          )
        : 0;

    const maxEntries = Math.max(...crews.map((c) => c.valuesSplit.length));

    const maxCrewIndex = crews.findIndex(
      (crew) => crew.valuesSplit.length === maxEntries
    );

    const xDomain = [];
    const xRange = [];
    let count = 0;

    crews[maxCrewIndex].valuesSplit.forEach((d) => {
      xDomain.push(d.values[0].day);
      xDomain.push(d.values[d.values.length - 1].day);
      xRange.push(((count * 5) / 4) * widthOfOneYear);
      xRange.push(((count * 5) / 4) * widthOfOneYear + widthOfOneYear);
      count += 1;
    });

    xScale = scaleLinear().domain(xDomain).range(xRange);

    // TODO: yScale origin changing causes charts to move about when changing data sets
    const yScale = scaleLinear()
      .domain([-1, yDomainMax])
      .range([yMarginTop, yDomainMax * heightOfOneCrew - yMarginTop]);

    const viewBoxWidth =
      widthWithoutLines + ((widthOfOneYear * 5) / 4) * numYearsToView;

    const viewBoxHeight = yDomainMax * heightOfOneCrew;
    const width = windowWidth;

    svg
      .attr('height', (viewBoxHeight / viewBoxWidth) * width)
      .attr(
        'viewBox',
        `${initialViewBoxX}, ${initialViewBoxY}, ${viewBoxWidth}, ${viewBoxHeight}`
      );

    const startDay = results.divisions.find(
      (d) => d.year === yearRange.start
    ).startDay;

    const endDay =
      results.divisions.find((d) => d.year === yearRange.end).startDay +
      results.divisions.find((d) => d.year === yearRange.end).numDays;

    dayShift = startDay;
    const startLabelIndex = startDay;
    let finishLabelIndex = endDay;

    // Check for incomplete last event, e.g. only 2 days completed of the 4
    const maxDays = max(
      results.crews.map((c) =>
        max(c.values.filter((v) => v.pos > -1 || v.day < finishLabelIndex - 5))
      )
    );

    if (finishLabelIndex > maxDays - 1) {
      finishLabelIndex = maxDays - 1;
    }

    container
      .select('.touch-target')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', viewBoxHeight + 16)
      .attr('fill', 'transparent');

    g.attr('transform', `translate(${-xScale(dayShift)},0)`);
    renderClipPath(svg, viewBoxHeight);
    renderDivisions(results, divisionsGroup, xScale, yScale);

    renderYears(results, yearsGroup, xScale, yScale);

    renderCrews(
      crews,
      linesGroup,
      xScale,
      yScale,
      selectedCrews,
      transitionLength
    );

    renderFinishLabel(
      crews,
      labelsGroup,
      finishLabelIndex,
      yScale,
      transitionLength,
      toggleSelectedCrew,
      highlightCrew
    );

    renderStartLabel(
      crews,
      labelsGroup,
      startLabelIndex,
      yScale,
      transitionLength,
      toggleSelectedCrew,
      highlightCrew
    );

    renderNumbersRight(
      crews,
      labelsGroup,
      finishLabelIndex,
      numYearsToView,
      yScale,
      transitionLength
    );

    renderNumbersLeft(
      results.divisions,
      labelsGroup,
      yearRange.start,
      yScale,
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

  function createClipPath(svg) {
    const clipPathId = 'clip' + ((Math.random() * 100000) | 0); // TODO: Require a unique id

    svg
      .append('clipPath')
      .attr('id', clipPathId)
      .append('rect')
      .attr('width', 80)
      .attr('height', 800);

    const clipPathUrl = 'url(#' + clipPathId + ')';

    svg.select('.results-container').attr('clip-path', clipPathUrl);
  }

  function createDropShadowFilter(svg) {
    const defs = svg.append('defs');

    const dropShadowFilter = defs
      .append('filter')
      .attr('filterUnits', 'userSpaceOnUse')
      .attr('width', 100000) // FIXME: Should depend on data
      .attr('id', 'dropShadow');

    dropShadowFilter
      .append('feGaussianBlur')
      .attr('stdDeviation', 0)
      .attr('in', 'SourceAlpha');

    dropShadowFilter.append('feOffset').attr('dx', 0).attr('dy', 2);

    const dropShadowMerge = dropShadowFilter.append('feMerge');
    dropShadowMerge.append('feMergeNode');
    dropShadowMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  function renderClipPath(svg, viewBoxHeight) {
    svg
      .select('clipPath')
      .select('rect')
      .datum(numYearsToView)
      .attr('width', (d) => ((d * 5 - 1) / 4) * widthOfOneYear)
      .attr('height', viewBoxHeight + 16); // TODO: Work out why we need to extend the height
  }

  function renderDivisions(results, g, xScale, yScale) {
    const divisionContainer = g
      .selectAll('.division-year')
      .data(results.divisions, (d) => d.year);

    divisionContainer.exit().remove();

    const divisionContainerEnter = divisionContainer
      .enter()
      .append('g')
      .attr('class', 'division-year')
      .attr('id', (d) => d.year);

    divisionContainerEnter
      .selectAll('rect.division')
      .data((d) =>
        d.divisions.map((division) => ({
          start: division.start,
          size: division.size,
          startDay: d.startDay,
          numDays: d.numDays,
        }))
      )
      .enter()
      .append('rect')
      .attr('class', 'division')
      .attr('id', (d) => d.start)
      .style('stroke', 'black')
      .style('fill', (d, i) => (i % 2 ? '#C4C4C4' : '#FFFFFF'))
      .attr('y', (d) => yScale(d.start - 0.5))
      .attr('width', widthOfOneYear)
      .attr('height', (d) => yScale(d.start + d.size) - yScale(d.start));

    divisionContainerEnter
      .merge(divisionContainer)
      .attr('transform', (d) => `translate(${xScale(d.startDay)},0)`);

    const division = divisionContainer.selectAll('rect.division').data((d) =>
      d.divisions.map((division) => ({
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
      .attr('id', (d) => d.start)
      .style('stroke', 'black')
      .style('fill', (d, i) => (i % 2 ? '#C4C4C4' : '#FFFFFF'))
      .attr('y', (d) => yScale(d.start - 0.5))
      .attr('width', widthOfOneYear)
      .attr('height', (d) => yScale(d.start + d.size) - yScale(d.start));

    const rects = divisionContainer.selectAll('rect.division').data((d) =>
      d.divisions.map((division) => ({
        start: division.start,
        size: division.size,
        startDay: d.startDay,
        numDays: d.numDays,
      }))
    );

    rects.exit().remove();

    rects
      .attr('y', (d) => yScale(d.start - 0.5))
      .attr('width', widthOfOneYear)
      .attr('height', (d) => yScale(d.start + d.size) - yScale(d.start));

    rects
      .enter()
      .append('rect')
      .attr('class', 'division')
      .attr('id', (d) => d.start)
      .style('stroke', 'black')
      .style('fill', (d, i) => (i % 2 ? '#C4C4C4' : '#FFFFFF'))
      .attr('y', (d) => yScale(d.start - 0.5))
      .attr('width', widthOfOneYear)
      .attr('height', (d) => yScale(d.start + d.size) - yScale(d.start));
  }

  function renderYears(results, g, xScale, yScale) {
    const years = g.selectAll('.year').data(
      results.divisions.map((d) => d.year),
      (d) => d
    );

    years
      .enter()
      .append('text')
      .attr('class', 'year')
      .attr('x', (d) => {
        const division = results.divisions.find(
          (division) => division.year === d
        );

        if (division === undefined) {
          return;
        }

        return xScale(division.startDay + division.numDays / 2);
      })
      .attr('y', yScale(0))
      .style('font-size', '22px')
      .attr('text-anchor', 'middle')
      .text((d) => d);

    years.attr('x', (d) => {
      const division = results.divisions.find(
        (division) => division.year === d
      );

      if (division === undefined) {
        return;
      }

      return xScale(division.startDay + division.numDays / 2);
    });

    years.exit().remove();
  }

  function renderCrews(data, g, xScale, yScale, selectedCrews) {
    const lineFunc = line()
      .defined((d) => d !== null && d.pos > -1)
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.pos));

    const crewContainer = g.selectAll('.line').data(data, (d) => d.name);

    crewContainer.exit().remove();

    const crewContainerEnter = crewContainer
      .enter()
      .append('g')
      .attr('class', (d) => `line ${d.name.replace(/ /g, '-')}`)
      .classed('highlighted', (d) => d.highlighted)
      .style('filter', (d) =>
        d.highlighted || d.hover ? 'url(#dropShadow)' : ''
      )
      .style('fill', 'none')
      .style('stroke', (d) =>
        d.highlighted || d.hover ? crewColor(d.name) : '#000000'
      )
      .style('stroke-width', (d) => (d.highlighted || d.hover ? '3px' : '2px'))
      .style('stroke-opacity', (d) =>
        selectedCrews.size > 0 ? (d.highlighted || d.hover ? '1' : '0.5') : '1'
      );

    crewContainerEnter
      .selectAll('path.active')
      .data((d) => d.valuesSplit)
      .enter()
      .append('path')
      .attr('class', 'active')
      .style('cursor', 'pointer')
      .classed('blades', (d) => d.blades)
      .classed('spoons', (d) => d.spoons)
      .style('stroke-dasharray', (d) =>
        d.blades ? '10,5' : d.spoons ? '5,5' : null
      )
      .attr('d', (d) => lineFunc(d.values));

    crewContainerEnter
      .selectAll('path.background')
      .data(
        (d) => [d],
        (d) => d.name
      )
      .enter()
      .append('path')
      .attr('class', 'background')
      .attr('d', (d) => lineFunc(d.values))
      .style('stroke-opacity', '0.1');

    crewContainerEnter
      .merge(crewContainer)
      .classed('highlighted', (d) => d.highlighted)
      .style('filter', (d) =>
        d.highlighted || d.hover ? 'url(#dropShadow)' : ''
      )
      .style('fill', 'none')
      .style('stroke', (d) =>
        d.highlighted || d.hover ? crewColor(d.name) : '#000000'
      )
      .style('stroke-width', (d) => (d.highlighted || d.hover ? '3px' : '2px'))
      .style('stroke-opacity', (d) =>
        selectedCrews.size > 0 ? (d.highlighted || d.hover ? '1' : '0.5') : '1'
      );

    const crews = crewContainer
      .selectAll('path.active')
      .data((d) => d.valuesSplit);

    crews.exit().remove();

    crews
      .classed('blades', (d) => d.blades)
      .classed('spoons', (d) => d.spoons)
      .style('stroke-dasharray', (d) =>
        d.blades ? '10,5' : d.spoons ? '5,5' : null
      )
      .attr('d', (d) => lineFunc(d.values));

    crews
      .enter()
      .append('path')
      .attr('class', 'active')
      .style('cursor', 'pointer')
      .classed('blades', (d) => d.blades)
      .classed('spoons', (d) => d.spoons)
      .style('stroke-dasharray', (d) =>
        d.blades ? '10,5' : d.spoons ? '5,5' : null
      )
      .attr('d', (d) => lineFunc(d.values));

    const crewsBackground = crewContainer.selectAll('path.background').data(
      (d) => [d],
      (d) => d.name
    );

    crewsBackground.exit().remove();

    crewsBackground
      .enter()
      .append('path')
      .attr('class', 'background')
      .attr('d', (d) => lineFunc(d.values))
      .style('stroke-opacity', '0.1');

    crewsBackground.attr('d', (d) => lineFunc(d.values));
  }

  function renderFinishLabel(
    crews,
    g,
    finishLabelIndex,
    yScale,
    transitionLength,
    toggleSelectedCrew,
    highlightCrew
  ) {
    const calculateFinishLabelPosition = (d) => {
      let index = finishLabelIndex;
      while (
        (d.values.find((v) => v.day === index) === undefined ||
          d.values.find((v) => v.day === index).pos === -1) &&
        index > finishLabelIndex - 4
      ) {
        index -= 1;
      }

      return d.values.find((v) => v.day === index).pos;
    };

    const finishLabel = g.selectAll('.finish-label').data(
      crews.filter((d) => calculateFinishLabelPosition(d) > -1),
      (d) => d.name
    );

    finishLabel
      .enter()
      .append('text')
      .on('click', (d) => {
        toggleSelectedCrew(d.name);
      })
      .on('mouseover', (d) => {
        // Only act on mouseover if touch is unavailable
        if (!('ontouchstart' in window || navigator.maxTouchPoints)) {
          highlightCrew(d.name);
        }
      })
      .on('mouseout', () => {
        highlightCrew(null);
      })
      .attr('class', (d) => 'label finish-label ' + d.name.replace(/ /g, '-'))
      .classed('highlighted', (d) => d.highlighted)
      .style('font-weight', (d) => (d.highlighted ? 'bold' : 'normal'))
      .datum((d) => ({
        name: d.name,
        set: d.set,
        gender: d.gender,
        pos: calculateFinishLabelPosition(d),
      }))
      .attr('x', 10)
      .attr('dy', '.35em')
      .text((d) => renderName(d.name, _data.set))
      .attr(
        'transform',
        (d) =>
          `translate(${
            ((5 * numYearsToView - 1) / 4) * widthOfOneYear
          },${yScale(d.pos)})`
      )
      .style('font-size', '16px')
      .style('cursor', 'pointer');

    finishLabel
      .classed('highlighted', (d) => d.highlighted || d.hover)
      .style('font-weight', (d) =>
        d.highlighted || d.hover ? 'bold' : 'normal'
      )
      .transition()
      .duration(transitionLength)
      .attr(
        'transform',
        (d) =>
          `translate(${
            ((5 * numYearsToView - 1) / 4) * widthOfOneYear
          },${yScale(calculateFinishLabelPosition(d))})`
      );

    finishLabel.exit().remove();
  }

  function renderStartLabel(
    crews,
    labelsGroup,
    startLabelIndex,
    yScale,
    transitionLength,
    toggleSelectedCrew,
    highlightCrew
  ) {
    const calculateStartLabelPosition = (d) => {
      let startValue = d.values.find((x) => x.day === startLabelIndex);

      if (startValue === undefined) {
        startValue = d.values.find((x) => x.day === startLabelIndex - 1);
      }

      return startValue.pos;
    };

    const startLabel = labelsGroup.selectAll('.start-label').data(
      crews.filter((d) => calculateStartLabelPosition(d) > -1),
      (d) => d.name
    );

    startLabel
      .enter()
      .append('text')
      .on('click', (d) => {
        toggleSelectedCrew(d.name);
      })
      .on('mouseover', (d) => {
        highlightCrew(d.name);
      })
      .on('mouseout', () => {
        highlightCrew(null);
      })
      .attr('class', (d) => 'label start-label ' + d.name.replace(/ /g, '-'))
      .classed('highlighted', (d) => d.highlighted)
      .style('font-weight', (d) => (d.highlighted ? 'bold' : 'normal'))
      .datum((d) => ({
        name: d.name,
        set: d.set,
        gender: d.gender,
        pos: calculateStartLabelPosition(d),
      }))
      .attr('x', -10)
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .text((d) => renderName(d.name, _data.set))
      .attr('transform', (d) => `translate(0,${yScale(d.pos)})`)
      .style('font-size', '16px')
      .style('cursor', 'pointer');

    startLabel
      .classed('highlighted', (d) => d.highlighted || d.hover)
      .style('font-weight', (d) =>
        d.highlighted || d.hover ? 'bold' : 'normal'
      )
      .transition()
      .duration(transitionLength)
      .attr(
        'transform',
        (d) => `translate(0,${yScale(calculateStartLabelPosition(d))})`
      );

    startLabel.exit().remove();
  }

  function renderNumbersRight(
    crews,
    labelsGroup,
    finishLabelIndex,
    numYearsToView,
    yScale,
    transitionLength
  ) {
    // TODO: Extract out into reusable function
    const calculateFinishLabelPosition = (d) => {
      let index = finishLabelIndex;
      while (
        (d.values.find((v) => v.day === index) === undefined ||
          d.values.find((v) => v.day === index).pos === -1) &&
        index > finishLabelIndex - 4
      ) {
        index -= 1;
      }

      return d.values.find((v) => v.day === index).pos;
    };

    const numbersRight = labelsGroup
      .selectAll('.position-label-right')
      .data(
        range(
          0,
          crews.filter((d) => calculateFinishLabelPosition(d) > -1).length
        ),
        (d) => d
      );

    numbersRight
      .enter()
      .append('text')
      .attr('class', 'position-label-right')
      .text((d, i) => i + 1)
      .style('fill', '#888888')
      .attr('dy', '.35em')
      .attr('text-anchor', 'end')
      .attr(
        'transform',
        (d, i) =>
          `translate(${
            ((5 * numYearsToView + 5) / 4) * widthOfOneYear
          },${yScale(i + 1)})`
      )
      .transition()
      .duration(transitionLength)
      .style('font-size', '16px')
      .style('opacity', 1);

    numbersRight
      .transition()
      .duration(transitionLength)
      .attr(
        'transform',
        (d, i) =>
          `translate(${
            ((5 * numYearsToView + 5) / 4) * widthOfOneYear
          },${yScale(i + 1)})`
      );

    numbersRight
      .exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 0)
      .remove();
  }

  function renderNumbersLeft(
    divisions,
    labelsGroup,
    startYear,
    yScale,
    transitionLength
  ) {
    const numbers = [];
    let startYearDivisions = divisions.find((x) => x.year === startYear);

    if (startYearDivisions === undefined) {
      startYearDivisions = divisions.find((x) => x.year === startYear - 1);
    }

    startYearDivisions.divisions.forEach((d) => {
      for (let i = 0; i < d.size; i++) {
        numbers.push(i + 1);
      }
    });

    const numbersLeft = labelsGroup
      .selectAll('.position-label-left')
      .data(numbers, (d, i) => i);

    numbersLeft
      .enter()
      .append('text')
      .attr('class', 'position-label-left')
      .text((d) => d)
      .style('fill', '#888888')
      .attr('dy', '.35em')
      .attr('text-anchor', 'start')
      .attr(
        'transform',
        (d, i) => `translate(${(-5.6 * widthOfOneYear) / 4},${yScale(i + 1)})`
      )
      .transition()
      .duration(transitionLength)
      .style('font-size', '16px')
      .style('opacity', 1);

    numbersLeft
      .transition()
      .duration(transitionLength)
      .text((d) => d)
      .attr(
        'transform',
        (d, i) => `translate(${(-5.6 * widthOfOneYear) / 4},${yScale(i + 1)})`
      );

    numbersLeft
      .exit()
      .transition()
      .duration(transitionLength)
      .style('opacity', 0)
      .remove();
  }

  chart.year = function (_) {
    if (!arguments.length) return year;
    year = _;
    return chart;
  };

  chart.numYearsToView = function (_) {
    if (!arguments.length) return numYearsToView;
    numYearsToView = _;
    return chart;
  };

  chart.highlightedCrew = function (_) {
    if (!arguments.length) return highlightedCrew;
    highlightedCrew = _;
    return chart;
  };

  chart.selectedCrews = function (_) {
    if (!arguments.length) return selectedCrews;
    selectedCrews = _;
    return chart;
  };

  chart.windowWidth = function (_) {
    if (!arguments.length) return windowWidth;
    windowWidth = _;
    return chart;
  };

  chart.on = function () {
    const value = listeners.on.apply(listeners, arguments);
    return value === listeners ? chart : value;
  };

  return chart;
}
