
const Dataset = function (data, options) {
    const { y, x, yMax } = data;
    this.x = x;
    this.y = y;
    this.xMax = d3.max(x, x => x);

    //stacking
    const y1 = [];

    for (let i = 0; i < y.length; i++) {
        const yv = y[i].map(v => { return v[0] });
        y1.push(yv);
    }

    this.stacked = options ? options.stacked : false;
    //transposed -> transposed[m][n]
    const transposed = d3.transpose(y1);
    //stack by key [0..n]
    const stackFunc = d3.stack().keys(d3.range(y1.length));
    //key the data
    //stackedData -> stackedData[i:n][j:m][2] y0 - y1, hold transposed[i:n][j:m] as data
    const stackedData = stackFunc(transposed);
    //
    //add index to the series as last element of array
    //y01z[i:n][j:m][3]
    //
    this.dataset = stackedData.map((d, i) => d.map(([y0, y1]) => [y0, y1, i]));
    //find yMax and y1Max if not given
    if (!yMax) {
        if (this.stacked) {
            this.yMax = d3.max(this.dataset, y => d3.max(y, d => d[1]));
        } else {
            //find y max for all series
            const maxes = [];
            for (let i = 0; i < y.length; i++) {
                maxes.push(d3.max(y[i], v => {
                    return v[0];
                }
                ));
            }
            this.yMax = d3.max(maxes);
        }
    }
    else {
        this.yMax = yMax;
    }
}

const CSVDataset = function (file, successCallback) {
    const dataset = d3.tsv(file).then(function (data) {
        return data;
    });
    const coords = dataset.then(function (d) {
        return Promise.all(d.map(function (d) {
            return [d.Name,
            Number(d.Latitude),
            Number(d.Longitude),
            Number(d.Population)];
        }))
    });
    coords.then(function (data) {
        successCallback(data);
    });
}

const RandomDataset = function (n, m, k=1) {
    //create an array [0..m]
    this.x = d3.range(m);
    //
    //create an array [0..n], for each, create an array [0..m] with function bumps
    //yz[n][m] -> yz[2][20]
    //
    this.y = d3.range(n).map(() => RandomMetrics(m, k));
}

const RandomDatasetWithArray = function (arr) {
    this.x = d3.range(arr.length);
    this.y = [];
    let series = [];
    for (v of arr) {
        series.push([v]);
    }
    this.y.push(series);
}

const RandomMetrics = (m, k) => {
    const values = [];
    // Initialize with uniform random values in [0.1, 0.2).
    for (let i = 0; i < m; ++i) {
        const item = [];
        for (let j = 0; j < k; ++j) {
            item[j] = 0.1 + 0.1 * Math.random();
        }
        values[i] = item;
    }
    // Add five random bumps.
    for (let i = 0; i < m; i++) {
        const item = values[i];
        for (let l = 0; l < k; ++l) {
            for (let j = 0; j < 100; ++j) {
                const x = 1 / (0.1 + Math.random());
                const y = 2 * Math.random() - 0.5;
                const z = 10 / (0.1 + Math.random());
                const w = (i / m - y) * z;
                item[l] += x * Math.exp(-w * w);
            }
        }
    }
    return values;
}
