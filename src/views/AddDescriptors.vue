<template>
<div>
    <img :src="testImg" alt="imageURL" />
    <div v-for="box in drawBoxes" :key="box.style.transform" :style="box.style"></div>
    <input
          id="myFileUpload"
          type="file"
          @change=handleFileChange
          accept=".jpg, .jpeg, .png"
    />
    <input type="text" placeholder="spirin" v-model="label">
    <button @click=download >download</button>
</div>
</template>
<script>
/* eslint-disable */
import { loadModels, getFullFaceDescription } from '../api/face';
export default {
    data(){
        return{
            testImg: require('@/img/test.jpeg'),
            descriptors: require('../descriptors/descriptors.json'),
            detections: [],
            drawBoxes: [],
            label: 'test'
        }
    },
    methods:{
        async setup (){
            console.log('setup');
            await loadModels();
            await this.handleImage();

        },

        download(){
            
            const data = JSON.stringify(this.descriptors, null, 2)
            const blob = new Blob([data], {type: 'text/plain'})
            const e = document.createEvent('MouseEvents'),
            a = document.createElement('a');
            a.download = "descriptors.json";
            a.href = window.URL.createObjectURL(blob);
            a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
            e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(e);
        },

        async handleImage (){
            const image = this.testImg;
            const label = this.label;
            console.log('handleimage');
            await getFullFaceDescription(image).then(fullDesc => {
                this.detections = fullDesc.map(fd => fd.detection);
                fullDesc.forEach(item=>{
                    if (!this.descriptors[label] || !this.descriptors[label].name) {
                        this.descriptors[label] = {
                            name: '',
                            descriptors: []
                        }
                        this.descriptors[label].name = label;
                    }
                    if (this.descriptors[label].descriptors) this.descriptors[label].descriptors.push(Array.from(item.descriptor)); else this.descriptors[label].descriptors = [];
                })
            });
            const data = JSON.stringify(Array(this.descriptors), null, 2)
            //const descs = new Float32Array(this.descriptors.spirin.descriptors[0]);
            //const descs_string =  JSON.stringify(Array.from(descs));
            console.log(data)

            this.render();
        },

        async handleFileChange (event){
            this.testImg = await URL.createObjectURL(event.target.files[0]);
            this.handleImage();
        },

        render(){
            const detections = this.detections;
            let drawBox = [];
            if (detections){
                detections.forEach((detection, i) => {
                let _H = detection._box._height;
                let _W = detection._box._width;
                let _X = detection._box._x;
                let _Y = detection._box._y;
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
                })
                })
                this.drawBoxes = drawBox;
            }
        },
    },
    mounted(){
        this.setup();
    }
}
</script>