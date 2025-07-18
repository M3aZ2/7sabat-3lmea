import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {createGUI} from "./environment/guiSettings.js";
import {createPlanetScene} from "./environment/PlanetScene.js";
import {createMeteor} from "./environment/meteor.js";
import {createSpark_Explosion_Effects} from './environment/explosion&spark.js'
import PhysicsMeteor from './physics/meteor.js'
const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
var physicsMeteor;

let started=false
let isShaked=false
const settings = {
    followMeteor: false,
    atmosphereDayColor : '#00aaff',
    atmosphereTwilightColor : '#4fda22',
    meteorType:'rock',
    meteorSpeed:1,
    meteorTemperature:1,
    meteorRadius:1,
    lunch:()=>{
        sound6barAljmajm.play()
        disableGui()
        controls.enabled=!settings.followMeteor;
        started=true
        meteor.position.copy(camera.position)
        if(followMeteor){
            camera.position.copy(meteor.position).add(new THREE.Vector3(0, 0, 5*settings.meteorRadius/10000))
        }
        const launchDirection = new THREE.Vector3()
        camera.getWorldDirection(launchDirection)
        launchDirection.normalize()
        meteor.userData.direction = launchDirection.clone()
        physicsMeteor=new PhysicsMeteor(meteor.position,settings.meteorRadius,settings.meteorSpeed,settings.meteorTemperature,launchDirection.normalize(),settings.meteorType)
    }
}
//Planet Scene
const {earth}=createPlanetScene(scene,textureLoader,cubeTextureLoader,settings)
//Meteor
const {meteor,updateMeteorType,updateMeteorColor,meteorRadiusUpdate}=createMeteor(scene,textureLoader,settings)
//Explosion
const {activeInAtmosphere,meteorImpact,shake,setShakingTrue}=createSpark_Explosion_Effects(scene,settings)
// gui
const {gui,updateControllersDisplay,disableGui}=createGUI(settings,{
   updateMeteorType,meteorRadiusUpdate
})

//KeyboardEventListener
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}
window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})
window.addEventListener('keydown', (e) => {
    if (e.key === 'h'||e.key==='ا') {
        gui.show(gui._hidden)
    }
    else if (e.key === 'v'||e.key==='ر') {
        controls.target.set(0,0,0)
    }
    else if (e.key === 'p'||e.key==='ح') {
        volume = volume === 0 ? 2 : 0
        sound6barAljmajm.setVolume(volume)
    }
})
const cursor={
    x:0,y:0
}
const cameraTargetPosition = new THREE.Vector3()
window.addEventListener("mousemove",(event)=>{
    cursor.x=-(event.clientX/sizes.width -0.5)
    cursor.y=(event.clientY/sizes.height -0.5)
} )
window.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
        isMouseDown = true
    }
})
window.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        isMouseDown = false
    }
})
let isMouseDown = false
const followMeteor = () => {
    const x = meteor.position.x
    const y = meteor.position.y
    const z = meteor.position.z

    if (isMouseDown) {
        cameraTargetPosition.set(
            x + Math.sin(cursor.x * Math.PI * 2) * 2,
            y + cursor.y * 5,
            z + Math.cos(cursor.x * Math.PI * 2) * 2
        )
    } else {
        cameraTargetPosition.set(x, y, z + 5)
    }
    camera.position.lerp(cameraTargetPosition, 0.01)
    camera.lookAt(meteor.position)
}

// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 1, 14000)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2000
scene.add(camera)

const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();
const soundCollison = new THREE.PositionalAudio(listener);
audioLoader.load(
    'mp3.mp4',
    buffer => {
        soundCollison.setBuffer(buffer);
        soundCollison.setVolume(8);
    }
);
const soundCollison2 = new THREE.PositionalAudio(listener);
audioLoader.load(
    'gg.mp3',
    buffer => {
        soundCollison2.setBuffer(buffer);
        soundCollison2.setVolume(40);
    }
);
const sound6barAljmajm = new THREE.PositionalAudio(listener)
let volume = 0
sound6barAljmajm.setVolume(volume)
audioLoader.load('remix.mp3', buffer => {
    sound6barAljmajm.setBuffer(buffer)
    sound6barAljmajm.setLoop(true) // تشغيل مستمر
    sound6barAljmajm.setVolume(volume)
    sound6barAljmajm.setRefDistance(15)      // مدى سماع واضح
    sound6barAljmajm.setMaxDistance(100)    // مسافة الصوت
    sound6barAljmajm.setDistanceModel('exponential') // تأثير واقعي
})
meteor.add(sound6barAljmajm)
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = !settings.followMeteor

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor('#000011')

const clock = new THREE.Clock()
let time=Date.now()
function getDeltaTime()
{
    const currentTime=Date.now()
    const deltaTime=currentTime - time
    time = currentTime
    return deltaTime
}
const loop = () =>
{
    const deltaTime = getDeltaTime()
    const elapsedTime = clock.getElapsedTime()
    earth.rotation.y = elapsedTime * 2*Math.PI/1440;
    console.log(physicsMeteor)
    if (started && !physicsMeteor.isCrashed()) {
        // physicsMeteor.update(deltaTime)
        if(physicsMeteor.isInAtmosphere()){
            if(settings.meteorRadius<=0){
                settings.meteorSpeed=0
                meteor.visible = false
                meteorRadiusUpdate()
            }
            else{
                //here normal move increase speed and temp
                meteorRadiusUpdate()
            }
            activeInAtmosphere(settings,meteor,deltaTime)
            updateMeteorColor()
        }
        else if (physicsMeteor.checkCollision()) {
            if(!isShaked)
                {
                    isShaked=true
                    setShakingTrue()
                }
            meteor.visible = false
            started = false
            sound6barAljmajm.stop()
            if(settings.meteorRadius>=70000){
                soundCollison2.play()
            }else
            {
                soundCollison.play()
            }
            meteorImpact(earth,meteor)
        }
    }
    shake(deltaTime/(Math.sqrt(settings.meteorRadius)*1000),camera)
    controls.update()
    updateControllersDisplay()
    if (settings.followMeteor&&started) {
        followMeteor()
    }
    renderer.render(scene, camera)

    window.requestAnimationFrame(loop)

}

loop()