/* eslint-disable */
<template>
<div style="font-family: 'Montserrat', sans-serif; font-style: normal; font-weight: 500;">
    <img :src="testImg" alt="imageURL" />
    <div style="display: flex; position: absolute; top: 0;">
    <div v-for="box in drawBoxes" :key="box.style.transform" :style="box.style" @click="selected=box"><div v-if="box.name!='unknown'" :style="box.label_style" class="label">{{box.name}}</div>
      <div class="corner top left"></div>
      <div class="corner top right"><div class="importance">{{box.rate}}°</div></div>
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
  

    <input
          id="myFileUpload"
          type="file"
          @change=handleFileChange
          accept=".jpg, .jpeg, .png"
        />
</div>   
</template>
<script>
/* eslint-disable */
import { loadModels, getFullFaceDescription, createMatcher } from '../api/face';
export default {
  data(){
    return {
        testImg: require('@/img/test.jpeg'),
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
        getVideoSettings: {},
        data: require("../descriptors/data")

    }
  },
  
  methods: {
    render(){
      //console.log(this.matches)
      //const detections = JSON.parse(localStorage.getItem('detections'));
      const detections = this.detections;
      //const matches = this.matches;
      console.log(this.matches)
      const matches = this.matches.map(
        match =>this.data.find(element =>{ return (element.label==match.label)})
      )
      console.log(matches)
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
          if (matches && matches[i]) {
            name = matches[i].name ? matches[i].name : matches[i].label
            rate = matches[i].rate
            telegram = matches[i].telegram
          }
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
    async handleImage (){
      const image = this.testImg;
      console.log('handleimage');
      //if (!localStorage.fullDesc || localStorage.fullDesc === null) 
      await getFullFaceDescription(image).then(fullDesc => {

        //localStorage.setItem('fullDesc', JSON.stringify(fullDesc));
        //localStorage.setItem('detections', JSON.stringify(fullDesc.map(fd => fd.detection)));
        //localStorage.setItem('descriptors', JSON.stringify(fullDesc.map(fd => fd.descriptor)));
        this.detections = fullDesc.map(fd => fd.detection);
        this.descriptors = fullDesc.map(fd => fd.descriptor);
        
      });
      if (this.descriptors && this.detections){
        console.log('finding match')
        //const descriptors = JSON.parse(localStorage.getItem('descriptors'));
        //var descriptors = new Array(localStorage.getItem('descriptors'));
        var descriptors = this.descriptors;
        console.log('descriptors',descriptors)

        //const JSON_PROFILE = require('../descriptors/bnk48.json');
        const JSON_PROFILE = require('../descriptors/descriptors.json');
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
      console.log('match',match);
      }

      this.render();
    },

    async setup (){
      console.log('setup');
      await loadModels();
      //const testImg = require('@/img/test.jpeg');
      //body.testImg = testImg;
      if (!this.faceMatcher) {
        const JSON_PROFILE = require('../descriptors/descriptors.json');
        //localStorage.setItem('faceMatcher', await createMatcher(JSON_PROFILE));
        this.faceMatcher = await createMatcher(JSON_PROFILE)
      }
      await this.handleImage();

    },
    async handleFileChange (event){
      localStorage.setItem('fullDesc', null);
      localStorage.setItem('detections', null);
      this.testImg = await URL.createObjectURL(event.target.files[0]);
      this.handleImage();
    }
  },
  mounted(){
    console.log('mounted');
    this.setup(this);
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
.label{
  background-color: 'blue';
  border: '1px solid';
  border-color: 'blue';
  width: 100%;
  margin-top: 0;
  color: '#fff';
}

.corner {
    display: block;
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: white;
    border-radius: 4px;
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
