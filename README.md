# share-tnc

Share a serial TNC using KISS over TCP/IP

This is a command-line utility that lets you share a serial (typically USB-serial)
KISS TNC to a TCP/IP port.  The port can be used by any program (e.g. aprx, APRSIS32, etc)
that can use the KISS-over-TCP protocol.

# Hardware/Software Environment

share-tnc uses 'node.js' and the 'serialport' npm module.  It has been tested most
heavily on a Raspberry Pi running Raspbian Jessie, but has been casually tested on
Windows 10, Linux Mint and MacOS Sierra, and appears to work fine.  Please file a
report if you experience difficulties.

share-tnc does not attempt to put the TNC into KISS mode.  You should have your TNC
configured to go into KISS mode automatically on bootup and stay there.

# Installation

_Note:_ 'serialport' doesn't like to installed in the usual way with 'sudo'
(see [here](https://github.com/EmergingTechnologyAdvisors/node-serialport#sudo--root)
for more information).  If you need to use 'sudo' to install globally, use
the following:

    sudo npm install -g --unsafe-perm share-tnc  

If you don't need 'sudo', then

    npm install -g share-tnc  

## Side-note: Installing Node.js on the Raspberry Pi

The version of Node that you'll get with 'apt-get install node' is unfortunately very
old.  Your best bet is to install from the 'nodejs.org' binary downloads.  
- Go to https://nodejs.org/en/download/ and download the _ARMv6_ package  
- Unpack it, and then copy all the directories in the package to /usr/local  

Example:  
    curl -O https://nodejs.org/dist/v6.9.5/node-v6.9.5-linux-armv6l.tar.xz  
    tar xf node-v6.9.5-linux-armv6l.tar.xz  
    cp -r node-v6.9.5-linux-armv6l/bin /usr/local  
    cp -r node-v6.9.5-linux-armv6l/include /usr/local  
    cp -r node-v6.9.5-linux-armv6l/share /usr/local  
    cp -r node-v6.9.5-linux-armv6l/lib /usr/local  

# Usage

## Command Line - Sharing the TNC

    share-tnc <device> <port> [--baud <baudrate>]  

    e.g.

    share-tnc /dev/ttyUSB0 8001 --baud 1200  

You can also share out a KISS-over-TCP connection like DireWolf (since DireWolf
only supports one connection at a time):

    share-tnc <host>:<port> <port>  

    e.g.  

    share-tnc localhost:8001 8002

### Multiple Connections

If more than one client connects to share-tnc's server port, the system simulates
what would happen if each client had a radio and TNC to itself, but could hear
the other clients.  When a client sends a packet, that packet is not echoed back to
the client (because you wouldn't hear while you're transmitting),
but it _is_ sent to every other client.  Packets received on the
physical radio/tnc are relayed to every client that's connected to share-tnc.

Note that this behaviour may confuse clients that are trying
to use the same callsign-ssid
combo, and may give undesired on-air results.  For instance if you had two APRS clients
configured to use VA3ZZZ-1, they would both acknowledge a message packet that was
received.  So, don't do that.  If you have more than one APRS client hooked up, they
should generally have different callsigns or ssids.  

## Command Line - Monitoring the On-Air APRS Traffic

    watch-aprs <host>:<port>

    e.g.

    watch-aprs raspberrypi:8001

'watch-aprs' isn't specific to the 'share-tnc' package.  It will work with any
KISS-over-TCP server (e.g. DireWolf).

# Installing as a 'systemd' Service

There is a sample 'module definition' in the module library as 'share-tnc.service'.
Typical usage would be something like:

- Ensure you have a directory called /usr/local/lib/systemd/system  
- Copy 'share-tnc.service' into /usr/local/lib/systemd/system  
- Edit /usr/local/lib/systemd/system/share-tnc.service to reflect the device port,
baud rate and KISS-TCP port that you want to use.  
- sudo systemctl enable share-tnc  
- sudo systemctl start share-tnc  

## Logging

share-tnc doesn't attempt to manage its own logging.  It simply outputs to the
console.  When started by 'systemd', this output will be logged to systemd's journal.
You can view the log output with:

    sudo journalctl -u share-tnc  

# Contributing  

To contribute, please fork https://github.com/trasukg/share-tnc and then submit
pull requests, or open an issue.

See also https://github.com/trasukg/utils-for-aprs for the underlying components
used in this utility.

# License

This software is licensed under the Apache Software License 2.0

The phrase APRS is a registered trademark of Bob Bruninga WB4APR.

# Release Notes

1.0.0 - February 8, 2017 - First Release  
1.0.1 - March 10, 2017 - Fixed a bug where the only baud rate actually used was 1200  
1.0.2 - April 3, 2017 - Updated to require the latest utils-for-aprs, which should
now include the 'ws' dependency properly.  
1.0.3 - April 3, 2017 - Updated utils-for-aprs to call out the 'bluebird' dependency.
1.0.4 - April 3, 2017 - Updated to latest utils-for-aprs  
1.0.5 - January 11, 2018 - Added capability to share a KISS-over-TCP port.  
