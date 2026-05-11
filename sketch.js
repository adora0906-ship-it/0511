let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringImages = [];
let currentEarringIndex = 0; // 預設顯示第一款

function modelReady() {
  console.log("Model Ready!");
}

function preload() {
  // 預載 5 種耳環圖片
  earringImages[0] = loadImage('pic/acc1_ring.png');
  earringImages[1] = loadImage('pic/acc2_pearl.png');
  earringImages[2] = loadImage('pic/acc3_tassel.png');
  earringImages[3] = loadImage('pic/acc4_jade.png');
  earringImages[4] = loadImage('pic/acc5_phoenix.png');
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

  // 初始化 handPose 模型進行手勢辨識
  handPose = ml5.handPose(modelReady);
  handPose.detectStart(capture, (results) => {
    hands = results;
  });
}

function draw() {
  // 設定背景顏色
  background('#e7c6ff');

  let w = width * 0.5;  // 影像寬度為畫布寬度的 50%
  let h = height * 0.5; // 影像高度為畫布高度的 50%
  let x = (width - w) / 2;  // 置中 X 座標
  let y = (height - h) / 2; // 置中 Y 座標

  // 手勢辨識邏輯：計算伸出的手指數量來切換耳環
  if (hands && hands.length > 0) {
    let hand = hands[0];
    let count = 0;
    
    // 檢查四指 (食指 8, 中指 12, 無名指 16, 小指 20) 是否高於各自的關節 (6, 10, 14, 18)
    let tips = [8, 12, 16, 20];
    let joints = [6, 10, 14, 18];
    for (let i = 0; i < 4; i++) {
      if (hand.keypoints[tips[i]].y < hand.keypoints[joints[i]].y) count++;
    }
    // 檢查大拇指 (索引 4 vs 3)
    if (hand.keypoints[4].y < hand.keypoints[3].y) count++;

    // 如果手指數量在 1~5 之間，更新目前的耳環索引
    if (count >= 1 && count <= 5) {
      currentEarringIndex = count - 1;
    }
  }

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

    // 取得當前手勢對應的耳環圖片
    let earringImg = earringImages[currentEarringIndex];
    let imgW = 40; 
    let imgH = earringImg.height * (imgW / earringImg.width);
    
    // 繪製左耳垂耳環 (中心點對齊耳垂點，並稍微向上偏移讓掛鉤位置正確)
    image(earringImg, face.keypoints[132].x * scaleX - imgW / 2, face.keypoints[132].y * scaleY - imgH / 5, imgW, imgH);
    // 繪製右耳垂耳環
    image(earringImg, face.keypoints[361].x * scaleX - imgW / 2, face.keypoints[361].y * scaleY - imgH / 5, imgW, imgH);
  }
  
  pop();
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
