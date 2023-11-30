let random = (min, max) => {
    return Math.random() * (max - min) + min;
}

class Edge {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;

        this.lifetime = 0;
    }

    draw(ctx) {
        //the lower the less transparent the line is
        ctx.globalAlpha = 1 - this.lifetime / 20;
        ctx.beginPath();
        ctx.moveTo(this.node1.posx, this.node1.posy);
        ctx.lineTo(this.node2.posx, this.node2.posy);
        ctx.stroke();
    }
}

class Node {
    constructor(posx, posy) {
        this.posx = posx;
        this.posy = posy;
        this.momentumx = 0;
        this.momentumy = 0;
    }

    drift(width, height) {
        this.momentumx += random(-0.05, 0.05);
        this.momentumy += random(-0.05, 0.05);
        this.posx += this.momentumx;
        this.posy += this.momentumy;

        //make sure the node stays within the canvas
        if (this.posx < 0) {
            this.momentumx = -this.momentumx;
        }
        if (this.posx > width) {
            this.momentumx = -this.momentumx;
        }
        if (this.posy < 0) {
            this.momentumy = -this.momentumy;
        }
        if (this.posy > height) {
            this.momentumy = -this.momentumy;
        }

        //friction
        //if the momentum is larger than 2 then friction is applied
        if (Math.abs(this.momentumx) > 0.5) {
            this.momentumx *= 0.99;
        }

        if (Math.abs(this.momentumy) > 0.5) {
            this.momentumy *= 0.99;
        }
    }
}

class Nodes {
    constructor(canvas) {

        this.nodes = [];
        this.edges = [];
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.mousePos = {
            x: 0,
            y: 0
        };

        this.stopped = false;
    }

    createEdge(node1, node2) {
        //check if the edge already exists
        for (let edge of this.edges) {
            if ((edge.node1 == node1 && edge.node2 == node2) || (edge.node1 == node2 && edge.node2 == node1)) {
                return;
            }
        }

        //check the ammount of edges
        if (this.edges.length > 5000) {
            return;
        }

        const edge = new Edge(node1, node2);
        this.edges.push(edge);

        // Set the lifetime of the edge to 0
        edge.lifetime = 0;
    }

    removeEdges() {
        setInterval(() => {
            for (let i = 0; i < this.edges.length; i++) {
                this.edges[i].lifetime++;
                if (this.edges[i].lifetime > 10) {
                    this.edges.splice(i, 1);
                }
            }
        }, 100);
    }

    click() {
        //all nodes within 100px of the mouse are accelerated away from the mouse
        console.log("click");
        for (let node of this.nodes) {
            let distanceToMouse = this.getDistanceToMouse(node);
            if (distanceToMouse < 100) {
                let angle = Math.atan2(node.posy - this.mousePos.y, node.posx - this.mousePos.x);
                node.momentumx += Math.cos(angle) * 10;
                node.momentumy += Math.sin(angle) * 10;
            }
        }

    }

    addNodes(numNodes) {
        for (let i = 0; i < numNodes; i++) {
            this.nodes.push(new Node(random(0, this.canvas.width), random(0, this.canvas.height)));
        }
    }

    drift() {
        for (let node of this.nodes) {
            node.drift(this.canvas.width, this.canvas.height);
        }
    }

    mouseMove(posx, posy) {
        this.mousePos.x = posx;
        this.mousePos.y = posy;
    }

    getDistanceToMouse(node) {
        return Math.sqrt(Math.pow(node.posx - this.mousePos.x, 2) + Math.pow(node.posy - this.mousePos.y, 2));
    }

