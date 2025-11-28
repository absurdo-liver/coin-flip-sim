const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const resetButton = document.getElementById('resetButton');
const playPauseButton = document.getElementById('playPauseButton');
const runOnceButton = document.getElementById('runOnceButton');
const run100Button = document.getElementById('run100Button');
const exportButton = document.getElementById('exportButton');
const meanMasterHDisplay = document.getElementById('meanMasterH');
const miniMeanHDisplay = document.getElementById('miniMeanH');

var a = 1;
var maxTries = 100;
let h = [];
let hm = [];
let check = 0;
var simSpeedms = 10;
var WLratio = [];

let intervalId;
let isPlaying = true;

function operation() {
	if (Math.round(Math.random()) === 1) {
		a *= 1.1;
		WLratio.push(1);
	} else {
		a *= 0.9;
		WLratio.push(0);
	}
	h.push(a);
}

function reset() {
	h = [];
	a = 1;
	check = 0;
}

function push() {
	const sum = h.reduce((acc, val) => acc + val, 0);
	const mean = h.length > 0 ? sum / h.length : 0;
	hm.push(mean);
	check = 1;
}

function main() {
	if (hm.length < maxTries) {
		if (h.length < maxTries) {
			operation();
		} else {
			if (check === 0) {
				push();
			} else {
				reset();
			}
		}
	}
}

function getViewportValues() {
	const xMin = 0;
	const xMax = maxTries + maxTries / 100;

	let maxY;
	if (h.length === 0) {
		maxY = 2.5;
	} else {
		const maxH = Math.max(...h);
		maxY = (maxH <= 2.5) ? 2.5 : maxH + 1;
	}
	const minY = -0.05;

	return {
		xMin,
		xMax,
		minY,
		maxY
	};
}

function mapToCanvas(x, y, xMin, xMax, yMin, yMax, canvasWidth, canvasHeight) {
	const padding = 50;
	const chartWidth = canvasWidth - 2 * padding;
	const chartHeight = canvasHeight - 2 * padding;

	const mappedX = ((x - xMin) / (xMax - xMin)) * chartWidth + padding;
	const mappedY = chartHeight - ((y - yMin) / (yMax - yMin)) * chartHeight + padding;
	return {
		x: mappedX,
		y: mappedY
	};
}

function drawGrid(xMin, xMax, yMin, yMax) {
	const gridColor = '#eee';
	const axisColor = '#000';
	const padding = 50;

	ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.font = '12px sans-serif';
	ctx.textAlign = 'right';
	ctx.fillStyle = '#000';

	ctx.strokeStyle = axisColor;
	ctx.lineWidth = 2;
	ctx.beginPath();
	const originY = mapToCanvas(0, 0, xMin, xMax, yMin, yMax, canvas.width, canvas.height).y;
	ctx.moveTo(padding, originY);
	ctx.lineTo(padding, canvas.height - padding);
	ctx.lineTo(canvas.width - padding, canvas.height - padding);
	ctx.stroke();

	ctx.strokeStyle = gridColor;
	ctx.lineWidth = 1;
	const numGraduations = 10;
	const yStep = (yMax - yMin) / numGraduations;
	for (let i = 0; i <= numGraduations; i++) {
		const yValue = yMin + i * yStep;
		const {
			y
		} = mapToCanvas(0, yValue, xMin, xMax, yMin, yMax, canvas.width, canvas.height);

		ctx.beginPath();
		ctx.moveTo(padding, y);
		ctx.lineTo(canvas.width - padding, y);
		ctx.stroke();

		ctx.fillText(yValue.toFixed(2), padding - 5, y + 4);
	}
}

function drawYEqualsOne(xMin, xMax, yMin, yMax) {
	const horizontalLinePadding = 50;
	const {
		y
	} = mapToCanvas(0, 1, xMin, xMax, yMin, yMax, canvas.width, canvas.height);

	ctx.strokeStyle = '#333';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(horizontalLinePadding, y);
	ctx.lineTo(canvas.width - horizontalLinePadding, y);
	ctx.stroke();

	ctx.textAlign = 'left';
	ctx.fillStyle = '#333';
	ctx.fillText('y=1', canvas.width - horizontalLinePadding + 5, y + 4);
}

function drawPoints(xMin, xMax, yMin, yMax) {
	for (let i = 0; i < h.length; i++) {
		const {
			x,
			y
		} = mapToCanvas(i + 1, h[i], xMin, xMax, yMin, yMax, canvas.width, canvas.height);
		const color = h[i] >= 1 ? 'hsl(100, 100%, 50%)' : 'hsl(0, 100%, 50%)';
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
		ctx.fill();
	}
}

function drawLines(xMin, xMax, yMin, yMax) {
	if (h.length > 1) {
		ctx.strokeStyle = '#000';
		ctx.lineWidth = 1;
		ctx.beginPath();
		const startPoint = mapToCanvas(1, h[0], xMin, xMax, yMin, yMax, canvas.width, canvas.height);
		ctx.moveTo(startPoint.x, startPoint.y);
		for (let i = 1; i < h.length; i++) {
			const {
				x,
				y
			} = mapToCanvas(i + 1, h[i], xMin, xMax, yMin, yMax, canvas.width, canvas.height);
			ctx.lineTo(x, y);
		}
		ctx.stroke();
	}
}

