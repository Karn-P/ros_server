const express = require("express");

function rosServer(RosInterface) {
  const router = express.Router();

  //* allow requesting code from any origin to access the resource
  router.use(function (req, res, next) {
    res.set("Access-Control-Allow-Origin", "*");
    next();
  });

  //* handle application requests
  router.get("/state", function (req, res) {
    const topic = req.query.topic;
    //console.log(topic);
    // console.log(RosInterface.getState(topic).toString());
    res.send(RosInterface.getState(topic).toString()).end();
  });

  router.get("/map", function (req, res) {
    console.log("Generating map!")
    res.set("Content-Type", "text/html");
    try {
      RosInterface.getMap();
      console.log("Generate map success!")
      res.send(`Map generate successfully!`).end();
    } catch {
      console.log("Error to generate map")
      res.send(`Error on map generating`).end();
    }
  })

  router.get("/waypointCmd", function (req, res) {
    console.log("received request")
    const place = req.query.place.toLowerCase();
    const waypoint = req.query.waypoint.toLowerCase();
    console.log(`Place: ${place}, Waypoint: ${waypoint}`)
    res.set("Content-Type", "text/html");

    try {
      RosInterface.waypointCmd(place, waypoint)
      res.send(`Your waypoint command to ${place}:${waypoint} is successfully dispatched!`).end();
    } catch {
      res.send(`Error on dispatching the waypoint command to ${place}:${waypoint}`).end();
    }
  });

  router.post("/joystickCmd", function (req, res) {
    
    const linear = parseFloat(req.query.linear).toFixed(4);
    const angular = parseInt(req.query.angular);

    res.set("Content-Type", "text/html");
    try {
      RosInterface.joystickCmd(linear, angular)
      console.log(`Your joystick command is
      successfully dispatched!, Linear: ${linear}, Angular: ${angular}`);
      res.send(`Your joystick command is successfully dispatched!, Linear: ${linear}, Angular: ${angular}`).end();
    } catch {
      res.send(`Error on dispatching the joystick command`).end();
    }
  });

  return router;
}

module.exports = rosServer;