let capture;
let faceMesh;
let handPose;
let faces = [];
let hands = [];
let earringImages = [];
let currentEarringIndex = 0; // 預設顯示第一款
let isFaceModelReady = false;
let isHandModelReady = false;

function modelReady() {
  console.log("AI Model Ready!");
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

  // 恢復最穩定的影像擷取方式，並明確禁用音訊
  capture = createCapture(VIDEO, { audio: false });
  capture.size(640, 480);
  
  // 隱藏預設的 HTML 影片元件，只在畫布上繪製
  capture.hide();

  // 初始化 faceMesh 模型並標記完成
  faceMesh = ml5.faceMesh(() => {
    isFaceModelReady = true;
    modelReady();
  });
  
  // 開始對攝影機影像進行連續偵測
  faceMesh.detectStart(capture, (results) => {
    faces = results;
  });

  // 初始化 handPose 模型並標記完成
  handPose = ml5.handPose(() => {
    isHandModelReady = true;
    modelReady();
  });
  handPose.detectStart(capture, (results) => {
    hands = results;
  });
}

function draw() {
  // 設定全螢幕背景顏色
  background('#e7c6ff');

  // 檢查攝影機是否已就緒
  if (capture.width === 0) return;

  // 如果模型還沒準備好，顯示載入文字
  if (!isFaceModelReady || !isHandModelReady) {
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("AI 模型載入中...", width / 2, height / 2);
    return;
  }

  // --- 手勢辨識邏輯：計算伸出的手指數量來切換耳環 ---
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

  // --- 計算相機影像的顯示尺寸和位置 ---
  // 相機影像大小為全螢幕的 50%，並置中顯示
  let displayWidth = width * 0.5;
  let displayHeight = height * 0.5;
  let displayX = (width - displayWidth) / 2;
  let displayY = (height - displayHeight) / 2;

  // --- 繪製相機影像（左右翻轉）---
  push();
  translate(displayX + displayWidth, displayY);
  scale(-1, 1); // 水平翻轉
  image(capture, 0, 0, displayWidth, displayHeight);
  pop();

  // --- 如果有偵測到臉部，在耳垂上顯示黃色圓圈和耳環 ---
  if (faces && faces.length > 0) {
    let face = faces[0];
    
    // 計算縮放比例，將 faceMesh 的座標對應到實際顯示的影像位置
    let scaleX = displayWidth / capture.width;
    let scaleY = displayHeight / capture.height;
    
    // 耳垂座標點 (MediaPipe faceMesh 索引)
    // 左耳垂: 234, 右耳垂: 454
    let leftEar = face.keypoints[234] || face.keypoints[132];
    let rightEar = face.keypoints[454] || face.keypoints[361];

    // 因為影像是左右翻轉的，需要調整 x 座標
    let leftEarX = displayX + (capture.width - leftEar.x) * scaleX;
    let leftEarY = displayY + leftEar.y * scaleY;
    let rightEarX = displayX + (capture.width - rightEar.x) * scaleX;
    let rightEarY = displayY + rightEar.y * scaleY;

    // 取得當前手勢對應的耳環圖片
    let earringImg = earringImages[currentEarringIndex];
    
    // 耳環大小（相對於顯示的影像大小）
    let earringSize = displayWidth * 0.08;
    
    // 先繪製黃色圓圈
    fill(255, 255, 0);
    noStroke();
    circle(leftEarX, leftEarY, 20);
    circle(rightEarX, rightEarY, 20);

    // 檢查圖片是否成功載入並繪製耳環
    if (earringImg && earringImg.width > 1) {
      let imgW = earringSize;
      let imgH = earringImg.height * (imgW / earringImg.width);
      
      // 繪製左耳垂耳環
      image(earringImg, leftEarX - imgW / 2, leftEarY - imgH / 5, imgW, imgH);
      // 繪製右耳垂耳環
      image(earringImg, rightEarX - imgW / 2, rightEarY - imgH / 5, imgW, imgH);
    }
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
