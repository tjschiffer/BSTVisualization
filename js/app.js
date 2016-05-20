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

function printTree() {
	var leftNodeVal, rightNodeVal;
	if (rootNode.leftNode) { leftNodeVal = rootNode.leftNode.value; }
	if (rootNode.rightNode) { rightNodeVal = rootNode.rightNode.value; }
	console.log(rootNode.value, 'Left Node: ' + leftNodeVal, 'Right Node: ' + rightNodeVal);
	$.each(rootNode.allChildren(), function(index, node) {
		var leftNodeVal, rightNodeVal;
		if (node.leftNode) { leftNodeVal = node.leftNode.value; }
		if (node.rightNode) { rightNodeVal = node.rightNode.value; }
		console.log(node.value, 'Left Node: ' + leftNodeVal, 'Right Node: ' + rightNodeVal);
	})
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
		presenter.addToParent(node);
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
	'deleteNode': function(valueOrNode) {
		var deleteNode
		if (valueOrNode instanceof bstNode) {
			deleteNode = valueOrNode;
		} else {
			deleteNode = presenter.searchForNode(valueOrNode);
		}
		if (!(deleteNode)) { return; }
		var children = deleteNode.children(), hide = false;
		if (children.length == 2) { hide = true; }
		model.nodesToAnimate.push([{'node':deleteNode,'animationType':'delete', 'hide':hide}])
		var childNodesToAnimate = [], replaceNode = null;
		if (children.length == 1) {
			replaceNode = children[0];
			
			replaceNode.depth = deleteNode.depth;
			replaceNode.locX = deleteNode.locX;
			replaceNode.locY = deleteNode.locY;
			replaceNode.parent = deleteNode.parent;
			presenter.addToParent(replaceNode);
			childNodesToAnimate.push({'node':replaceNode,'animationType':'move',
				'x':deleteNode.locX, 'y':deleteNode.locY, 'drawConnection':true});

			$.each(replaceNode.allChildren(), function(index, node) {
				node.depth = node.parent.depth + 1;
				presenter.addToParent(node);
				childNodesToAnimate.push({'node':node,'animationType':'move',
				'x':node.locX, 'y':node.locY, 'lineAnimation':{'x1': node.parent.locX - node.locX, 
					'y1': node.parent.locY - node.locY, 'x2': 0, 'y2': 0}});
			});
		} else if (children.length == 2) {
			var findLargestChild = function(node) {
				if (node.rightNode) {
					return findLargestChild(node.rightNode);
				} else {
					return node
				}
			}
			replaceNode = findLargestChild(deleteNode.leftNode);

			model.nodesToAnimate.push([{'node':replaceNode,'animationType':'move',
				'x':deleteNode.locX, 'y':deleteNode.locY,'removeConnection':true}]);

			deleteNode.value = replaceNode.value;

			model.nodesToAnimate.push([{'node':replaceNode,'animationType':'hide'}]);
			model.nodesToAnimate.push([{'node':deleteNode,'animationType':'unhide', 'drawConnection':true,
				'drawChildrenConnection':true, 'newValue':true}]);

			presenter.deleteNode(replaceNode);			
		}

		if (children.length < 2) { 
			if (childNodesToAnimate.length > 0) { model.nodesToAnimate.push(childNodesToAnimate); }
			if (deleteNode.parent) {
				if (deleteNode.parent.leftNode === deleteNode) {
					deleteNode.parent.leftNode = replaceNode;
				} else if (deleteNode.parent.rightNode === deleteNode) {
					deleteNode.parent.rightNode = replaceNode;

				}
			} else {
				rootNode = replaceNode;
				if (replaceNode) { replaceNode.parent = null; }
			}
			deleteNode = null; 
		}
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
		if (value == 5.1) { model.animationSpeed.speed = 0; }
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
				if (animationSpeed.noAnimation) {
					animateNextNodeSublist(nodesToAnimate);
					animateNextNode();
				} else {
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
							animateNextNode();
						});
					animateNextNodeSublist(nodesToAnimate);
				}
			},
			'delete': function(animation) {
				d3.select('#' + animation.node.id + ' > .nodeWrap')
					.transition()
					.attr('transform', 'scale(0)')
					.duration(speed)
					.each('end', function () {
						$('#' + animation.node.id + ' > .nodeLine').remove();
						$.each(presenter.returnChildren(animation.node), function(index, node) {
							$('#' + node.id + ' > .nodeLine').remove();
						})
						if (!(animation.hide)) { $('#' + animation.node.id).remove(); }
						animateNextNode();
					});
				animateNextNodeSublist(nodesToAnimate);
			},
			'move': function(animation) {
				if (animation.node.parent) { 
					$('#' + animation.node.id).insertBefore( $('#' + animation.node.parent.id) );
				} else {
					$('#' + animation.node.id).appendTo('#svg > g > g');
				}
				if (animation.removeConnection) {
					$('#' + animation.node.id + ' > .nodeLine').remove();
					$.each(presenter.returnChildren(animation.node), function(index, node) {
						$('#' + node.id + ' > .nodeLine').remove();
					})
				}
				d3.select('#' + animation.node.id).transition()
					.attr('transform', 'translate(' + animation.x + ',' + animation.y + ')')
					.duration(speed)
					.each('end', function () {
						if (animation.drawConnection) {
							view.drawConnection(animation.node.parent, animation.node);
						}
						animateNextNode();
					});
				if (animation.lineAnimation) {
					d3.select('#' + animation.node.id + ' > .nodeLine').transition()
					.attr({'x1': animation.lineAnimation.x1, 'y1': animation.lineAnimation.y1, 
						'x2': animation.lineAnimation.x2, 'y2': animation.lineAnimation.y2})
					.duration(speed)
				}
				animateNextNodeSublist(nodesToAnimate);
			},
			'unhide': function(animation) {
				d3.select('#' + animation.node.id + ' > .nodeWrap')
					.attr('transform', 'scale(1)');
				if (animation.drawConnection) {
					view.drawConnection(animation.node.parent, animation.node);
				}
				if (animation.drawChildrenConnection) {
					$.each(presenter.returnChildren(animation.node), function(index, node) {
						view.drawConnection(node.parent, node);
					})
				}
				if (animation.newValue) {
					d3.select('#' + animation.node.id + ' > .nodeWrap > text')
						.text(animation.node.value);
				}
				animateNextNodeSublist(nodesToAnimate);
				animateNextNode();
			},
			'hide': function(animation) {
				$('#' + animation.node.id).hide();
				animateNextNodeSublist(nodesToAnimate);
				animateNextNode();
			},
			'add': function(animation) { 
				var nodeWrap = view.drawNode(animation.node);
				nodeWrap.transition()
					.attr('transform', 'scale(1)')
					.duration(speed)
					.each('end', animateNextNode);
			}
		}

		function animateNextNodeSublist(nodesToAnimate) {
			var nextAnimation;
			if (nodesToAnimate[0].length > 0) {
				nextAnimation = nodesToAnimate[0].pop();
			}
			if (nextAnimation) {
				animationSpeed = presenter.returnAnimationSpeed();
				speed = animationSpeed.speed;
				animate[nextAnimation.animationType](nextAnimation); 
			}
		}

		function animateNextNode() {
			animationSpeed = presenter.returnAnimationSpeed();
			speed = animationSpeed.speed;
			if (nodesToAnimate[0] && nodesToAnimate[0].length == 0) { nodesToAnimate.shift(); }
			if (nodesToAnimate.length > 0) {
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