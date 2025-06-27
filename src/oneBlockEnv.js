import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {createGUI} from "./environment/guiSettings.js";
import earthVertexShader from './shaders/earth/vertex.glsl'
import earthFragmentShader from './shaders/earth/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.glsl'

// Canvas
const canvas = document.querySelector('canvas.webgl')
// Scene
const scene = new THREE.Scene()
// Loaders
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const skyboxTexture = cubeTextureLoader.load([
    'sky_box/bkg1_right.png', // right
    'sky_box/bkg1_left.png', // left
    'sky_box/bkg1_top.png', // top
    'sky_box/bkg1_bot.png', // bottom
    'sky_box/bkg1_front.png', // front
    'sky_box/bkg1_back.png'  // back
])
scene.background = skyboxTexture

let speed=1
let started=false
const settings = {
    followMeteor: false,
    speed:1,
    atmosphereDayColor : '#00aaff',
    atmosphereTwilightColor : '#ff6600',
    meteorSpeed:1,
    meteorTemperature:1,
    meteorRadius:1,
    meteorRadiusUpdate:()=>{
        meteor.geometry.dispose() // تخلص من الشكل القديم
        meteor.geometry = new THREE.SphereGeometry(
            0.1 * settings.meteorRadius, 64, 64
        )
    },
    lunch:()=>{
        controllers.speedController.disable()
        controllers.followMeteorController.disable()
        folder.genSetGUI.close()
        controllers.speedMeteorController.disable()
        controllers.meteorTemperatureController.disable()
        controllers.meteorRadiusController.disable()
        controls.enabled=!settings.followMeteor;
        started=true
        meteor.position.copy(camera.position)
        if(followMeteor){
            camera.position.copy(meteor.position).add(new THREE.Vector3(0, 0, 5))
        }
        const launchDirection = new THREE.Vector3()
        camera.getWorldDirection(launchDirection)
        launchDirection.normalize()

        meteor.userData.direction = launchDirection.clone()

    }
}



// Textures
const earthDayTexture = textureLoader.load('./earth/day.jpg')
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8
const earthNightTexture = textureLoader.load('./earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8
const earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg')
earthSpecularCloudsTexture.anisotropy = 8

// Mesh
const earthGeometry = new THREE.SphereGeometry(8, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(settings.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(settings.atmosphereTwilightColor))
    }
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

const meteorGeometry= new THREE.SphereGeometry(0.1 * settings.meteorRadius, 64, 64)
const meteorColorMap = textureLoader.load('./meteor/ground_0010_color_1k.jpg')
const meteorAoMap = textureLoader.load('./meteor/ground_0010_ao_1k.jpg')
const meteorRoughnessMap = textureLoader.load('./meteor/ground_0010_roughness_1k.jpg')
const meteorNormalMap = textureLoader.load('./meteor/ground_0010_normal_opengl_1k.png') // استخدم OpenGL version
const meteorDisplacementMap = textureLoader.load('./meteor/ground_0010_height_1k.png')

const meteorMaterial = new THREE.MeshStandardMaterial({
    map: meteorColorMap,
    aoMap: meteorAoMap,
    roughnessMap: meteorRoughnessMap,
    normalMap: meteorNormalMap,
    displacementMap: meteorDisplacementMap,
    displacementScale: 0.05 // تحكم في شدة البروز
})
const meteor=new THREE.Mesh(meteorGeometry,meteorMaterial)
meteor.geometry.setAttribute(
    'uv2',
    new THREE.BufferAttribute(meteor.geometry.attributes.uv.array, 2)
)

scene.add(meteor)
meteor.position.x=14

//trail
const sparkTrailPositions = []
const maxSparks = 100
let sparkPoints = null
const sparkGeometry = new THREE.BufferGeometry()
sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
const sparkMaterial = new THREE.PointsMaterial({
    color: 0xffaa33,
    size: 0.2,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
})
sparkPoints = new THREE.Points(sparkGeometry, sparkMaterial)
scene.add(sparkPoints)

let trailGeometry = new THREE.BufferGeometry()
let trailMaterial = new THREE.LineBasicMaterial({ vertexColors: true })
let trailLine = new THREE.Line(trailGeometry, trailMaterial)
scene.add(trailLine)
const trailPositions = []
const trailColors = []
const maxTrail = 100

// Particle explosion
const particlesGeometry = new THREE.BufferGeometry()
const particlesCount = 100
const positions = new Float32Array(particlesCount * 3)
for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 2 // توزيع عشوائي حول نقطة
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const particlesMaterial = new THREE.PointsMaterial({
    color: 0xffaa33,
    size: 0.5,
    transparent: true,
    opacity: 1,
    depthWrite: false
})
const explosionParticles = new THREE.Points(particlesGeometry, particlesMaterial)
explosionParticles.visible = false
scene.add(explosionParticles)
//shake effect
let isShaking = false
let shakeDuration = 0
let shakeElapsed = 0
let shakeIntensity = 0
let originalCameraPosition = new THREE.Vector3()

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(ambientLight)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
directionalLight.position.set(15, 10, 5)
scene.add(directionalLight)

// Atmosphere
const atmosphereMaterial = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms:
    {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(settings.atmosphereDayColor)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(settings.atmosphereTwilightColor))
    },
})

