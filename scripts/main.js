/*global jQuery, d3, dagreD3, DAG */

(function () {
    'use strict';
    window.DAG = {
        displayGraph: function (graph, dagNameElem, svgElem) {
            dagNameElem.text(graph.name);
            this.renderGraph(graph, svgElem);
        },

        renderGraph: function (graph, svgParent) {
            var nodes = graph.nodes;
            var links = graph.links;

            var graphElem = svgParent.children('g').get(0);
            var svg = d3.select(graphElem);
            var renderer = new dagreD3.Renderer();
            var layout = dagreD3.layout().rankDir('LR');
            renderer.layout(layout).run(dagreD3.json.decode(nodes, links), svg.append('g'));

            // Adjust SVG height to content
            var main = svgParent.find('g > g');
            var h = main.get(0).getBoundingClientRect().height;
            var newHeight = h + 40;
            newHeight = newHeight < 80 ? 80 : newHeight;
            svgParent.height(newHeight);

            // Zoom
            d3.select(svgParent.get(0)).call(d3.behavior.zoom().on('zoom', function () {
                var ev = d3.event;
                svg.select('g')
                    .attr('transform', 'translate(' + ev.translate + ') scale(' + ev.scale + ')');
            }));
        }
    };
})();

(function () {
    'use strict';
    jQuery(function () {
        var triggerElement = jQuery('#loader'); // Change this selector to match the actual element you want to click
        triggerElement.on('click', loadAndDisplayGraph);
    });
}());

(function () {
    'use strict';
    jQuery(function () {
        var triggerElement = jQuery('#dataFlowFile'); // Change this selector to match the actual element you want to click
        triggerElement.on('change', function (event) {
            const selectedFile = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                const fileContent = event.target.result;
                try {
                    let dataflowJson = JSON.parse(fileContent);
                    let edges = dataflowJson["edges"];
                    let nodeNames = [];
                    for(let i = 0 ; i < edges.length ; i++){
                        if (nodeNames.includes(edges[i].src) === false) {
                            nodeNames.push(edges[i].src);
                        }
                        if (nodeNames.includes(edges[i].dst) === false) {
                            nodeNames.push(edges[i].dst);
                        }
                    }
                    
                    let nodes = []
                    let links = []
                    nodeNames.forEach(nodeName => {
                        nodes.push({
                            id : nodeName, value: {label: nodeName}
                        })
                    });

                    edges.forEach(edge =>{
                        links.push({
                            u: edge.src,
                            v: edge.dst
                        });
                    });

                    let data = {
                        name: 'pipeline',
                        nodes : nodes,
                        links : links
                    }
                    DAG.displayGraph(data, jQuery('#dag-name'), jQuery('#dag > svg'));
                } catch (error) {
                    alert(error);
                }
            };
            reader.readAsText(selectedFile);
        });
    });
}());


function loadAndDisplayGraph() {
    data = {
        name: 'graph2',
        nodes: [
            { id: 'node1', value: { label: 'node1' } },
            { id: 'node2', value: { label: 'node2' } }
        ],
        links: [
            { u: 'node1', v: 'node2', value: { label: 'link1' } }
        ]
    }
    DAG.displayGraph(data, jQuery('#dag-name'), jQuery('#dag > svg'));
}





