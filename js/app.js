"use strict";

var bstNode = function(value) {
	this.value = value;
	this.leftNode = null;
	this.rightNode = null;
	this.parent = null;
	this.locX = null;
	this.locY = 50;
	this.depth = 0;
	this.inRightBranch = true;
	this.xOffset = 1;

	this.size = 13;
	this.fillStyle = '#0099cc';
	this.fillStyleText = '#333';
	this.font = '13px "Helvetica Neue",Helvetica,Arial,sans-serif';
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



// bstNode.prototype.upBranch = function(node) {
// 	if (this.parent === node) {
// 		return true;
// 	} else if (node === rootNode) {
// 		return false;
// 	}
// 	console.log(node);
// 	this.upBranch(node.parent);
// }

var rootNode = null;

var model = {
	'pixelOffset': 27,
	'nodesToAnimate': [],
	'animationSpeed': {'speed': 1, 'delay': 250, noAnimation: false}
}

var presenter = {
	'addNode': function(value, ctx) {
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
			var parentNode = node.parent, pixelOffset = model.pixelOffset, xOffset = 1;
			node.inRightBranch = node.parent.inRightBranch;
			//node.xOffset = (Math.abs(parent.offset) + 1)*Math.sign(parent.offset);
			if (node.value >= parentNode.value) {
				parentNode.rightNode = node;
				if (node.depth == 1) { node.xOffset = 1 }
					else {
				if (node.inRightBranch) {
						node.xOffset = parentNode.xOffset * 2;
					} else {
						node.xOffset = (parentNode.xOffset * 2) + 1;
					}
				}
			} else {
				parentNode.leftNode = node;
				if (node.depth == 1) {
					node.inRightBranch = false;
					node.xOffset = -1;
				} else {
					if (node.inRightBranch) {
						node.xOffset = (parentNode.xOffset * 2) - 1;
					} else {
						node.xOffset = (parentNode.xOffset * 2);
					}
				}
			}
			node.locX = rootNode.locX + pixelOffset * node.xOffset;		
			node.locY = rootNode.locY + 3*pixelOffset * node.depth;
			//if (node.depth > 1) { presenter.FixOverlapInTree(parentNode) };
		}
	},
	// 'FixOverlapInTree': function(node) {
	// 	var turnNode = presenter.findTurnNode(node);
	// 	if (turnNode) {
	// 		presenter.UpdateLocDownTree(turnNode, Math.sign(turnNode.locX - turnNode.parent.locX)*model.pixelOffset);
	// 	}
	// },
	// 'findTurnNode': function(node) {
	// 	var returnNode = node.parent;
	// 	if (node.parent.leftNode === node) {
	// 		while (returnNode !== rootNode) {
	// 			if (returnNode.parent.rightNode === returnNode) {
	// 				return returnNode
	// 			}
	// 			returnNode = returnNode.parent;
	// 		}
	// 	}
	// 	if (node.parent.rightNode === node) {
	// 		while (returnNode !== rootNode) {
	// 			if (returnNode.parent.leftNode === returnNode) {
	// 				return returnNode
	// 			}
	// 			returnNode = returnNode.parent;
	// 		}
	// 	}
	// },
	// 'FixOverlapInTree': function(node, nodeToCheck) {
	// 	var shiftX = (node.parent.locX - node.locX)
	// 	if (!(node === nodeToCheck) && node.depth == nodeToCheck.depth
	// 		&& node.locX == nodeToCheck.locX && node.locY == nodeToCheck.locY) {
	// 		presenter.UpdateLocDownTree(node.parent, shiftX);
	// 		presenter.UpdateLocDownTree(nodeToCheck.parent, -shiftX);
	// 	} else {
	// 		$.each(nodeToCheck.children(), function(index, child) {
	// 			presenter.FixOverlapInTree(node, child);
	// 		})
	// 	}
	// },
	// 'UpdateLocDownTree': function(node, shiftX) {
	// 	node.locX += shiftX;
	// 	$.each(node.children(), function(index, child) {
	// 		presenter.UpdateLocDownTree(child, shiftX);
	// 	})
	// },
	// 'UpdateLocUpTree': function(node, shiftX) {
	// 	if (!(node === rootNode)) {
	// 		console.log(node.value);
	// 		node.locX += shiftX;
 // 			presenter.UpdateLocUpTree(node.parent, shiftX);
 // 		}
	// },
	'SearchforNode': function(value) {
		model.nodesToAnimate = [];
		console.log(value);
		var node;
		if (rootNode)  { node = presenter.searchDownTree(rootNode, value); }
		if (node && node.value == value) {
			var i = 0;
			while (i < 2) {
				model.nodesToAnimate.push(node); // add Node to list 2x, will animate 3x
				i++;
			}			
			view.animateNodes(model.nodesToAnimate, null, null);
		} else {
			model.nodesToAnimate = [];
			alert('The value ' + String(value) + ' does not exist in the tree.');
		};
	},
	'searchDownTree': function(node, value) {
		model.nodesToAnimate.push(node);
		if (value == node.value) {
			return node;
		} else if (value < node.value) {
			if (node.leftNode == null) {
				return null;
			}
			else {
				return presenter.searchDownTree(node.leftNode, value);
			}
		} else if (value > node.value) {
			if (node.rightNode == null) {
				return null;
			}
			else {
				return presenter.searchDownTree(node.rightNode, value);
			}
		}
		return false;
	},
	'findParentFromValue': function(node, value) {
		model.nodesToAnimate.push(node);
		if (value < node.value) {
			if (!node.leftNode) {
				return node;
			} else {
				return presenter.findParentFromValue(node.leftNode, value);
			}
		} else {
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
	'changeAnimationSpeed': function(value, noAnimation) {
		if (value > 2) { model.animationSpeed.delay = 0; } else
			{ model.animationSpeed.delay = Math.min(0, - 100 * Math.pow(value, 2) + 50 * value + 300); }
		model.animationSpeed.speed = value;
		model.animationSpeed.noAnimation = noAnimation;
	},
	'returnNodesToAnimate': function() {
		return model.nodesToAnimate;
	},
	'returnAnimationSpeed': function() {
		return model.animationSpeed;
	}
}

var view = {
	'addNode': function(numbersToAdd) {
		if (numbersToAdd) { value = numbersToAdd.pop(); } else {
			var input = document.getElementById('addNode'), value = Number(input.value);
			input.value = '';
		}
		if (view.checkForBadValue(value)) { return; }
		var node = presenter.addNode(value, ctx);
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

		$.each(node.children(), function(index, child) {
			view.drawConnection(node, child);
		})

		ctx.beginPath();
		ctx.arc(node.locX, node.locY, node.size, 0, 2 * Math.PI);
		ctx.fillStyle = node.fillStyle;
		ctx.fill();
		ctx.stroke();

		ctx.font = node.font;
		ctx.fillStyle = node.fillStyleText;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(String(node.value), node.locX, node.locY);

		ctx.strokeStyle = node.fillStyleText;
	},
	'drawConnection': function(node, childNode) {
		ctx.save()
		//ctx.globalCompositeOperation = 'destination-over';
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
			if (nodesToAnimate.length > 0 && !(animationSpeed.noAnimation)) {
				var node = nodesToAnimate.shift();
				speed = animationSpeed.speed;
				animateNode(node, node.size);
			} else {
				if (nodeToAdd) { presenter.addToParent(nodeToAdd); }
				view.draw();
				if (numbersToAdd && numbersToAdd.length > 0) {
					setTimeout(function() {
						view.addNode(numbersToAdd);
					}, animationSpeed.delay)
				}
			}
		}
		animateNextNode();
	},
	'addRandoms': function() {
		var input = document.getElementById('addRandom'), value = Number(input.value);
		input.value = '';

		if (view.checkForBadValue(value)) { return; }

		var numbersToAdd = [];
		for (var i = 0; i < value; i++) {
			numbersToAdd.push(Math.floor((Math.random() * 999) + 1));
		}
		presenter.addNextRandom(numbersToAdd);
	},
	'SearchforNode': function() {
		var input = $('#searchForNode'), value = Number(input.val());
		if (view.checkForBadValue(value)) { return; }
		if (presenter.returnAnimationSpeed().noAnimation) {
			alert("Please turn on animation to find a node.");
			return;
		}
		input.val('');
		presenter.SearchforNode(value);
	},
	'resetZoom': function() {
		lastEvent = null;
		ctx = d3.select("#canvas")
			.call(d3.behavior.zoom().scaleExtent([0.5, 10]).on("zoom", view.draw))
			.node().getContext("2d");
		view.draw();
	},
	'checkForBadValue': function(value) {
		if (isNaN(value)) {
			alert("Please enter a value.");
			return true;
		}
		return false;
	}
}

$('#animationSpeed').slider({
	formatter: function(value) {
		var noAnimation = false;
		var text = value + 'x';
		if (value > 5) {
			noAnimation = true;
			text = 'No Animation';
		}
		presenter.changeAnimationSpeed(value, noAnimation);
		return text;
	}
});

var ctx = d3.select("#canvas")
	.attr("width", window.innerWidth)
	.attr("height", window.innerHeight - 50)
	.call(d3.behavior.zoom().scaleExtent([0.1, 10]).on("zoom", view.draw))
	.node().getContext("2d");

var lastEvent = null;

var formFunctions = {
	'addNodeForm': view.addNode,
	'resetZoom': view.resetZoom,
	'addRandomForm': view.addRandoms,
	'searchForNodeForm': view.SearchforNode
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