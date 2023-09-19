const beltColor = "black";
const beltColorSelected = "darkblue";
const beltColorChange = "blue";
const beltStrokeColor = `#8888CC`;
const cookieColor = "#FFCD00";
const sourceColor = cookieColor;
const targetColor = "black";
const SPEED = 200;
const NODERADIUS = 20;

const ITARGET = 1;

/**
 * @description this class displays a network graph with beautiful graphics :)
 */
export class ConveyorBeltStyle {
    drawNode(context, node, G) {
        if (node == G.nodes[0])  //source
            return;

        if (node == G.nodes[ITARGET]) return;

        context.beginPath();
        context.strokeStyle = node == G.nodes[0] ? sourceColor : node == G.nodes[ITARGET] ? targetColor : beltStrokeColor;
        context.fillStyle = "black";
        context.lineWidth = 2;
        context.arc(node.x, node.y, NODERADIUS, 0, 2 * Math.PI);
        context.fill();
        context.stroke();

        if (node.isProblematic) {

            context.moveTo(node.x - 8, node.y - 8);
            context.lineTo(node.x + 8, node.y + 8);
            context.moveTo(node.x + 8, node.y - 8);
            context.lineTo(node.x - 8, node.y + 8);
            context.stroke();
        }


    }



    drawNodeOver(context, node, G) {
        if (node == G.nodes[0]) { //source
            context.beginPath();
            context.fillStyle = sourceColor;
            context.strokeStyle = "black";
            context.lineWidth = 2;
            context.rect(node.x - NODERADIUS, node.y - NODERADIUS, 2 * NODERADIUS, 2 * NODERADIUS);
            context.fill();
            context.stroke();

            context.beginPath();
            context.fillStyle = "red";
            context.strokeStyle = "black";
            context.lineWidth = 2;
            context.moveTo(node.x - NODERADIUS, node.y - NODERADIUS);
            context.lineTo(node.x + NODERADIUS, node.y - NODERADIUS);
            context.lineTo(node.x, node.y - 2 * NODERADIUS);
            context.fill();
            context.stroke();

            context.fillStyle = "black";
            context.font = "10px sans serif";

            context.fillText("cookie", node.x, node.y);
            context.fillText("factory", node.x, node.y + NODERADIUS / 2);

        }
        else if (node == G.nodes[ITARGET]) { //target
            context.beginPath();
            context.fillStyle = "yellow";
            context.strokeStyle = "black";
            context.lineWidth = 2;
            const angle = (1 + Math.sin(window.t / 10)) / 2;
            context.arc(node.x, node.y + NODERADIUS, 1.5 * NODERADIUS, -Math.PI / 2 + angle, 3 * Math.PI / 2 - angle);
            context.lineTo(node.x, node.y + NODERADIUS);
            context.fill();
        }

    }

    drawEdge(context, A, B, edge, G) {
        const lineWidth = 34;

        context.beginPath();
        context.strokeStyle = beltStrokeColor;
        context.lineWidth = lineWidth + 2;
        context.moveTo(A.x, A.y);
        context.lineTo(B.x, B.y);
        context.stroke();

        context.beginPath();
        context.strokeStyle = beltColor;


        context.lineWidth = lineWidth;
        context.moveTo(A.x, A.y);
        context.lineTo(B.x, B.y);
        context.stroke();

        const angle = Math.atan2(A.y - B.y, A.x - B.x);
        if (G.action) {
            if (G.action.edge == edge) {
                context.strokeStyle = edge.clicked ? beltColorChange : beltColorSelected;

                const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
                context.beginPath();
                if (G.action.add) {
                    context.moveTo(M.x, M.y);
                    context.lineTo(B.x, B.y);
                    context.stroke();

                }
                else {
                    context.moveTo(A.x, A.y);
                    context.lineTo(M.x, M.y);
                    context.stroke();
                }
            }

        }



        if (edge.clicked)
            edge.clicked--;

        const d = Math.sqrt((A.x - B.x) ** 2 + (A.y - B.y) ** 2);
        const speed = 1 * 20000 / SPEED / d;


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

        const i = d * ((window.t) % (SPEED) / (SPEED));
        const p = { x: A.x + (B.x - A.x) * i / d, y: A.y + (B.y - A.y) * i / d };

        function drawCookie(p) {
            context.beginPath();
            context.lineWidth = 1;
            context.arc(p.x, p.y, 8, 0, 2 * Math.PI);
            context.fillStyle = cookieColor;
            context.strokeStyle = "black";
            context.fill();
            context.stroke();

            function pepite(x, y) {
                context.beginPath();
                context.fillStyle = "black";
                context.arc(x, y, 1, 0, 2 * Math.PI);
                context.fill();
            }

            pepite(p.x + 3, p.y + 2);
            pepite(p.x, p.y - 4);
            pepite(p.x - 2, p.y + 1);


        }
        const r = 10;
        for (let j = 0; j < edge.flow; j++) {
            function perturbation() {
                return 2 * Math.random() - 1;
            }
            drawCookie({
                x: p.x + perturbation() + r * Math.cos(j * Math.PI * 2 / edge.flow),
                y: p.y + perturbation() + r * Math.sin(j * Math.PI * 2 / edge.flow)
            })
        }

        const pmiddle = { x: A.x + (B.x - A.x) * 0.5, y: A.y + (B.y - A.y) * 0.5 }

        context.textAlign = "center";
        context.font = "12px sans serif";
        const angle = Math.atan2(A.y - B.y, A.x - B.x) + Math.PI / 2;
        context.fillStyle = "white";
        const dd = 16;
        context.fillText(edge.flow + "/" + edge.capacity, pmiddle.x + polarX(dd, angle), pmiddle.y + polarY(dd, angle));
    }
}


function polarX(r, a) {
    return r * Math.cos(a);
}


function polarY(r, a) {
    return r * Math.sin(a);
}