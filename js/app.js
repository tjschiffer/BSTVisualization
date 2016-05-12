'use strict';

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

	this.id = this.depth + '_' + value;

	this.size = 14;
	this.fillStyle = '#0099cc';
	this.fillStyleText = '#000';
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
	'pixelOffset': 30,
	'nodesToAnimate': [],
	'animationSpeed': {'speed': 150, 'delay': 250, noAnimation: false}
}

var presenter = {
	'addNode': function(value) {
		var node = new bstNode(value);
		if (!rootNode) {
			rootNode = node;
			node.locX = $('#svg').width() / 2;
		} else {
			var parentNode = presenter.findParentFromValue(rootNode, value);
			node.depth = parentNode.depth + 1;
			node.id = node.depth + '_' + value;
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
		var node;
		if (rootNode)  { node = presenter.searchDownTree(rootNode, value); }
		if (node && node.value == value) {
			var i = 0;
			while (i < 2) {
				model.nodesToAnimate.push({'node':node,'animationType':'pop'}); // add Node to list 2x, will animate 3x
				i++;
			}			
			return node;
		} else {
			model.nodesToAnimate = [];
			alert('The value ' + String(value) + ' does not exist in the tree.');
		};
	},
	'searchDownTree': function(node, value) {
		model.nodesToAnimate.push({'node':node,'animationType':'pop'});
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
	'deleteNode': function(value) {
		var deleteNode = presenter.searchForNode(value);

	},
	'findParentFromValue': function(node, value) {
		model.nodesToAnimate.push({'node':node,'animationType':'pop'});
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
	'changeAnimationSpeed': function(value, noAnimation) {
		if (value > 2) { model.animationSpeed.delay = 0; } else
			{ model.animationSpeed.delay = Math.min(0, - 100 * Math.pow(value, 2) + 50 * value + 300); }
		model.animationSpeed.speed = 150 * Math.pow(value, -1);
		model.animationSpeed.noAnimation = noAnimation;
		if (noAnimation) { model.nodesToAnimate = []; }
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
			var input = $('#addNode'), value = Number(input.val());
			input.val('');
		}
		if (view.checkForBadValue(value)) { return; }
		var node = presenter.addNode(value);
		view.animateNodes(presenter.returnNodesToAnimate(), node, numbersToAdd);
	},
	'draw':	function() {

		if (d3.event) {
			lastEvent = d3.event;
		}
		if (lastEvent) {
			svg.attr('transform', 'translate(' + lastEvent.translate + ')scale(' + lastEvent.scale + ')');
		}
	},
	'drawNode': function(node) {

		var newNode = svg.insert('g',':first-child')
			.attr({'class': 'node', 'id': node.id})
			.attr('transform', 'translate(' + node.locX + ',' + node.locY + ')');

		if (node.parent) {
			view.drawConnection(newNode, node.parent, node);
		}

		var nodeWrap = newNode.append('g').attr({'class':'nodeWrap', 'transform':'scale(0)'});

		nodeWrap.append('circle')
			.attr('r', node.size)
			.style({'fill': node.fillStyle, 'stroke': node.fillStyleText, 'stroke-width': 2});

		nodeWrap.append('text')
			.attr('dy', '.35em')
			.text(node.value);
		return nodeWrap;

	},
	'drawConnection': function(newNode, node, childNode) {
		newNode.append('line')
			.attr({'x1': node.locX - childNode.locX, 'y1': node.locY - childNode.locY, 'x2': 0,
				'y2': 0, 'class': 'nodeLine'})

	},
	'animateNodes': function(nodesToAnimate, nodeToAdd, numbersToAdd) {
		var animationSpeed = presenter.returnAnimationSpeed();
		var speed = animationSpeed.speed;

		var animate = {
			'pop': function(nodeId) {
				var domNode = $('#' + nodeId + ' > .nodeWrap');
				d3.select(domNode.get(0)).transition()
					.attr('transform', 'scale(1.5)')
					.duration(speed)
					.transition()
					.attr('transform', 'scale(1)')
					.duration(speed)
					.transition()
					.attr('transform', null)
					.duration(0)
					.each('end', animateNextNode);
			}
		}

		function animateNextNode() {
			animationSpeed = presenter.returnAnimationSpeed();
			speed = animationSpeed.speed;
			if (nodesToAnimate.length > 0 && !(animationSpeed.noAnimation)) {
				var animation = nodesToAnimate.shift()
				animate[animation.animationType](animation.node.id);
			} else {
				if (nodeToAdd) {
					presenter.addToParent(nodeToAdd); 
					var nodeWrap = view.drawNode(nodeToAdd);
					nodeWrap.transition()
						.attr('transform', 'scale(1)')
						.duration(speed)
						.each('end', function() {
							if (numbersToAdd && numbersToAdd.length > 0) {
								setTimeout(function() {
									view.addNode(numbersToAdd);
								}, animationSpeed.delay)
							}
						});
				}
			}
		}
		animateNextNode();
	},
	'addRandoms': function() {
		var input = $('#addRandom'), value = Number(input.val());
		input.val('');

		if (view.checkForBadValue(value)) { return; }

		var numbersToAdd = [];
		for (var i = 0; i < value; i++) {
			numbersToAdd.push(Math.floor((Math.random() * 999) + 1));
		}
		presenter.addNextRandom(numbersToAdd);
	},
	'searchForNode': function() {
		var input = $('#searchForNode'), value = Number(input.val());
		if (view.checkForBadValue(value)) { return; }
		if (presenter.returnAnimationSpeed().noAnimation) {
			alert("Please turn on animation to find a node.");
			return;
		}
		input.val('');
		presenter.SearchforNode(value);
		view.animateNodes(presenter.returnNodesToAnimate(), null, null);
	},
	'deleteNode': function() {
		var input = $('#deleteNode'), value = Number(input.val());
		if (view.checkForBadValue(value)) { return; }
		input.val('');

		presenter.deleteNode(value);
	},
	'resetZoom': function() {
		lastEvent = null;
		svg.attr('transform', null);
	},
	'checkForBadValue': function(value) {
		if (isNaN(value)) {
			alert('Please enter a value.');
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

var svg = d3.select('#svg')
	// .attr("width", window.innerWidth)
	// .attr("height", window.innerHeight - 50)
	.call(d3.behavior.zoom().scaleExtent([0.5, 10]).on('zoom', view.draw))
	.append('g')
	.append('g');
	//.node().getContext('2d');

var lastEvent = null;

var formFunctions = {
	'addNodeForm': view.addNode,
	'resetZoom': view.resetZoom,
	'addRandomForm': view.addRandoms,
	'searchForNodeForm': view.searchForNode,
	'deleteNodeForm': view.deleteNode
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