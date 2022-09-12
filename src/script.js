import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import * as lil from 'lil-gui'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Vector3 } from 'three'


var clock, controls
var camera, scene, renderer, mixer, action

const init = () => {
    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader()
    const cubeTextureLoader = new THREE.CubeTextureLoader()

    const raycaster = new THREE.Raycaster()
    
    /**
     * Base
     */
    // Canvas
    const canvas = document.querySelector('canvas.webgl')
    
    // Scene
    scene = new THREE.Scene()
    // scene.background = null
    
    /**
     * Models
     */
    const gltfLoader = new GLTFLoader()
    
    var bottle
    
    gltfLoader.load(
        '/bottle/Bottle.gltf',
        (gltf) =>
        {
            console.log(gltf)
            bottle = gltf.scene
            gltf.scene.position.y = -0.2
            scene.add(gltf.scene)
    
            mixer = new THREE.AnimationMixer( gltf.scene )
            gltf.animations.forEach( ( clip ) => {
                action = mixer.clipAction( clip )
                console.log(action)
            } )
            
        }
    )
    
    document.addEventListener( 'mousedown', onDocumentMouseDown, false );

    function onDocumentMouseDown( event ) {

        let hasClickedBottle = false

        const pointer = new THREE.Vector2()

        pointer.x = ( event.x / window.innerWidth ) * 2 - 1;
        pointer.y = - ( event.y / window.innerWidth ) & 2 + 1;

        raycaster.setFromCamera( pointer, camera )

        const intersects = raycaster.intersectObjects( scene.children )

        for ( let i = 0; i < intersects.length; i++ ) {
            if (intersects[i].object.parent.name == 'Bottle') {
                hasClickedBottle = true
            }
        }

        if ( action !== null && hasClickedBottle ) {

            action.stop();
            action.setLoop( THREE.LoopOnce )
            action.play();
            
        }
    
    }
    
    /**
     * Lights
     */
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(1024, 1024)
    directionalLight.shadow.camera.far = 15
    directionalLight.shadow.camera.left = - 7
    directionalLight.shadow.camera.top = 7
    directionalLight.shadow.camera.right = 7
    directionalLight.shadow.camera.bottom = - 7
    directionalLight.position.set(- 5, 5, 0)
    scene.add(directionalLight)
     
    const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1)
    rectAreaLight.intensity = 2
    rectAreaLight.position.set(0, 2, 0)
    rectAreaLight.lookAt(0,0,0)
    scene.add(rectAreaLight)

    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    
    window.addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight
    
        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()
    
        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    
    /**
     * Camera
     */
    // Base camera
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 0.3
    camera.position.y = 0
    camera.position.z = 0.2
    scene.add(camera)
    
    // Controls
    controls = new OrbitControls(camera, canvas)
    controls.target = new Vector3(0, -0.03, 0)
    controls.enableDamping = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 1.2
    
    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // renderer.setClearColor( 0x000000, 0)
    
    /**
     * Animate
     */
    clock = new THREE.Clock()
}

const tick = () =>
{
    //const elapsedTime = clock.getElapsedTime()
    const delta = clock.getDelta()

    if ( mixer ) mixer.update( delta )

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

init()
tick()