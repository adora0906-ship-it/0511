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

  // 設定攝影機參數，強制使用前鏡頭 (facingMode: user)
  let constraints = {
    video: {
      facingMode: "user",
      width: 640,
      height: 480
    }
  };
  capture = createCapture(constraints);
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
  background('#e7c6ff');

  // 檢查攝影機是否已就緒
  if (capture.width === 0) return;

  let w = width * 0.5;  // 影像寬度為畫布寬度的 50%
  let h = height * 0.5; // 影像高度為畫布高度的 50%
  let x = (width - w) / 2;  // 置中 X 座標
  let y = (height - h) / 2; // 置中 Y 座標

  // 繪製目前的狀態 (手機除錯用)
  fill(0);
  noStroke();
  textSize(16);
  textAlign(LEFT, TOP);
  let statusTxt = `Faces: ${faces.length}, Hands: ${hands.length}`;
  if (!isFaceModelReady || !isHandModelReady) statusTxt = "Loading AI Models...";
  text(statusTxt, 10, 10);

  // 偵測模型載入提示 (Debug 用)
  if (!isFaceModelReady || !isHandModelReady) {
    textAlign(CENTER);
    textSize(20);
    text("AI Models Loading...", width / 2, height / 2);
    return; // 模型還沒好就先不畫後面的東西
  }

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
    
    // 使用 capture.width/height 動態計算縮放，適應不同設備
    let scaleX = w / capture.width;
    let scaleY = h / capture.height;
    
    // 更精準的耳垂座標點 (MediaPipe 索引)
    // 左耳垂: 234, 右耳垂: 454 (比 132/361 更靠邊緣)
    let leftEar = face.keypoints[234] || face.keypoints[132];
    let rightEar = face.keypoints[454] || face.keypoints[361];

    // 取得當前手勢對應的耳環圖片
    let earringImg = earringImages[currentEarringIndex];
    
    // 檢查圖片是否成功載入 (防止寬度為 0 導致程式當機)
    if (earringImg && earringImg.width > 1) {
      let imgW = 40; 
      let imgH = earringImg.height * (imgW / earringImg.width);
      
      // 繪製左耳垂耳環
      image(earringImg, leftEar.x * scaleX - imgW / 2, leftEar.y * scaleY - imgH / 5, imgW, imgH);
      // 繪製右耳垂耳環
      image(earringImg, rightEar.x * scaleX - imgW / 2, rightEar.y * scaleY - imgH / 5, imgW, imgH);
    } else {
      // 如果圖片沒載入，畫黃色圓圈作為備案
      fill(255, 255, 0);
      noStroke();
      circle(leftEar.x * scaleX, leftEar.y * scaleY, 15);
      circle(rightEar.x * scaleX, rightEar.y * scaleY, 15);
    }
  }
  
  pop();
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小
  resizeCanvas(windowWidth, windowHeight);
}
