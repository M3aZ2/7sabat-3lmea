import * as THREE from "three";
// import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js'
export function createSpark_Explosion_Effects(scene,settings){
    const sparks = []//الذيل
    const sparkGeometry = new THREE.BufferGeometry()
    sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
    sparkGeometry.setAttribute('color', new THREE.Float32BufferAttribute([], 3))

    const sparkMaterial = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false
    })

    const sparkPoints = new THREE.Points(sparkGeometry, sparkMaterial)
    scene.add(sparkPoints)

// Particle explosion
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 100//كل ما يرسم 100 نقطة بصير بيمسح من ورا وبزت نقاط جديدة
    const positions = new Float32Array(particlesCount * 3)

    const spread = settings.meteorRadius * 1.5

    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * spread
        positions[i + 1] = (Math.random() - 0.5) * spread
        positions[i + 2] = (Math.random() - 0.5) * spread
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

    const activeInAtmosphere=  (settings,meteor,deltaTime)=>{
        const sparkCount = Math.ceil(settings.meteorRadius * 5)

        for (let i = 0; i < sparkCount; i++) {
            const sparkHue = THREE.MathUtils.clamp(0.02 + settings.meteorTemperature * 0.00003, 0, 0.15)
            const color = new THREE.Color().setHSL(sparkHue, 1, 0.5)

            sparks.push({
                position: meteor.position.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                ),
                color: color,
                life: 1.0
            })
        }

        const sparkPositions = []
        const sparkColors = []

        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i]
            s.life -= deltaTime * 0.002

            if (s.life <= 0) {
                sparks.splice(i, 1)
                continue
            }

            // تحديث الموقع
            s.position.add(s.velocity.clone().multiplyScalar(deltaTime * 0.01))

            // دفع البيانات للمصفوفة
            sparkPositions.push(s.position.x, s.position.y, s.position.z)
            sparkColors.push(s.color.r, s.color.g, s.color.b)
        }

        sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparkPositions, 3))
        sparkGeometry.setAttribute('color', new THREE.Float32BufferAttribute(sparkColors, 3))
        sparkGeometry.attributes.position.needsUpdate = true
        sparkGeometry.attributes.color.needsUpdate = true

        sparkMaterial.size = THREE.MathUtils.clamp(settings.meteorRadius * 0.3, 0.1, 1)

    }
    const meteorImpact=(earth,meteor)=>{
        const impactDirection = new THREE.Vector3().subVectors(meteor.position, earth.position).normalize()
        const earthRadius = earth.geometry.parameters.radius
        const impactPoint = new THREE.Vector3().copy(earth.position).add(impactDirection.multiplyScalar(earthRadius * earth.scale.x))
        const baseSize = 0.5
        const sizeFactor = 0.5
        const speedFactor = 0.3

        particlesMaterial.size = baseSize + (settings.meteorRadius * sizeFactor) + (settings.meteorSpeed * speedFactor)
        explosionParticles.position.copy(impactPoint)
        explosionParticles.visible = true
        let explosionTime = 0
        const fadeOut = () => {
            explosionTime += 0.05
            particlesMaterial.opacity = Math.max(10 - explosionTime, 0)
            if (particlesMaterial.opacity > 0) {
                requestAnimationFrame(fadeOut)
            } else {
                explosionParticles.visible = false
            }
        }
        fadeOut()
        
        
    }
    const setShakingTrue=()=>{
        isShaking = true
        shakeDuration = 1
        shakeElapsed = 0//
        shakeIntensity = 0.5//مقدار الهزة

        }
    const shake=(deltaTime,camera)=>{
        if (isShaking) {
            shakeElapsed += deltaTime
            originalCameraPosition.copy(camera.position)
            if (shakeElapsed < shakeDuration) {
                const shakeAmount = shakeIntensity * (1 - shakeElapsed / shakeDuration)
                camera.position.x = originalCameraPosition.x + (Math.random() - 0.5) * shakeAmount
                camera.position.y = originalCameraPosition.y + (Math.random() - 0.5) * shakeAmount
                camera.position.z = originalCameraPosition.z + (Math.random() - 0.5) * shakeAmount
            } else {
                isShaking = false
                camera.position.copy(originalCameraPosition)
            }
        }
    }


    return({activeInAtmosphere,meteorImpact,shake,setShakingTrue})

}