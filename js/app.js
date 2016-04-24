var bstNode = function(value) {
	this.value = value;
	this.leftNode = null;
	this.rightNode = null;
	this.parent = null;
	this.locX = null;
	this.locY = 50;
	this.depth = 0;
}

bstNode.prototype.children = function() {
	var children = [];
	if (this.leftNode) {
		children.push(this.leftNode);
	}
	if (this.rightNode) {
		children.push(this.rightNode);
	}
	return children;
}

rootNode = null;

model = {
	'pixelOffset': 40
}

presenter = {
	'addNodeAndGetXY': function(value, ctx) {
		var node = new bstNode(value);
		if (!rootNode) {
			rootNode = node;
			node.locX = ctx.canvas.width / 2;
		} else {
			var pixelOffset = model.pixelOffset, parentNode = presenter.findParentFromValue(rootNode, value);
			if (value > parentNode.value) {
				node.locX = parentNode.locX + pixelOffset;
				parentNode.rightNode = node;
			} else {
				node.locX = parentNode.locX - pixelOffset;
				parentNode.leftNode = node;
			}			
			node.locY = parentNode.locY + pixelOffset;

			node.depth = parentNode.depth + 1;
			node.parent = parentNode;
			if (node.depth > 1) { // impossible for nodes to overlap at depth less than 2
				presenter.FixOverlap(node, rootNode);
			}
		}
		
		return node;
	},
	'FixOverlap': function(node, nodeToCheck) {
		if (!(node === nodeToCheck) && node.locX == nodeToCheck.locX && node.locY == nodeToCheck.locY) {
			presenter.UpdateLocDownTree(node.parent, (node.parent.locX - node.locX)*2);
		}
		$.each(nodeToCheck.children(), function(index, child) {
			console.log(node, child);
			presenter.FixOverlap(node, child);
		})
	},
	'UpdateLocDownTree': function(node, shiftX) {
		node.locX += shiftX;
		$.each(node.children(), function(index, child) {
			presenter.UpdateLocDownTree(child, shiftX);
		})
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
			$.each(node.children(), function(index, child) {
				drawDownNodes(child);
			})
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
	'addNode': function(manualValue) {
		var input = document.getElementById('addNode'), value = Number(input.value);
		input.value = '';

		if (manualValue) { value = manualValue; }
		console.log(value);

		if (!value) {
			alert("Please enter a value.");
			return;
		}
		var node = presenter.addNodeAndGetXY(value, ctx);
		view.draw();
	},
	'draw':	function() {
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
		ctx.lineWidth = 1;
		ctx.strokeStyle = '#003300';
		if (node.leftNode) {
			view.drawConnection(node, node.leftNode, ctx);
		}
		if (node.rightNode) {
			view.drawConnection(node, node.rightNode, ctx);
		}
		ctx.beginPath();
		ctx.arc(node.locX, node.locY, 20, 0, 2 * Math.PI, false);
		ctx.fillStyle = '#0099cc';
		ctx.fill();
		ctx.stroke();

		ctx = canvas.getContext('2d');
		ctx.font = '14pt Calibri';
		ctx.fillStyle = '#003300';
		ctx.textAlign = 'center';
		ctx.fillText(String(node.value),node.locX, node.locY + 5);
	},
	'drawConnection': function(node, childNode, ctx) {
		ctx.beginPath();
		ctx.moveTo(node.locX, node.locY);
		ctx.lineTo(childNode.locX, childNode.locY);
		ctx.stroke();
	},
	'resetZoom': function() {
		lastEvent = null;
		view.draw();
	},
	'addRandoms': function() {
		var input = document.getElementById('addRandom'), value = Number(input.value);
		input.value = '';

		if (!value) {
			alert("Please enter a value.");
			return;
		}
		for (var i = 0; i < value; i++) {
			view.addNode(Math.floor((Math.random() * 10) + 1));
		}
	}

}

var ctx = d3.select("#canvas")
	.attr("width", window.innerWidth)
	.attr("height", window.innerHeight - 50)
	.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", view.draw))
	.node().getContext("2d");

var lastEvent = null;

var formFunctions = {
	'AddNodeForm': view.addNode,
	'ResetZoom': view.resetZoom,
	'AddRandomForm': view.addRandoms,
}

$('.form-inline').on('submit', function (event) {
	event.preventDefault;
	try {
		formFunctions[this.id]();
	} catch(err) {
		console.log(err);
	}
	return false;
});

//view.addNode(10);