self.onmessage = event => {
    console.log("[worker.js]:Acknowledge!");
    self.postMessage(event.data);
};