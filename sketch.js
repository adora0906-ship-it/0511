let capture;
let faceMesh;
let faces = [];
let earringImage; // 新增一個變數來儲存耳環圖片

function modelReady() {
  console.log("Model Ready!");
}

function preload() {
  // 在 setup() 之前載入圖片
  earringImage = loadImage('pic/acc1_ring.png');
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  // 隱藏預設的 HTML 影片元件，只在畫布上繪製
  capture.hide();

  // 初始化 faceMesh 模型
  faceMesh = ml5.faceMesh(modelReady);
  
  // 開始對攝影機影像進行連續偵測
  faceMesh.detectStart(capture, (results) => {
    faces = results;
  });
}

function draw() {
  // 設定背景顏色
  background('#e7c6ff');

  let w = width * 0.5;  // 影像寬度為畫布寬度的 50%
  let h = height * 0.5; // 影像高度為畫布高度的 50%
  let x = (width - w) / 2;  // 置中 X 座標
  let y = (height - h) / 2; // 置中 Y 座標

  push();
  // 移動座標系到影像右側邊界並進行水平翻轉 (左右顛倒)
  translate(x + w, y);
  scale(-1, 1);
  
  // 繪製攝影機影像
  image(capture, 0, 0, w, h);

  // 如果有偵測到臉部，繪製耳垂圓圈
  if (faces && faces.length > 0) {
    let face = faces[0];
    
    // 計算攝影機畫面到畫布顯示大小的縮放比例
    let scaleX = w / 640;
    let scaleY = h / 480;

    // 設定耳環圖片的顯示尺寸，可以根據需要調整
    let earringSize = 30; 
    let earringWidth = earringSize;
    let earringHeight = earringSize;
    
    // 繪製左耳垂的耳環圖片
    // 調整圖片位置使其中心對齊耳垂點
    image(earringImage, face.keypoints[132].x * scaleX - earringWidth / 2, face.keypoints[132].y * scaleY - earringHeight / 2, earringWidth, earringHeight);
    
    // 繪製右耳垂的耳環圖片
    // 調整圖片位置使其中心對齊耳垂點
    image(earringImage, face.keypoints[361].x * scaleX - earringWidth / 2, face.keypoints[361].y * scaleY - earringHeight / 2, earringWidth, earringHeight);
  }
  
  pop();
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
