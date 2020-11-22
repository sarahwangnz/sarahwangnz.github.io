BarChart = function (elemid, ds, options) {
    var self = this;
    const { dataset, xMax, yMax, x, y } = ds;
    this.dataset = dataset;
    this.xMax = xMax;
    this.yMax = yMax;

    const { width, height, margin, chartType, animation, selected, title, colors } = options;
    this.chartType = chartType;
    this.animation = animation;
    this.selected = selected;
    this.colors = colors;
    this.title = title;
    //clean up
    this.svgId = elemid + '-bar';
    d3.select('#' + this.svgId).remove();
    this.svg = d3.select('#' + elemid)
        .append("svg")
        .attr("id", this.svgId)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        
    //height
    this.y = d3.scaleLinear().domain([0, this.yMax])
        .range([height - margin.bottom, margin.top]);

    this.series = y.length;
    //color
    this.z = d3.scaleSequential(d3.interpolateBlues).domain([-0.5 * this.series, 1.5 * this.series]);

    this.x = d3.scaleBand().domain(x)
        .rangeRound([margin.left, width - margin.right])
        .padding(0.1);

    this.y.domain([0, this.yMax]);

    this.rect = this.svg.selectAll('g')
        .data(dataset)
        .join('g').attr('fill', (d, i) => this.z(i))
        .selectAll('rect')
        .data(d => d)
        .join('rect');

    if (this.animation) {
        this.rect.attr('x', (d, i) => self.x(i)).attr('y', height - margin.bottom)
            .attr('width', self.x.bandwidth())
            .transition().duration(500).delay((d, i) => i * 20);
    }

    if (!options.xAxis || options.xAxis.show) {
        xAxis = svg => svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(this.x).tickSizeOuter(10).tickFormat(
                (d, i) => {
                    return i % 2 == 1 ? '' : '' + d;
                }
            ));

        this.svg.append('g').call(xAxis);
    }
    
    if (!options.yAxis || options.yAxis.show) {
        const yTicksAmount = 5;
        yAxis = svg => svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(this.y).ticks(yTicksAmount).tickSizeOuter(10).tickFormat(
                (d) => {
                    return '' + d;
                }
            ));
        this.svg.append('g').call(yAxis);
    }
    return this;
}

BarChart.prototype.transitionGrouped = function () {
    this.rect
        .attr('x', (d, i) => this.x(i) + this.x.bandwidth() / this.series * d[2])
        .attr('width', this.x.bandwidth() / this.series);
    if (this.animation) {
        this.rect.transition();
    }
    this.rect.attr('y', d => this.y(d[1] - d[0]))
        .attr('fill', 'red')
        .attr('height', d => this.y(0) - this.y(d[1] - d[0]));
}

BarChart.prototype.transitionStacked = function () {
    this.rect
        .attr('y', d => this.y(d[1]))
        .attr('fill', (d, i) => {
            const color = this.colors ? this.colors[0] : null;
            return this.selected ? (this.selected.includes(i) ? 'red' : color) : color
        })
        .attr('height', d => this.y(d[0]) - this.y(d[1]));

    if (this.animation) {
        this.rect.transition();
    }

    this.rect.attr('x', (d, i) => this.x(i))
        .attr('width', this.x.bandwidth());

}

BarChart.prototype.redraw = function () {
    if (this.chartType === 'stacked') {
        this.transitionStacked();
    } else if (this.chartType === 'grouped') {
        this.transitionGrouped();
    }
}

LineChart = function (elemid, ds, options) {
    const { xMax, yMax, x, y } = ds;
    const { width, height, margin } = options;

    this.y = y;
    this.x = x;
    this.xMax = xMax;
    this.yMax = yMax;
    this.svgId = elemid + '-line';
    d3.select('#' + this.svgId).remove();
    this.svg = d3.select('#' + elemid)
        .append("svg")
        .attr("id", this.svgId)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    //height
    this.yScale = d3.scaleLinear()
        .domain([0, this.yMax])
        .range([height - margin.bottom, margin.top]);

    //color
    this.series = y.length;
    this.zScale = d3.scaleSequential(d3.interpolateBlues).domain([-0.5 * this.series, 1.5 * this.series]);
    this.xScale = d3.scaleLinear()
        .domain([0, xMax])
        .range([margin.left, width]);

    this.line = this.svg.selectAll('.line')
        .data(y)
        .enter()
        .append('path')
        .data(y)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5);

    xAxis = svg => svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(this.xScale).tickSizeOuter(10).tickFormat(
            (d) => {
                return '' + d;
            }
        ));

    this.svg.append('g').call(xAxis);
    const ticksAmount = 5;
    yAxis = svg => svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(this.yScale).ticks(ticksAmount).tickSizeOuter(10).tickFormat(
            (d) => {
                return '' + d;
            }
        ));

    this.svg.append('g').call(yAxis);
    return this;
}

LineChart.prototype.redraw = function () {
    this.yScale.domain([0, this.yMax]);
    this.line.attr('d', d3.line().curve(d3.curveBasis)
        .x((d, i) => { return this.xScale(this.x[i]) })
        .y((d) => { return this.yScale(d[0]) })
    );
}

ScatterChart = function (elemid, ds, options) {
    var self = this;
    const { xMax, yMax, x, y } = ds;
    const { width, height, margin, shape, shapeSize } = options;

    this.y = y;
    this.x = x;
    this.xMax = xMax;
    this.yMax = yMax;
    this.shape = shape ? shape : 'circle';
    this.shapeSize = shapeSize ? shapeSize : 10;

    this.svgId = elemid + '-scatter';
    d3.select('#' + this.svgId).remove();
    this.svg = d3.select('#' + elemid)
        .append("svg")
        .attr("id", this.svgId)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    //height
    this.yScale = d3.scaleLinear().domain([0, this.yMax])
        .range([height - margin.bottom, margin.top]);

    //size
    this.sizeScale = d3.scaleLinear().domain([0, 20])
        .range([0, this.shapeSize]);

    //color
    this.series = y.length;
    this.color = d3.scaleSequential(d3.interpolateBlues).domain([-0.5 * this.series, 1.5 * this.series]);

    //x scale
    this.xScale = d3.scaleLinear()
        .domain([0, xMax])
        .range([margin.left, width - margin.right]);

    this.rect = this.svg.selectAll('g')
        .data(y)
        .join('g').attr('fill', (d, i) => this.color(i))
        .selectAll(this.shape).data(d => d)
        .join(this.shape)
        .attr('cx', (d, i) => this.xScale(this.x[i]))
        .attr('cy', d => this.yScale(0))
        .attr('r', (d, i) => {
            return this.sizeScale(d[0] ? d[0] : 20)
        });

    xAxis = svg => svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(this.xScale).tickSizeOuter(10).tickFormat(
            (d) => {
                return '' + d;
            }
        ));

    this.svg.append('g').call(xAxis);
    const ticksAmount = 5;
    yAxis = svg => svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(this.yScale).ticks(ticksAmount).tickSizeOuter(10).tickFormat(
            (d) => {
                return '' + d;
            }
        ));

    this.svg.append('g').call(yAxis);
    return this;
}

ScatterChart.prototype.redraw = function () {
    this.yScale.domain([0, this.yMax]);
    this.rect
        .transition().duration(500).delay((d, i) => i * 20)
        .attr('cx', (d, i) => this.xScale(this.x[i]))
        .attr('cy', d => this.yScale(d[0]));
}