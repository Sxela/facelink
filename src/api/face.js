/* eslint-disable */
import * as faceapi from 'face-api.js';
// import * as faceapi from '../faceapi'
// Load models and weights
export async function loadModels() {
  //const MODEL_URL = process.env.PUBLIC_URL + '/models';
  const MODEL_URL = '/models';
  // eslint-disable-next-line no-console
  console.log('loading models');
  await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
  await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
  await faceapi.loadFaceRecognitionModel(MODEL_URL);
  await faceapi.loadAgeGenderModel(MODEL_URL)
}

export async function getFullFaceDescription(blob, inputSize = 512) {
  // tiny_face_detector options
  let scoreThreshold = 0.5;
  const OPTION = new faceapi.TinyFaceDetectorOptions({
    inputSize,
    scoreThreshold
  });
  const useTinyModel = true;

  // fetch image to api
  let img = await faceapi.fetchImage(blob);
  console.log(img.width, img.height)
  // detect all faces and generate full description from image
  // including landmark and descriptor of each face
  let fullDesc = await faceapi
    .detectAllFaces(img, OPTION)
    .withFaceLandmarks(useTinyModel)
    .withAgeAndGender()
    .withFaceDescriptors();


  // console.log(fullDesc)
  return fullDesc;
}

export async function getFullFaceVideoDescription(video, inputSize = 256) {
  // tiny_face_detector options
  let scoreThreshold = 0.5;
  const OPTION = new faceapi.TinyFaceDetectorOptions({
    inputSize,
    scoreThreshold
  });
  const useTinyModel = true;

  let canvas = document.createElement('canvas');
  canvas.height = video.videoHeight;
  canvas.width = video.videoWidth;
  let ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let dataURI = canvas.toDataURL('image/jpeg'); // can also use 'image/png'
  let img = await faceapi.fetchImage(dataURI);
  

  // detect all faces and generate full description from image
  // including landmark and descriptor of each face
  console.log('got to fulldesc detectallfaces')
  let fullDesc1 = await faceapi
    //.detectAllFaces(img, OPTION)
    .detectAllFaces(video, OPTION)
    .withFaceLandmarks(useTinyModel)
    // .withAgeAndGender()
    .withFaceDescriptors();

  dataURI = null;
  img = null;
  ctx = null;  
  //canvas.remove();

  return fullDesc1;
}



const maxDescriptorDistance = 0.5;
export async function createMatcher(faceProfile) {
  // Create labeled descriptors of member from profile
  let members = Object.keys(faceProfile);
  let labeledDescriptors = members.map(
    member =>
      new faceapi.LabeledFaceDescriptors(
        faceProfile[member].name,
        faceProfile[member].descriptors.map(
          descriptor => new Float32Array(descriptor)
        )
      )
  );
  console.log(labeledDescriptors[0]);
  // Create face matcher (maximum descriptor distance is 0.5)
  let faceMatcher = new faceapi.FaceMatcher(
    labeledDescriptors,
    maxDescriptorDistance
  );
  return faceMatcher;
}