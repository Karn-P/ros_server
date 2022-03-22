# ROS Server
## Features
- Support ROS RESTful API.

## Dependencies
_ROS Server_ uses a number of open source projects to work properly:

- [node.js] - Asynchronous event-driven JavaScript runtime environment, suitable for non-blocking I/O needed application.
- [express] - Node.js web application framework, serving RESTful API.
- [express-ws] - WebSocket endpoint for Express server, supported by [ws].
- [node-serialport] - Node.js library for access Linux/OSX/Windows serial port
  
## Installation
_ROS Server_ requires [Node.js](https://nodejs.org/) v16.13+ to run.

Clone the repository and install the dependencies

```sh
git clone https://github.com/Karn-P/ros_server.git
cd ros_server
npm install
```

## Usage
To run this software, you need to follow severals step to configure the behavior of the software
1. Set the configuration of the ROS source interface in `/configs/sourceConfigs.js`.
2. In `server.js`, instantiate the source interface (the class file is in `/interfaces/source.js`) which will take specific configuration from `/configs/sourceConfigs.js` as an argument. __Currently supports SocketClient and SocketServer interface type__.
3. The software will listen on port 9999 by default, which can be run by execute
   ```sh
   npm start
   ```
   or execute with nodemon
   ```sh
   npm run dev
   ```