    getClosestNodes(node, numNodes) {
        let closestNodes = [];
        for (let i = 0; i < numNodes; i++) {
            closestNodes.push(this.nodes[i]);
        }
        for (let i = numNodes; i < this.nodes.length; i++) {
            let dist = Math.sqrt(Math.pow(node.posx - this.nodes[i].posx, 2) + Math.pow(node.posy - this.nodes[i].posy, 2));
            let maxDist = 0;
            let maxDistIndex = 0;
            for (let j = 0; j < closestNodes.length; j++) {
                let dist2 = Math.sqrt(Math.pow(node.posx - closestNodes[j].posx, 2) + Math.pow(node.posy - closestNodes[j].posy, 2));
                if (dist2 > maxDist) {
                    maxDist = dist2;
                    maxDistIndex = j;
                }
            }
            if (dist < maxDist) {
                closestNodes[maxDistIndex] = this.nodes[i];
            }
        }
        return closestNodes;
    }

    draw() {
        this.ctx.beginPath();
        for (let node of this.nodes) {
            //this.ctx.moveTo(node.posx, node.posy);
            //this.ctx.arc(node.posx, node.posy, 1, 0, 2 * Math.PI);

            let distanceToMouse = this.getDistanceToMouse(node);
            let range = 11 - Math.floor(distanceToMouse / 100);
            //make sure range is at least 1
            if (range < 1) {
                range = 1;
            }
            
            let closestNodes = this.getClosestNodes(node, range);

            for (let closestNode of closestNodes) {
                // this must be debounced
                //this.ctx.lineTo(closestNode.posx, closestNode.posy);
                this.createEdge(node, closestNode);

            }

        }

        for (let edge of this.edges) {
            edge.draw(this.ctx);
        }

        this.ctx.strokeStyle = "#494949";
        this.ctx.stroke();
    }


    start() {
        const animate = () => {
            this.drift(this.canvas.width, this.canvas.height);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
            requestAnimationFrame(animate);
        };

        if (!this.stopped) {
            animate();
        }
    }

    stop() {
        this.stopped = true;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.clearNodes();
    }

    clearNodes() {
        this.nodes = [];
        this.edges = [];
    }
}

/*

canvas = document.getElementById("canvas");

//set canvas height and width
canvas.height = window.innerHeight * 1.2;
canvas.width = window.innerWidth * 1.2;

let nodes = new Nodes(canvas);
nodes.addNodes(1000);
nodes.removeEdges();
nodes.start();

//data for mousemove
let canvasRect = canvas.getBoundingClientRect();
let scaleX = canvas.width / canvasRect.width;
let scaleY = canvas.height / canvasRect.height;

let mouseMove = (e) => {
    const x = (e.clientX - canvasRect.left) * scaleX;
    const y = (e.clientY - canvasRect.top) * scaleY;
    nodes.mouseMove(x, y);
}

card = document.getElementsByClassName("card")[0];
card.addEventListener("mousemove", mouseMove);
canvas.addEventListener("mousemove", mouseMove);

canvas.addEventListener("click", function(e) {
    nodes.click();
});

document.getElementsByClassName("center")[0].addEventListener("click", function(e) {
    nodes.click();
});

//on resize
window.addEventListener("resize", function() {
    canvas.height = window.innerHeight * 1.2;
    canvas.width = window.innerWidth * 1.2;

    //kill old node class
    nodes.stop();

    //reset mousemove data
    canvasRect = canvas.getBoundingClientRect();
    scaleX = canvas.width / canvasRect.width;
    scaleY = canvas.height / canvasRect.height;

    //re-init nodes class
    nodes = new Nodes(canvas);
    nodes.addNodes(1000);
    nodes.removeEdges();
    nodes.start();
});*/

let started = false;
let nodes = null;


let start = (canvas) => {
    nodes = new Nodes(canvas);
    nodes.addNodes(1000);
    nodes.removeEdges();
    nodes.start();
}

onmessage = (event) => {
    if(!started) {
        start(event.data.canvas);
        started = true;
    }
    if(event.data.mouse) {
        nodes.mouseMove(event.data.mouse.x, event.data.mouse.y);
    }
    if (event.data.click) {
        nodes.click();
    }
    if(event.data.resize) {
        nodes.stop();
        start(event.data.canvas);
    }
}