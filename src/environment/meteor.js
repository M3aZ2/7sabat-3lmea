import * as THREE from "three";

export function createMeteor(scene,textureLoader,settings){
    const meteorGeometry= new THREE.SphereGeometry(0.1 * settings.meteorRadius, 64, 64)
    const  meteorColorMapRock = textureLoader.load('./meteor/ground_0010_color_1k.jpg')
    const meteorColorMapIce = textureLoader.load('./meteor/ground_0010_color_ice_1k.jpg')
    const meteorColorMapCopper = textureLoader.load('./meteor/ground_0010_color_copper_1k.webp')
    const meteorAoMap = textureLoader.load('./meteor/ground_0010_ao_1k.jpg')
    const meteorRoughnessMap = textureLoader.load('./meteor/ground_0010_roughness_1k.jpg')
    const meteorNormalMap = textureLoader.load('./meteor/ground_0010_normal_opengl_1k.png') // استخدم OpenGL version
    const meteorDisplacementMap = textureLoader.load('./meteor/ground_0010_height_1k.png')

    const meteorMaterial = new THREE.MeshStandardMaterial({
        map: meteorColorMapRock,
        aoMap: meteorAoMap,
        roughnessMap: meteorRoughnessMap,
        normalMap: meteorNormalMap,
        displacementMap: meteorDisplacementMap,
        displacementScale: 0.1*settings.meteorRadius,
    })
    const meteor=new THREE.Mesh(meteorGeometry,meteorMaterial)
    meteor.geometry.setAttribute(
        'uv2',
        new THREE.BufferAttribute(meteor.geometry.attributes.uv.array, 2)
    )
    scene.add(meteor)
    meteor.position.z=1900

    const trailPositions = []
    const trailGeometry = new THREE.BufferGeometry()
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0xff6600 })

// مبدئياً: هندسة فارغة
    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3))
    const meteorTrailLine = new THREE.Line(trailGeometry, trailMaterial)
    scene.add(meteorTrailLine)

    const updateTrial=()=>{
        const lastPoint = trailPositions.length >= 3
            ? new THREE.Vector3(
                trailPositions[trailPositions.length - 3],
                trailPositions[trailPositions.length - 2],
                trailPositions[trailPositions.length - 1]
            )
            : null

        if (!lastPoint || meteor.position.distanceTo(lastPoint) > 0.5) {
            // أضف نقطة جديدة فقط إذا تحرك النيزك بما فيه الكفاية
            trailPositions.push(meteor.position.x, meteor.position.y, meteor.position.z)
        }
        if (meteor.visible) {
            // أضف موضع النيزك الحالي إلى المسار
            trailPositions.push(meteor.position.x, meteor.position.y, meteor.position.z)

            // تحديث بيانات الخط
            trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3))
            trailGeometry.attributes.position.needsUpdate = true
        }
    }

    const updateMeteorType=(type)=>{
        switch(type){
            case 'rock':
                meteorMaterial.map=meteorColorMapRock
                break;
            case 'ice':
                meteorMaterial.map=meteorColorMapIce
                break;
            case 'copper':
                meteorMaterial.map=meteorColorMapCopper
                break;
        }
    }
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
             settings.meteorRadius/10000, 64, 64
        )
    }
    return ({meteor,updateMeteorType,updateMeteorColor,meteorRadiusUpdate,updateTrial})
}