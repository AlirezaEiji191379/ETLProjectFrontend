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
            newHeight = newHeight < 500 ? 500 : newHeight;
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
        var uploadPipeline = jQuery('#loader');
        uploadPipeline.on('click', function(event){
            let url = 'http://localhost:5000/Pipeline/Execute';
            const formData = new FormData();
            let input = document.getElementById("dataFlowFile");
            formData.append('file',input.files[0])
            const requestOptions = {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'multipart/form-data'
                // },
                body: formData
            };
            fetch(url,requestOptions)
                .then(result => result.json())
                .then(respose => {
                    alert(respose["message"]);
                })
                .catch(x => alert(error));
        });
    });
}());

(function () {
    'use strict';
    jQuery(function () {
        var triggerElement = jQuery('#dataFlowFile'); 
        triggerElement.on('change', function (event) {
            const selectedFile = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function (event) {
                jQuery('#dag > svg').html("<g transform=\"translate(20, 20)\" />");
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





