'use strict';

function generateUUID() { // https://jsfiddle.net/briguy37/2MVFd/
	var d = new Date().getTime();
	var uuid = 'Nxxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
}

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

	this.id = generateUUID();

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

bstNode.prototype.allChildren = function() {
	var children = [];
	if (this.leftNode) {
		children.push(this.leftNode);
		$.each(this.leftNode.allChildren(), function(index, child) {
			children.push(child);
		})
	}
	if (this.rightNode) {
		children.push(this.rightNode);
		$.each(this.rightNode.allChildren(), function(index, child) {
			children.push(child);
		})
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
			node.parent = parentNode;
		}
		model.nodesToAnimate.push([{'node':node,'animationType':'add'}])
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
			node.locY = rootNode.locY + 3 * pixelOffset * node.depth;
		}
	},
	'searchForNode': function(value) {
		model.nodesToAnimate = [];
		var node;
		if (rootNode)  { node = presenter.searchDownTree(rootNode, value); }
		if (node && node.value == value) {
			var i = 0;
			while (i < 2) {
				model.nodesToAnimate.push([{'node':node,'animationType':'pop'}]); // add Node to list 2x, will animate 3x
				i++;
			}			
			return node;
		} else {
			model.nodesToAnimate = [];
			alert('The value ' + String(value) + ' does not exist in the tree.');
		};
	},
	'searchDownTree': function(node, value) {
		model.nodesToAnimate.push([{'node':node,'animationType':'pop'}]);
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
		model.nodesToAnimate.push([{'node':deleteNode,'animationType':'delete'}])
		var children = deleteNode.children();
		var childNodesToAnimate = [];
		var replaceNode = null;
		if (children.length == 1) {
			replaceNode = children[0];
			
			replaceNode.depth -= 1;
			replaceNode.locX = deleteNode.locX;
			replaceNode.locY = deleteNode.locY;
			replaceNode.parent = deleteNode.parent;
			presenter.addToParent(replaceNode);
			childNodesToAnimate.push({'node':replaceNode,'animationType':'move',
				'x':deleteNode.locX, 'y':deleteNode.locY, 'drawConnection':true});

			$.each(replaceNode.allChildren(), function(index, node) {
				node.depth -= 1;
				presenter.addToParent(node);
				childNodesToAnimate.push({'node':node,'animationType':'move',
				'x':node.locX, 'y':node.locY, 'lineAnimation':{'x1': node.parent.locX - node.locX, 
					'y1': node.parent.locY - node.locY, 'x2': 0, 'y2': 0}});
			});
		}
		if (deleteNode.parent) {
			if (deleteNode.parent.leftNode === deleteNode) {
				deleteNode.parent.leftNode = replaceNode;
			} else {
				deleteNode.parent.rightNode = replaceNode;
			}
		} else {
			rootNode = replaceNode;
			replaceNode.parent = null;
		}

		model.nodesToAnimate.push(childNodesToAnimate);
		deleteNode = null;
	},
	'findParentFromValue': function(node, value) {
		model.nodesToAnimate.push([{'node':node,'animationType':'pop'}]);
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
	},
	'returnChildren': function(node) {
		return node.children();
	}
}

var view = {
	'addNode': function(numbersToAdd) {
		if (numbersToAdd) { value = numbersToAdd.pop(); } else {
			var input = $('#addNode'), value = Number(input.val());
			input.val('');
		}
		if (view.checkForBadValue(value)) { return; }
		presenter.addNode(value);
		view.animateNodes(presenter.returnNodesToAnimate(), numbersToAdd);
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

		view.drawConnection(node.parent, node);

		var nodeWrap = newNode.append('g').attr({'class':'nodeWrap', 'transform':'scale(0)'});

		nodeWrap.append('circle')
			.attr('r', node.size)
			.style({'fill': node.fillStyle, 'stroke': node.fillStyleText, 'stroke-width': 2});

		nodeWrap.append('text')
			.attr('dy', '.35em')
			.text(node.value);
		return nodeWrap;

	},
	'drawConnection': function(node, childNode) {
		if (node) {
			d3.select('#' + childNode.id).insert('line',':first-child')
				.attr({'x1': node.locX - childNode.locX, 'y1': node.locY - childNode.locY, 'x2': 0,
					'y2': 0, 'class': 'nodeLine'});
		}

	},
	'animateNodes': function(nodesToAnimate, numbersToAdd) {
		var animationSpeed = presenter.returnAnimationSpeed();
		var speed = animationSpeed.speed;

		var animate = {
			'pop': function(animation) {
				d3.select('#' + animation.node.id + ' > .nodeWrap')
					.transition()
					.attr('transform', 'scale(1.5)')
					.duration(speed)
					.transition()
					.attr('transform', 'scale(1)')
					.duration(speed)
					.transition()
					.attr('transform', null)
					.duration(0)
					.each('end', function () {
						animateNextNodeSublist(nodesToAnimate);
					});
			},
			'delete': function(animation) {
				d3.select('#' + animation.node.id + ' > .nodeWrap')
					.transition()
					.attr('transform', 'scale(0)')
					.duration(speed)
					.each('end', animateNextNode);
				$('#' + animation.node.id).remove();
				$.each(presenter.returnChildren(animation.node), function(index, node) {
					$('#' + node.id + ' > .nodeLine').remove();
				})
			},
			'move': function(animation) {
				d3.select('#' + animation.node.id).transition()
					.attr('transform', 'translate(' + animation.x + ',' + animation.y + ')')
					.duration(speed)
					.each('end', function () {
						if (animation.drawConnection) {
							view.drawConnection(animation.node.parent, animation.node);
						}
					});
				if (animation.lineAnimation) {
					d3.select('#' + animation.node.id + ' > .nodeLine').transition()
					.attr({'x1': animation.lineAnimation.x1, 'y1': animation.lineAnimation.y1, 
						'x2': animation.lineAnimation.x2, 'y2': animation.lineAnimation.y2})
					.duration(speed)
				}
				animateNextNodeSublist(nodesToAnimate)
			},
			'add': function(animation) {
				presenter.addToParent(animation.node); 
				var nodeWrap = view.drawNode(animation.node);
				nodeWrap.transition()
					.attr('transform', 'scale(1)')
					.duration(speed)
					.each('end', animateNextNode);
			}
		}

		function animateNextNodeSublist(nodesToAnimate) {
			var nextAnimation;
			if (nodesToAnimate.length > 0) {
				nextAnimation = nodesToAnimate[0].pop();
				if (nodesToAnimate[0].length < 1) { nodesToAnimate.shift(); }
			}
			if (nextAnimation) {
				animate[nextAnimation.animationType](nextAnimation); 
			} else {
				animateNextNode();
			}
		}

		function animateNextNode() {
			animationSpeed = presenter.returnAnimationSpeed();
			speed = animationSpeed.speed;
			if (nodesToAnimate.length > 0 && !(animationSpeed.noAnimation)) {
				animateNextNodeSublist(nodesToAnimate);
			} else {
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

		presenter.searchForNode(value);
		view.animateNodes(presenter.returnNodesToAnimate(), null, null);
	},
	'deleteNode': function() {
		var input = $('#deleteNode'), value = Number(input.val());
		if (view.checkForBadValue(value)) { return; }
		input.val('');

		presenter.deleteNode(value);
		view.animateNodes(presenter.returnNodesToAnimate(), null, null);
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