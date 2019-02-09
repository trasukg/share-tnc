/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

/*
  The class is a state machine that sets up a shared endpoint.
*/

const util=require('util');

const EventEmitter=require('events');
const StateMachine=require('@trasukg/state-machine');
const utilsForAprs=require("utils-for-aprs");
const SerialKISSFrameEndpoint=utilsForAprs.SerialKISSFrameEndpoint;
const ServerSocketKISSFrameEndpoint=utilsForAprs.ServerSocketKISSFrameEndpoint;
const SocketKISSFrameEndpoint=utilsForAprs.SocketKISSFrameEndpoint;

const states={
    Idle: {
      enable: "Enabled",
      disable: "Idle"
    },
    Enabled: {
      onEntry: function() {
        /* Turn on the endpoints.
          - Target Endpoint will attempt to connect to TNC
          - ServerSocketKISSFrameEndpoint will open the server port and start
          accepting connections
        */
        this.targetEndpoint.enable();
        this.serverEndpoint.enable();
      },
      onExit: function() {
        /* Turn off the endpoints.
        */
        this.targetEndpoint.disable();
        this.serverEndpoint.disable();
      },
      enable: "Enabled",
      disable: "Idle"
    }
};

const SharedEndpoint=function(options) {
  EventEmitter.apply(this);
  StateMachine.call(this, states, "Idle");


  /* All connections are put into a Set, which lets us use forEach()
  */
  this.allConnections=new Set();

  //Create the server socket endpoint
  this.serverEndpoint=new ServerSocketKISSFrameEndpoint("0.0.0.0", options.port);

  // If the device happens to look like "host:port" then create a socket endpoint.
  var res=/([^\:]+):([0-9]+)/.exec(options.device);
  if (res) {
    var host=res[1];
    var port=res[2];
    this.targetEndpoint=new SocketKISSFrameEndpoint();
    this.targetEndpoint.host=host;
    this.targetEndpoint.port=port;
  } else {
    this.targetEndpoint=new SerialKISSFrameEndpoint(options.device, {baudRate: options.baud});
  }

  // Log interesting events...
  this.serverEndpoint.on('connect', connection => {
    this.emit("clientConnect", "TCP Endpoint received a connection from " +
      connection.socket.remoteAddress + ":" + connection.socket.remotePort,
      connection.socket.remoteAddress,
      connection.socket.remotePort
    );
    this.allConnections.add(connection);
    connection.on('data', frame =>  {
      relayToAllBut(connection,frame);
    });
    connection.on('close', () => {
      this.allConnections.delete(connection);
      this.emit("clientDisconnect", "TCP connection from " +
        connection.socket.remoteAddress + ":" + connection.socket.remotePort +
        " was closed",
        connection.socket.remoteAddress,
        connection.socket.remotePort
      );
    });
  });

  this.serverEndpoint.on('listen', () => {
    this.emit("listen", "KISS TCP server established - listening for connections on port " + options.host + ":" + options.port,
    options.host,
    options.port);
  });

  this.serverEndpoint.on('error', err =>  {
    this.emit("error", "Error on server endpoint:" + err);
  });

  this.targetEndpoint.on('error', err => {
    this.emit("error", "Error on serial TNC endpoint:" + err);
  });

  this.targetEndpoint.on('connect', connection => {
    this.emit("tncConnect", "Connected to TNC on " + options.device + (res?"":" at " + options.baud + " baud."));
    this.allConnections.add(connection);
    connection.on('data', frame => {
      this.relayToAllBut(connection, frame);
    });
    connection.on('disconnect', () => {
      this.allConnections.delete(connection);
      this.emit("tncDisconnect", 'TNC connection was closed');
    });
  });
}
util.inherits(SharedEndpoint, EventEmitter);

SharedEndpoint.prototype.relayToAllBut=function(source, frame) {
  //console.log("Got frame from " + source);
  this.allConnections.forEach(connection => {
    if (connection === source) {
      //console.log("Skipping destination " + connection);
    } else {
      connection.data(frame);
    }
  });
}

module.exports=SharedEndpoint;
