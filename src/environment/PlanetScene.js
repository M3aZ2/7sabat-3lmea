import * as THREE from 'three'
import earthVertexShader from '../shaders/earth/vertex.glsl'
import earthFragmentShader from '../shaders/earth/fragment.glsl'
import atmosphereVertexShader from '../shaders/atmosphere/vertex.glsl'
import atmosphereFragmentShader from '../shaders/atmosphere/fragment.glsl'
import world from '../physics/world.js';

export function createPlanetScene(scene,textureLoader, cubeTextureLoader, settings) {

//SkyBox
    scene.background = cubeTextureLoader.load([
        'sky_box/bkg1_right.png', // right
        'sky_box/bkg1_left.png', // left
        'sky_box/bkg1_top.png', // top
        'sky_box/bkg1_bot.png', // bottom
        'sky_box/bkg1_front.png', // front
        'sky_box/bkg1_back.png'  // back
    ])
//Earth
    //Texture
    const earthDayTexture = textureLoader.load('./earth/day.jpg')
    earthDayTexture.colorSpace = THREE.SRGBColorSpace
    earthDayTexture.anisotropy = 8
    const earthNightTexture = textureLoader.load('./earth/night.jpg')
    earthNightTexture.colorSpace = THREE.SRGBColorSpace
    earthNightTexture.anisotropy = 8
    const earthSpecularCloudsTexture = textureLoader.load('./earth/specularClouds.jpg')
    earthSpecularCloudsTexture.anisotropy = 8
    //mesh
    const earthGeometry = new THREE.SphereGeometry(world.EarthRaduis/10000, 64, 64)
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
//atmosphere
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
    atmosphere.scale.set(2.5, 2.5, 2.5)
    scene.add(atmosphere)
//light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
    directionalLight.position.set(1192, 795, 397.5)
    scene.add(directionalLight)

//sun
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
        sunDirection.setFromSpherical(sunSpherical)
        debugSun.position
            .copy(sunDirection)
            .multiplyScalar(40)
        earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
        atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)
    }
    updateSun()

    return ({
        earth,
        atmosphere,
        sunDirection,
        sunSpherical,
        debugSun,
        updateSun
    })
}