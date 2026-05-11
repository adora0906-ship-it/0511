let capture;
let faceMesh;
let faces = [];

function modelReady() {
  console.log("Model Ready!");
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
  faceMesh = ml5.faceMesh(capture, modelReady);
  // 當偵測到臉部時，更新 faces 變數
  faceMesh.on("predict", results => {
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
  if (faces.length > 0) {
    let face = faces[0];
    // 取得耳垂的特徵點 (FaceMesh 索引: 左耳約 132, 右耳約 361)
    // 這裡的座標是相對於攝影機原始大小，需要縮放至畫布上的顯示大小
    let scaleX = w / capture.width;
    let scaleY = h / capture.height;

    fill(255, 255, 0); // 黃色
    noStroke();
    
    // 繪製左耳垂與右耳垂
    circle(face.scaledMesh[132][0] * scaleX, face.scaledMesh[132][1] * scaleY, 15);
    circle(face.scaledMesh[361][0] * scaleX, face.scaledMesh[361][1] * scaleY, 15);
  }
  
  pop();
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
