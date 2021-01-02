import React from "react";
import "./handpose.css"
const handpose = require("@tensorflow-models/handpose");
require("@tensorflow/tfjs-backend-webgl");
require("@tensorflow/tfjs-backend-cpu");

const config = {
  video: { width: 640, height: 480, fps: 30 },
};

class HandPose extends React.Component {
  constructor() {
    super();
    this.state = { flag: true };
  }

  drawPoint(ctx, x, y, r, color) {
    ctx.fillStyle = "white";
    ctx.fillRect(x,y,5,5,"blue");
  }

  async initCamera(width, height, fps) {
    const constraints = {
      audio: false,
      video: {
        facingMode: "user",
        width: width,
        height: height,
        frameRate: { max: fps },
      },
    };

    const video = document.querySelector("#pose-video");
    video.width = width;
    video.height = height;

    // get video stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;

    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  }

  async estimate() {
    const model = await handpose.load();
    const video = document.querySelector("#pose-video");
    const canvas = document.querySelector("#pose-canvas");
    const ctx = canvas.getContext("2d");
    const resultLayer = document.querySelector("#pose-result");

    ctx.clearRect(0, 0, config.video.width, config.video.height);
    resultLayer.innerText = "";
    if(this.state.flag){
        const predictions = await model.estimateHands(video, true);
    console.log("Start estimation")
    for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].landmarks;
  
        // Log hand keypoints.
        for (let i = 0; i < keypoints.length; i++) {
          const [x, y, z] = keypoints[i];
          this.drawPoint(ctx, x, y, z, "red");
        }
      }
    }

    setTimeout(() => { this.estimate(); }, 1000 / config.video.fps);
  }

  componentDidMount() {
    // this.loadModel();
    this.initCamera(
      config.video.width,
      config.video.height,
      config.video.fps
    ).then((video) => {
      video.play();
      video.addEventListener("loadeddata", (event) => {
        console.log("Camera is ready");
        this.estimate();
      });
    });
    const canvas = document.querySelector("#pose-canvas");
    canvas.width = config.video.width;
    canvas.height = config.video.height;
    console.log("Canvas initialized");
  }

  render() {
    return (
      <div>
        <div id="video-container">
          <video id="pose-video"  playsInline></video>
          <canvas id="pose-canvas" ></canvas>
          <div id="pose-result" ></div>
        </div>
      </div>
    );
  }
}

export default HandPose;
