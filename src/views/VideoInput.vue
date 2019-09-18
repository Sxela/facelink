/* eslint-disable */
<template>
<div style="display: flex; justify-content: center; min-width: 480px; font-family: 'Montserrat', sans-serif; font-style: normal; font-weight: 500;">
  <div style="max-width: 480px;">
  <div style="display: flex; top: 0;">
    <video class="video" @play="handleVideo()" id="inputVideo" autoplay muted playsinline>
    </video>
  </div>  
  <div style="display: flex; position: absolute; top: 0;">
    <div v-for="box in drawBoxes" :key="box.style.transform" :style="box.style" @click="selected=box"><div :style="box.label_style" class="label">{{box.name}}, visits: {{box.count}}</div>
      <div class="corner top left"></div>
      <div class="corner top right"><div class="importance">{{box.rate}}°</div> <div class="importance" >{{box.gender}}, {{Math.floor(box.age)}}y.o.</div></div>
      <div class="corner bottom left"></div>
      <div class="corner bottom right"></div>
      
    </div>
  </div>
  <div v-if="!this.selected.name">click on a detected face to view info</div>
  
  
  <div v-else style="display: flex; justify-content: space-between; max-width: 550px;" class="card">
    <div style="display: block;">
    <div class="username">{{this.selected.telegram}}</div>
    <div class="name">{{this.selected.name}}</div>
    </div>
    <div class="rate">
    <div>{{this.selected.rate}}°</div>
    </div>
   
  
  
  </div>
  

  <button v-if="cameras.length>100" @click="switchCams()">switch</button>
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
        ages: [],
        genders: [],
        labels: [],
        matches: [],
        faceMatcher : null,
        msg: '',
        selected: {},
        cameras: [],
        selectedCamera: null,
        getVideoSettings: {},
        counts: [],
        data: require("../descriptors/data"),
        descs: require('../descriptors/descriptors.json') 
        }

    },
  
  computed:{
    bodyStyle: function(){
      return {
        display: 'flex',
        justifyContent: 'center',
        minWidth: `${this.getVideoSettings.width}px`
      }
      
    }
  },
  methods: {
    render(){
      //console.log(this.matches)
      //const detections = JSON.parse(localStorage.getItem('detections'));
      const detections = this.detections;
      //const matches = this.matches;
      // console.log(this.matches)
      const matches = this.matches.map(
        match =>this.data.find(element =>{ return (element.label==match.label)})
      )
      // console.log(matches)
      let drawBox = [];
      if (detections){
        detections.forEach((detection, i) => {
          let _H = detection._box._height;
          let _W = detection._box._width;
          let _X = detection._box._x;
          let _Y = detection._box._y;
          let name = '';
          let rate = '0';
          let telegram = '';
          let count = '';
          let age = this.ages[i];
          let gender = this.genders[i];
          if (matches && matches[i]) {
            name = matches[i].name ? matches[i].name : matches[i].label
            rate = matches[i].rate
            telegram = matches[i].telegram
            count = matches[i].count
          }
          if (name == 'unknown' || !name) name = 'new';
          gender = (gender=='female') ? '♀' : '♂'  ;
          drawBox.push({
            style: {
                position: 'absolute',
                //border: 'solid',
                //borderColor: 'blue',
                height: `${_H}px`,
                width: `${_W}px`,
                transform: `translate(${_X}px,${_Y}px)`,
                top:0,


  /* Quick on the way out */

            },
            name: name,
            rate: rate,
            telegram: telegram,
            age: age,
            gender: gender,
            count: count,
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
        this.ages = fullDesc.map(fd => fd.age);
        this.genders = fullDesc.map(fd => fd.gender);
      });

      if (this.descriptors && this.detections){
        console.log('finding match')
        //const descriptors = JSON.parse(localStorage.getItem('descriptors'));
        //var descriptors = new Array(localStorage.getItem('descriptors'));
        var descriptors = this.descriptors;
        // console.log('descriptors',descriptors)

        //const JSON_PROFILE = require('../descriptors/bnk48.json');
        // const JSON_PROFILE = require('../descriptors/descriptors.json');
        let JSON_PROFILE = this.descs;
        const faceMatcher = await createMatcher(JSON_PROFILE);
        //localStorage.setItem('faceMatcher', JSON.stringify(faceMatcher));

        let match = await descriptors.map(descriptor =>
        {
          let desc = new Float32Array(descriptor);
          return faceMatcher.findBestMatch(desc);
        }
        );
      //localStorage.setItem('match', await JSON.stringify(match));
      this.matches = match;
      // console.log('match',match);
      }

      String.prototype.hashCode = function() {
        var hash = 0, i, chr;
        if (this.length === 0) return hash;
        for (i = 0; i < this.length; i++) {
          chr   = this.charCodeAt(i);
          hash  = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      };

      await this.matches.forEach((m,i) =>{
        let date = new Date()
        let match = this.data.find(element =>{ return (element.label==m.label)})
        // console.log('math id', match)
        if (match && !match.date) {
          match.date = date
          match.count = 1
        }
        if (m.label == 'unknown') {
          console.log('got unknown'); 
          let newlabel = date.toString()
          newlabel = newlabel.hashCode().toString()
          this.descs[newlabel] = {}
          this.descs[newlabel].name = newlabel
          this.descs[newlabel].descriptors = []
          this.descs[newlabel].descriptors.push(this.descriptors[i])

          
          let desc = {}
          desc.date = date
          desc.name = 'new'
          desc.count = 1
          desc.label = newlabel
          this.data.push(desc)
          console.log('label', newlabel)
          }
          else {
            // if dates are more different than thresh set count up
            let datediff = date.getTime()-match.date.getTime(); 
            datediff = datediff/ (1000*60) //diff in minutes 
            console.log('datediff',datediff)
            if (datediff>1){
              match.date = date;
              match.count ++}
          }
          
        // console.log(this.data);
        // console.log(this.descs)
      })

      this.render();
      setTimeout(() => this.handleVideo(), 100)
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
            facingMode: "environment",
            //deviceId: { exact: this.cameras[0].deviceId },
            //width: 640,//{ min: 480, ideal: 640 },
            //height: 480//{ min: 480, ideal: 640 }
            width: window.innerHeight - 150,
            height: (window.innerWidth)
             }
          
        };
      } else {
        alert('no cameras found'); 
        constraints = {
          video: { 
            //width: { min: 320, ideal: window.innerWidth, max: window.innerWidth }, height: {ideal: window.innerHeight}
            }
          
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
      .then(stream => {
        input.srcObject = stream 
        this.getVideoSettings = (stream.getVideoTracks()[0].getSettings())
        this.bodyStyle.width = this.getVideoSettings.width;
        console.log(this.getVideoSettings)
        this.msg = this.getVideoSettings 
        let ratio = this.getVideoSettings.aspectRatio;
        let constraints = {
          video: { 
            //facingMode: "environment",
            //deviceId: { exact: this.cameras[0].deviceId },
            //width: 480,
            //height: 640 
            //width: window.innerWidth/10,
            //height: window.innerHeight
             }
          
        };
        this.msg = stream.getVideoTracks()[0].getConstraints();
        stream.getVideoTracks()[0].applyConstraints(constraints)
        })
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
    console.log(this.data.find(element =>{ return (element.label=='spirin')}))
    this.setup_video(this);
  }
}
</script>
<style>
.card{
    padding: 50px 50px 50px;
    border-radius: 12px;
    box-shadow: 0px 0px 20px rgba(184, 184, 184, 0.25);
    word-break: break-word;
    white-space: pre-wrap;
    background: #fff;
}
.rate{
    justify-self: flex-end;
    font-size: 28px;
    font-weight: bold;
    line-height: 34px;
    color: #585858;
}
.name{
    font-size: 28px;
    font-weight: bold;
    line-height: 34px;
    color: #000;
}
.username{
    font-size: 12px;
    color: #585858;
}
.importance{
  	text-shadow:
		-1px -1px 0 #000,
		1px -1px 0 #000,
		-1px 1px 0 #000,
		1px 1px 0 #000;
  position: relative;
  transform: translate(30px,-30px);
  color: white;

border-radius: 4px;
width: 100px;
font-size: 24px;
}
.label{
  background-color: 'white';
  margin-top: 0;
  color: '#000';
}
.video{
  max-width: 640px;
  min-width: 256px;
  min-height: 256px;
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
