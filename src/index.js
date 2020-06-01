var container = document.getElementById('mCSB_2')
var index = 1
var timeInterval = document.querySelector('#time-interval') ? parseInt(document.querySelector('#time-interval').value) : (60 * 1000)
var multiStreamRecorder
var streamList = []

const options = {
  mimeType: 'video/webm;codecs=vp8',
  video: {
    width: 1280,
    height: 720
  }
}

/**
 * 停止录制
 * @private
 */
function _stopRecording () {
  multiStreamRecorder.stop()
  multiStreamRecorder.stream.stop()
}

/**
 * 开始取流和录制
 * @private
 */
function _startRecording () {
  this.disabled = true
  let mediaConstraints = {
    audio: false,
    video: true
  }
  console.log('getUserMedia constraints: \n', JSON.stringify(mediaConstraints, null, '  '))
  navigator.mediaDevices.getUserMedia(mediaConstraints).then(onMediaSuccess).catch(onMediaError)
}

/**
 * 取流失败
 * @param e
 */
function onMediaError (e) {
  console.error('media error', e)
}

/**
 * 取流成功
 * @param stream
 */
function onMediaSuccess (stream) {
  streamList.push(stream)
  var video = document.createElement('video')

  video = mergeProps(video, {
    controls: true,
    muted: true
  })
  video.srcObject = stream

  video.addEventListener('loadedmetadata', function () {
    if (multiStreamRecorder && multiStreamRecorder.stream) return

    multiStreamRecorder = new MultiStreamRecorder([stream], options)
    multiStreamRecorder.stream = stream

    multiStreamRecorder.previewStream = function (stream) {
      video.srcObject = stream
      video.play()
    }

    multiStreamRecorder.ondataavailable = function (blob) {
      console.log('ondataavailable: ', blob)
      appendLink(blob)
    }
    // get blob after specific time interval
    multiStreamRecorder.start(timeInterval)
  }, false)

  video.play()
  container.appendChild(video)
  container.appendChild(document.createElement('hr'))
}

/**
 * 添加流
 * @private
 */
function _addStream () {
  console.log('add stream')
  if (!multiStreamRecorder || !multiStreamRecorder.stream) {
    return
  }
  var screenConstraints = {
    audio: true,
    video: {
      width: { max: '1920' },
      height: { max: '1080' },
      frameRate: { max: '5' }
    }
  }

  console.log('getDisplayMedia constraints: \n', JSON.stringify(screenConstraints, null, '  '))
  navigator.mediaDevices.getDisplayMedia(screenConstraints).then(function (stream) {
    console.log('getDisplayMedia stream success: ' + stream.id)
    streamList.push(stream)
    multiStreamRecorder.addStream(stream)
  }).catch(function (error) {
    console.error(error)
  })
}

/**
 * 获取stream列表
 * @returns {Promise<Array>}
 */
async function _getStreamList () {
  var localAudioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  })

  var remoteAudioStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  })

  var videoStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 1920, height: 1080 }
  })

  var presentStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 1920, height: 1080 }
  })

  if (localAudioStream) {
    console.warn('add localAudioStream')
    streamList.push(localAudioStream)
  }
  if (remoteAudioStream) {
    console.warn('add remoteAudioStream')
    streamList.push(remoteAudioStream)
  }
  if (videoStream) {
    console.warn('add videoStream')
    streamList.push(videoStream)
    showVideo(videoStream)
  }
  if (presentStream) {
    console.warn('add presentStream')
    streamList.push(presentStream)
    showVideo(presentStream)
  }

  console.warn('get streamList: ', streamList)
  return streamList
}

function showVideo (stream) {
  const span = document.createElement('span')
  const video = document.createElement('video')
  video.style.width = '200px'
  video.srcObject = stream
  video.addEventListener('loadedmetadata', function () {
    const res = 'video resolution: ' + video.videoWidth + '*' + video.videoHeight
    console.log(res)
    span.innerText = res
  })
  video.play()
  container.appendChild(video)
  container.appendChild(span)
  container.appendChild(document.createElement('hr'))
}

/**
 * 创建在线预览连接
 * @param blob
 */
function appendLink (blob) {
  var url = URL.createObjectURL(blob)
  var a = document.createElement('a')
  a.target = '_blank'
  a.innerHTML = 'Open Recorded ' + (blob.type === 'audio/ogg' ? 'Audio' : 'Video') + ' No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ') Time Length: ' + getTimeLength(timeInterval)
  a.href = url

  container.appendChild(a)
  container.appendChild(document.createElement('hr'))
  download(blob)
}

/**
 * 创建下载链接
 * @param blob
 */
function download (blob) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.innerHTML = '点击下载'
  a.download = Date.now() + '.webm'
  container.appendChild(a)
  container.appendChild(document.createElement('hr'))
}

/**
 * below function via: http://goo.gl/B3ae8c
 * @param bytes
 * @returns {string}
 */
function bytesToSize (bytes) {
  var k = 1000
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10)
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}

/**
 * below function via: http://goo.gl/6QNDcI
 * @param milliseconds
 * @returns {string}
 */
function getTimeLength (milliseconds) {
  var data = new Date(milliseconds)
  return data.getUTCHours() + ' hours, ' + data.getUTCMinutes() + ' minutes and ' + data.getUTCSeconds() + ' second(s)'
}
