import * as THREE from "three";

export function createMeteor(scene,textureLoader,settings){
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
        displacementScale: 0.05
    })
    const meteor=new THREE.Mesh(meteorGeometry,meteorMaterial)
    meteor.geometry.setAttribute(
        'uv2',
        new THREE.BufferAttribute(meteor.geometry.attributes.uv.array, 2)
    )
    scene.add(meteor)
    meteor.position.x=16
    const updateMeteorColor=()=>{
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
    }
    const meteorRadiusUpdate=()=>{
        meteor.geometry.dispose()
        meteor.geometry = new THREE.SphereGeometry(
            0.1 * settings.meteorRadius, 64, 64
        )
    }
    return ({meteor,updateMeteorColor,meteorRadiusUpdate})
}