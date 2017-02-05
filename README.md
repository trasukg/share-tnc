# share-tnc
Share a serial TNC using KISS over TCP/IP

This is a command-line utility that lets you share a serial (typically USB-serial)
KISS TNC to a TCP/IP port.

# Installation

_Note:_ 'serialport' doesn't like to installed in the usual way with 'sudo'
(see [here](https://github.com/EmergingTechnologyAdvisors/node-serialport#sudo--root)
for more information).  If you need to use 'sudo' to install globally,use
the following:

    sudo npm install -g --unsafe-perm trasukg/share-tnc

If you don't need 'sudo', then

    npm install -g trasukg/share-tnc

# Usage

## Command Line - Sharing the TNC

    share-tnc <serial-device> <port>

    e.g.

    share-tnc /dev/ttyUSB0

## Command Line - Monitoring the On-Air Traffic

    watch-aprs <host>:<port>

    e.g.

    watch-aprs raspberrypi:8001

# Installing as a 'systemd' Service

There is a sample 'module definition' in the module library as 'share-tnc.service'.
