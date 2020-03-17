import React, { useState, useCallback, useRef, useEffect, useMemo, useLayoutEffect } from 'react'
import { batch } from 'react-redux'
import * as THREE from 'three'
import ShotItem from './ShotItem'
import { ShotSizes, ShotAngles, setShot } from '../shot-generator/utils/cameraUtils'
import { OutlineEffect } from '../vendor/OutlineEffect'
import { 
    setCameraShot, 
    getSceneObjects,
    getActiveCamera
} from '../shared/reducers/shot-generator'
import ObjectTween from './objectTween'
import ShotElement from './ShotElement'

const getRandomNumber = (maxLength) => {
    let number = Math.floor(Math.random() * (maxLength-1))
    return number
}

const ShotMaker = React.memo(({
    sceneInfo,
    
    withState,
    aspectRatio,
    newAssetsLoaded
}) => {
    const camera = useRef()
    const [selectedShot, selectShot] = useState(null)
    const [shots, setShots] = useState([])
    const imageRenderer = useRef()
    const outlineEffect = useRef()
    const tweenObject = useRef()
    const setSelectedShot = (newSelectedShot) => {
        // TODO filter character once amount of objects in the scene changed
        // Set camera to default before applying shot changes
        let clonnedCamera = newSelectedShot.camera
        tweenObject.current = tweenObject.current || new ObjectTween(sceneInfo.camera)
        tweenObject.current.stopTween()
        selectedShot && sceneInfo.camera.copy(selectedShot.camera)

        tweenObject.current.startTween(clonnedCamera.worldPosition(), clonnedCamera.worldQuaternion())
        selectShot(newSelectedShot)
    }
    useMemo(() => {
        if (!imageRenderer.current) {
            imageRenderer.current = new THREE.WebGLRenderer({ antialias: true }), { defaultThickness:0.008 }
        }
        outlineEffect.current = new OutlineEffect(imageRenderer.current, { defaultThickness: 0.015 })
        return () => {
            imageRenderer.current = null
            outlineEffect.current = null
        }
    }, [])
    
    const convertCanvasToImage = async (canvas) => {
        return new Promise((resolve, reject) => {
            let image = canvas.toDataURL('image/jpeg', 0.7)
            resolve(image);
        })
    }

    const renderSceneWithCamera = useCallback((shotsArray) => {
        let width = Math.ceil(900 * aspectRatio)

        outlineEffect.current.setSize(width, 900)
        for(let i = 0; i < shotsArray.length; i++) {
            let shot = shotsArray[i]
            outlineEffect.current.render(sceneInfo.scene, shot.camera)
            convertCanvasToImage(outlineEffect.current.domElement).then((cameraImage) => {
                shot.renderImage = cameraImage
            })
        }

    }, [sceneInfo])

    const generateShot = useCallback(() => {
        let shotsArray = []
        let shotsCount = 12
        let characters = sceneInfo.scene.__interaction.filter(object => object.userData.type === 'character')
        if(!characters.length) {
            return;
        }
        for(let i = 0; i < shotsCount; i++) {
            let cameraCopy = camera.current.clone()
            let shotAngleKeys = Object.keys(ShotAngles)
            let randomAngle = ShotAngles[shotAngleKeys[getRandomNumber(shotAngleKeys.length)]]
            
            let shotSizeKeys = Object.keys(ShotSizes)
            let randomSize = ShotSizes[shotSizeKeys[getRandomNumber(shotSizeKeys.length)]]

            let character = characters[getRandomNumber(characters.length)]
            if(!character.getObjectByProperty("type", "SkinnedMesh")) continue
            let shot = new ShotItem(randomAngle, randomSize, character)
            setShot({camera: cameraCopy, characters, selected:character, shotAngle:shot.angle, shotSize:shot.size})
            shot.camera = cameraCopy.clone()
            shotsArray.push(shot)
        }
        renderSceneWithCamera(shotsArray)
        shotsArray[0] && setSelectedShot(shotsArray[0])
    
        setShots(shotsArray)
    }, [renderSceneWithCamera])

    useMemo(() => {
        if(sceneInfo ) {
            camera.current = sceneInfo.camera.clone()
            generateShot()
        }
    }, [sceneInfo, newAssetsLoaded])

    const updateCamera = useCallback(() => {
        withState((dispatch, state) => {
            batch(() => {
                dispatch(setCameraShot(camera.current.userData.id, {size: selectedShot.size, angle: selectedShot.angle, character: selectedShot.character.userData.id }))
            })
        })
    }, [selectedShot])

    let scale = 2
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const handleResize = () => {
        setWindowHeight(window.innerHeight)
      }
    
    useLayoutEffect(() => {
      window.addEventListener('resize', handleResize)
      
      return () => {
        window.removeEventListener('resize', handleResize) 
      }
    }, [])

    return ( 
        <div style={{ maxHeight: "100%", height: "100%" }}>
            <div className="insert-camera" onPointerDown={() => updateCamera()}>
                <a>
                    Insert Camera
                </a>
            </div>
            <div className="shots-container" style={{ maxWidth: (900 * aspectRatio) / scale + 30, height: windowHeight / scale - 45 }}>
            {
                shots.map((object, index) => {
                    return <ShotElement
                    key={index}
                    setSelectedShot={setSelectedShot}
                    object={object}
                    aspectRatio={aspectRatio}
                    scale={scale}
                    />
                })
            }
            </div>
        </div>
    )
})
export default ShotMaker