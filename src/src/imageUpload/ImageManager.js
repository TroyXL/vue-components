import Exif from 'exif-js'
import axios from 'axios'

const ImageManager = {
  renderStyle ($el) {
    function render (prop, value) {
      $el.style[prop] = value
      return render
    }
    return render
  },

  triggerListener ($el) {
    function trigger (type, events, fns) {
      if (type === 'add') {
        events.forEach((event, index) => {
          $el.addEventListener(event, fns[index])
        })
      } else {
        events.forEach((event, index) => {
          $el.removeEventListener(event, fns[index])
        })
      }
      return trigger
    }
    return trigger
  },

  // 校验文件大小
  checkFileSize (file, standard) {
    if (standard && file.size > standard) return false
    return true
  },

  // 文件转base64
  file2DataUrl (file) {
    return new Promise((resolve, reject) => {
      let fd = new FileReader()
      let dataUrl = ''
      let mimeType = ''
      fd.onload = (e) => {
        dataUrl = e.target.result
        // mimeType = dataUrl.match(/data:(.{6,});base64/)[1] // 通过正则获取mimeType会导致堆栈溢出 为什么
        let temp = dataUrl.split(';base64')[0]
        mimeType = temp.substr(5, temp.length - 1)
        fd = file = null
        resolve && resolve({ dataUrl, mimeType })
      }
      fd.onerror =
      fd.onabort =
        () => {
          fd = file = null
          reject && reject('图片处理失败-file2DataUrl')
        }
      fd.readAsDataURL(file)
    })
  },

  // base64转图片
  url2Image (dataUrl) {
    return new Promise((resolve, reject) => {
      let image = new Image()
      image.onload = () => {
        resolve && resolve(image)
        image = null
      }
      image.onerror =
      image.onabort =
        () => {
          image = null
          reject && reject('图片处理失败-url2Image')
        }
      image.src = dataUrl
    })
  },

  // 压缩图片
  compressImage (image, mime, maxWidth, quality) {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    if (maxWidth && image.width > maxWidth) {
      canvas.width = maxWidth
      canvas.height = image.height * maxWidth / image.width
    } else {
      canvas.width = image.width
      canvas.height = image.height
    }

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL(mime, quality)
    canvas = ctx = image = null
    return dataUrl
  },

  rotateImage ({ image, mimeType, forward, start, size, crop }) {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')

    if (!crop) {
      if (forward === 1 || forward === 3) {
        canvas.width = image.height
        canvas.height = image.width
      } else {
        canvas.width = image.width
        canvas.height = image.height
      }
    } else canvas.width = canvas.height = size

    ctx.rotate(90 * forward * Math.PI / 180)

    if (!crop) {
      const translate = computeRotateTranslate(image.width, image.height, forward)
      ctx.translate(translate.tx, translate.ty)
      ctx.drawImage(image, 0, 0, image.width, image.height)
    } else {
      const translate = computeRotateTranslate(size, size, forward)
      ctx.translate(translate.tx, translate.ty)
      if (start < 0) start = 0
      if (image.width > image.height) ctx.drawImage(image, start, 0, size, size, 0, 0, size, size)
      else ctx.drawImage(image, 0, start, size, size, 0, 0, size, size)
    }

    return canvas.toDataURL(mimeType, 1)
  },

  // 裁切图片
  cropImage (image, mimeType, forward, start, size) {
    return this.rotateImage({
      image,
      mimeType,
      forward,
      start,
      size,
      crop: true
    })
  },

  // 获取图片方向信息
  getOrientation (image) {
    return new Promise((resolve, reject) => {
      getExif(image, ['Orientation'])
        .then(res => { resolve && resolve(res) })
        .catch(err => reject && reject(err))
    })
  },

  // base64转blob
  base64Url2Blob (dataUrl, mimeType) {
    const temp = dataUrl.split(',')
    const bytes = window.atob(temp[1])
    let ia = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i)
    }
    return {
      file: new Blob([ia], {
        type: mimeType
      }),
      name: `${new Date().getTime()}.${mimeType.split('/')[1]}`
    }
  },

  // 上传
  uploadImage ({ url, fileKey, file, params, onProgress }) {
    return new Promise((resolve, reject) => {
      let formData = new FormData()
      params && params.forEach(item => {
        formData.append(item.key, item.value)
      })
      formData.append(fileKey, file.file, file.name)

      axios({
        url: url,
        method: 'post',
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        onUploadProgress: (e) => {
          onProgress && onProgress({
            loaded: e.loaded,
            total: e.total
          })
        }
      }).then(res => {
        resolve && resolve(res.data)
      }).catch(err => {
        reject && reject(err)
      })
    })
  }
}

// 获取图片exif元数据
function getExif (image, tags) {
  return new Promise((resolve, reject) => {
    Exif.getData(image, function () {
      if (!tags || !tags.length) {
        Exif.getAllTags(this)
        resolve && resolve(this)
      } else {
        let res = tags.map(tag => Exif.getTag(this, tag))
        resolve && resolve(res.length === 1 ? res[0] : res)
      }
    })
  })
}

// 计算图片旋转后位移的信息
function computeRotateTranslate (imageWidth, imageHeight, forward) {
  return {
    tx: forward === 0 || forward === 1 ? 0 : -imageWidth,
    ty: forward === 0 || forward === 3 ? 0 : -imageHeight
  }
}

export default ImageManager
