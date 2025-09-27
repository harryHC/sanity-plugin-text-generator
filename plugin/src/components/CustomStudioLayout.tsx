import {Badge} from '@sanity/ui'
import React, {useEffect, useState} from 'react'
import {LayoutProps} from 'sanity'

import {
  addMessageHandler,
  checkWebGPUSupport,
  getSavedModelOption,
  loadModel,
  SharedWorkerMessage,
} from '../model'

// create only one worker and load model once and reuse across all inputs
const CustomStudioLayout = (props: LayoutProps): React.ReactElement => {
  const [modelLoadingProgress, setModelLoadingProgress] = useState(0)
  const {renderDefault} = props

  // Check for WebGPU support and load the model when the component mounts
  useEffect(() => {
    // First check if WebGPU is supported
    checkWebGPUSupport()
      .then((supported) => {
        if (!supported) {
          console.error('WebGPU is not supported in this browser')
          return
        }

        addMessageHandler('loading-progress', (data: SharedWorkerMessage) => {
          setModelLoadingProgress(data.progress || 0)
        })
        const model = getSavedModelOption()

        loadModel(model)
          .then(() => {
            console.log('Model loaded successfully')
          })
          .catch((error) => {
            console.error('Error loading model:', error)
          })
      })
      .catch((error) => {
        console.error('Error checking WebGPU support:', error)
      })
  }, [])

  return (
    <>
      <div style={{position: 'absolute', top: 8, right: 8, zIndex: 999999}}>
        {modelLoadingProgress > 0 && modelLoadingProgress < 100 && (
          <Badge
            tone="positive"
            style={{
              backgroundColor: 'green',
              color: 'white',
              padding: '4px 8px 6px',
              borderRadius: '4px 4px 4px 0',
              position: 'relative',
            }}
          >
            Loading AI model...
            <span
              style={{
                position: 'absolute',
                bottom: -2,
                left: -8,
                height: 2,
                backgroundColor: 'white',
                transition: 'width 0.3s',
                width: `${modelLoadingProgress}%`,
                transformOrigin: 'left',
              }}
            />
          </Badge>
        )}
      </div>
      {renderDefault(props)}
    </>
  )
}

export default CustomStudioLayout
