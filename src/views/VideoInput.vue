/* eslint-disable */
<template>
<div style="display: flex;">
  <div style="display: flex; justify-content:center;">
    <video class="video" @play="handleVideo()" id="inputVideo" autoplay muted>
    </video>
  </div>  
  <div style="display: flex; position: absolute;" >
    <div v-for="box in drawBoxes" :key="box.style.transform" :style="box.style"><div :style="box.label_style">{{box.label}}</div></div>
  </div>
<canvas id="canvas"></canvas>
</div>   
</template>
<script>
/* eslint-disable */
import { loadModels, getFullFaceDescription, createMatcher, getFullFaceVideoDescription } from '../api/face';
export default {
  data(){
    return {
        testImg: require('@/img/test.jpeg'),
        drawBoxes: [],
        detections: [],
        descriptions: [],
        labels: [],
        matches: [],
        faceMatcher : null

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
                border: 'solid',
                borderColor: 'blue',
                height: `${_H}px`,
                width: `${_W}px`,
                transform: `translate(${_X}px,${_Y}px)`,
                top:0
            },
            label: label,
            label_style:{
                backgroundColor: 'blue',
                border: 'solid',
                borderColor: 'blue',
                width: _W,
                marginTop: 0,
                color: '#fff',
                transform: `translate(-3px,${_H}px)`
            }
          })
        })
        this.drawBoxes = drawBox;
      }
    },
    async handleVideo (){
      const input = document.getElementById('inputVideo');
      if(input.paused || input.ended) return setTimeout(() => this.handleVideo (),100)
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
      navigator.getUserMedia(
      { video: {} },
      stream => input.srcObject = stream,
      err => alert(err)
      )

    },
  },
  mounted(){
    console.log('mounted');
    this.setup_video(this);
  }
}
</script>
<style>
.label{
  background-color: 'blue';
  border: '1px solid';
  border-color: 'blue';
  width: 100%;
  margin-top: 0;
  color: '#fff';
}
.video{
  max-width: 640px;
  height: auto;
}
</style>
