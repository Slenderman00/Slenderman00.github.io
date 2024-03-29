let worker;

initBackground = () => {
        // set canvas height and width
        let lcanvas = document.getElementById("canvas");
        lcanvas.height = window.innerHeight * 1.2;
        lcanvas.width = window.innerWidth * 1.2;
    
        worker = new Worker('backgroundWorker.js');
    
        let canvas = document.getElementById("canvas").transferControlToOffscreen();
        
        //data for mousemove
        let canvasRect = document.getElementById("canvas").getBoundingClientRect();
        let scaleX = canvas.width / canvasRect.width;
        let scaleY = canvas.height / canvasRect.height;
    
        let mouseMove = (e) => {
            const x = (e.clientX - canvasRect.left) * scaleX;
            const y = (e.clientY - canvasRect.top) * scaleY;
            worker.postMessage({mouse: {x: x, y: y}, click: false, canvas: null });
        }
    
        card = document.getElementsByClassName("card")[0];
        card.addEventListener("mousemove", mouseMove);
        document.getElementById("canvas").addEventListener("mousemove", mouseMove);
    
        //send message to worker
        worker.postMessage({mouse: null, click: false, canvas: canvas }, [canvas]);
    
        document.getElementById("canvas").addEventListener("click", function(e) {
            worker.postMessage({mouse: null, click: true, canvas: null });
        });
    
        document.getElementsByClassName("center")[0].addEventListener("click", function(e) {
            worker.postMessage({mouse: null, click: true, canvas: null });
        });
    
        worker.onmessage = (e) => {
            console.log('Message received from worker');
            console.log(e.data);
        }
}

loadBackground = () => {
    initBackground();

    //This does not work as the window is resized when scrolling on a mobile device
    //on window resize
    window.addEventListener("resize", function() {
        //destroy worker
        worker.terminate();
        worker = null;

        //destroy canvas
        canvas = document.getElementById("canvas");
        canvas.remove();
        canvas = document.createElement("canvas");
        canvas.id = "canvas";
        document.getElementById("canvas-container").appendChild(canvas);
        initBackground();
    });
}

