const net = require("net");
const SerialPortDriver = require("serialport");
const EventEmitter = require("events");
const Three = require("three");
const ROSLIB = require("roslib");
const { notStrictEqual } = require("assert");
// const NAV2D = require("../js/Nav2D");
// const ROS2D = require("../js/ros2d")

// const createjs = require("@robotlegsjs/createjs")
// const ros2d = require("../node_modules/ros2d/build/ros2d");
// const easeljs = require("../js/easeljs");
// const ImageMapClientNav = require("../js/ImageMapClientNav")
// const mjpegcanvas = require("../js/mjpegcanvas");
// const mjpegcanvasmin = require("../js/mjpegcanvas.min");

// const Navigation = require("../js/Navigation")
// const OccupancyGridClientNav = require("../js/OccupancyGridClientNav")
// const ROSLIB = require("../js/roslib")
class SocketClient {
  constructor(sourceConfigs) {
    this.connectionName = sourceConfigs.name;
    this.type = sourceConfigs.type;

    this.ip = sourceConfigs.ip;
    this.port = sourceConfigs.port;
    this.pollInterval = sourceConfigs.pollInterval || 10;
    this.successFunction = sourceConfigs.successFunction;

    this.interface = new EventEmitter();

    this.setupConnections();
  }

  setupConnections() {
    this.connect().catch((reject) => {
      this.printRejectNotice(reject);
      this.handleConnectionError(reject);
    });
  }

  printRejectNotice(reject) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`);
    console.log(
      `${this.connectionName}: Attempting to reconnect to ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`
    );
  }

  handleConnectionError() {
    setTimeout(() => {
      this.connect().catch((reject) => {
        this.handleConnectionError(reject);
      });
    }, this.pollInterval * 1000);
  }

  connect() {
    if (!this.socket) {
      this.socket = new net.Socket();
    }
    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.ip, () => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.ip}:${this.port}`
        );
        if (this.successFunction) this.successFunction(this.socket);
        resolve(true);
      });

      this.socket.on("data", (data) => {
        this.interface.emit("received", data);
      });

      this.socket.on("end", () => {
        console.log("Client disconnected");
      });

      this.socket.on("error", (err) => {
        this.socket.removeAllListeners("error");
        this.socket.removeAllListeners("data");
        this.socket.removeAllListeners("end");
        this.socket.removeAllListeners("connect");
        reject(err.message);
      });
    });
  }
}

class SocketServer extends SocketClient {
  constructor(sourceConfigs) {
    super(sourceConfigs);
  }

  printRejectNotice(reject) {
    console.log(`${this.connectionName}: Connection Error: ${reject}`);
    console.log(
      `${this.connectionName}: Attempting to re-listen to ${this.type}: ${this.connectionName} every ${this.pollInterval} seconds`
    );
  }

  connect() {
    if (!this.server) {
      this.server = net.createServer((socket) => {
        console.log("Client socket connected to socker server");
        socket.on("data", (data) => {
          this.interface.emit("received", data);
        });

        socket.on("end", () => {
          console.log("Client Disconnected");
        });
      });
    }
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(
          `${this.connectionName} ${this.type}: Listening on ${this.ip}:${this.port}`
        );
        resolve(true);
      });

      this.server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log("Address in use, retrying...");
          server.close();
        }
        reject(err.message);
      });
    });
  }
}

class SerialPort extends SocketClient {
  constructor(sourceConfigs) {
    super(sourceConfigs);
  }

