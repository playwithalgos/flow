import { Graph } from "./graph.js";
import { ConveyorBeltStyle } from "./ConveyorBeltStyle.js";

window.onload = load;
window.t = 0;


const WIDTH = 800;
const HEIGHT = 600;

const ISOURCE = 0;
const ITARGET = 1;



/**
 * 
 * @returns a very nice graph network that has nice property:
 *  it has a max-flow > 0
 *  the solution is not so trivial (generally not a unique path with some flow)
 */
function generateGraph() {
   const THESHOLDEDGES = 100;

   const G = new Graph();
   G.addNode({ x: 100, y: 200 }); //source
   G.addNode({ x: WIDTH - 50, y: HEIGHT - 50 }); //target

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

   if (flow(G) == 0 || isFlowSinglePath(G))
      return generateGraph();
   else {
      resetFlowToZero(G);
      return G;

   }
}



function isFlowSinglePath(G) {
   let s = 0;

   while (s != ITARGET) {
      const edgesWithFlow = G.edgesFrom(s).filter((e) => e.flow > 0);
      if (edgesWithFlow.length > 1)
         return false;
      else
         s = edgesWithFlow[0].end;
   }
   return true;
}

function maxflow(G) {
   for (const edge of G.edges)
      edge.flow = 0;

   //with DFS
   /**function getAugmentingPath(G) {
      let v = new Array(G.nbNodes).fill(false);

      function explore(G, is) {
         v[is] = true;

         if (is == ITARGET)
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

   }*/

   /**
    * 
    * @param {*} G 
    * @returns an augmenting path. It performs a BFS in the residual graph
    */
   function getAugmentingPath(G) {
      let v = new Array(G.nbNodes).fill(false);

      const queue = [0];
      const pred = {};

      while (queue.length > 0) {
         let is = queue.pop();

         if (is == ITARGET)
            return constructPath(pred, is);

         for (const edge of G.edges) {
            if (edge.start == is && !v[edge.end] && edge.flow < edge.capacity) {
               pred[edge.end] = { node: is, value: edge.capacity - edge.flow };
               v[edge.end] = true;
               queue.unshift(edge.end);
            }
            else if (!v[edge.start] && edge.end == is && edge.flow > 0) {
               pred[edge.start] = { node: is, value: edge.flow };
               v[edge.start] = true;
               queue.unshift(edge.start);
            }
         }
      }


      function constructPath(pred, is) {
         if (is == 0)
            return [];
         else {
            return constructPath(pred, pred[is].node).concat([pred[is]]);
         }

      }
      return false;

   }

   /**
    * 
    * @param {*} pi
    * @description improves the current flow with the path pi 
    */
   function improve(pi) {
      const cmin = Math.min(...pi.map((seq) => seq.value));
      for (let i = 0; i < pi.length; i++) {
         let u = pi[i].node;
         let v = (i == pi.length - 1) ? ITARGET : pi[i + 1].node;
         const edge1 = G.edge(u, v);

         if (edge1)
            edge1.flow += cmin;

         const edge2 = G.edge(v, u);

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


/**
 * 
 * @returns a simple example of network
 */
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


/**
 * 
 * @param {*} G
 * @returns reset the flow of G to 0 in every edge 
 */
function resetFlowToZero(G) {
   for (const edge of G.edges)
      edge.flow = 0;
}
let G = new Graph(); //generateGraph

function load() {
   buttonReset.onclick = () => { resetFlowToZero(G); updateState() }
   buttonSolution.onclick = () => { maxflow(G);; updateState() }
   buttonHelp.onclick = () => alert("Yellow node: the source of cookies. Black node: the target. You have to transport the maximum number of cookies from the source to the target. \n" +
      "Click at the end of an edge: increase the flow in an edge by 1\nClick at the beginning of an edge: decrease the flow in an edge by 1")

   const style = new ConveyorBeltStyle();
   //G = simpleExampleGraph();
   G = generateGraph();
   //maxflow(G)

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



/**
 * 
 * @param {*} a 
 * @param {*} b 
 * @returns the euclidean distance between the two points a and b (could be nodes)
 */
function d(a, b) {
   return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}


function pointToAction(p) {
   let bestEdge = undefined;
   let bestScore = 10000;

   for (const edge of G.edges) {
      const score = Math.abs(d(edge.A, p) + d(p, edge.B) - d(edge.A, edge.B));
      if (score < 3 && score < bestScore) {
         bestEdge = edge;
         bestScore = score;
      }
   }

   if (bestEdge) {

      //beginning of the edge = decrease the flow by 1
      if (d(bestEdge.B, p) < d(p, bestEdge.A)) {
         if (bestEdge.flow < bestEdge.capacity)
            return { edge: bestEdge, add: true };
      }
      //more to the end of the edge = increease the flow by 1
      else {
         if (bestEdge.flow > 0)
            return { edge: bestEdge, add: false };
      }

   }
   return undefined;
}

canvas.onmousemove = (evt) => {
   const p = { x: evt.layerX, y: evt.layerY };
   const action = pointToAction(p);
   G.action = action;
   evt.preventDefault();
}


canvas.onmousedown = (evt) => {
   const p = { x: evt.layerX, y: evt.layerY };
   const action = pointToAction(p);

   if (action) {
      const { edge, add } = action;
      edge.clicked = 10;
      if (add)
         edge.flow++;
      else
         edge.flow--;
      updateState();
   }
   evt.preventDefault();
}


/**
 * 
 * @param {*} G 
 * @param {*} inode 
 * @returns the inflow in the node number inode in G
 */
function inflow(G, inode) {
   return G.edges.filter((e) => e.end == inode).map((e) => e.flow).reduce((a, b) => a + b, 0);
}


/**
 * 
 * @param {*} G 
 * @param {*} inode 
 * @returns the outflow in the node number inode in G
 */
function outflow(G, inode) {
   return G.edges.filter((e) => e.start == inode).map((e) => e.flow).reduce((a, b) => a + b, 0);
}


/**
 * 
 * @param {*} G 
 * @returns the current flow value in G (i.e. the inflow of the source)
 */
function flow(G) {
   return outflow(G, 0);
}

const synth = new Tone.Synth().toDestination();
sound();

const notes = ["E3", "E3", "F3", "G3", "G3", "F3", "E3", "D3", "C3", "C3", "D3", "E3", "E3", "D3", "D3", "D3",
   "E3", "E3", "F3", "G3", "G3", "F3", "E3", "D3", "C3", "C3", "D3", "E3", "D3", "C3", "C3", "C3"
];
const notesBad = ["C2", "D2", "Eb2", "F2", "G2"];
let iNote = 0;


/**
 * makes some music sometimes
 */
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


/**
 * @description checks whether the flow is correct.
 */
function updateState() {
   G.isProblematic = false;
   for (const inode in G.nodes) {
      console.log(inflow(G, inode))
      console.log(outflow(G, inode))

      if (inode != ISOURCE && inode != ITARGET && inflow(G, inode) != outflow(G, inode)) {
         G.nodes[inode].isProblematic = true;
         G.isProblematic = true;
      }
      else
         G.nodes[inode].isProblematic = false;

   }

   document.body.classList.remove("win");
   if (G.isProblematic)
      canvas.style.filter = "grayscale(0.2)";
   else {
      if (flow(G) == G.maxflow)
         document.body.classList.add("win");
      canvas.style.filter = "";
   }

   console.log(G.isProblematic)

}

