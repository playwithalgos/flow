const beltColor = "black";
const beltStrokeColor = `#8888AA`;
const cookieColor = "#FFDD00";
const SPEED = 200;
export class ConveyorBeltStyle {
    drawNode(context, node, G) {
        context.beginPath();
        context.fillStyle = node == G.nodes[0] ? cookieColor : node == G.nodes[G.nodes.length-1] ? "black" : beltStrokeColor;
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.arc(node.x, node.y, 24, 0, 2 * Math.PI);
        context.fill();


        if (node.isProblematic) {
            context.moveTo(node.x - 8, node.y - 8);
            context.lineTo(node.x + 8, node.y + 8);
            context.moveTo(node.x + 8, node.y - 8);
            context.lineTo(node.x - 8, node.y + 8);
            context.stroke();

        }

    }


    drawEdge(context, A, B, edge, G) {
        const lineWidth = 34;

        context.beginPath();
        context.strokeStyle = beltStrokeColor;
        context.lineWidth = lineWidth+2;
        context.moveTo(A.x, A.y);
        context.lineTo(B.x, B.y);
        context.stroke();

        context.lineCap = "butt";
        context.beginPath();
        context.strokeStyle = edge.clicked ? "white" : beltColor;
        context.lineWidth = lineWidth;
        context.moveTo(A.x, A.y);
        context.lineTo(B.x, B.y);
        context.stroke();


        if (edge.clicked)
            edge.clicked--;

        const d = Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2);
        const speed = (G.isProblematic ? 1/4 : 1)* 20000/SPEED / d;

        const angle = Math.atan2(A.y - B.y, A.x - B.x);
        const esp = 16;
        for (let j = 0; j < d; j += esp) {
            const i = j + speed * window.t % esp;//(200 * (window.t) / d) % 8;
            const p = { x: A.x + (B.x - A.x) * i / d, y: A.y + (B.y - A.y) * i / d };
            const s = lineWidth / 2;
            const angleS = Math.PI * 1.8;
            context.beginPath();
            context.strokeStyle = beltStrokeColor;
            context.lineWidth = 4;
            context.moveTo(p.x - 10, p.y - 10);

            context.moveTo(p.x + s * Math.cos(angle - angleS), p.y + s * Math.sin(angle - angleS));
            context.lineTo(p.x, p.y);
            context.lineTo(p.x + s * Math.cos(angle + angleS), p.y + s * Math.sin(angle + angleS));
            context.stroke();
        }

    }

    drawEdgeOver(context, A, B, edge, G) {
        
        const d = Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2);

        const i = d * ((window.t) % ((G.isProblematic ? 4 : 1)*SPEED) / ((G.isProblematic ? 4 : 1)*SPEED));
        const p = { x: A.x + (B.x - A.x) * i / d, y: A.y + (B.y - A.y) * i / d };

        function drawCookie(p) {
            context.beginPath();
            context.lineWidth = 2;
            context.arc(p.x, p.y, 6, 0, 2 * Math.PI);
            context.fillStyle = cookieColor;
            context.strokeStyle = "black";
            context.fill();
            context.stroke();
        }
        const r = 10;
        for (let j = 0; j < edge.flow; j++) {
            function perturbation() {
                return 3 * Math.random() - 1.5;
            }
            drawCookie({
                x: p.x + perturbation() + r * Math.cos(j * Math.PI * 2 / edge.flow),
                y: p.y + perturbation() + r * Math.sin(j * Math.PI * 2 / edge.flow)
            })
        }

        const pmiddle = { x: A.x + (B.x - A.x) * 0.5, y: A.y + (B.y - A.y) * 0.5}

        context.textAlign = "center";
        context.font = "12px sans serif";
        const angle = Math.atan2(A.y - B.y, A.x - B.x) + Math.PI / 2;
        context.fillStyle = "white";
        const dd=16;
        context.fillText(edge.flow + "/" + edge.capacity, pmiddle.x + polarX(dd, angle), pmiddle.y + polarY(dd, angle));
    }
}


function polarX(r, a) {
    return r * Math.cos(a);
}


function polarY(r, a) {
    return r * Math.sin(a);
}