const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial)
atmosphere.scale.set(1.5, 1.5, 1.5)
scene.add(atmosphere)

/**Sun*/
// Coordinates
const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5)
const sunDirection = new THREE.Vector3()

// Debug
const debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.4, 8),
    new THREE.MeshBasicMaterial()
)
scene.add(debugSun)

// Update
const updateSun = () =>
{
    // Sun direction
    sunDirection.setFromSpherical(sunSpherical)

    // Debug
    debugSun.position
        .copy(sunDirection)
        .multiplyScalar(40)

    // Uniforms
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)
}

updateSun()

//KeyboardEventListener
window.addEventListener('keydown', (e) => {
    if (e.key === 'h'||e.key=='ا') {
        gui.show(gui._hidden)
    }
    else if (e.key === 'v'||e.key=='ر') {
        controls.target.set(0,0,0)
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


// gui
const {gui,folder,controllers,updateControllersDisplay}=createGUI(settings,{
    speedUpdate:()=>{
        speed=settings.speed
    },meteorRadiusUpdate:()=>{
        settings.meteorRadiusUpdate()
    }
})

//sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 200)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 40
scene.add(camera)

const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();
const sound = new THREE.PositionalAudio(listener);
audioLoader.load(
    'mp3.mp4',
    buffer => {
        sound.setBuffer(buffer);
        sound.setVolume(8);
    }
);

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

/**
 * Animate
 */
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

    earth.rotation.y = elapsedTime * 0.02 *speed
    if (started && meteor.visible) {
        const moveSpeed = 0.001 * speed *settings.meteorSpeed*deltaTime
        if (meteor.userData.direction) {
            meteor.position.add(meteor.userData.direction.clone().multiplyScalar(moveSpeed))
        }
        const toEarth = meteor.position.distanceTo(earth.position)
        if(toEarth<=12&&toEarth>8){

            if(settings.meteorRadius<=0){
                settings.meteorSpeed=0
                meteor.visible = false
                sparkPoints.visible = false
                trailLine.visible = false
                settings.meteorRadiusUpdate()
            }
            else{
                settings.meteorTemperature+=0.5*deltaTime
                settings.meteorRadius-=0.0001*deltaTime
                settings.meteorRadiusUpdate()
            }
            //Color of meteor dep on Temp
            let hue
            if (settings.meteorTemperature < 800) {
                hue = 0.0 // Dark Red
            } else if (settings.meteorTemperature < 1500) {
                hue = 0.05 // Orange
            } else if (settings.meteorTemperature < 2500) {
                hue = 0.1 // Yellow
            } else if (settings.meteorTemperature < 4000) {
                hue = 0.13 // light yellow
            }
            meteorMaterial.color.setHSL(hue, 1, 0.5)
            meteorMaterial.emissive = new THREE.Color().setHSL(hue, 1, 0.5)
            meteorMaterial.emissiveIntensity = THREE.MathUtils.clamp((settings.meteorTemperature - 500) / 500, 0, 5)
            meteorMaterial.transparent = true
            meteorMaterial.opacity = THREE.MathUtils.clamp(1 - (settings.meteorTemperature / 4000), 0.4, 1)

            //trail
            sparkTrailPositions.push(meteor.position.clone())
            if (sparkTrailPositions.length > maxSparks) {
                sparkTrailPositions.shift()
            }
            const sparkVertices = []
            sparkTrailPositions.forEach(pos => {
                sparkVertices.push(pos.x, pos.y, pos.z)
            })
            sparkPoints.geometry.setAttribute('position', new THREE.Float32BufferAttribute(sparkVertices, 3))
            sparkPoints.geometry.attributes.position.needsUpdate = true
            sparkMaterial.opacity = THREE.MathUtils.clamp(settings.meteorSpeed * 0.1, 0.3, 1)
            sparkMaterial.size = THREE.MathUtils.clamp(settings.meteorRadius * 0.15, 0.05, 2)
            const sparkHue = THREE.MathUtils.clamp(0.02 + settings.meteorTemperature * 0.00003, 0, 0.15)
            sparkMaterial.color.setHSL(sparkHue, 1, 0.5)

            const pos = meteor.position.clone()
            trailPositions.push(pos)

            const hueTrail = THREE.MathUtils.clamp(0.02 + settings.meteorTemperature * 0.00003, 0, 0.15)
            const color = new THREE.Color().setHSL(hueTrail, 1, 0.5)
            trailColors.push(color.r, color.g, color.b)

            if (trailPositions.length > maxTrail) {
                trailPositions.shift()
                trailColors.splice(0, 3)
            }

            const vertices = []
            trailPositions.forEach(p => vertices.push(p.x, p.y, p.z))
            trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
            trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3))
            trailGeometry.computeBoundingSphere()
        }

        else if (toEarth <= 8) {
            meteor.visible = false
            sound.play()
            sparkPoints.visible = false
            trailLine.visible = false
            const impactDirection = new THREE.Vector3().subVectors(meteor.position, earth.position).normalize()
            const earthRadius = earth.geometry.parameters.radius
            const impactPoint = new THREE.Vector3().copy(earth.position).add(impactDirection.multiplyScalar(earthRadius * earth.scale.x))
            const baseSize = 0.5
            const sizeFactor = 0.5
            const speedFactor = 0.3

            const particleSize = baseSize + (settings.meteorRadius * sizeFactor) + (settings.meteorSpeed * speedFactor)
            particlesMaterial.size = particleSize
            explosionParticles.position.copy(impactPoint)
            explosionParticles.visible = true
            let explosionTime = 0
            const fadeOut = () => {
                explosionTime += 0.05
                particlesMaterial.opacity = Math.max(1 - explosionTime, 0)
                if (particlesMaterial.opacity > 0) {
                    requestAnimationFrame(fadeOut)
                } else {
                    explosionParticles.visible = false
                }
            }
            fadeOut()
            isShaking = true
            shakeDuration = 1 // مدة الاهتزاز بالثواني
            shakeElapsed = 0
            shakeIntensity = 0.5 // شدة الاهتزاز
            originalCameraPosition.copy(camera.position)
        }
    }
    if (isShaking) {
        shakeElapsed += deltaTime // هنا استخدم نفس deltaTime اللي حسبته في بداية الحلقة

        if (shakeElapsed < shakeDuration) {
            // اهتزاز عشوائي سلس
            const shakeAmount = shakeIntensity * (1 - shakeElapsed / shakeDuration) // تخفيف الاهتزاز مع الوقت
            camera.position.x = originalCameraPosition.x + (Math.random() - 0.5) * shakeAmount
            camera.position.y = originalCameraPosition.y + (Math.random() - 0.5) * shakeAmount
            camera.position.z = originalCameraPosition.z + (Math.random() - 0.5) * shakeAmount
        } else {
            // انتهاء الاهتزاز
            isShaking = false
            camera.position.copy(originalCameraPosition)
        }

    }
    // Update controls
    controls.update()
    updateControllersDisplay()

    if (settings.followMeteor&&started) {
        followMeteor()
    }
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(loop)
}

loop()