const expressWs = require("express-ws");
const app = require("express")();
const dotenv = require("dotenv").config();

const rosServer = require("./controllers/ros-server.js");
const sourceConfigs = require("./configs/sourceConfigs.js");

const source = require("./interfaces/source.js");

const rosInterface = new source.Ros(sourceConfigs.ros);
app.use("/ros", rosServer(rosInterface));

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`ROS server is listening on ${PORT}`);
});