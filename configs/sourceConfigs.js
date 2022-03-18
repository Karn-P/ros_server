//Configuration for target source interface e.g. Satellite, Robot, Test module

module.exports = {
  ros: {
    name: "Robot Team Test",
    ip: "192.168.0.40",
    port: "9090",
    type: "RosBridgeClient",
    pollInterval: 5,
    topics: {
      CMD_VEL_TOPIC: "/cmd_vel",
      POSE_TOPIC: "/amcl_pose",
      ODOM_TOPIC: "/odom",
      MOVE_BASE_TOPIC: "/move_base",
      MOVE_BASE_RESULT: "/move_base/result",
    },
    waypoints: {
      f1: {
        home: {
          position: {
            x: 0.0,
            y: 0.0,
            z: 0.0,
          },
          orientation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
        reception: {
          position: {
            x: 6.35,
            y: -0.9,
            z: 0.0,
          },
          orientation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
        store: {
          position: {
            x: 11.2,
            y: -1.6,
            z: 0.0,
          },
          orientation: {
            x: 0,
            y: 0,
            z: 180,
            w: 1,
          },
        },
        ceoOffice: {
          position: {
            x: 10.5,
            y: 5.6,
            z: 0.0,
          },
          orientation: {
            x: 0,
            y: 0,
            z: -90,
            w: 1,
          },
        },
        canteen: {
          position: {
            x: -0.85,
            y: 6.0,
            z: 0.0,
          },
          orientation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
      },
    },
  },
};
