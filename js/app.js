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
		var drawDownNodes = function(node) {
			view.drawNode(node, ctx);
			if (node.leftNode) {
				drawDownNodes(node.leftNode)
			}
			if (node.rightNode) {
				drawDownNodes(node.rightNode)
			}
		}
		drawDownNodes(rootNode);
	}
}

view = {
	'init': function() {
		var ctx = document.getElementById('canvas').getContext('2d');
		ctx.canvas.width  = window.innerWidth;
		ctx.canvas.height = window.innerHeight - 50;
	},
	'addNode': function(value) {
		var input = document.getElementById('addNode'), value = Number(input.value);
		input.value = '';
		if (!value) {
			alert("Please enter a value.");
			return;
		}
		var ctx = document.getElementById('canvas').getContext('2d');
		var node = presenter.addNodeAndGetXY(value, ctx);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		presenter.redrawBST(ctx);
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
view.init();
$('#AddNodeForm').on('submit', function () {
	view.addNode();
	return false;
});