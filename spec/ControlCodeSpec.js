
const net=require('net');
const Promise=require('bluebird');
const ServerSocketKISSFrameEndpoint=
  require('utils-for-aprs').ServerSocketKISSFrameEndpoint
const SharedEndpoint=require("../SharedEndpoint");

/*
  The setup here is that we have:
  - A ServerSocketKISSFrameEndpoint on port 8001
  - A SharedEndpoint on port 8002 that is set to forward to port 8001
*/
describe("Share-tnc's handling of control codes", () => {
  var receivingEndpoint=null;
  var UUT=null;
  var waitForServerSocket=null;
  var receivingConnection=null;

  beforeEach(function() {
    //Setup a receiving endpoint on port 8001.
    waitForServerSocket=new Promise((resolve,reject) => {
      receivingEndpoint=new ServerSocketKISSFrameEndpoint("0.0.0.0", 8001);
      receivingEndpoint.on('listen', function() {
        console.log("KISS TCP server established - listening for connections on port " + "8001");
      });
      receivingEndpoint.on("connect", connection => {
        receivingConnection=connection;
        resolve();
      });
      receivingEndpoint.on("error", reject);
      receivingEndpoint.enable()
    });

    //Setup the sharing endpoint on port 8002
    UUT=new SharedEndpoint({
      device: "0.0.0.0:8001",
      port: 8002
    });
    UUT.on("listen", message => console.log(message));
    UUT.on("clientConnect", message => console.log(message));
    UUT.on("tncConnect", message => console.log(message));
    UUT.on("tncDisconnect", message => console.log(message));
    UUT.on("clientDisconnect", message => console.log(message));
    UUT.on("error", message => console.log(message));

    UUT.enable();
  });

  afterEach(function() {
    receivingEndpoint.disable();
    UUT.disable();
  });

  it("Passes a TXDelay setting verbatim.", (done) => {
    //Open a socket to the sharing endpoint
    var socket;
    var receivedData;
    openSocket()
    //Send a TXDelay setting frame
    .then(s => {
      socket=s;
      /* Have to start up the received data before we send, or it will miss the
      event. */
      receivedData=getReceivedData(receivingConnection);
      return writeATxDelayFrame(socket);
    })
    .then(socket => {return receivedData;})
    .then(receivedData => {
      //It should come through verbatim
      // 1st byte should be 1
      expect(receivedData[0]).toBe(0x01);
      expect(receivedData[1]).toBe(0x50);  
    })
    .then(done)
  });
});

const openSocket=function() {
  return new Promise(resolve => {
    var s=new net.Socket();
    s.connect(8002, 'localhost', evt => {
      resolve(s);
    });
  });
};

const writeToSocket=function(s, data) {
  return new Promise(resolve => {
    s.write(data, undefined, () => {
      resolve(s);
    });
  });
};

const aTxDelayFrame=function() {
  return Buffer.from([0xc0, 0x01, 0x50, 0xc0]);
};

const writeATxDelayFrame=function(s) {
  return writeToSocket(s, aTxDelayFrame());
}

const getReceivedData=function(socket) {
  return new Promise(resolve => {
    console.log("Setting event handler on the receiving socket");
    socket.once("data", data => {
      resolve(data);
    });

  })
}
