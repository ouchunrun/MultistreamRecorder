var container = document.getElementById('mCSB_2')
var index = 1
var timeInterval = document.querySelector('#time-interval') ? parseInt(document.querySelector('#time-interval').value) : (60 * 1000)
var multiStreamRecorder
var mediaConstraints = {
  audio: true,
  video: true
}

/**
 * 取流
 * @param mediaConstraints
 * @param successCallback
 * @param errorCallback
 */
function captureUserMedia (mediaConstraints, successCallback, errorCallback) {
  navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback)
}

/**
 * 开始
 * @private
 */
function _startRecording () {
  this.disabled = true
  captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError)
}

/**
 * 停止
 * @private
 */
function _stopRecording () {
  multiStreamRecorder.stop()
  multiStreamRecorder.stream.stop()
}

/**
 * 取流成功
 * @param stream
 */
function onMediaSuccess (stream) {
  var video = document.createElement('video')

  video = mergeProps(video, {
    controls: true,
    muted: true
  })
  video.srcObject = stream

  video.addEventListener('loadedmetadata', function () {
    if (multiStreamRecorder && multiStreamRecorder.stream) return

    multiStreamRecorder = new MultiStreamRecorder([stream, stream])
    multiStreamRecorder.stream = stream

    multiStreamRecorder.previewStream = function (stream) {
      video.srcObject = stream
      video.play()
    }

    multiStreamRecorder.ondataavailable = function (blob) {
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
  if (!multiStreamRecorder || !multiStreamRecorder.stream) {
    return
  }
  multiStreamRecorder.addStream(multiStreamRecorder.stream)
}

function onMediaError (e) {
  console.error('media error', e)
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

  console.log('blob.type: ', blob.type)
  let fileName = '_Recorder.' + blob.type.split('/')[1]
  createDownloadLink(blob, fileName)
  container.appendChild(document.createElement('hr'))
}

/**
 * 创建下载链接
 * @param blob
 * @param fileName
 */
function createDownloadLink (blob, fileName) {
  var li = document.createElement('li')
  var link = document.createElement('a')
  let dataBlob = new window.Blob([blob], { type: 'video/webm' })

  // link the a element to the blob
  link.href = URL.createObjectURL(dataBlob)
  link.download = Date.parse(new Date()) + fileName
  link.innerHTML = link.download
  li.appendChild(link)

  // add the li element to the ordered list
  container.appendChild(li)
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
