/* eslint-env browser */
module.exports = function (config) {
  function readAsDataURL (file) {
    if (!(file instanceof Blob)) {
      throw new TypeError('Must be a File or Blob')
    }
    return new Promise(function (resolve, reject) {
      var reader = new FileReader()
      reader.onload = function (e) {
        resolve(e.target.result)
      }
      reader.onerror = function (e) {
        reject(`Error reading ${file.name}: ${e.target.result}`)
      }
      reader.readAsDataURL(file)
    })
  }

  function makeImage (fileReaderResult) {
    return new Promise(function (resolve, reject) {
      var img = new Image()
      img.onload = function () {
        resolve(img)
      }
      img.onerror = function (e) {
        reject('Error resizing image: ', e)
      }
      img.src = fileReaderResult
    })
  }

  function compressImage (img) {
    // Get image dimensions and calculate appropriate ratio to use
    var w = img.width
    var h = img.height
    var ratioWidth = w > config.maxWidth ? config.maxWidth / w : 1
    var ratioHeight = h > config.maxHeight ? config.maxHeight / h : 1
    var ratio = Math.min(ratioWidth, ratioHeight)
    // Calculate new dimensions
    var newWidth = Math.floor(w * ratio)
    var newHeight = Math.floor(h * ratio)
    // Draw canvas using new dimensions
    var canvas = document.createElement('canvas')
    canvas.width = newWidth
    canvas.height = newHeight
    var ctx = canvas.getContext('2d', {
      preserveDrawingBuffer: true
    })
    ctx.drawImage(img, 0, 0, newWidth, newHeight)
    // Turn canvas into file data
    var dataURL = canvas.toDataURL('image/jpeg', 0.5)
    var a = dataURL.split(',')[1]
    var blob = atob(a)
    let array = []
    for (let k = 0; k < blob.length; k++) {
      array.push(blob.charCodeAt(k))
    }
    var data = new Blob([new Uint8Array(array)], {
      type: 'image/jpeg'
    })
    return data
  }

  return function (file) {
    return readAsDataURL(file)
      .then(makeImage)
      .then(compressImage)
  }
}
