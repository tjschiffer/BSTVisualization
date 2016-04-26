var bstNode = function(value) {
	this.value = value;
	this.leftNode = null;
	this.rightNode = null;
	this.parent = null;
	this.locX = null;
	this.locY = 50;
	this.depth = 0;

	this.size = 20;
	this.fillStyle = '#0099cc';
	this.fillStyleText = '#333';
	this.font = '14pt Calibri';
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
	'pixelOffset': 40,
	'nodesToAnimate': [],
	'AnimationSpeed': {'speed': 1, 'delay': 250}
}

presenter = {
	'addNodeAndGetXY': function(value, ctx) {
		var node = new bstNode(value);
		if (!rootNode) {
			rootNode = node;
			node.locX = ctx.canvas.width / 2;
		} else {
			var parentNode = presenter.findParentFromValue(rootNode, value);
			node.depth = parentNode.depth + 1;
			node.parent = parentNode;
		}
		return node;
	},
	'addToParent': function(node) {
		if (node.parent) {
			var parentNode = node.parent, pixelOffset = model.pixelOffset;
			if (node.value > parentNode.value) {
				node.locX = parentNode.locX + pixelOffset;
				parentNode.rightNode = node;
			} else {
				node.locX = parentNode.locX - pixelOffset;
				parentNode.leftNode = node;
			}			
			node.locY = parentNode.locY + pixelOffset;
		}
	},
	'FixOverlapInTree': function(node, nodeToCheck) {
		if (!(node === nodeToCheck) && node.depth == nodeToCheck.depth
			 && node.locX == nodeToCheck.locX && node.locY == nodeToCheck.locY) {
			presenter.UpdateLocDownTree(node.parent, (node.parent.locX - node.locX));
			presenter.UpdateLocDownTree(nodeToCheck.parent, (nodeToCheck.parent.locX - nodeToCheck.locX));
		}
		$.each(nodeToCheck.children(), function(index, child) {
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
		model.nodesToAnimate.push(node);
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
	'addNextRandom': function(numbersToAdd) {
		if (numbersToAdd.length > 0) {
			view.addNode(numbersToAdd);
		}
	},
	'redrawBST': function() {
		function drawDownNodes(node) {
			view.drawNode(node);
			$.each(node.children(), function(index, child) {
				drawDownNodes(child);
			})
		}
		if (rootNode) { drawDownNodes(rootNode); }
	},
	'changeAnimationSpeed': function(value) {
		if (value > 2) { model.AnimationSpeed.delay = 0; } else
			{ model.AnimationSpeed.delay = Math.min(0, - 100 * Math.pow(value, 2) + 50 * value + 300); }
		model.AnimationSpeed.speed = value;
	},
	'returnNodesToAnimate': function() {
		return model.nodesToAnimate;
	},
	'returnAnimationSpeed': function() {
		return model.AnimationSpeed;
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
	'addNode': function(numbersToAdd) {
		if (numbersToAdd) { value = numbersToAdd.pop(); } else {
			var input = document.getElementById('addNode'), value = Number(input.value);
			input.value = '';
		}
		if (isNaN(value)) {
			alert("Please enter a value.");
			return;
		}
		var node = presenter.addNodeAndGetXY(value, ctx);
		view.animateNodes(presenter.returnNodesToAnimate(), node, numbersToAdd);
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
		presenter.redrawBST();
		ctx.restore();
	},
	'drawNode': function(node) {
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(node.locX, node.locY, node.size, 0, 2 * Math.PI);
		ctx.fillStyle = node.fillStyle;
		ctx.fill();
		ctx.stroke();

		//ctx = canvas.getContext('2d');
		ctx.font = node.font;
		ctx.fillStyle = node.fillStyleText;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(String(node.value), node.locX, node.locY);

		ctx.strokeStyle = node.fillStyleText;
		$.each(node.children(), function(index, child) {
			view.drawConnection(node, child);
		})
	},
	'drawConnection': function(node, childNode) {
		ctx.save()
		ctx.globalCompositeOperation = 'destination-over';
		ctx.beginPath();
		ctx.moveTo(node.locX, node.locY);
		ctx.lineTo(childNode.locX, childNode.locY);
		ctx.stroke();
		ctx.restore()
	},
	'animateNodes': function(nodesToAnimate, nodeToAdd, numbersToAdd) {
		var animationSpeed = presenter.returnAnimationSpeed();
		//var initalSize = node.size;
		var speed = animationSpeed.speed;
		function animateNode(node, initalSize) {
			node.size += speed;
			if (node.size > (initalSize * 1.5)) {
				speed *= -1;
			}
			if (node.size <= initalSize) { 
				node.size = initalSize;
				animateNextNode();
			} else {
				view.draw();
				requestAnimationFrame(function() { animateNode(node, initalSize); });
			}
		}
		function animateNextNode() {
			if (nodesToAnimate.length > 0 && animationSpeed.speed <= 5) {
				var node = nodesToAnimate.shift();
				speed = animationSpeed.speed;
				animateNode(node, node.size);
			} else {
				presenter.addToParent(nodeToAdd);
				view.draw();
				setTimeout(function() {
					if (numbersToAdd && numbersToAdd.length > 0) {
						view.addNode(numbersToAdd);
					}
				}, animationSpeed.delay)
			}
		}
		animateNextNode();
	},
	'resetZoom': function() {
		lastEvent = null;
		ctx = d3.select("#canvas")
			.call(d3.behavior.zoom().scaleExtent([0.5, 10]).on("zoom", view.draw))
			.node().getContext("2d");
		view.draw();
	},
	'addRandoms': function() {
		var input = document.getElementById('addRandom'), value = Number(input.value);
		input.value = '';

		if (!value) {
			alert("Please enter a value.");
			return;
		}
		var numbersToAdd = [];
		for (var i = 0; i < value; i++) {
			numbersToAdd.push(Math.floor((Math.random() * 999) + 1));
		}
		presenter.addNextRandom(numbersToAdd);
	}
}

$('#AnimationSpeed').slider({
	formatter: function(value) {
		presenter.changeAnimationSpeed(value);
		if (value > 5) {
			return 'No Animation';
		}
		return value + 'x';
	}
});

var ctx = d3.select("#canvas")
	.attr("width", window.innerWidth)
	.attr("height", window.innerHeight - 50)
	.call(d3.behavior.zoom().scaleExtent([0.5, 10]).on("zoom", view.draw))
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