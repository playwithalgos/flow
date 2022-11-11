import { Graph } from "./graph.js";
import { ConveyorBeltStyle } from "./ConveyorBeltStyle.js";

window.onload = load;
window.t = 0;


const WIDTH = 800;
const HEIGHT = 600;


function generateGraph() {
   const THESHOLDEDGES = 100;

   const G = new Graph();
   G.addNode({ x: 100, y: 200 });
   function getFreePosition() {
      for (let i = 0; i < 10; i++) {
         let ok = true;
         const x = 100 + (WIDTH - 150) * Math.random();
         const y = 50 + (HEIGHT - 150) * Math.random();
         for (let j = 0; j < G.nbNodes; j++) {
            if (d(G.node(j), { x, y }) < THESHOLDEDGES) {
               ok = false;
               break;
            }
         }
         if (ok)
            return { x: x, y: y };
      }
      return undefined;
   }


   for (let i = 0; i < 50; i++) {
      const pos = getFreePosition();
      if (pos)
         G.addNode({ x: pos.x, y: pos.y });
   }

   G.addNode({ x: WIDTH - 50, y: HEIGHT - 50 });

   for (let ii = 0; ii < G.nbNodes; ii++)
      for (let jj = ii + 1; jj < G.nbNodes; jj++) {
         let i = ii;
         let j = jj;
         if (Math.random() > 0.5) {
            if (G.node(j).x < G.node(i).x)
               [i, j] = [jj, i]
         }
         if (d(G.node(j), G.node(i)) < THESHOLDEDGES * 1.5)
            G.addEdge(i, j, { flow: 0, capacity: 1 + Math.floor(Math.random() * 10) });

      }

   maxflow(G);
   if (flow(G) == 0)
      return generateGraph();
   else {
      reset(G);
      return G;

   }
}





function maxflow(G) {
   for (const edge of G.edges)
      edge.flow = 0;

   function getAugmentingPath(G) {
      let v = new Array(G.nbNodes).fill(false);

      function explore(G, is) {
         v[is] = true;

         if (is == G.nbNodes - 1)
            return [{ node: is, value: Infinity }];

         for (const edge of G.edges) {

            if (edge.start == is && !v[edge.end] && edge.flow < edge.capacity) {
               const pi = explore(G, edge.end);
               console.log(pi)
               if (pi)
                  return [{ node: is, value: edge.capacity - edge.flow }].concat(pi);
            }
            else if (!v[edge.start] && edge.end == is && edge.flow > 0) {
               const pi = explore(G, edge.start);
               if (pi)
                  return [{ node: is, value: edge.flow }].concat(pi);
            }

         }
         return false;
      }
      return explore(G, 0);

   }


   function improve(pi) {
      const cmin = Math.min(...pi.map((seq) => seq.value));
      for (let i = 0; i < pi.length - 1; i++) {
         const edge1 = G.edge(pi[i].node, pi[i + 1].node);

         if (edge1)
            edge1.flow += cmin;

         const edge2 = G.edge(pi[i + 1].node, pi[i].node);

         if (edge2)
            edge2.flow -= cmin;
      }


   }

   let pi;
   while (pi = getAugmentingPath(G)) {
      improve(pi)
   }
   G.maxflow = flow(G);
}


function simpleExampleGraph() {
   const G = new Graph();
   G.addNode({ x: 100, y: 200 });
   G.addNode({ x: 300, y: 100 });
   G.addNode({ x: 300, y: 300 });
   G.addNode({ x: 500, y: 200 });
   G.addEdge(0, 1, { capacity: 6, flow: 0 });
   G.addEdge(0, 2, { capacity: 6, flow: 0 });
   G.addEdge(1, 3, { capacity: 4, flow: 0 });
   G.addEdge(2, 3, { capacity: 6, flow: 0 });
   G.addEdge(2, 1, { capacity: 6, flow: 0 });
   return G;

}



function reset(G) {
   for (const edge of G.edges)
      edge.flow = 0;
}
let G = new Graph(); //generateGraph

function load() {
   buttonReset.onclick = () => reset(G);
   buttonSolution.onclick = () => maxflow(G);
   buttonHelp.onclick = () => alert("Yellow node: the source of cookies. Black node: the target. You have to transport the maximum number of cookies from the source to the target. \n" +
      "Click at the end of an edge: increase the flow in an edge by 1\nClick at the beginning of an edge: decrease the flow in an edge by 1")

   const style = new ConveyorBeltStyle();
   //G = simpleExampleGraph();
   G = generateGraph();

   const draw = () => {
      const context = canvas.getContext("2d");
      G.draw(context, style);
      if (!G.isProblematic) {
         context.fillText("flow: " + flow(G), 64, 32);
         if (G.maxflow == flow(G))
            context.fillText("bravo!", 300, 32);

      }



      requestAnimationFrame(draw);
      t++;

   }

   draw();


}

function d(a, b) {
   return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

canvas.onmousedown = (evt) => {
   const p = { x: evt.layerX, y: evt.layerY };

   for (const edge of G.edges) {
      if (Math.abs(d(edge.A, p) + d(p, edge.B) - d(edge.A, edge.B)) < 10) {
         edge.clicked = 10;
         if (d(edge.B, p) < d(p, edge.A)) {
            if (edge.flow < edge.capacity)
               edge.flow++;

         }
         else {

            if (edge.flow > 0)
               edge.flow--;

         }
         updateState();
      }
   }
   evt.preventDefault();
}


function inflow(G, inode) {
   return G.edges.filter((e) => e.end == inode).map((e) => e.flow).reduce((a, b) => a + b, 0);
}

function outflow(G, inode) {
   return G.edges.filter((e) => e.start == inode).map((e) => e.flow).reduce((a, b) => a + b, 0);
}

function flow(G) {
   return outflow(G, 0);
}

const synth = new Tone.Synth().toDestination();
sound();

const notes = ["E3", "E3", "F3", "G3", "G3", "F3", "E3", "D3", "C3", "C3", "D3", "E3", "E3", "D3", "D3", "D3",
   "E3", "E3", "F3", "G3", "G3", "F3", "E3", "D3", "C3", "C3", "D3", "E3", "D3", "D3", "C3", "C3"
];
const notesBad = ["C2", "D2", "Eb2", "F2", "G2"];
let iNote = 0;


function sound() {
   function pick(A) {
      iNote++;
      if (iNote >= A.length)
         iNote = 0;
      return A[iNote]; //Math.floor(Math.random() * A.length)]
   }
   const f = flow(G)

   if ((f == G.maxflow) || G.isProblematic) {
      synth.triggerAttackRelease(pick(G.isProblematic ? notesBad : notes), "16n");
   }

   const speed = 2000;
   if (G.isProblematic)
      setTimeout(sound, 1000);
   else
      setTimeout(sound, f > 0 ? speed / f : speed);
}

function updateState() {


   G.isProblematic = false;
   for (const inode in G.nodes) {
      console.log(inflow(G, inode))
      console.log(outflow(G, inode))

      if (inode != 0 && inode != G.nodes.length - 1 && inflow(G, inode) != outflow(G, inode)) {
         G.nodes[inode].isProblematic = true;
         G.isProblematic = true;
      }
      else
         G.nodes[inode].isProblematic = false;

   }

   if (G.isProblematic)
      canvas.style.filter = "grayscale(0.5)";
   else
      canvas.style.filter = "";

   console.log(G.isProblematic)

}



canvas.oncontextmenu = function () {
   return false;
}