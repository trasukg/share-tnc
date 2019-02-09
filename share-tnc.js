#! /usr/bin/env node

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
  This is a command-line utility to share out a serial port TNC to one or more
  KISS-TCP client programs.

  For instance, you could have a serial TNC shared between APRX and a client
  program like APRSIS32.
*/
var path=require('path');
var util=require('util');
var SharedEndpoint=require("./SharedEndpoint");

var opt=require('node-getopt').create([
  ['', 'baud[=BAUD]', 'baud rate']
]).bindHelp().parseSystem();

if (opt.argv.length != 2) {
  console.log("Usage: share-tnc <device> <port> --baud=BAUD");
  return;
}

/*
  The pipeline is sort of like this:
    SerialKISSFrameEndpoint Endpoint -> sharePortToTCP -> ServerSocketKISSFrameEndpoint
*/

var device=opt.argv[0];
var port=opt.argv[1];
var baud= opt.options.baud?parseInt(opt.options.baud):1200

var sharedEndpoint=new SharedEndpoint( {
  device: device,
  port: port,
  baud: baud
});

sharedEndpoint.on("listen", message => console.log(message));
sharedEndpoint.on("clientConnect", message => console.log(message));
sharedEndpoint.on("tncConnect", message => console.log(message));
sharedEndpoint.on("tncDisconnect", message => console.log(message));
sharedEndpoint.on("clientDisconnect", message => console.log(message));
sharedEndpoint.on("error", message => console.log(message));

sharedEndpoint.enable();
