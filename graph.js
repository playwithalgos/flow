export class Graph {
    nodes = new Array();
    successors = new Array();
    edges = new Array();

    addNode(node) {
        this.nodes.push(node);
        this.successors.push([]);
    }

    addEdge(i, j, edge) {
        edge.start = i;
        edge.end = j;
        edge.A = this.nodes[i];
        edge.B = this.nodes[j];

        if (edge.capacity == undefined)
            edge.capacity = 1;
        if (edge.flow == undefined)
            edge.flow = 0;
        this.successors[i].push(edge);
        this.edges.push(edge);
    }

    edge(i, j) {
        for (const edge of this.edges)
            if (edge.start == i && edge.end == j)
                return edge;
    }

    node(i) { return this.nodes[i] }
    get nbNodes() { return this.nodes.length };

    draw(context, style) {
        context.clearRect(0, 0, 1000, 1000)
        for (let i = 0; i < this.successors.length; i++) {
            for (let edge of this.successors[i]) {
                const A = this.nodes[edge.start];
                const B = this.nodes[edge.end];
                style.drawEdge(context, A, B, edge, this);
            }

        }

        for (const node of this.nodes) {
            style.drawNode(context, node, this);
        }

        if (style.drawEdgeOver)
            for (let i = 0; i < this.successors.length; i++) {
                for (let edge of this.successors[i]) {
                    const A = this.nodes[edge.start];
                    const B = this.nodes[edge.end];
                    style.drawEdgeOver(context, A, B, edge, this);
                }

            }
    }
}