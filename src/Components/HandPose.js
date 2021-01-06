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

  drawPoint(ctx, x, y) {
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, 5, 5);
  }

  async initWebCam(width, height, fps) {
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
    
    if (this.state.flag) {
      const predictions = await model.estimateHands(video, true);
      console.log("estimating/..");
      for (let i = 0; i < predictions.length; i++) {
        const keypoints = predictions[i].landmarks;
        for (let i = 0; i < keypoints.length; i++) {
          const [x, y] = keypoints[i];
          this.drawPoint(ctx, x, y);
        }
      }
      resultLayer.innerText = "Ready";
      this.Change();
    }

    setTimeout(() => {
      this.estimate();
    }, 1000 / config.video.fps);
  }

  componentDidMount() {
    // this.loadModel();
    this.initWebCam(
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
    this.Change();
  }
  Change(){
    // Color changes depending on the result
    const result = document.getElementById("pose-result");
    const control = document.getElementById('control');    
    if(result.innerHTML==='Loading/...')
    {
      control.style.backgroundColor="#ff8000"
      control.style.borderColor="#ff8000";
    }
    else 
    {
      control.style.backgroundColor="#00b300";
      control.style.borderColor="#00b300"
    }
  }

  render() {
    return (
      <div>
        <div id="hand-pose">
          <div>
            <video id="pose-video" playsInline></video>
          </div>
          <div>
            <canvas id="pose-canvas"></canvas>
          </div>
        </div>
        <div id="control">
        <div id="pose-result">Loading/...</div>
        </div>
        
      </div>
    );
  }
}

export default HandPose;
