var i, j, node, model, watch, start, stop, textNode, models = {};
var windowEventsList = [];
for (i in window){
	if (i.indexOf('on')===0){
		windowEventsList.push(i);
	}
}
(function listDOM(node){
	var i;
	if (typeof node !== 'object'){
		return;
	}
	if (node.hasChildNodes()){
		for (i in node.childNodes){
			listDOM(node.childNodes[i]);
		}
	}
	if (node.nodeName === '#text'){
		(function textSplit(node){
			start = node.nodeValue.indexOf('{{');
			if (start < 0){
				return;
			}
			textNode = node.splitText(start);
			stop = textNode.nodeValue.indexOf('}}');
			if (stop >= 0){
				stop += 2;
				node = textNode.splitText(stop);
			}
			model = textNode.nodeValue.slice(2).slice(0, -2);
			textNode.nodeValue = '';
			models[model] = models[model] || {
				value: '',
				inputs: [],
				outputs: []
			};
			models[model].outputs.push(textNode);
			textSplit(node);
		})(node);
	} else {
		if (typeof node.hasAttribute === 'function' && node.hasAttribute('data-model')){
			model = node.getAttribute('data-model');
			models[model] = models[model] || {
				value: '',
				inputs: [],
				outputs: []
			};
			watch = (function(){
				var current = models[model];
				return function(e){
					if (current.value !== e.target.value){
						current.value = e.target.value;
						for (j in current.inputs){
							current.inputs[j].value = current.value;
						}
						for (j in current.outputs){
							current.outputs[j].nodeValue = current.value;
						}
					}
				};
			})();
			models[model].inputs.push(node);
			for (j in windowEventsList){
		 		node[windowEventsList[j]] = watch;
			}
		}
	}
})(document);
