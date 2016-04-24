var bstNode = function(value) {
	this.value = value;
	this.leftNode = null;
	this.rightNode = null;
	this.parent = null;
	this.locx = null;
	this.locy = 50;
}
rootNode = null;

model = {
	'scaleFactor': 1
}

presenter = {
	'addNodeAndGetXY': function(value, ctx) {
		var node = new bstNode(value);
		if (!rootNode) {
			rootNode = node;
			node.locx = ctx.canvas.width / 2;
		} else {
			var pixelOffset = 50, parentNode = presenter.findParentFromValue(rootNode, value);
			node.parent = parentNode;
			if (value > parentNode.value) {
				node.locx = parentNode.locx + pixelOffset;
				parentNode.rightNode = node;
			} else {
				node.locx = parentNode.locx - pixelOffset;
				parentNode.leftNode = node;
			}			
			node.locy = parentNode.locy + pixelOffset*model.scaleFactor;
		}
		return node;
	},
	'findParentFromValue': function(node, value) {
		if (value < node.value || node.value == value) {
			if (!node.leftNode) {
				return node;
			} else {
				return presenter.findParentFromValue(node.leftNode, value);
			}
		} else if (value > node.value) {
			if (!node.rightNode) {
				return node;
			} else {
				return presenter.findParentFromValue(node.rightNode, value);
			}
		}
	},
	'redrawBST': function(ctx) {
		function drawDownNodes(node) {
			view.drawNode(node, ctx);
			if (node.leftNode) {
				drawDownNodes(node.leftNode)
			}
			if (node.rightNode) {
				drawDownNodes(node.rightNode)
			}
		}
		if (rootNode) { drawDownNodes(rootNode); }
	}
}


view = {
	// 'init': function() {
	// 	var ctx = d3.select("#canvas")
	// 		.attr("width", window.innerWidth)
	// 		.attr("height", window.innerHeight - 50)
	// 		.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", view.zoom))
	// 		.node().getContext("2d");
	// },
	'addNode': function() {
		var input = document.getElementById('addNode'), value = Number(input.value);
		input.value = '';

		//value = 10;

		if (!value) {
			alert("Please enter a value.");
			return;
		}
		var node = presenter.addNodeAndGetXY(value, ctx);
		//presenter.redrawBST(ctx);
		view.zoom();
	},
	'zoom':	function() {
		ctx.save();
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		if (d3.event) {
			ctx.translate(d3.event.translate[0], d3.event.translate[1]);
			ctx.scale(d3.event.scale, d3.event.scale);
			lastEvent = d3.event;
		} else if (lastEvent) {
			ctx.translate(lastEvent.translate[0], lastEvent.translate[1]);
			ctx.scale(lastEvent.scale, lastEvent.scale);
		}
		presenter.redrawBST(ctx);
		ctx.restore();
	},
	'drawNode': function(node, ctx) {
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#003300';
		if (node.leftNode) {
			view.drawConnection(node, node.leftNode, ctx);
		}
		if (node.rightNode) {
			view.drawConnection(node, node.rightNode, ctx);
		}
		ctx.beginPath();
		ctx.arc(node.locx, node.locy, 25, 0, 2 * Math.PI, false);
		ctx.fillStyle = '#0099cc';
		ctx.fill();
		ctx.stroke();

		ctx = canvas.getContext('2d');
		ctx.font = '16pt Calibri';
		ctx.fillStyle = '#003300';
		ctx.textAlign = 'center';
		ctx.fillText(String(node.value),node.locx, node.locy + 6);
	},
	'drawConnection': function(node, childNode, ctx) {
		ctx.beginPath();
		ctx.moveTo(node.locx, node.locy);
		ctx.lineTo(childNode.locx, childNode.locy);
		ctx.stroke();
	}
}

var ctx = d3.select("#canvas")
	.attr("width", window.innerWidth)
	.attr("height", window.innerHeight - 50)
	.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", view.zoom))
	.node().getContext("2d");

var lastEvent = null;

var formFunctions = {
	'AddNodeForm': view.addNode
}

$('.form-inline').on('submit', function () {
	formFunctions['AddNodeForm']();
	return false;
});

//view.addNode(10);