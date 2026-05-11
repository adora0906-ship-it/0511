let video;
let bodyPose;
let handPose;
let poses = [];
let hands = [];
let earringImages = [];
let currentEarring;

function preload() {
  // 載入 ml5.js 的 bodyPose 模型
  bodyPose = ml5.bodyPose();
  // 載入 ml5.js 的 handPose 模型
  handPose = ml5.handPose();
  
  // 載入所有耳環圖片
  earringImages[0] = loadImage('pic/acc1_ring.png');
  earringImages[1] = loadImage('pic/acc2_pearl.png');
  earringImages[2] = loadImage('pic/acc3_tassel.png');
  earringImages[3] = loadImage('pic/acc4_jade.png');
  earringImages[4] = loadImage('pic/acc5_phoenix.png');
  
  // 預設顯示第一個耳環
  currentEarring = earringImages[0];
}

function setup() {
  createCanvas(640, 480);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // 開始偵測人體姿勢與手勢
  bodyPose.detectStart(video, gotPoses);
  handPose.detectStart(video, gotHands);
}

function gotPoses(results) {
  poses = results;
}

function gotHands(results) {
  hands = results;
  // 如果偵測到手，計算手指數量並更換耳環
  if (hands.length > 0) {
    let count = countFingers(hands[0]);
    if (count >= 1 && count <= 5) {
      currentEarring = earringImages[count - 1];
    }
  }
}

function draw() {
  // 繪製攝影機畫面作為背景
  image(video, 0, 0, width, height);

  // 遍歷所有偵測到的人體
  if (poses.length > 0) {
    for (let i = 0; i < poses.length; i++) {
      let pose = poses[i];

      // 設定圖片繪製模式為中心對齊
      imageMode(CENTER);

      // 繪製耳環於左耳與右耳
      if (currentEarring) {
        if (pose.left_ear && pose.left_ear.confidence > 0.1) {
          image(currentEarring, pose.left_ear.x, pose.left_ear.y, 50, 50);
        }
        if (pose.right_ear && pose.right_ear.confidence > 0.1) {
          image(currentEarring, pose.right_ear.x, pose.right_ear.y, 50, 50);
        }
      }

      // 將 imageMode 恢復預設，以免影響下一幀的背景繪製
      imageMode(CORNER);
    }
  }
}

// 計算伸出的手指數量的簡單邏輯
function countFingers(hand) {
  let count = 0;
  let keypoints = hand.keypoints;

  // 拇指判定：根據手掌方向比較 X 座標 (簡化版)
  if (hand.handedness === 'Right') {
    if (keypoints[4].x < keypoints[3].x) count++;
  } else {
    if (keypoints[4].x > keypoints[3].x) count++;
  }

  // 食指、中指、無名指、小指判定：指尖 (Tip) Y 座標小於第二關節 (PIP) Y 座標即視為伸出
  // 食指: 8 vs 6, 中指: 12 vs 10, 無名指: 16 vs 14, 小指: 20 vs 18
  if (keypoints[8].y < keypoints[6].y) count++;
  if (keypoints[12].y < keypoints[10].y) count++;
  if (keypoints[16].y < keypoints[14].y) count++;
  if (keypoints[20].y < keypoints[18].y) count++;

  return count;
}