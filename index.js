// 获取按钮
const startRecording = document.getElementById('start-recording')
const stopRecording = document.getElementById('stop-recording')
const pauseRecording = document.getElementById('pause-recording')
const resumeRecording = document.getElementById('resume-recording')
const addStream = document.getElementById('add-stream')
const container = document.getElementById('container')
let index = 1
let multiStreamRecorder

const options = {
  mimeType: 'video/webm',
  video: {
    width: 1280,
    height: 720
  }
}
const mediaConstraints = {
  audio: true,
  video: true
}

/**
 * 取流成功
 * @param stream
 */
function onMediaSuccess (stream) {
  console.log('get stream success: ', stream.id)
  let video = document.createElement('video')

  video = mergeProps(video, {
    controls: true,
    muted: true
  })
  video.srcObject = stream

  video.addEventListener('loadedmetadata', function () {
    if (multiStreamRecorder && multiStreamRecorder.stream) return

    multiStreamRecorder = new MultiStreamRecorder([stream, stream], options)
    multiStreamRecorder.stream = stream

    multiStreamRecorder.previewStream = function (stream) {
      video.srcObject = stream
      video.play()
    }

    multiStreamRecorder.ondataavailable = function (blob) {
      appendLink(blob)
    }

    // 生成recorder文件的预览链接
    function appendLink (blob) {
      const a = document.createElement('a')
      a.target = '_blank'
      a.innerHTML = 'Open Recorded ' + (blob.type === 'audio/ogg' ? 'Audio' : 'Video') + ' No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ') Time Length: ' + getTimeLength(timeInterval)
      a.href = URL.createObjectURL(blob)
      container.appendChild(a)
      container.appendChild(document.createElement('hr'))
    }

    let timeInterval = document.querySelector('#time-interval').value
    if (timeInterval) {
      timeInterval = parseInt(timeInterval)
    } else {
      timeInterval = 30 * 1000
    }

    // get blob after specific time interval
    multiStreamRecorder.start(timeInterval)

    document.querySelector('#add-stream').disabled = false
    document.querySelector('#stop-recording').disabled = false
    document.querySelector('#pause-recording').disabled = false
  }, false)

  video.play()

  container.appendChild(video)
  container.appendChild(document.createElement('hr'))
}

/**
 * 取流失败
 * @param e
 */
function onMediaError (e) {
  console.error('media error', e)
}

function captureUserMedia (mediaConstraints, successCallback, errorCallback) {
  navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback)
}

/**
 * 开始录制
 */
startRecording.onclick = function () {
  this.disabled = true
  captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError)
}

/**
 * 停止录制
 */
stopRecording.onclick = function () {
  this.disabled = true
  multiStreamRecorder.stop()
  multiStreamRecorder.stream.stop()

  pauseRecording.disabled = true
  resumeRecording.disabled = false
  addStream.disabled = true
}

/**
 * 暂停录制
 */
pauseRecording.onclick = function () {
  this.disabled = true
  multiStreamRecorder.pause()
  resumeRecording.disabled = false
}

/**
 * 恢复录制
 */
resumeRecording.onclick = function () {
  this.disabled = true
  multiStreamRecorder.resume()
  pauseRecording.disabled = false
}

/**
 * 添加流
 */
addStream.onclick = function () {
  if (!multiStreamRecorder || !multiStreamRecorder.stream) return
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: 1920,
      height: 1080
    }
  }).then(function (stream) {
    multiStreamRecorder.addStream(stream)
  }).catch(function (error) {
    console.error(error)
  })
}

/**
 * 文件大小转换
 * below function via: http://goo.gl/B3ae8c
 * @param bytes
 * @returns {string}
 */
function bytesToSize (bytes) {
  const k = 1000
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10)
  return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i]
}

/**
 * 获取文件时长
 * below function via: http://goo.gl/6QNDcI
 * @param milliseconds
 * @returns {string}
 */
function getTimeLength (milliseconds) {
  const data = new Date(milliseconds)
  return data.getUTCHours() + ' hours, ' + data.getUTCMinutes() + ' minutes and ' + data.getUTCSeconds() + ' second(s)'
}

/**
 * 监听窗口关闭
 */
window.onbeforeunload = function () {
  startRecording.disabled = false
}
