const BubbleSort = (array, plugin) => {
    let len = array.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            if (array[j] > array[j + 1]) {
                let tmp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = tmp;
            }
            plugin && plugin.draw({ array: [...array], highlights: [j + 1] });
            plugin && plugin.ops++;
        }
    }
    return array;
};

const InsertionSort = (array, plugin) => {
    let n = array.length;
    for (let i = 1; i < n; i++) {
        // Choosing the first element in our unsorted subarray
        let current = array[i];
        // The last element of our sorted subarray
        let j = i - 1;
        while ((j > -1) && (current < array[j])) {
            plugin && plugin.ops++;
            plugin && plugin.draw({ array: [...array], highlights: [j, i] });
            array[j + 1] = array[j];
            j--;
        }
        array[j + 1] = current;
        plugin && plugin.draw({ array: [...array], highlights: [j + 1] });
    }
    return array;
}

const SelectionSort = (array, plugin) => {
    for (var i = 0; i < array.length; i++) {
        //set min to the current iteration of i
        var min = i;
        for (var j = i + 1; j < array.length; j++) {
            if (array[j] < array[min]) {
                min = j;
                plugin && plugin.draw({ array: [...array], highlights: [min, i] });
            }
            plugin && plugin.ops++;
        }
        var temp = array[i];
        array[i] = array[min];
        array[min] = temp;
    }
    plugin && plugin.draw({ array: [...array], highlights: [min, i] });
    return array;
};

const ShellSort = (arr, plugin) => {
    var increment = arr.length / 2;
    while (increment > 0) {
        for (i = increment; i < arr.length; i++) {
            var j = i;
            var temp = arr[i];

            while (j >= increment && arr[j - increment] > temp) {
                arr[j] = arr[j - increment];
                plugin && plugin.ops++ && plugin.draw({ array: [...arr], highlights: [i, j] });
                j = j - increment;
            }
            arr[j] = temp;

        }
        if (increment == 2) {
            increment = 1;
        } else {
            increment = parseInt(increment * 5 / 11);
        }
    }
    return arr;
}

const QuickSort = (array, plugin, from, original) => {
    if (array.length < 2) {
        plugin && plugin.ops++;
        return array;
    }
    var pivot = array[0];
    var lesserArray = [];
    var greaterArray = [];

    for (var i = 1; i < array.length; i++) {
        plugin && plugin.ops++;
        if (array[i] > pivot) {
            greaterArray.push(array[i]);
        } else {
            lesserArray.push(array[i]);
        }
    }
    plugin && plugin.draw({ array: lesserArray.concat(pivot, greaterArray), from, original });
    return QuickSort(lesserArray, plugin, from, original).concat(pivot, QuickSort(greaterArray, plugin, from + lesserArray.length + 1, original));
}


function merge(left, right, plugin) {
    let resultArray = [], leftIndex = 0, rightIndex = 0;

    // We will concatenate values into the resultArray in order
    while (leftIndex < left.length && rightIndex < right.length) {
        plugin && plugin.ops++;
        if (left[leftIndex] < right[rightIndex]) {
            resultArray.push(left[leftIndex]);
            leftIndex++; // move left array cursor
        } else {
            resultArray.push(right[rightIndex]);
            rightIndex++; // move right array cursor
        }
    }

    // We need to concat here because there will be one element remaining
    // from either left OR the right
    return resultArray
        .concat(left.slice(leftIndex))
        .concat(right.slice(rightIndex));
}

const MergeSort = (array, plugin, from, original) => {
    // No need to sort the array if the array only has one element or empty
    if (array.length <= 1) {
        return array;
    }
    // In order to divide the array in half, we need to figure out the middle
    const middle = Math.floor(array.length / 2);

    // This is where we will be dividing the array into left and right
    const left = array.slice(0, middle);
    const right = array.slice(middle);
    // Using recursion to combine the left and right
    plugin && plugin.ops++;
    result = merge(
        MergeSort(left, plugin, from, original), MergeSort(right, plugin, from + middle, original), plugin
    );
    plugin && plugin.draw({ array: result, from, original });
    return result;
}

const HeapSort = (array, plugin) => {
    let arrayLength = array.length;

    for (let i = Math.floor(arrayLength / 2); i >= 0; i -= 1) {
        getHeapRoot(array, i, arrayLength, plugin);
    }

    for (let i = array.length - 1; i > 0; i--) {
        swap(array, 0, i);
        arrayLength--;
        plugin && plugin.ops++ && plugin.draw({ array: [...array], highlights: [0, i] })
        getHeapRoot(array, 0, arrayLength, plugin);
    }
    plugin && plugin.draw({ array: [...array]})
}

function swap(array, idxA, idxB) {
    const temp = array[idxA];
    array[idxA] = array[idxB];
    array[idxB] = temp;
}

function getHeapRoot(array, i, arrayLength, plugin) {
    let left = 2 * i + 1;
    let right = 2 * i + 2;
    let max = i;

    if (left < arrayLength && array[left] > array[max]) {
        max = left;
    }

    if (right < arrayLength && array[right] > array[max]) {
        max = right;
    }

    if (max != i) {
        plugin && plugin.ops++ && plugin.draw({ array: [...array], highlights: [i, max] })
        swap(array, i, max);
        plugin && plugin.ops++ && plugin.draw({ array: [...array], highlights: [i, max] })
        getHeapRoot(array, max, arrayLength, plugin);
    }
}


PlugIn = function (parentId, options) {
    this.parentId = parentId;
    this.delay = options.delay;
    this.count = 0;
    this.width = options.width;
    this.height = options.height;
    this.margin = options.margin;
    this.stack = 0;
    this.ops = 0;
    this.colors = options.colors;
}

PlugIn.prototype.onComplete = function (onComplete) {
    this.onComplete = onComplete;
    return this;
}

PlugIn.prototype.draw = function (arr) {
    const delay = this.delay * this.count++;
    this.stack++;
    setTimeout(() => {
        //
        let original = arr.array;
        let highlights = arr.highlights || [];
        if (arr.original) {
            original = arr.original;
            let pivoted = arr.array;
            for (let i = arr.from; i < arr.from + pivoted.length; i++) {
                original[i] = pivoted[i - arr.from];
                highlights.push(i);
            }
        }
        new BarChart(
            this.parentId,
            new Dataset({ ...new RandomDatasetWithArray(original) }, { stacked: false }),
            {
                selected: highlights,
                width: this.width,
                height: this.height,
                margin: this.margin,
                chartType: 'stacked',
                animation: false,
                title: `Ops ${this.ops}`,
                colors: this.colors,
                yAxis: {
                    show: true
                },
                xAxis: {
                    show: false
                }
            }
        ).redraw();
        this.stack--;
        if (this.stack == 0) {
            new BarChart(
                this.parentId,
                new Dataset({ ...new RandomDatasetWithArray(original) }, { stacked: false }),
                {
                    selected: [],
                    width: this.width,
                    height: this.height,
                    margin: this.margin,
                    chartType: 'stacked',
                    colors: this.colors,
                    animation: false,
                    yAxis: {
                        show: true
                    },
                    xAxis: {
                        show: false
                    }
                }
            ).redraw();
            this.onComplete && this.onComplete({ target: this, event: 'complete' });
        }
    }, delay);
}