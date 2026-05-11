let capture;
let faceMesh;
let faces = [];
let earringImages = [];
let currentEarringIndex = 0; // 預設顯示第一款
let isFaceModelReady = false;

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

  // 初始化 faceMesh 模型 (修正語法：最新版第一個參數通常為空或設定物件)
  faceMesh = ml5.faceMesh(() => {
    isFaceModelReady = true;
    modelReady();
  });

  // 開始持續偵測臉部
  faceMesh.detectStart(capture, (results) => {
    faces = results;
  });
}

function draw() {
  // 設定全螢幕背景顏色
  background('#e7c6ff');

  // 檢查攝影機是否已就緒
  if (capture.width === 0) return;

  // --- 計算相機影像的顯示尺寸和位置 ---
  // 恢復為螢幕寬高 50% 的影像框，並置中顯示
  let displayWidth = width * 0.5;
  let displayHeight = height * 0.5;
  let displayX = (width - displayWidth) / 2;
  let displayY = (height - displayHeight) / 2;

  // --- 繪製相機影像（左右翻轉）---
  push();
  translate(displayX + displayWidth, displayY);
  scale(-1, 1); // 水平翻轉
  image(capture, 0, 0, displayWidth, displayHeight);

  // --- 除錯與狀態顯示 (幫助檢查為什麼沒東西) ---
  pop(); // 暫時跳出翻轉座標系以繪製一般文字
  fill(0);
  noStroke();
  textSize(16);
  let status = isFaceModelReady ? `模型已就緒 | 偵測人臉數: ${faces.length}` : "模型載入中...";
  text(status, 20, 20);
  push(); // 回到翻轉座標系
  translate(displayX + displayWidth, displayY);
  scale(-1, 1);

  // --- 在耳垂位置繪製耳環 ---
  if (isFaceModelReady && faces.length > 0) {
    let face = faces[0];
    
    // 取得左右耳垂附近的主要特徵點
    let leftEar = face.keypoints[234];
    let rightEar = face.keypoints[454];

    if (leftEar && rightEar) {
      // 計算縮放比例
      let scaleX = displayWidth / capture.width;
      let scaleY = displayHeight / capture.height;

      // 取得當前選中的耳環圖片
      let img = earringImages[currentEarringIndex];
      if (img) {
        // 根據影像框寬度計算耳環顯示大小
        let imgW = displayWidth * 0.12; 
        let imgH = img.height * (imgW / img.width);

        // 繪製左右耳環 (微調 Y 座標偏移，讓它看起來是鉤在耳垂上)
        image(img, leftEar.x * scaleX - imgW / 2, leftEar.y * scaleY - imgH / 5, imgW, imgH);
        image(img, rightEar.x * scaleX - imgW / 2, rightEar.y * scaleY - imgH / 5, imgW, imgH);
      }
    }
  }

  pop();
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // 點擊滑鼠或觸控螢幕時，切換到下一款耳環
  currentEarringIndex = (currentEarringIndex + 1) % earringImages.length;
}