  connect() {
    if (!this.serialPort) {
      this.serialPort = new SerialPortDriver(`/dev/${this.port}`, {
        buadRate: 115200,
        autoOpen: false,
        lock: false,
      });
    }
    return new Promise((resolve, reject) => {
      this.serialPort.open(() => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.port}`
        );
        resolve(true);
      });
      this.serialPort.on("data", (data) => {
        this.interface.emit("received", data);
      });
      this.serialPort.on("error", (err) => {
        // clean up event listeners to prevent multiple success or failure messages
        this.serialPort.removeAllListeners("error");
        this.serialPort.removeAllListeners("connect");
        reject(err.message);
      });
    });
  }
}

class RosInterface extends SocketClient {
  constructor(sourceConfigs) {
    super(sourceConfigs);
    this.topics = sourceConfigs.topics;
    this.waypoints = sourceConfigs.waypoints;

    this.connectionState = false;

    this.robotState = {
      x: 0,
      y: 0,
      orientation: 0,
      linear_vel: 0,
      angular_vel: 0,
      battery: 50,
      time_remain: 13,
    };
  }

  getState(state) {
    return this.robotState[state]
  }

  // getMap() {
  //   try {
  //     var viewer = new ROS2D.Viewer({
  //       divID: "nav_div",
  //       width: 450,
  //       height: 657,
  //     });
  //   } catch (error) {
  //     console.log(error)
  //   }

  //   console.log("11");
  //   var navClient = new NAV2D.OccupancyGridClientNav({
  //     ros: this.ros,
  //     rootObject: viewer.scene,
  //     viewer: viewer,
  //     severName: "/move_base",
  //     withOrientation: true,
  //   });
  // }



  joystickCmd(linear, angular) {
    const cmd_vel = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topics.CMD_VEL_TOPIC,
      messageType: "geometry_msgs/Twist",
    });

    let adjX = Math.cos(angular * (Math.PI / 180));
    let adjZ = Math.sin(angular * (Math.PI / 180));
    
    if (angular >= 90 && angular <= 270) {
      adjZ = adjZ;
    } else {
      adjZ = -adjZ;
    }

    console.log(`Angular : ${angular}`)
    console.log(adjX);
    console.log(adjZ);
    const twist = new ROSLIB.Message({
      linear: {
        x: (adjX * linear) / 3,
        y: 0,
        z: 0,
      },
      angular: {
        x: 0,
        y: 0,
        z: (adjZ * linear) / 3,
      },
    });

    cmd_vel.publish(twist);

  }

  waypointCmd(desiredPlace, waypoint) {
    const actionClient = new ROSLIB.ActionClient({
      ros: this.ros,
      serverName: "/move_base",
      actionName: "move_base_msgs/MoveBaseAction",
    });
    const positionVec3 = new ROSLIB.Vector3(null);

    const orientation = new ROSLIB.Quaternion(null);


    const place = this.waypoints[desiredPlace];
    positionVec3.x = place[waypoint].position.x;
    positionVec3.y = place[waypoint].position.y;
    positionVec3.z = place[waypoint].position.z;

    //orientation
    orientation.x = place[waypoint].orientation.x;
    orientation.y = place[waypoint].orientation.y;
    orientation.z = place[waypoint].orientation.z;
    orientation.w = place[waypoint].orientation.w;

    //Create package POSE
    const pose = new ROSLIB.Pose({
      position: positionVec3,
      orientation: orientation,
    });

    const goal = new ROSLIB.Goal({
      actionClient: actionClient,
      goalMessage: {
        target_pose: {
          header: {
            frame_id: "map",
          },
          pose: pose,
        },
      },
    });
    goal.send();
  }

  updateRobotState() {
    const pose_subscriber = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topics.POSE_TOPIC,
      messageType: "geometry_msgs/PoseWithCovarianceStamped",
    });

    pose_subscriber.subscribe((message) => {
      this.robotState.x = message.pose.pose.position.x.toFixed(4);
      this.robotState.y = message.pose.pose.position.y.toFixed(4);
      this.robotState.orientation = this.getOrientationFromQuaternion(
        message.pose.pose.orientation
      ).toFixed(2);
    });

    const velocity_subscriber = new ROSLIB.Topic({
      ros: this.ros,
      name: this.topics.ODOM_TOPIC,
      messageType: "nav_msgs/Odometry",
    });

    velocity_subscriber.subscribe((message) => {
      this.robotState.linear_vel = message.twist.twist.linear.x.toFixed(4);
      this.robotState.angular_vel = message.twist.twist.angular.z.toFixed(4);
    });
  }

  getOrientationFromQuaternion(ros_orientation_quaternion) {
    const q = new Three.Quaternion(
      ros_orientation_quaternion.x,
      ros_orientation_quaternion.y,
      ros_orientation_quaternion.z,
      ros_orientation_quaternion.w
    );
    const RPY = new Three.Euler().setFromQuaternion(q);
    return RPY["_z"] * (180 / Math.PI);
  }

  connect() {
    if (!this.ros) {
      this.ros = new ROSLIB.Ros();

      this.ros.on("connection", () => {
        this.connectionState = true
        this.updateRobotState()
        console.log("Connected to ROS");
      });

      this.ros.on("close", () => {
        this.connectionState = false
        console.log("Connection is closing");
      });
    }

    return new Promise((resolve, reject) => {
      this.ros.connect("ws://" + this.ip + ":" + this.port, () => {
        console.log(
          `Established ${this.type} connection to ${this.connectionName} on ${this.ip}:${this.port}`
        );
        if (this.successFunction) this.successFunction(this.ros);
        resolve(true);
      });

      this.ros.on("error", (err) => {
        // clean up event listeners to prevent multiple success or failure messages
        this.connectionState = false
        this.ros.removeAllListeners("error");
        this.ros.removeAllListeners("connection");
        this.ros.removeAllListeners("close");
        reject(err.message);
      });
    });
  }
}

module.exports = {
  SocketClient: SocketClient,
  SocketServer: SocketServer,
  SerialPort: SerialPort,
  Ros: RosInterface,
};
