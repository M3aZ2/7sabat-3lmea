import * as THREE from "three";
// import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js'
export function createSpark_Explosion_Effects(scene,settings) {
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


    const activeInAtmosphere = (settings, meteor, deltaTime) => {
        const sparkCount = Math.ceil(settings.meteorRadius / 1000 * 0.5) // أقل عدد شرر لأن نصف القطر صار كبير

        for (let i = 0; i < sparkCount; i++) {
            const sparkHue = THREE.MathUtils.clamp(0.02 + settings.meteorTemperature * 0.00003, 0, 0.15)
            const color = new THREE.Color().setHSL(sparkHue, 1, 0.5)

            sparks.push({
                position: meteor.position.clone(),
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * settings.meteorRadius / 100 * 0.05, // انتشر أوسع حسب الحجم
                    (Math.random() - 0.5) * settings.meteorRadius / 100 * 0.05,
                    (Math.random() - 0.5) * settings.meteorRadius / 100 * 0.05
                ),
                color: color,
                life: 1.0
            })
        }

        const sparkPositions = []
        const sparkColors = []

        for (let i = sparks.length - 1; i >= 0; i--) {
            const s = sparks[i]
            s.life -= deltaTime * 0.0005

            if (s.life <= 0) {
                sparks.splice(i, 1)
                continue
            }

            s.position.add(s.velocity.clone().multiplyScalar(deltaTime * 0.001)) // قلل التأثير مع الوقت

            sparkPositions.push(s.position.x, s.position.y, s.position.z)
            sparkColors.push(s.color.r, s.color.g, s.color.b)
        }

        sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparkPositions, 3))
        sparkGeometry.setAttribute('color', new THREE.Float32BufferAttribute(sparkColors, 3))
        sparkGeometry.attributes.position.needsUpdate = true
        sparkGeometry.attributes.color.needsUpdate = true

        sparkMaterial.size = THREE.MathUtils.clamp(settings.meteorRadius / 500 * 0.03, 0.2, 10)
    }


    const explosionVelocities = []
    let explosionElapsed = 0
    const particlesCount = 8000

    const meteorImpact = (earth, meteor, camera, sound6barAljmajm, soundCollison, soundCollison2, EK, checkCollision, exploded) => {
        meteor.visible = false
        sound6barAljmajm.stop()

        if (checkCollision && !exploded) {
            if (settings.meteorRadius >= 70000) soundCollison2.play()
            else soundCollison.play()
        }

        const impactDirection = new THREE.Vector3().subVectors(meteor.position, earth.position).normalize()
        const earthRadius = earth.geometry.parameters.radius
        const impactPoint = new THREE.Vector3().copy(earth.position).add(impactDirection.multiplyScalar(earthRadius * earth.scale.x))

        const r = THREE.MathUtils.clamp((EK / 1e23) * 10 + 5, 5, 300)

        const positions = new Float32Array(particlesCount * 3)
        explosionVelocities.length = 0
        explosionElapsed = 0

        for (let i = 0; i < particlesCount; i++) {
            // start all points at impact point
            positions[i * 3 + 0] = impactPoint.x
            positions[i * 3 + 1] = impactPoint.y
            positions[i * 3 + 2] = impactPoint.z

            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const speed = Math.random() * r * 0.01

            const dir = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta),
                Math.sin(phi) * Math.sin(theta),
                Math.cos(phi)
            ).multiplyScalar(speed)

            explosionVelocities.push(dir)
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        particlesGeometry.attributes.position.needsUpdate = true

        particlesMaterial.size = THREE.MathUtils.clamp(EK / 1e22, 0.5, 15)
        particlesMaterial.opacity = 1
        explosionParticles.position.set(0, 0, 0) // reset position
        explosionParticles.visible = true
    }

    const updateExplosionParticles = (deltaTime) => {
        if (!explosionParticles.visible) return

        explosionElapsed += deltaTime
        const posAttr = explosionParticles.geometry.attributes.position

        for (let i = 0; i < explosionVelocities.length; i++) {
            posAttr.array[i * 3 + 0] += explosionVelocities[i].x * deltaTime * 0.05
            posAttr.array[i * 3 + 1] += explosionVelocities[i].y * deltaTime * 0.05
            posAttr.array[i * 3 + 2] += explosionVelocities[i].z * deltaTime * 0.05
        }

        posAttr.needsUpdate = true

        if (explosionElapsed > 10000) {
            explosionParticles.visible = false
        }
    }

    return ({activeInAtmosphere, meteorImpact,updateExplosionParticles})
}
// const meteorImpact = (earth, meteor, camera, sound6barAljmajm, soundCollison, soundCollison2, EK,checkCollision,exploded) => {
//     meteor.visible = false
//     sound6barAljmajm.stop()
//     if(checkCollision&&!exploded) {
//         if (settings.meteorRadius >= 70000) {
//             soundCollison2.play()
//         } else {
//             soundCollison.play()
//         }
//     }
//     const impactDirection = new THREE.Vector3().subVectors(meteor.position, earth.position).normalize()
//     const earthRadius = earth.geometry.parameters.radius
//     const impactPoint = new THREE.Vector3().copy(earth.position).add(impactDirection.multiplyScalar(earthRadius * earth.scale.x))
//
//     particlesMaterial.size = THREE.MathUtils.clamp(EK / 1e22, 0.5, 15)
//     explosionParticles.position.copy(impactPoint)
//     explosionParticles.visible = true
//     let explosionTime = 0
//
//     // توليد توزيع كروي
//     const particlesCount = 8000
//     const positions = new Float32Array(particlesCount * 3)
//
//     for (let i = 0; i < particlesCount; i++) {
//         const theta = Math.random() * Math.PI * 2
//         const phi = Math.acos(2 * Math.random() - 1)
//         const r = Math.random() * (EK / 1e23) * 40 + 5 // حجم الكرة يتناسب مع طاقة الانفجار
//
//         const x = r * Math.sin(phi) * Math.cos(theta)
//         const y = r * Math.sin(phi) * Math.sin(theta)
//         const z = r * Math.cos(phi)
//
//         positions[i * 3 + 0] = x
//         positions[i * 3 + 1] = y
//         positions[i * 3 + 2] = z
//     }
//
//     particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
//     particlesGeometry.attributes.position.needsUpdate = true
//
//
//     const fadeOut = () => {
//         explosionTime += 0.01
//         particlesMaterial.opacity = Math.max(10 - explosionTime, 0)
//         if (particlesMaterial.opacity > 0) {
//             requestAnimationFrame(fadeOut)
//         } else {
//             explosionParticles.visible = false
//         }
//     }
//     fadeOut()
// }
