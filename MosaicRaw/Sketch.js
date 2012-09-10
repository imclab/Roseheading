var base = new Image();
base.src = "img/base.png";
var target = new Image();
target.src = "img/target.png";

var baseSmall, targetSmall;
var screenImageData;
var baseCanvas, baseImageData;
var positions;
var pw, ph, pn, pieceSize = 10;

function setup() {
  //frameRate = 60;
  pw = Math.floor(width / pieceSize);
  ph = Math.floor(height / pieceSize);
  pn = pw * ph;
  
  baseSmall = resizeArea(base, pw, ph);
  targetSmall = resizeArea(target, pw, ph);
  
  positions = findMosaic(baseSmall, targetSmall);
  
  screenImageData = ctx.createImageData(width, height);
  baseCanvas = imageToCanvas(base);
  baseImageData = getImageData(baseCanvas);
}

function draw() {
  /*
  for(i = 0; i < 10; ++i) {
    left = Math.floor(Math.random() * pn);
    right = Math.floor(Math.random() * pn);
    swap = positions[left];
    positions[left] = positions[right];
    positions[right] = swap;
  }
  */
  
  sw = Math.floor(width / pw);
  sh = Math.floor(height / ph);
  pi = 0;
  src = baseImageData.data;
  dst = screenImageData.data;
  stepSize = 4 * (width - sw);
  
  var cur, cx, cy, sx, sy, dx, dy, si, di, xx, yy;
  for (py = 0; py < ph; py++) {
    for (px = 0; px < pw; px++) {
      cur = positions[pi];
      cy = Math.floor(cur / pw);
      cx = cur - (cy * pw);
      sx = cx * sw, sy = cy * sh;
      dx = px * sw, dy = py * sh;
      
      // copy sw x sh pixels
      si = 4 * (sy * width + sx);
      di = 4 * (dy * width + dx);
      for(yy = 0; yy < sh; yy++) {
        for(xx = 0; xx < sw; xx++) {
          dst[di++] = src[si++];
          dst[di++] = src[si++];
          dst[di++] = src[si++];
          dst[di++] = 255; si++;
        }
        si += stepSize;
        di += stepSize;
      }
      
      pi++;
    }
  }
  ctx.putImageData(screenImageData, 0, 0);
  
  ctx.drawImage(baseSmall, 0, 0);
  ctx.drawImage(targetSmall, pw, 0);  
}

function createCanvas(width, height) {
  canvas = document.createElement('canvas');
  canvas.width = width, canvas.height = height;
  return canvas;
}

function imageToCanvas(src, width, height) {
  if(typeof(width)==='undefined') width = src.width;
  if(typeof(height)==='undefined') height = src.height;
  buffer = createCanvas(width, height);
  buffer.getContext('2d').drawImage(src, 0, 0, width, height);
  return buffer;
}

function getImageData(canvas) {
  return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
}

// resize an Image into an HTMLCanvasElement using area averaging
function resizeArea(src, dw, dh) {
  sw = src.width, sh = src.height;
  w = Math.floor(sw / dw), h = Math.floor(sh / dh);
  srcCanvas = imageToCanvas(src);
  dstCanvas = createCanvas(dw, dh);
  srcImageData = getImageData(srcCanvas);
  dstImageData = dstCanvas.getContext('2d').createImageData(dw, dh);
  srcData = srcImageData.data;
  dstData = dstImageData.data;
  i = 0;
  n = w * h;
  var x, y, j, stepSize, xx, yy;
  sum = new Array(3);
  for(y = 0; y < dh; y++) {
    for(x = 0; x < dw; x++) {
      sum[0] = 0, sum[1] = 0, sum[2] = 0;
      j = 4 * ((y * h * sw) + (x * w));
      stepSize = 4 * (sw - w);
      for(yy = 0; yy < h; yy++) {
        for(xx = 0; xx < w; xx++) {
          sum[0] += srcData[j++];
          sum[1] += srcData[j++];
          sum[2] += srcData[j++];
          j++;
        }
        j += stepSize;
      }      
      dstData[i] = sum[0] / n;
      dstData[i+1] = sum[1] / n;
      dstData[i+2] = sum[2] / n;
      dstData[i+3] = 255;
      i += 4;
    }
  }
  dstCanvas.getContext('2d').putImageData(dstImageData, 0, 0);
  return dstCanvas;
}  

function getLightness(src, i) {
  i *= 4;
  return (src[i] + src[i+1] + src[i+2]) / 3;
}

function flatten(nested) {
  flat = new Array();
  for(i = 0; i < nested.length; ++i) {
    for(j = 0; j < nested[i].length; ++j) {
      flat.push(nested[i][j]);
    }
  }
  return flat;
}

function findMosaic(src, dst) {
  positions = new Array(pn);
  srcData = getImageData(src).data;
  dstData = getImageData(dst).data;
  binCount = 256;
  srcBins = new Array(binCount);
  dstBins = new Array(binCount);
  for (i = 0; i < binCount; ++i) {
    srcBins[i] = new Array();
    dstBins[i] = new Array();
  }
  for (i = 0; i < pn; ++i) {
    srcBins[getLightness(srcData, i)|0].push(i);
    dstBins[getLightness(dstData, i)|0].push(i);
  }
  flatSrc = flatten(srcBins);
  flatDst = flatten(dstBins);
  for (i = 0; i < pn; ++i) {
    positions[flatDst[i]] = flatSrc[i];
  }  
  return positions;
}