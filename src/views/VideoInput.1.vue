/* eslint-disable */
<template>
<div style="display: flex; justify-content: center; min-width: 640px;">
  <div style="width: 640px">
  <div style="display: flex; top: 0; ">
    <video class="video" @play="handleVideo()" id="inputVideo" autoplay muted>
    </video>
  </div>  
  <div style="display: flex; position: absolute; top: 0;">
    <div v-for="box in drawBoxes" :key="box.style.transform" :style="box.style" @click="selected=box"><div v-if="box.label!='unknown'" :style="box.label_style" class="label">{{box.label}}</div>
      <div class="corner top left"></div>
      <div class="corner top right"></div>
      <div class="corner bottom left"></div>
      <div class="corner bottom right"></div>
    </div>
  </div>
  {{ this.msg }}
  {{this.selected.label}}
  <button v-if="cameras.length>1" @click="switchCams()">switch</button>
  </div>
</div>   
</template>
<script>
/* eslint-disable */
import { loadModels, createMatcher, getFullFaceVideoDescription } from '../api/face';
export default {
  data(){
    return {
        drawBoxes: [],
        detections: [],
        descriptions: [],
        labels: [],
        matches: [],
        faceMatcher : null,
        msg: '',
        selected: {},
        cameras: [],
        selectedCamera: null,
        camStyle: {
          minWidth:'640px'
        }

    }
  },
  
  methods: {
    render(){
      //const detections = JSON.parse(localStorage.getItem('detections'));
      const detections = this.detections;
      const matches = this.matches;
      let drawBox = [];
      if (detections){
        detections.forEach((detection, i) => {
          let _H = detection._box._height;
          let _W = detection._box._width;
          let _X = detection._box._x;
          let _Y = detection._box._y;
          let label = '1';
          if (matches && matches[i]) {
            label = matches[i].label
          }
          drawBox.push({
            style: {
                position: 'absolute',
                //border: 'solid',
                //borderColor: 'blue',
                height: `${_H}px`,
                width: `${_W}px`,
                transform: `translate(${_X}px,${_Y}px)`,
                top:0
            },
            label: label,
            label_style:{
                backgroundColor: 'white',
                //border: 'solid',
                //borderColor: 'blue',
                width: _W,
                textAlign: 'center',
                marginTop: 0,
                color: '#000',
                fontSize: '24px',
                transform: `translate(-3px,${_H}px)`,
                textTransform: 'capitalize'
            }
          })
        })
        this.drawBoxes = drawBox;
      }
    },
    async handleVideo (){
      const input = document.getElementById('inputVideo');
      if(input.paused || input.ended) return {}//setTimeout(() => this.handleVideo (),100)
      
      //console.log('handleVideo');

      await getFullFaceVideoDescription(input).then(fullDesc => {
        this.detections = fullDesc.map(fd => fd.detection);
        this.descriptors = fullDesc.map(fd => fd.descriptor);
      });

      if (this.descriptors && this.detections){
        //console.log('finding match')
        let descriptors = this.descriptors;
        //console.log('descriptors',descriptors)

        let match = await descriptors.map(descriptor =>
        {
          let desc = new Float32Array(descriptor);
          return this.faceMatcher.findBestMatch(desc);
        }
        );

      this.matches = match;
      //console.log('match',match);
      }

      this.render();
      setTimeout(() => this.handleVideo(), 10)
    },

    async setup_video (){
      console.log('setup');
      await loadModels();

      if (!this.faceMatcher) {
        const JSON_PROFILE = require('../descriptors/descriptors.json');
        this.faceMatcher = await createMatcher(JSON_PROFILE)
      }
      

      const input = document.getElementById('inputVideo');
      
      if(!navigator.mediaDevices) alert ('loaded insecurely')
      await navigator.mediaDevices.enumerateDevices().then(devices => {
      let  dev = devices.map(device => device.kind)
      devices.forEach(device =>{
        if (device.kind == 'videoinput') this.cameras.push(device);
      })
        this.msg = this.cameras;
        })
      var constraints = {};
      if (this.cameras[0]){
        this.selectedCamera = this.cameras[0];
        constraints = {
          video: { 
            deviceId: { exact: this.cameras[0].deviceId },
            width: { min: 320, ideal: window.innerWidth, max: window.innerWidth }
             }
          
        };
      } else {
        alert('no cameras found'); 
        constraints = {
          video: { width: { min: 320, ideal: window.innerWidth, max: window.innerWidth }}
          
        }
      }
      /*
      navigator.getUserMedia(
      { video: {} },
      stream => input.srcObject = stream,
      err => alert(err)
      )
      */
      
      navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {input.srcObject = stream })
      .catch(err => alert(err))
      //this.camStyle.width = `${input.videoWidth}px`;
      

    },
    switchCams(){
      const input = document.getElementById('inputVideo');
      if (window.stream) {
        input.src = null;
        window.stream.getTracks().forEach(function(track) {
          track.stop();
        });
      }

      if (this.selectedCamera == this.cameras[0])
        this.selectedCamera = this.cameras[1]; 
        else
        this.selectedCamera = this.cameras[0];



      var constraints = {
        video: {
          optional: [{
            sourceId: this.selectedCamera.deviceId
          }]
        }
      };

      navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        window.stream = stream; // make stream available to console
        input.srcObject = stream;
        input.play();})
      .catch(err => alert(err))
    }
  },
  mounted(){
    console.log('mounted');
    this.setup_video(this);
  }
}
</script>
<style>
.label{
  background-color: 'white';
  margin-top: 0;
  color: '#000';
}
.video{
  max-width: 640px;
  height: auto;
}
.top {
    top: 0px;
    border-top-style: solid;
}

.bottom {
    bottom: 0px;
    border-bottom-style: solid;
}

.left {
    left: 0px;
    border-left-style: solid;
}

.right {
    right: 0px;
    border-right-style: solid;
}
</style>