function drawMeanLines(xMin, xMax, yMin, yMax) {
	const horizontalLinePadding = 50;

	if (h.length > 0) {
		const miniMean = h.reduce((acc, val) => acc + val, 0) / h.length;
		const {
			y
		} = mapToCanvas(0, miniMean, xMin, xMax, yMin, yMax, canvas.width, canvas.height);
		ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
		ctx.beginPath();
		ctx.moveTo(horizontalLinePadding, y);
		ctx.lineTo(canvas.width - horizontalLinePadding, y);
		ctx.stroke();
		miniMeanHDisplay.textContent = miniMean.toFixed(4);
	} else {
		miniMeanHDisplay.textContent = '0';
	}

	if (hm.length > 0) {
		const masterMean = hm.reduce((acc, val) => acc + val, 0) / hm.length;
		const {
			y
		} = mapToCanvas(0, masterMean, xMin, xMax, yMin, yMax, canvas.width, canvas.height);
		ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
		ctx.beginPath();
		ctx.moveTo(horizontalLinePadding, y);
		ctx.lineTo(canvas.width - horizontalLinePadding, y);
		ctx.stroke();
		meanMasterHDisplay.textContent = masterMean.toFixed(4);
	} else {
		meanMasterHDisplay.textContent = '0';
	}
}

function renderScene() {
	const {
		xMin,
		xMax,
		minY,
		maxY
	} = getViewportValues();
	drawGrid(xMin, xMax, minY, maxY);
	drawLines(xMin, xMax, minY, maxY);
	drawPoints(xMin, xMax, minY, maxY);
	drawYEqualsOne(xMin, xMax, minY, maxY);
	drawMeanLines(xMin, xMax, minY, maxY);
}

function tick() {
	main();
	renderScene();
}

function togglePlayPause() {
	if (isPlaying) {
		clearInterval(intervalId);
		playPauseButton.textContent = 'Play';
	} else {
		intervalId = setInterval(tick, simSpeedms);
		playPauseButton.textContent = 'Pause';
	}
	isPlaying = !isPlaying;
}

function runOnce() {
	if (isPlaying) {
		togglePlayPause();
	}
	tick();
}

function run100Times() {
	if (isPlaying) {
		togglePlayPause();
	}
	let counter = 0;
	const runInterval = setInterval(() => {
		if (counter < 100) {
			tick();
			counter++;
		} else {
			clearInterval(runInterval);
		}
	}, simSpeedms);
}

function hardReset() {
	h = [];
	hm = [];
	a = 1;
	check = 0;
	renderScene();
	if (!isPlaying) {
		togglePlayPause();
	}
}

function arraysToCsvString() {
	const numRows = Math.max(h.length, hm.length);
	const rows = [
		['Points (H)', 'Master History (Hm)']
	];

	for (let i = 0; i < numRows; i++) {
		const hValue = i < h.length ? h[i] : '';
		const hmValue = i < hm.length ? hm[i] : '';
		rows.push([hValue, hmValue]);
	}

	return rows.map(row => row.join(',')).join('\n');
}

function exportToCsv() {
	const csvContent = arraysToCsvString();
	const blob = new Blob([csvContent], {
		type: 'text/csv;charset=utf-8;'
	});
	const link = document.createElement('a');

	if (navigator.msSaveBlob) {
		navigator.msSaveBlob(blob, 'simulation_data.csv');
	} else {
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', 'simulation_data.csv');
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
}

function startSimulation() {
	intervalId = setInterval(tick, simSpeedms);
}

function resizeHandler() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	renderScene();
}

resetButton.addEventListener('click', hardReset);
playPauseButton.addEventListener('click', togglePlayPause);
runOnceButton.addEventListener('click', runOnce);
run100Button.addEventListener('click', run100Times);
exportButton.addEventListener('click', exportToCsv);

window.addEventListener('resize', resizeHandler);
window.addEventListener('DOMContentLoaded', () => {
	resizeHandler();
	startSimulation();
	console.log(
  `welcome developper / console enthusiast
================================================
i won't try to bore you with any boring talk
so i'll just tell you what you can do here
without anything breaking (hopefully)
================================================
you can change the initial value by accessing:
variable: a
default value: 1
requires: integer (safely) or float (not tested)
value describes initial value before growth/decay
------------------------------------------------
you can change the number of iterations by accessing:
variable: maxTries
default value: 100
requires: integer (safely) or float (not tested)
------------------------------------------------
you can change the simulation speed by accessing:
variable: simSpeedms
default value: 10
requires: integer
value describes milliseconds in between iterations
------------------------------------------------
you can change the isPlaying state by accessing:
variable: isPlaying
default value: true
requires: boolean
value describes wether the simulation is running
------------------------------------------------`
);
});

/*
for funsies you can paste this into the console:

maxTries = 500;
hardReset()
const tempInt = setInterval(() => {
    let countW = 0;
let countL = 0;
for(let i = 0; i < WLratio.length; i++){
    if(WLratio[i] === 1){
        countW++
    } else {
        countL++
    }
}
console.log(countW, countL, countW/countL);
}, 5000);
*/
