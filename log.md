
## 2020-6-1

- 修改video类型，生成`video/webm;codecs=vp8` 格式，下载后可播放

- 添加MediaRecorder类型检测

## 2020-5-31

- 生成.mp4格式文件并且可以选择下载路径
```javascript
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
```
- 添加桌面共享流

