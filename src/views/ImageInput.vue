/* eslint-disable */
<template>
<div>
    <img :src="testImg" alt="imageURL" />
    <div v-for="box in drawBoxes" :key="box.style.transform" :style="box.style"><div :style="box.label_style">{{box.label}}</div></div>
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
        matches: []

    }
  },
  
  methods: {
    render(){
      const detections = JSON.parse(localStorage.getItem('detections'));
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
    async handleImage (){
      const image = this.testImg;
      console.log('handleimage');
      //if (!localStorage.fullDesc || localStorage.fullDesc === null) 
      await getFullFaceDescription(image).then(fullDesc => {

        localStorage.setItem('fullDesc', JSON.stringify(fullDesc));
        localStorage.setItem('detections', JSON.stringify(fullDesc.map(fd => fd.detection)));
        localStorage.setItem('descriptors', JSON.stringify(fullDesc.map(fd => fd.descriptor)));
        this.detections = fullDesc.map(fd => fd.detection);
        this.descriptors = fullDesc.map(fd => fd.descriptor);
        
      });
      if (localStorage.descriptors && localStorage.detections){
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
      localStorage.setItem('match', await JSON.stringify(match));
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
        const JSON_PROFILE = require('../descriptors/bnk48.json');
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
.label{
  background-color: 'blue';
  border: '1px solid';
  border-color: 'blue';
  width: 100%;
  margin-top: 0;
  color: '#fff';
}
</style>
