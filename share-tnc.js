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
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
var SharedEndpoint=require("./SharedEndpoint");

const startup = function(argv){
  console.log(argv);
  var path=argv.path;
  var port= argv.port;
  var baud= argv.baud;
  
  var sharedEndpoint=new SharedEndpoint( {
    path: path,
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
  
}

const argv = yargs(hideBin(process.argv))
  .command(
    '$0 <path> <port>', 
    'Setup a shared TNC', 
    (yargs) => {
      yargs.positional('path', {
        describe: 'Either the path of the serial device or hostname:port of network KISS device.',
        type: 'string'
      }).positional('port', {
        describe: 'Server port for the shared device',
        type: 'number'
      }).option('baud', {
        describe: 'Baud rate for serial device',
        default: 1200
      })
    },
    argv => startup(argv))
  .help()
  .argv;

/*
  The pipeline is sort of like this:
    SerialKISSFrameEndpoint Endpoint -> sharePortToTCP -> ServerSocketKISSFrameEndpoint
*/


