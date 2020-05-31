## 2020-5-31

- 生成.mp4格式文件并且可以选择下载路径
```javascript
/**
 * 创建下载链接
 * @param blob
 * @param fileName
 */
function createDownloadLink (blob, fileName) {
  let file = new window.File([blob], fileName, { type: 'video/mp4', lastModified: Date.now() })
  // let dataBlob = new window.Blob([blob], { type: 'video/mp4' })
  let element = document.createElement('a')
  element.setAttribute('href', 'data:video/mp4,' + URL.createObjectURL(file))
  element.setAttribute('download', fileName)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()
}
```
- 添加桌面共享流

