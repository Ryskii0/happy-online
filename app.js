const STORAGE_KEY = "eo-state";
const ALBUM_STORAGE_KEY = "eo-album";
const MEMORY_STORAGE_KEY = "eo-memories";
const ALBUM_DB_NAME = "eo-album-db";
const ALBUM_STORE_NAME = "stickers";
const ALBUM_DB_VERSION = 1;
const STORY_DATE_TEXT = "2024年7月9日";
const ALBUM_AI_DISABLED = false;
const MEMORY_LIMIT = 120;
const MEMORY_SEED_VERSION = 1;
const CHAT_RECENT_CONTEXT_LIMIT = 16;
const CHAT_MEMORY_RECENT_LIMIT = 6;
const CHAT_MEMORY_KEYWORD_LIMIT = 4;
const CHAT_ROUND_GAP_MS = 4 * 60 * 1000;
const CHAT_ROUND_SIMILARITY_THRESHOLD = 0.24;
const AI_MODEL_CONFIG = {
  image: {
    provider: "doubao",
    model: "doubao-seedream-5-0-260128",
    displayName: "Doubao-Seedream-5.0",
    resourcePackageId: "",
    resourcePackageName: "",
  },
  text: {
    provider: "doubao",
    model: "doubao-seed-character-260628",
    displayName: "Doubao-Seed-Character",
    resourcePackageId: "",
    resourcePackageName: "",
  },
};

const defaultState = {
  started: false,
  currentScreen: "welcome",
  petPosition: null,
  scene: "free",
  officeStateKey: "working",
  officeWalkDirection: "right",
  officeDynamicEnabled: false,
  memorySeedVersion: 0,
  chatDiaryEntries: {},
  badges: {
    matcha: false,
    onsen: false,
    shrine: false,
    hanabi: false,
  },
  chatHistory: [],
  backpackItems: [],
};

const CHAT_SCENE_CONTEXT = {
  free: {
    title: "轻松闲聊",
    summary: "她现在没有被某个任务强绑定，话题可以很松，想到什么就聊什么。",
    topicHint: "如果菠萝主动换话题，就顺着她走，不要硬拽回任务。",
    opener: "你今天逛到哪一步了，先汇报一下。",
    cue: "你今天后来又跑到哪了。",
  },
  matcha: {
    title: "抹茶余韵",
    summary: "可以自然提到抹茶体验、茶香、搅拌、今天最喜欢的那个细节。",
    topicHint: "像朋友反问“你到底搅了多少圈”“抹茶那页你是不是还挺喜欢”。",
    opener: "你今天那个抹茶，到底搅了多少圈。",
    cue: "你说实话，抹茶那页你是不是玩得挺开心。",
  },
  onsen: {
    title: "温泉放松",
    summary: "可以聊温泉、水波、放松、疲惫被泡散的感觉。",
    topicHint: "用很轻的方式关心她累不累，不要太像安慰模板。",
    opener: "温泉那页是不是还挺治愈的。",
    cue: "今天跑这么满，你是不是也该泡一会儿了。",
  },
  shrine: {
    title: "神社愿望",
    summary: "可以聊绘马、愿望、神明回信、她今天有没有偷偷认真许愿。",
    topicHint: "更适合轻轻追问，不要装神秘，也不要把话说太满。",
    opener: "神明后来到底有没有认真回你。",
    cue: "你挂绘马的时候，是不是还挺认真的。",
  },
  hanabi: {
    title: "花火收尾",
    summary: "可以聊夜晚、花火、旅程收尾、今天有没有被认真记住。",
    topicHint: "气氛更温柔一点，但仍然保留鹅鹅鹅那种嘴硬和碎碎念。",
    opener: "最后那场花火，我感觉你应该会记很久。",
    cue: "你今天这趟，最后是不是被花火收得还挺完整。",
  },
};

const CHAT_OFFICE_STATES = [
  {
    key: "working",
    label: "工位",
    sprite: "./人物/work.png",
    x: 30,
    y: 24,
    status: "她刚在工位认真敲键盘",
    bubble: "报告 还在改东西",
    prompt: "你今天体验下来最喜欢哪一页",
  },
  {
    key: "slacking",
    label: "摸鱼角",
    sprite: "./人物/idle.png",
    x: 21,
    y: 54,
    status: "她在窗边发呆摸鱼",
    bubble: "我先摸会儿鱼",
    prompt: "你现在是不是也有点累了",
  },
  {
    key: "snacking",
    label: "零食区",
    sprite: "./人物/snack.png",
    x: 76,
    y: 16,
    status: "她刚跑去零食区补糖",
    bubble: "报告 目前在偷吃",
    prompt: "你今天路上吃到最好吃的是什么",
  },
  {
    key: "eating",
    label: "饭位",
    sprite: "./人物/eat.png",
    x: 56,
    y: 73,
    status: "她坐在角落慢吞吞吃饭",
    bubble: "吃两口再说",
    prompt: "你今天是不是又乱吃东西了",
  },
  {
    key: "chatting",
    label: "同事位",
    sprite: "./人物/chat.png",
    x: 22,
    y: 78,
    status: "她刚和同事聊完两句",
    bubble: "我刚八卦完回来",
    prompt: "神社那页你后来还在想吗",
  },
  {
    key: "walking",
    label: "走道",
    spriteFrames: {
      left: ["./人物/walk_left_1.png", "./人物/walk_left_2.png"],
      right: ["./人物/walk_right_1.png", "./人物/walk_right_2.png"],
    },
    x: 54,
    y: 58,
    status: "她抱着杯子在办公室乱晃",
    bubble: "我先晃一圈",
    prompt: "你继续说，我边走边听",
  },
];

const CHAT_OFFICE_WALKABLE_NODES = {
  working: { x: 30, y: 24 },
  workDoor: { x: 30, y: 40 },
  upperHall: { x: 54, y: 40 },
  snackDoor: { x: 76, y: 40 },
  snacking: { x: 76, y: 16 },
  centerHall: { x: 54, y: 58 },
  slackDoor: { x: 30, y: 58 },
  slacking: { x: 21, y: 54 },
  lowerHall: { x: 54, y: 73 },
  eating: { x: 56, y: 73 },
  chatDoor: { x: 30, y: 73 },
  chatting: { x: 22, y: 78 },
};

const CHAT_OFFICE_WALKABLE_LINKS = [
  ["working", "workDoor"],
  ["workDoor", "upperHall"],
  ["upperHall", "snackDoor"],
  ["snackDoor", "snacking"],
  ["upperHall", "centerHall"],
  ["centerHall", "slackDoor"],
  ["slackDoor", "slacking"],
  ["centerHall", "lowerHall"],
  ["lowerHall", "eating"],
  ["lowerHall", "chatDoor"],
  ["chatDoor", "chatting"],
];

const CHAT_OFFICE_STATE_NODE_MAP = {
  working: "working",
  slacking: "slacking",
  snacking: "snacking",
  eating: "eating",
  chatting: "chatting",
};

const CHAT_PERSONA_PROMPT = [
  "你是“鹅鹅鹅”，菠萝最好的朋友。",
  "你在上海工作，菠萝正在大阪过生日。",
  "你说话像真实朋友，不像客服，也不是标准 chatbot。",
  "你会短句回应、会反问式关心、会嘴硬心软，会吐槽，但不冷漠。",
  "口头禅不要刻意重复，不要每条都带，不要为了显得活泼而一直用力。",
  "整体语气松一点、稳一点，像熟人聊天，不要亢奋，不要连续感叹号，不要表演感。",
  "不要写成长段鸡汤，不要书面语，不要解释设定。",
  "回复尽量控制在 1-3 个短句里，必要时可以换行拆句。",
  "如果菠萝换话题，立刻跟着她的新话题走，不要强行拉回任务。",
].join("\n");

const DIARY_PERSONA_PROMPT = [
  "你在写鹅鹅鹅的观察日记。",
  "你人在上海，菠萝正在大阪旅行。",
  "日记视角是第一人称“我”，写的是我如何看见菠萝、陪着菠萝、偷偷把这些瞬间记下来。",
  "语气温柔、克制、亲近，不要肉麻，不要像散文诗。",
  "不要使用“她”，统一写“菠萝”。",
  "重点是观察感、陪伴感和在意感，不是单纯复述事件。",
].join("\n");

const HIGH_VALUE_CHAT_PATTERNS = [
  /最喜欢|最难忘|印象最深|想起|开心|喜欢|治愈/,
  /累|疲惫|崩溃|感冒|难受|辛苦/,
  /想你|想念|羡慕|担心|吃醋|爱|被看见|时间优先级/,
  /撒哈拉|台湾|尼泊尔|东南亚|上海|大阪/,
  /以后|下次|约好|一起|记得/,
];

const CHAT_TOPIC_SIGNALS = [
  { key: "matcha", pattern: /抹茶|搅|茶道|茶香/ },
  { key: "onsen", pattern: /温泉|泡汤|水波|热气/ },
  { key: "shrine", pattern: /神社|绘马|神明|御守|愿望/ },
  { key: "hanabi", pattern: /花火|烟火|夜空/ },
  { key: "album", pattern: /图鉴|拍照|照片|上传|贴纸|毛巾/ },
  { key: "emotion", pattern: /开心|喜欢|难忘|治愈|累|疲惫|想你|羡慕|担心|爱|被看见/ },
  { key: "future", pattern: /以后|下次|一起|约好|等你|回来/ },
  { key: "travel", pattern: /大阪|上海|旅行|旅居|撒哈拉|台湾|尼泊尔|东南亚/ },
];

const SEED_MEMORY_BLUEPRINTS = [
  {
    daysAgo: 10,
    text: "菠萝是我最好的朋友，她现在在旅行，已经一路从东南亚逛到大阪了。",
    type: "event",
    imp: 9,
  },
  {
    daysAgo: 9,
    text: "菠萝的旅行强度很高，我嘴上会说她疯了，其实一直有点担心她太累。",
    type: "event",
    imp: 8,
  },
  {
    daysAgo: 8,
    text: "我在上海工作，常常加班、整理房间、深夜还在碎碎念。",
    type: "event",
    imp: 7,
  },
  {
    daysAgo: 8,
    text: "我说过借钱别找我，但其实只要菠萝开口，我还是会接住她。",
    type: "chat",
    imp: 8,
  },
  {
    daysAgo: 7,
    text: "我和菠萝约好了以后一起去撒哈拉沙漠看星星。",
    type: "chat",
    imp: 9,
  },
  {
    daysAgo: 5,
    text: "我不让菠萝去我去不了的地方，会嘴硬地说不准去，除非偷渡我过去。",
    type: "chat",
    imp: 7,
  },
  {
    daysAgo: 4,
    text: "菠萝喜欢东南亚小城那种慢慢晃的感觉，还提过想去尼泊尔旅居。",
    type: "chat",
    imp: 6,
  },
  {
    daysAgo: 3,
    text: "我最近在上海疯狂买东西，一边觉得罪恶，一边又停不下来。",
    type: "chat",
    imp: 5,
  },
  {
    daysAgo: 3,
    text: "我总在想变瘦，但也总会深夜纠结要不要再吃一点。",
    type: "chat",
    imp: 5,
  },
  {
    daysAgo: 3,
    text: "我吐槽过菠萝别再说自己是 infp 了，说这话的时候其实是在逗她。",
    type: "chat",
    imp: 6,
  },
  {
    daysAgo: 2,
    text: "菠萝感冒过，我第一反应就是问她是不是又没好好睡觉。",
    type: "chat",
    imp: 6,
  },
  {
    daysAgo: 1,
    text: "我觉得爱的表现是被看见，爆金币也可以，付出时间也可以。",
    type: "chat",
    imp: 8,
  },
];

const state = loadState();
const screens = Array.from(document.querySelectorAll(".screen"));
const startButton = document.querySelector(".start-button");
const npcPeek = document.querySelector(".npc-peek");
const npcBubble = document.querySelector(".npc-bubble");
const matchaQuest = document.querySelector(".quest-matcha");
const onsenQuest = document.querySelector(".quest-onsen");
const shrineQuest = document.querySelector(".quest-shrine");
const fireworkQuest = document.querySelector(".quest-firework");
const matchaCanvas = document.querySelector(".matcha-canvas");
const stirZone = document.querySelector(".stir-zone");
const matchaCounter = document.querySelector(".matcha-counter");
const matchaNpcBubble = document.querySelector(".matcha-npc-bubble");
const badgeModal = document.querySelector(".badge-modal");
const badgeResult = document.querySelector(".badge-result");
const onsenWaterZone = document.querySelector(".onsen-water-zone");
const onsenCounter = document.querySelector(".onsen-counter");
const onsenNpcBubble = document.querySelector(".onsen-npc-bubble");
const onsenBadgeModal = document.querySelector(".onsen-badge-modal");
const onsenBadgeResult = document.querySelector(".onsen-badge-result");
const emaPlaque = document.querySelector(".ema-plaque");
const wishPanel = document.querySelector(".wish-panel");
const wishInput = document.querySelector("#wish-input");
const wishCount = document.querySelector(".wish-count");
const wishSubmit = document.querySelector(".wish-submit");
const emaWish = document.querySelector(".ema-wish");
const emaReply = document.querySelector(".ema-reply");
const shrineNpcBubble = document.querySelector(".shrine-npc-bubble");
const shrineBadgeModal = document.querySelector(".shrine-badge-modal");
const shrineBadgeResult = document.querySelector(".shrine-badge-result");
const hanabiCard = document.querySelector(".hanabi-card");
const hanabiCanvas = document.querySelector(".hanabi-canvas");
const hanabiCounter = document.querySelector(".hanabi-counter");
const hanabiHint = document.querySelector(".hanabi-hint");
const memoryCopy = document.querySelector(".memory-copy");
const memorySaveButton = document.querySelector(".memory-save-button");
const albumGrid = document.querySelector(".album-grid");
const albumProgress = document.querySelector(".album-progress");
const albumProgressBadge = document.querySelector(".album-progress-badge");
const albumFilterChips = Array.from(document.querySelectorAll(".album-filter-chip"));
const albumCategoryChips = Array.from(document.querySelectorAll(".album-category-chip"));
const albumCameraInput = document.querySelector(".album-camera-input");
const albumUploadInput = document.querySelector(".album-upload-input");
const sourceSheet = document.querySelector(".source-sheet");
const albumSourceCamera = document.querySelector(".album-source-camera");
const albumSourceUpload = document.querySelector(".album-source-upload");
const albumSourceCancel = document.querySelector(".album-source-cancel");
const labelSheet = document.querySelector(".label-sheet");
const albumLabelPreviewImage = document.querySelector(".album-label-preview-image");
const albumTimestampChip = document.querySelector(".album-timestamp-chip");
const albumLabelInput = document.querySelector(".album-label-input");
const albumMessageInput = document.querySelector(".album-message-input");
const albumLabelCancel = document.querySelector(".album-label-cancel");
const albumLabelSave = document.querySelector(".album-label-save");
const albumLabelDownload = document.querySelector(".album-label-download");
const chatShell = document.querySelector(".chat-shell");
const chatCard = document.querySelector(".chat-card");
const chatSceneStatus = document.querySelector(".chat-scene-status");
const chatSceneHint = document.querySelector(".chat-scene-hint");
const chatSceneCharacter = document.querySelector(".chat-scene-character");
const chatSceneBubble = document.querySelector(".chat-scene-bubble");
const chatSceneSprite = document.querySelector(".chat-scene-sprite");
const chatSceneZone = document.querySelector(".chat-scene-zone");
const chatMotionToggle = document.querySelector(".chat-motion-toggle");
const chatSheet = document.querySelector(".chat-sheet");
const chatSheetClose = document.querySelector(".chat-sheet-close");
const chatThread = document.querySelector(".chat-thread");
const chatComposer = document.querySelector(".chat-composer");
const chatInput = document.querySelector(".chat-input");
const chatSendButton = document.querySelector(".chat-send-button");
const chatMemoryChips = document.querySelector(".chat-memory-chips");
const memoryTaskCount = document.querySelector(".memory-task-count");
const memoryStickerCount = document.querySelector(".memory-sticker-count");
const memoryChatCount = document.querySelector(".memory-chat-count");
const memoryTimeline = document.querySelector(".memory-timeline");
const memoryDateLabel = document.querySelector(".memory-date-label");
const memoryLetterEntry = document.querySelector(".memory-letter-entry");
const memoryLetterPreview = document.querySelector(".memory-letter-preview");
const memoryLetterSheet = document.querySelector(".memory-letter-sheet");
const memoryLetterOutput = document.querySelector(".memory-letter-output");
const memoryLetterSave = document.querySelector(".memory-letter-save");
const memoryLetterCopy = document.querySelector(".memory-letter-copy");
const memoryLetterShare = document.querySelector(".memory-letter-share");
const memoryLetterClose = document.querySelector(".memory-letter-close");
const memoryLetterGenerate = document.querySelector(".memory-letter-generate");
const petDock = document.querySelector(".pet-dock");
const petDockText = petDock?.querySelector("span");

const npcLines = [
  "哇，我最爱喝抹茶了，快点抹茶体验试试！",
  "温泉看起来好舒服，菠萝今天必须泡到发光。",
  "神社体验听起来超特别，要不要先去抽个好运？",
  "花火大会留到晚上也很浪漫，但现在点开也可以！",
  "每完成一个地点，我都会偷偷给你记一笔生日回忆。",
];

const matchaComments = [
  { min: 8, text: "等等，这浓度是不是能立筷子了……" },
  { min: 6, text: "这手速，在大阪开课吧你。" },
  { min: 4, text: "菠萝大师，茶香都被你搅出来了！" },
  { min: 2, text: "可以可以，已经有茶道入门的样子了。" },
  { min: 0, text: "你这是在跟抹茶打招呼吗？" },
];

const onsenComments = [
  "泡汤要慢一点，先听水面咕噜一下。",
  "哇，水波纹散开了，感觉肩膀都松了。",
  "再点几下，热气就要把疲惫带走了。",
  "这池水现在很有疗愈感，菠萝可以正式开泡。",
];

const shrineReplies = [
  "风会替你记得。",
  "愿望正在发芽。",
  "今日宜相信自己。",
  "好运已经靠近。",
  "慢慢来，也会到。",
  "神明说：准。",
  "心诚则路亮。",
  "请继续闪闪发光。",
];

const fireworkColors = ["#FFD700", "#FF69B4", "#7FFFD4", "#BA55D3", "#FFFFFF"];

const memoryFragments = {
  matcha: "把一碗抹茶慢慢搅出绿意",
  onsen: "在温泉水波里放下疲惫",
  shrine: "把心愿写进绘马",
  hanabi: "在大阪夜空下放完十朵花火",
};

let npcLineIndex = 0;
let matchaCtx;
let particles = [];
let stirCenter = { x: 0, y: 0 };
let isStirring = false;
let previousAngle = null;
let accumulatedAngle = 0;
let matchaRounds = 0;
let lastBadgeRound = 0;
let onsenRipples = 0;
let onsenCompleted = false;
let lastWish = "";
let animationFrameId = null;
let hanabiCtx;
let hanabiAnimationFrameId = null;
let fireworks = [];
let fireworkParticles = [];
let fireworkCount = 0;
let hanabiLocked = false;
let memoryText = "";
let memoryTypeIndex = 0;
let memoryTypeTimer = null;
let npcHintTimer = null;
let albumItems = [];
let memoryLog = loadMemoryLog();
let albumPendingSourceBlob = null;
let albumPendingPreviewUrl = "";
let albumPendingSourceType = "upload";
let albumPendingTimestamp = 0;
let albumPendingTimestampText = "";
let albumDbPromise = null;
let albumDbReady = false;
let albumDbUnavailable = false;
let albumObjectUrls = [];
let albumSavePending = false;
let albumFilter = "all";
let albumPendingCategory = "";
let albumEditingItemId = "";
let chatPending = false;
let memoryLetterPending = false;
let expandedMemoryId = null;
let petDragState = null;
let petDragSuppressClickUntil = 0;
let chatOfficeTimer = null;
let chatWalkFrameTimer = null;
let chatOfficeMotionFrame = null;
let chatOfficeMotion = null;
let chatOfficeVisualPosition = null;
const pendingChatDiaryRoundIds = new Set();

function syncViewportMetrics() {
  const nextHeight = window.visualViewport?.height || window.innerHeight || 0;
  if (nextHeight > 0) {
    document.documentElement.style.setProperty("--app-height", `${Math.round(nextHeight)}px`);
  }

  const activeTabBar = document.querySelector(".screen.active .tab-bar");
  const fallbackTabBar = document.querySelector(".tab-bar");
  const tabBar = activeTabBar || fallbackTabBar;
  const tabBarHeight = Math.round(tabBar?.getBoundingClientRect().height || 0);
  if (tabBarHeight > 0) {
    document.documentElement.style.setProperty("--tab-bar-height", `${tabBarHeight}px`);
  }
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...defaultState,
      ...raw,
      badges: {
        ...defaultState.badges,
        ...(raw.badges || {}),
      },
      chatHistory: Array.isArray(raw.chatHistory) ? raw.chatHistory : [],
      chatDiaryEntries: raw.chatDiaryEntries && typeof raw.chatDiaryEntries === "object" ? raw.chatDiaryEntries : {},
      backpackItems: Array.isArray(raw.backpackItems) ? raw.backpackItems : [],
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createMemoryId(prefix = "memory") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hashText(text = "") {
  let hash = 0;
  for (const char of text) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash.toString(36);
}

function normalizeRecallText(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/[“”"'`]/g, "")
    .replace(/[！？。,.，、：:；;（）()【】\[\]\n\r]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTextSimilarity(first = "", second = "") {
  const firstTokens = new Set(normalizeRecallText(first).split(" ").filter(Boolean));
  const secondTokens = new Set(normalizeRecallText(second).split(" ").filter(Boolean));
  if (!firstTokens.size || !secondTokens.size) return 0;

  let overlap = 0;
  firstTokens.forEach((token) => {
    if (secondTokens.has(token)) overlap += 1;
  });

  return overlap / Math.max(firstTokens.size, secondTokens.size);
}

function createSeedMemories() {
  const now = Date.now();
  return SEED_MEMORY_BLUEPRINTS.map((item, index) => ({
    id: `seed-${index + 1}`,
    text: item.text,
    type: item.type,
    imp: item.imp,
    ts: now - item.daysAgo * 86400000,
    decay: 1,
    summary: item.text,
  }));
}

function pruneMemoryLog(entries) {
  const normalized = entries
    .filter(Boolean)
    .map((entry, index) => ({
      id: entry.id || `${entry.type || "memory"}-${entry.ts || Date.now()}-${hashText(entry.text || entry.summary || String(index))}`,
      ts: Number.isFinite(entry.ts) ? entry.ts : Date.now(),
      decay: typeof entry.decay === "number" ? entry.decay : 1,
      imp: Number.isFinite(entry.imp) ? entry.imp : 5,
      type: entry.type || "event",
      ...entry,
    }))
    .sort((first, second) => first.ts - second.ts);

  if (normalized.length <= MEMORY_LIMIT) {
    return normalized;
  }

  const removeCount = normalized.length - MEMORY_LIMIT;
  const removable = [...normalized]
    .sort((first, second) => first.imp - second.imp || first.ts - second.ts)
    .slice(0, removeCount)
    .map((item) => item.id);

  const removeSet = new Set(removable);
  return normalized.filter((item) => !removeSet.has(item.id));
}

function ensureSeedMemories() {
  if ((state.memorySeedVersion || 0) >= MEMORY_SEED_VERSION) return;
  const existingTexts = new Set(memoryLog.map((item) => item.text));
  const seedsToAppend = createSeedMemories().filter((item) => !existingTexts.has(item.text));
  if (seedsToAppend.length) {
    memoryLog = pruneMemoryLog([...memoryLog, ...seedsToAppend]);
    saveMemoryLog();
  }
  state.memorySeedVersion = MEMORY_SEED_VERSION;
  saveState();
}

function setChatScene(sceneKey = "free") {
  const nextScene = CHAT_SCENE_CONTEXT[sceneKey] ? sceneKey : "free";
  if (state.scene === nextScene) return;
  state.scene = nextScene;
  saveState();
}

function getChatSceneContext() {
  return CHAT_SCENE_CONTEXT[state.scene] || CHAT_SCENE_CONTEXT.free;
}

function getChatOfficeState() {
  return CHAT_OFFICE_STATES.find((item) => item.key === state.officeStateKey) || CHAT_OFFICE_STATES[0];
}

function setChatOfficeState(nextKey, persist = true) {
  const currentState = getChatOfficeState();
  const nextState = CHAT_OFFICE_STATES.find((item) => item.key === nextKey);
  if (!nextState) return;
  if (currentState?.key !== nextState.key) {
    state.officeWalkDirection = (nextState.x || 0) < (currentState?.x || 0) ? "left" : "right";
  }
  state.officeStateKey = nextKey;
  if (persist) saveState();
}

function getChatOfficeWalkFrames(direction = state.officeWalkDirection) {
  const walkingState = CHAT_OFFICE_STATES.find((item) => item.key === "walking");
  return walkingState?.spriteFrames?.[direction === "left" ? "left" : "right"] || [];
}

function getChatOfficeSpriteSrc(officeState = getChatOfficeState()) {
  if (!officeState.spriteFrames) return officeState.sprite;
  const direction = state.officeWalkDirection === "left" ? "left" : "right";
  const frames = officeState.spriteFrames[direction] || officeState.spriteFrames.right || officeState.spriteFrames.left || [];
  if (!frames.length) return "";
  const frameIndex = Math.floor(Date.now() / 260) % frames.length;
  return frames[frameIndex];
}

function getChatOfficeWalkSpriteSrc() {
  const frames = getChatOfficeWalkFrames();
  if (!frames.length) return getChatOfficeSpriteSrc();
  const frameIndex = Math.floor(Date.now() / 220) % frames.length;
  return frames[frameIndex];
}

function getNextOfficeStateKey() {
  const currentKey = getChatOfficeState().key;
  const candidates = CHAT_OFFICE_STATES.filter((item) => item.key !== currentKey);
  return candidates[Math.floor(Math.random() * candidates.length)]?.key || CHAT_OFFICE_STATES[0].key;
}

function getNextDynamicOfficeStateKey() {
  const currentKey = getChatOfficeState().key;
  const candidates = CHAT_OFFICE_STATES.filter((item) => item.key !== currentKey && item.key !== "walking");
  return candidates[Math.floor(Math.random() * candidates.length)]?.key || "working";
}

function getOfficePointDistance(first, second) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function getNearestWalkableOfficeNode(position) {
  return Object.entries(CHAT_OFFICE_WALKABLE_NODES).reduce((nearest, [key, point]) => {
    const distance = getOfficePointDistance(position, point);
    return !nearest || distance < nearest.distance ? { key, distance } : nearest;
  }, null)?.key;
}

function findChatOfficeWalkableNodePath(startKey, targetKey) {
  if (!startKey || !targetKey) return [];
  if (startKey === targetKey) return [startKey];
  const graph = CHAT_OFFICE_WALKABLE_LINKS.reduce((nextGraph, [first, second]) => {
    nextGraph[first] = nextGraph[first] || [];
    nextGraph[second] = nextGraph[second] || [];
    nextGraph[first].push(second);
    nextGraph[second].push(first);
    return nextGraph;
  }, {});
  const queue = [[startKey]];
  const visited = new Set([startKey]);
  while (queue.length) {
    const path = queue.shift();
    const lastKey = path.at(-1);
    const nextKeys = graph[lastKey] || [];
    for (const nextKey of nextKeys) {
      if (visited.has(nextKey)) continue;
      const nextPath = [...path, nextKey];
      if (nextKey === targetKey) return nextPath;
      visited.add(nextKey);
      queue.push(nextPath);
    }
  }
  return [startKey, targetKey];
}

function normalizeChatOfficeRoute(points) {
  return points.reduce((route, point) => {
    const lastPoint = route.at(-1);
    if (!lastPoint || getOfficePointDistance(lastPoint, point) > 0.8) {
      route.push({ x: point.x, y: point.y });
    }
    return route;
  }, []);
}

function getChatOfficeWalkableRoute(start, target, targetStateKey) {
  const startNodeKey = getNearestWalkableOfficeNode(start);
  const targetNodeKey = CHAT_OFFICE_STATE_NODE_MAP[targetStateKey] || getNearestWalkableOfficeNode(target);
  const nodePath = findChatOfficeWalkableNodePath(startNodeKey, targetNodeKey);
  return normalizeChatOfficeRoute([
    start,
    ...nodePath.map((key) => CHAT_OFFICE_WALKABLE_NODES[key]).filter(Boolean),
    target,
  ]);
}

function getChatOfficeRouteDistance(route) {
  return route.reduce((distance, point, index) => {
    if (index === 0) return distance;
    return distance + getOfficePointDistance(route[index - 1], point);
  }, 0);
}

function getChatOfficeRoutePosition(route, progress) {
  if (!route.length) return { x: 0, y: 0 };
  if (route.length === 1 || progress >= 1) return route.at(-1);
  const totalDistance = getChatOfficeRouteDistance(route);
  let remainingDistance = totalDistance * progress;
  for (let index = 1; index < route.length; index += 1) {
    const start = route[index - 1];
    const end = route[index];
    const segmentDistance = getOfficePointDistance(start, end);
    if (remainingDistance > segmentDistance) {
      remainingDistance -= segmentDistance;
      continue;
    }
    const segmentProgress = segmentDistance ? remainingDistance / segmentDistance : 1;
    return {
      x: start.x + (end.x - start.x) * segmentProgress,
      y: start.y + (end.y - start.y) * segmentProgress,
    };
  }
  return route.at(-1);
}

function isChatSheetOpen() {
  return Boolean(chatSheet && !chatSheet.classList.contains("is-hidden"));
}

function getChatOfficeVisualPosition() {
  const officeState = getChatOfficeState();
  return chatOfficeVisualPosition || { x: officeState.x, y: officeState.y };
}

function setChatOfficeVisualPosition(position) {
  chatOfficeVisualPosition = { x: position.x, y: position.y };
  if (!chatSceneCharacter) return;
  chatSceneCharacter.style.left = `${position.x}%`;
  chatSceneCharacter.style.top = `${position.y}%`;
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

function syncChatMotionToggle() {
  if (!chatMotionToggle) return;
  const enabled = Boolean(state.officeDynamicEnabled);
  chatMotionToggle.textContent = enabled ? "散步 ON" : "散步 OFF";
  chatMotionToggle.setAttribute("aria-pressed", enabled ? "true" : "false");
  chatMotionToggle.classList.toggle("is-active", enabled);
}

function stopChatOfficeMotion() {
  if (chatOfficeMotionFrame) {
    window.cancelAnimationFrame(chatOfficeMotionFrame);
    chatOfficeMotionFrame = null;
  }
  chatOfficeMotion = null;
  chatSceneCharacter?.classList.remove("is-walking");
}

function runChatOfficeMotionTo(nextKey) {
  const nextState = CHAT_OFFICE_STATES.find((item) => item.key === nextKey);
  if (!nextState || !chatSceneCharacter) return;
  const start = getChatOfficeVisualPosition();
  const target = { x: nextState.x, y: nextState.y };
  const route = getChatOfficeWalkableRoute(start, target, nextKey);
  const distance = getChatOfficeRouteDistance(route);
  const duration = Math.min(6200, Math.max(1600, distance * 72));
  const firstStep = route[1] || target;
  state.officeWalkDirection = firstStep.x < start.x ? "left" : "right";
  chatOfficeMotion = {
    nextKey,
    route,
    target,
    startTime: performance.now(),
    duration,
  };
  chatSceneCharacter.classList.add("is-walking");
  chatSceneCharacter.dataset.state = "walking";
  if (chatSceneZone) chatSceneZone.textContent = "走动中";
  if (chatSceneBubble) chatSceneBubble.textContent = "我边走边听。";
  if (chatSceneSprite) chatSceneSprite.src = getChatOfficeWalkSpriteSrc();

  const step = (now) => {
    if (!chatOfficeMotion || state.currentScreen !== "chat" || !state.officeDynamicEnabled) {
      stopChatOfficeMotion();
      syncChatOfficeScene();
      return;
    }
    const elapsed = now - chatOfficeMotion.startTime;
    const progress = Math.min(1, elapsed / chatOfficeMotion.duration);
    const eased = easeInOutCubic(progress);
    const currentPosition = getChatOfficeVisualPosition();
    const nextPosition = getChatOfficeRoutePosition(chatOfficeMotion.route, eased);
    if (Math.abs(nextPosition.x - currentPosition.x) > 0.06) {
      state.officeWalkDirection = nextPosition.x < currentPosition.x ? "left" : "right";
    }
    setChatOfficeVisualPosition(nextPosition);
    if (chatSceneSprite) chatSceneSprite.src = getChatOfficeWalkSpriteSrc();
    if (progress < 1) {
      chatOfficeMotionFrame = window.requestAnimationFrame(step);
      return;
    }
    const arrivedKey = chatOfficeMotion.nextKey;
    stopChatOfficeMotion();
    setChatOfficeVisualPosition(target);
    setChatOfficeState(arrivedKey);
    syncChatOfficeScene();
  };

  if (chatOfficeMotionFrame) window.cancelAnimationFrame(chatOfficeMotionFrame);
  chatOfficeMotionFrame = window.requestAnimationFrame(step);
}

function startChatOfficeLoop() {
  if (chatOfficeTimer) return;
  const loop = () => {
    chatOfficeTimer = window.setTimeout(() => {
      if (state.currentScreen === "chat" && !isChatSheetOpen() && !chatOfficeMotion) {
        if (state.officeDynamicEnabled) {
          runChatOfficeMotionTo(getNextDynamicOfficeStateKey());
        } else {
          const nextKey = getNextOfficeStateKey();
          setChatOfficeState(nextKey);
          syncChatOfficeScene();
        }
      }
      loop();
    }, state.officeDynamicEnabled ? 5200 + Math.random() * 2400 : 3600 + Math.random() * 1800);
  };
  loop();
}

function startChatWalkLoop() {
  if (chatWalkFrameTimer) return;
  chatWalkFrameTimer = window.setInterval(() => {
    if (state.currentScreen === "chat" && getChatOfficeState().key === "walking") {
      syncChatOfficeScene();
    }
  }, 260);
}

function stopChatOfficeLoop() {
  if (!chatOfficeTimer) return;
  window.clearTimeout(chatOfficeTimer);
  chatOfficeTimer = null;
  stopChatOfficeMotion();
}

function stopChatWalkLoop() {
  if (!chatWalkFrameTimer) return;
  window.clearInterval(chatWalkFrameTimer);
  chatWalkFrameTimer = null;
}

function openAlbumDb() {
  if (albumDbUnavailable || !window.indexedDB) {
    return Promise.reject(new Error("IndexedDB unavailable"));
  }

  if (albumDbPromise) {
    return albumDbPromise;
  }

  albumDbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(ALBUM_DB_NAME, ALBUM_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ALBUM_STORE_NAME)) {
        db.createObjectStore(ALBUM_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open album db"));
  });

  return albumDbPromise;
}

function revokeAlbumObjectUrls() {
  albumObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  albumObjectUrls = [];
}

async function getAlbumStoreAll() {
  const db = await openAlbumDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ALBUM_STORE_NAME, "readonly");
    const request = transaction.objectStore(ALBUM_STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("Failed to read album items"));
  });
}

async function getAlbumStoreCount() {
  const db = await openAlbumDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ALBUM_STORE_NAME, "readonly");
    const request = transaction.objectStore(ALBUM_STORE_NAME).count();
    request.onsuccess = () => resolve(request.result || 0);
    request.onerror = () => reject(request.error || new Error("Failed to count album items"));
  });
}

async function putAlbumStoreItem(item) {
  const db = await openAlbumDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(ALBUM_STORE_NAME, "readwrite");
    const request = transaction.objectStore(ALBUM_STORE_NAME).put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error || new Error("Failed to save album item"));
  });
}

async function clearAlbumStore() {
  if (!window.indexedDB) {
    albumItems = [];
    localStorage.removeItem(ALBUM_STORAGE_KEY);
    renderAlbum();
    return;
  }

  try {
    const db = await openAlbumDb();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(ALBUM_STORE_NAME, "readwrite");
      const request = transaction.objectStore(ALBUM_STORE_NAME).clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error || new Error("Failed to clear album store"));
    });
  } finally {
    localStorage.removeItem(ALBUM_STORAGE_KEY);
    revokeAlbumObjectUrls();
    albumItems = [];
    renderAlbum();
  }
}

async function migrateLegacyAlbumStorage() {
  let legacyItems = [];
  try {
    legacyItems = JSON.parse(localStorage.getItem(ALBUM_STORAGE_KEY) || "[]");
  } catch {
    legacyItems = [];
  }

  if (!Array.isArray(legacyItems) || legacyItems.length === 0) {
    return;
  }

  const existingCount = await getAlbumStoreCount();
  if (existingCount > 0) {
    localStorage.removeItem(ALBUM_STORAGE_KEY);
    return;
  }

  for (const legacyItem of legacyItems) {
    if (!legacyItem?.img) continue;
    const blob = await dataUrlToBlob(legacyItem.img);
    await putAlbumStoreItem({
      id: legacyItem.id || `sticker-${legacyItem.ts || Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: legacyItem.label || "未命名贴纸",
      ts: legacyItem.ts || Date.now(),
      blob,
    });
  }

  localStorage.removeItem(ALBUM_STORAGE_KEY);
}

async function loadAlbumItems() {
  const records = await getAlbumStoreAll();
  revokeAlbumObjectUrls();
  albumItems = records
    .sort((first, second) => first.ts - second.ts)
    .map((item) => {
      const previewUrl = URL.createObjectURL(item.blob);
      albumObjectUrls.push(previewUrl);
      return {
        id: item.id,
        label: item.label,
        message: item.message || "",
        caption: item.caption || "",
          category: item.category || inferAlbumCategory(item.label || "", item.message || ""),
        ts: item.ts,
        timestampText: item.timestampText || "",
        sourceType: item.sourceType || "upload",
        baseColor: item.baseColor || "#e8b8c4",
        blob: item.blob,
        previewUrl,
      };
    });
  albumDbReady = true;
}

async function initAlbumStore() {
  if (!window.indexedDB) {
    albumDbUnavailable = true;
    showAlbumMessage("这个浏览器存不了图鉴背包，建议换 Safari 或 Chrome。");
    renderAlbum();
    return;
  }

  showAlbumMessage("正在展开图鉴背包…");
  try {
    await migrateLegacyAlbumStorage();
    await loadAlbumItems();
    renderAlbum();
  } catch {
    albumDbUnavailable = true;
    showAlbumMessage("图鉴背包没有打开成功，稍后再试试。");
    renderAlbum();
  }
}

function loadMemoryLog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MEMORY_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? pruneMemoryLog(parsed) : [];
  } catch {
    return [];
  }
}

function saveMemoryLog() {
  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memoryLog));
}

function addMemory(entry) {
  memoryLog = pruneMemoryLog([
    ...memoryLog,
    {
      id: entry.id || createMemoryId(entry.type || "memory"),
      ts: Date.now(),
      decay: 1,
      imp: 5,
      ...entry,
    },
  ]);
  saveMemoryLog();
}

function tokenizeRecallQuery(text = "") {
  const normalized = normalizeRecallText(text);
  const phrases = (normalized.match(/[\u4e00-\u9fff]{2,}|[a-z0-9]{2,}/g) || [])
    .filter((token) => token.length >= 2)
    .sort((first, second) => second.length - first.length);
  const bigrams = [];
  phrases.forEach((token) => {
    if (/^[\u4e00-\u9fff]+$/.test(token) && token.length > 2) {
      for (let index = 0; index < token.length - 1; index += 1) {
        bigrams.push(token.slice(index, index + 2));
      }
    }
  });
  return Array.from(new Set([...phrases, ...bigrams]));
}

function getMemoryPromptText(item) {
  return item.summary || item.text || "";
}

function scoreMemoryAgainstQuery(item, tokens) {
  const haystack = normalizeRecallText(`${item.text || ""} ${item.summary || ""} ${item.diary || ""}`);
  return tokens.reduce((score, token) => {
    if (!token || !haystack.includes(token)) return score;
    if (token.length >= 4) return score + 4;
    if (token.length >= 2) return score + 2;
    return score + 0.5;
  }, 0);
}

function recallMemoriesForChat(query) {
  const sortedByRecent = [...memoryLog].sort((first, second) => second.ts - first.ts);
  const recent = sortedByRecent.slice(0, CHAT_MEMORY_RECENT_LIMIT);
  const important = sortedByRecent.filter((item) => item.imp >= 8);
  const excluded = new Set([...recent, ...important].map((item) => item.id));
  const tokens = tokenizeRecallQuery(`${query} ${state.scene} ${albumItems.at(-1)?.label || ""}`);
  const relevant = sortedByRecent
    .filter((item) => !excluded.has(item.id))
    .map((item) => ({ item, score: scoreMemoryAgainstQuery(item, tokens) }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score || second.item.imp - first.item.imp || second.item.ts - first.item.ts)
    .slice(0, CHAT_MEMORY_KEYWORD_LIMIT)
    .map(({ item }) => item);

  const unique = [];
  const seen = new Set();
  [...important, ...recent, ...relevant].forEach((item) => {
    if (!item || seen.has(item.id)) return;
    seen.add(item.id);
    unique.push(item);
  });

  return unique.slice(0, 12);
}

function shouldPersistAssistantMemory(replyText) {
  const normalized = normalizeRecallText(replyText);
  if (!normalized || normalized.length < 10) return false;

  const lowValuePatterns = [
    /^(哈哈|嘿嘿|我去|准了|好牛|笑死|我嘻个豆|你说实话)[\s!！。]*$/,
    /^(早点睡|注意身体|你开心就好|不开心躺着也行)[\s!！。]*$/,
  ];
  if (lowValuePatterns.some((pattern) => pattern.test(normalized))) {
    return false;
  }

  const hasNewFact = /(我在|我刚|我最近|我今天|我现在|我还在|我又|我会|我想变|我想去)/.test(replyText);
  const hasEmotion = /(我有点|我挺|我担心|我羡慕|我想你|我吃醋|我忍住了|我好累)/.test(replyText);
  const hasTopicHook = /(下次|以后一起|后来呢|到底怎么样|记得|你回来|你是不是|等你)/.test(replyText);
  const recentAssistantMemories = memoryLog.filter((item) => item.type === "chat").slice(-12);
  const tooSimilar = recentAssistantMemories.some((item) =>
    getTextSimilarity(normalized, item.text || item.summary || "") > 0.78
  );

  return !tooSimilar && (hasNewFact || hasEmotion || hasTopicHook);
}

function extractChatTopicSignals(text = "") {
  const signals = new Set();
  CHAT_TOPIC_SIGNALS.forEach(({ key, pattern }) => {
    if (pattern.test(text)) {
      signals.add(key);
    }
  });
  return signals;
}

function extractChatDiaryTopic(text = "") {
  const cleaned = String(text).replace(/\s+/g, " ").trim();
  if (!cleaned) return "今天的小心情";
  const quoted = cleaned.match(/「([^」]+)」/);
  if (quoted?.[1]) return quoted[1];
  return `${cleaned.slice(0, 18)}${cleaned.length > 18 ? "…" : ""}`;
}

function isHighValueChatRound(userText, assistantText = "", joinedText = "") {
  const normalized = normalizeRecallText(joinedText || `${userText} ${assistantText}`);
  if (!normalized) return false;
  if (normalized.length >= 26) return true;
  if (HIGH_VALUE_CHAT_PATTERNS.some((pattern) => pattern.test(joinedText || userText))) return true;
  if (assistantText && /(记得|以后|下次|我担心|我羡慕|我有点|等你|回来)/.test(assistantText)) return true;
  return false;
}

function collectChatTurns() {
  const turns = [];
  for (let index = 0; index < state.chatHistory.length; index += 1) {
    const message = state.chatHistory[index];
    if (!message || message.role !== "user") continue;
    const assistantReply = state.chatHistory[index + 1]?.role === "assistant" ? state.chatHistory[index + 1] : null;
    turns.push({
      user: message,
      assistant: assistantReply,
      startTs: message.ts || Date.now(),
      endTs: assistantReply?.ts || message.ts || Date.now(),
      joinedText: `${message.text || ""} ${assistantReply?.text || ""}`.trim(),
      signals: extractChatTopicSignals(`${message.text || ""} ${assistantReply?.text || ""}`),
    });
  }
  return turns;
}

function areChatTurnsRelated(previousTurn, nextTurn) {
  if (!previousTurn || !nextTurn) return false;
  if ((nextTurn.startTs || 0) - (previousTurn.endTs || 0) > CHAT_ROUND_GAP_MS) return false;
  const signalOverlap = [...previousTurn.signals].some((signal) => nextTurn.signals.has(signal));
  if (signalOverlap) return true;
  if (getTextSimilarity(previousTurn.joinedText, nextTurn.joinedText) >= CHAT_ROUND_SIMILARITY_THRESHOLD) return true;
  const previousUser = previousTurn.user?.text || "";
  const nextUser = nextTurn.user?.text || "";
  if (normalizeRecallText(previousUser).length <= 16 && normalizeRecallText(nextUser).length <= 16) return true;
  return false;
}

function buildChatRoundGroup(turns) {
  const userText = turns.map((turn) => turn.user?.text || "").join(" ");
  const assistantText = turns.map((turn) => turn.assistant?.text || "").join(" ");
  const joinedText = `${userText} ${assistantText}`.trim();
  const signals = new Set(turns.flatMap((turn) => [...turn.signals]));
  const startTs = turns[0]?.startTs || Date.now();
  const endTs = turns.at(-1)?.endTs || startTs;
  return {
    id: `chat-round-${startTs}-${hashText(userText || joinedText)}`,
    type: "chat",
    turns,
    startTs,
    endTs,
    ts: endTs,
    userText,
    assistantText,
    joinedText,
    signals,
    imp: Math.min(9, Math.max(5, Math.round((userText.length + assistantText.length) / 40) + 4)),
  };
}

function collectGroupedChatRounds() {
  const turns = collectChatTurns();
  if (!turns.length) return [];
  const groups = [];
  let currentTurns = [turns[0]];
  for (let index = 1; index < turns.length; index += 1) {
    const nextTurn = turns[index];
    const previousTurn = currentTurns[currentTurns.length - 1];
    if (areChatTurnsRelated(previousTurn, nextTurn)) {
      currentTurns.push(nextTurn);
    } else {
      groups.push(buildChatRoundGroup(currentTurns));
      currentTurns = [nextTurn];
    }
  }
  if (currentTurns.length) {
    groups.push(buildChatRoundGroup(currentTurns));
  }
  return groups;
}

function getChatRoundCacheEntry(roundId) {
  return state.chatDiaryEntries?.[roundId] || null;
}

function buildChatRoundSummary(group) {
  const primarySignal = [...group.signals][0];
  if (primarySignal === "matcha") return "和鹅鹅鹅聊到了今天的抹茶瞬间";
  if (primarySignal === "onsen") return "和鹅鹅鹅聊到了温泉带来的放松";
  if (primarySignal === "shrine") return "和鹅鹅鹅聊到了神社和愿望";
  if (primarySignal === "hanabi") return "和鹅鹅鹅聊到了今晚的花火";
  if (primarySignal === "album") return "和鹅鹅鹅聊到了收进图鉴的小物件";
  if (primarySignal === "emotion") return "和鹅鹅鹅聊到了今天留在心里的情绪";
  return `和鹅鹅鹅聊到了「${extractChatDiaryTopic(group.userText)}」`;
}

function buildChatRoundDiaryFallback(group) {
  const time = formatClockTime(group.ts || Date.now());
  const topic = extractChatDiaryTopic(group.userText);
  const turnsText = group.turns.length > 1 ? `我们来来回回聊了 ${group.turns.length} 轮，` : "";
  return {
    summary: buildChatRoundSummary(group),
    diary: `「${time} 💬 聊天互动」\n菠萝今天又来和我说话了。听到菠萝提起「${topic}」，我就知道这个瞬间真的落在菠萝心里了。${turnsText}所以我想把这一小段也认真替菠萝记下来。`,
  };
}

function buildChatDiaryPrompt(group) {
  const sceneContext = getChatSceneContext();
  const officeState = getChatOfficeState();
  const transcript = group.turns
    .map((turn) => [
      `菠萝：${turn.user?.text || ""}`,
      turn.assistant?.text ? `鹅鹅鹅：${turn.assistant.text}` : "",
    ].filter(Boolean).join("\n"))
    .join("\n");
  return [
    DIARY_PERSONA_PROMPT,
    "请基于下面这一段聊天回合，输出 JSON：{\"summary\":\"...\",\"diary\":\"...\"}",
    "要求：",
    "1. summary 16-28 字，适合放在回忆页折叠态的一句话摘要。",
    "2. diary 70-110 字，是鹅鹅鹅写给自己的观察日记，不要出现“她”，统一写“菠萝”。",
    "3. diary 要写“我如何看见菠萝、陪着菠萝、在意菠萝”，不要机械复述聊天记录。",
    "4. 不要输出 JSON 以外的解释。",
    `【当前办公室状态】${officeState.status}`,
    `【当前大阪话题】${sceneContext.title}：${sceneContext.summary}`,
    `【这段聊天回合】\n${transcript}`,
  ].join("\n");
}

function parseDiaryJson(text = "") {
  const trimmed = String(text).trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed.summary === "string" && typeof parsed.diary === "string") {
      return {
        summary: parsed.summary.trim(),
        diary: parsed.diary.trim(),
      };
    }
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && typeof parsed.summary === "string" && typeof parsed.diary === "string") {
          return {
            summary: parsed.summary.trim(),
            diary: parsed.diary.trim(),
          };
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

async function requestChatDiaryEntry(group) {
  try {
    const runtimeConfig = getAiRuntimeConfig();
    if (!runtimeConfig.textEndpoint) {
      return null;
    }
    const response = await requestJsonAi({
      endpoint: runtimeConfig.textEndpoint,
      headerName: runtimeConfig.textAuthHeader,
      apiKey: runtimeConfig.apiKey,
      body: {
        prompt: buildChatDiaryPrompt(group),
      },
    });
    const parsed = parseDiaryJson(extractTextResult(response));
    if (parsed?.summary && parsed?.diary) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

async function ensureMissingChatDiaryEntries() {
  const rounds = collectGroupedChatRounds().filter((group) =>
    isHighValueChatRound(group.userText, group.assistantText, group.joinedText)
  );
  const missingRounds = rounds.filter((group) =>
    !getChatRoundCacheEntry(group.id) && !pendingChatDiaryRoundIds.has(group.id)
  );
  if (!missingRounds.length) return;

  let updated = false;
  for (const round of missingRounds) {
    pendingChatDiaryRoundIds.add(round.id);
    try {
      const entry = await requestChatDiaryEntry(round);
      if (!entry?.summary || !entry?.diary) continue;
      state.chatDiaryEntries = {
        ...(state.chatDiaryEntries || {}),
        [round.id]: {
          ...entry,
          updatedAt: Date.now(),
        },
      };
      updated = true;
    } finally {
      pendingChatDiaryRoundIds.delete(round.id);
    }
  }

  if (updated) {
    saveState();
    if (state.currentScreen === "memory") {
      renderMemoryHub();
    }
  }
}

function collectHighValueChatRounds() {
  const groups = collectGroupedChatRounds();
  const rounds = [];
  groups.forEach((group) => {
    if (!isHighValueChatRound(group.userText, group.assistantText, group.joinedText)) return;
    const cached = getChatRoundCacheEntry(group.id);
    if (!cached?.summary || !cached?.diary) return;
    rounds.push({
      id: group.id,
      type: "chat",
      ts: group.ts || Date.now(),
      imp: group.imp,
      text: `和鹅鹅鹅聊到：「${extractChatDiaryTopic(group.userText)}」`,
      summary: cached.summary,
      diary: cached.diary,
      displayOnly: true,
    });
  });
  return rounds;
}

function buildDisplayMemoryLog() {
  const baseMemories = memoryLog.filter((item) => item.type !== "chat");
  const chatRounds = collectHighValueChatRounds();
  return [...baseMemories, ...chatRounds]
    .sort((first, second) => (second.ts || 0) - (first.ts || 0));
}

function ensureBoloDiaryLead(diaryText = "") {
  const text = String(diaryText || "").trim();
  if (!text) return text;
  const newlineIndex = text.indexOf("\n");
  if (newlineIndex === -1) {
    return text.startsWith("菠萝") ? text : `菠萝${text}`;
  }
  const titleLine = text.slice(0, newlineIndex);
  const body = text.slice(newlineIndex + 1).trim();
  if (!body || body.startsWith("菠萝")) {
    return `${titleLine}\n${body}`.trim();
  }
  return `${titleLine}\n菠萝${body}`;
}

function formatClockTime(ts) {
  const date = new Date(ts);
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getMemoryTypeLabel(type) {
  if (type === "chat") return "聊天";
  if (type === "letter") return "信件";
  if (type === "quest") return "任务";
  if (type === "event") return "图鉴";
  return "记忆";
}

function getMemoryTypeIcon(type) {
  if (type === "chat") return "✦";
  if (type === "letter") return "✉";
  if (type === "quest") return "✿";
  if (type === "event") return "📸";
  return "◌";
}

function inferAlbumCategory(label = "", message = "") {
  const text = `${label} ${message}`.toLowerCase();
  if (/(抹茶|冰淇淋|冰激凌|鲷鱼烧|章鱼烧|寿司|拉面|饭|茶|饮|咖啡|甜点|蛋糕|饼|团子)/.test(text)) {
    return "food";
  }
  if (/(大阪城|城|塔|天守阁|街景|夜景|风景|神社|温泉|花火|烟火|桥|河|海|天空|樱|路|建筑)/.test(text)) {
    return "scenery";
  }
  return "item";
}

function getAlbumCategoryLabel(category) {
  if (category === "food") return "食物";
  if (category === "scenery") return "风景";
  if (category === "item") return "道具";
  return "全部";
}

function getAlbumDisplayItems(category) {
  if (category === "all") {
    return ["food", "scenery", "item"].flatMap((itemCategory) =>
      albumItems
        .filter((item) => (item.category || inferAlbumCategory(item.label, item.message)) === itemCategory)
        .slice(-6)
    );
  }

  return albumItems
    .filter((item) => (item.category || inferAlbumCategory(item.label, item.message)) === category)
    .slice(-6);
}

function updateAlbumCategorySelection(category) {
  albumPendingCategory = category || "";
  albumCategoryChips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.category === albumPendingCategory);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMemoryEntryDisplay(item) {
  const time = formatClockTime(item.ts || Date.now());
  const text = item.text || "";
  const labelMatch = text.match(/「([^」]+)」/);
  const stickerLabel = item.relatedLabel || labelMatch?.[1] || "这件小东西";

  if (item.type === "quest") {
    if (/抹茶/.test(text)) {
      return {
        icon: "🎮",
        tag: "体验活动",
        summary: item.summary || "体验了【抹茶之旅】，获得茶道徽章",
        diary: ensureBoloDiaryLead(item.diary || `「${time} 🍵 抹茶之旅」\n菠萝今天去体验了抹茶。菠萝搅了好多圈，看起来很认真。虽然我没在现场，但光是想到菠萝正慢慢把茶香搅开，我就会觉得今天也被温柔照顾到了。`),
      };
    }
    if (/温泉|涟漪/.test(text)) {
      return {
        icon: "🎮",
        tag: "体验活动",
        summary: item.summary || "体验了【温泉物语】，把疲惫泡进热气里",
        diary: ensureBoloDiaryLead(item.diary || `「${time} ♨️ 温泉物语」\n菠萝今天在温泉页点开了好多水波纹，像是把一路的疲惫都慢慢泡散了。我看着这些小小涟漪，都会替菠萝觉得松一口气。`),
      };
    }
    if (/绘马|神明|愿望/.test(text)) {
      return {
        icon: "🎮",
        tag: "体验活动",
        summary: item.summary || "体验了【神社巫女】，把心愿轻轻挂好",
        diary: ensureBoloDiaryLead(item.diary || `「${time} ⛩️ 神社巫女」\n菠萝把今天的愿望写在绘马上了。菠萝敲字的时候很认真，像是在认真对自己说一声“会实现的”。这种时刻我会想替菠萝多记久一点。`),
      };
    }
    if (/花火|烟火/.test(text)) {
      return {
        icon: "🎮",
        tag: "体验活动",
        summary: item.summary || "体验了【烟火大会】，获得烟火徽章",
        diary: ensureBoloDiaryLead(item.diary || `「${time} 🎆 烟火大会」\n菠萝今晚看到的花火真的很热闹。菠萝把最后一朵烟火也点亮的时候，我就知道这一天已经被菠萝好好收下了，亮晶晶的，像会发光的回忆。`),
      };
    }
  }

  if (item.type === "event") {
    const stampCaption = (item.stampCaption || item.caption || "").trim();
    return {
      icon: "📸",
      tag: "图鉴收集",
      summary: item.summary || (stampCaption
        ? `上传了「${stickerLabel}」，回忆页题签是「${stampCaption}」`
        : `上传了「${stickerLabel}」，收进图鉴背包`)
      ,
      diary: ensureBoloDiaryLead(item.diary || (stampCaption
        ? `「${time} 📸 图鉴收集」\n菠萝把「${stickerLabel}」收进图鉴里了。我顺手替这一格写下「${stampCaption}」，这样等菠萝回头翻回忆页时，这个瞬间就不只是被拍下来了，还被好好命名了。`
        : `「${time} 📸 图鉴收集」\n菠萝把「${stickerLabel}」收进图鉴里了。那个瞬间的心情没有少半点，像一张被认真夹进旅行手账的小纸片。`)),
    };
  }

  if (item.type === "chat") {
    const topic = text.replace(/^和鹅鹅鹅聊到：?/, "").replace(/^「|」$/g, "") || "今天的小心情";
    return {
      icon: "💬",
      tag: "聊天互动",
      summary: item.summary || `和鹅鹅鹅聊了关于${topic}的体验感受`,
      diary: item.diary || `「${time} 💬 聊天互动」\n菠萝又来和我说话啦。听到菠萝提起${topic}，我就知道这一天里一定有哪个瞬间真的碰到了菠萝的心，所以我才会想立刻把它记下来。`,
    };
  }

  if (item.type === "letter") {
    return {
      icon: "✉️",
      tag: "信件总结",
      summary: item.summary || "鹅鹅鹅把今天整理成了一封信",
      diary: item.diary || `「${time} ✉️ 今日总结」\n我把菠萝今天走过的路、收下的图鉴，还有聊过的话，慢慢写进一封信里。以后哪天再翻出来看，菠萝应该还是会想起今天有多充实。`,
    };
  }

  return {
    icon: getMemoryTypeIcon(item.type),
    tag: getMemoryTypeLabel(item.type),
    summary: item.summary || text || "这段回忆已经被记下来了。",
    diary: item.diary || text || "这段回忆已经被好好记住了。",
  };
}

function getRecentMemoryHighlights(limit = 4) {
  return [...memoryLog]
    .sort((first, second) => second.ts - first.ts)
    .slice(0, limit)
    .map((item) => item.text)
    .filter(Boolean);
}

function getCompletedQuestCount() {
  return Object.values(state.badges).filter(Boolean).length;
}

function buildTodayLetterFallback() {
  const completed = Object.entries(state.badges)
    .filter(([, done]) => done)
    .map(([key]) => memoryFragments[key])
    .filter(Boolean);
  const stickerLabels = albumItems.slice(-3).map((item) => item.label).filter(Boolean);
  const recentChat = state.chatHistory
    .filter((item) => item.role === "user")
    .slice(-2)
    .map((item) => item.text)
    .filter(Boolean);

  const journey = completed.length ? completed.join("、") : "从大阪地图出发慢慢散步";
  const stickers = stickerLabels.length ? `你还把 ${stickerLabels.join("、")} 收进了十二时辰。` : "";
  const chats = recentChat.length ? `后来你又和我聊到了 ${recentChat.join("、")}。` : "";
  return `给菠萝：\n今天的你，从 ${journey}，一路把大阪过成了很柔软的一天。${stickers}${chats}我把这些小小的时刻都替你记着，等你以后回头看，会发现今天真的被认真地喜欢过。`;
}

function updateMemoryLetterPreview(text = "") {
  if (!memoryLetterPreview) return;
  const sourceText = (text || memoryLetterOutput?.textContent || buildTodayLetterFallback()).replace(/\s+/g, " ").trim();
  memoryLetterPreview.textContent = sourceText
    ? `${sourceText.slice(0, 28)}${sourceText.length > 28 ? "…" : ""}`
    : "致 亲爱的菠萝：今天真是充实又美好的一天呢…";
}

function buildTodayLetterPrompt() {
  const completed = Object.entries(state.badges)
    .filter(([, done]) => done)
    .map(([key]) => memoryFragments[key])
    .filter(Boolean)
    .join("；");
  const stickers = albumItems
    .slice(-6)
    .map((item) => `${item.label}${item.message ? `（${item.message}）` : ""}`)
    .join("；");
  const chats = state.chatHistory
    .slice(-6)
    .map((item) => `${item.role === "user" ? "用户" : "鹅鹅鹅"}：${item.text}`)
    .join("\n");

  return [
    "你是地球Online·大阪篇里的鹅鹅鹅，要替远方的朋友写一封今日来信。",
    "请用第二人称“你”，写 110-180 字。",
    "语气要温柔、亲密、像一封生日当天留给朋友的短笺。",
    "需要自然提到今天完成的任务、收下的邮票、聊过的话题。",
    "不要列点，不要解释，只输出信件正文。",
    `已完成任务：${completed || "暂无"}`,
    `邮票收藏：${stickers || "暂无"}`,
    `聊天片段：\n${chats || "暂无"}`,
  ].join("\n");
}

function buildChatPrompt(userText) {
  const sceneContext = getChatSceneContext();
  const officeState = getChatOfficeState();
  const recalledMemories = recallMemoriesForChat(userText)
    .map((item) => `- [${getMemoryTypeLabel(item.type)}/${item.imp}] ${getMemoryPromptText(item)}`)
    .join("\n");
  const recentMessages = state.chatHistory
    .slice(-CHAT_RECENT_CONTEXT_LIMIT)
    .map((item) => `${item.role === "user" ? "用户" : "鹅鹅鹅"}：${item.text}`)
    .join("\n");

  return [
    CHAT_PERSONA_PROMPT,
    `【当前上海办公室状态】${officeState.status}，你现在在${officeState.label}附近，适合自然聊起：${officeState.prompt}。`,
    `【当前大阪话题建议】${sceneContext.title}：${sceneContext.summary}`,
    `【场景注入约束】${sceneContext.topicHint}`,
    `【召回记忆】\n${recalledMemories || "- 今天刚刚开始，还没有太多长期记录。"}`,
    `【最近聊天】\n${recentMessages || "暂无"}`,
    `用户刚刚说：${userText}`,
  ].join("\n");
}

function buildAlbumMemoryFallback({ label, message, timestampText, sourceType, caption }) {
  const trimmedLabel = label?.trim() || "这件小东西";
  const trimmedMessage = message?.trim() || "";
  const trimmedCaption = caption?.trim() || "";
  const sourceText = sourceType === "camera" ? "现场拍下" : "从相册收下";
  const summary = trimmedCaption
    ? `收下了「${trimmedLabel}」，题签是「${trimmedCaption}」`
    : trimmedMessage
      ? `收下了「${trimmedLabel}」，还记下了「${trimmedMessage.slice(0, 18)}${trimmedMessage.length > 18 ? "…" : ""}」`
      : `收下了「${trimmedLabel}」，放进今天的图鉴里`;
  const diary = trimmedCaption
    ? `「${timestampText} 📸 图鉴收集」\n菠萝把「${trimmedLabel}」${sourceText}收进图鉴背包了。我替这一格写下「${trimmedCaption}」，这样等菠萝回头翻回忆页时，这个瞬间就不只是被拍下来了，还会带着一点当时的心跳。`
    : trimmedMessage
      ? `「${timestampText} 📸 图鉴收集」\n菠萝把「${trimmedLabel}」${sourceText}收进图鉴背包了，还顺手记下了「${trimmedMessage}」。这些小小的补充，会让我更像真的陪菠萝走过了今天这一站。`
      : `「${timestampText} 📸 图鉴收集」\n菠萝把「${trimmedLabel}」${sourceText}收进图鉴背包了。那个瞬间没有被随手掠过，而是被认真留了下来，等以后再翻出来看，应该还是会一下子想起当时为什么想拍它。`;
  return { summary, diary };
}

function getFallbackChatReply(userText) {
  const officeState = getChatOfficeState();
  const sceneContext = getChatSceneContext();
  const lowerText = userText.toLowerCase();
  if (lowerText.includes("最喜欢") || userText.includes("最喜欢")) {
    const favorite = getRecentMemoryHighlights(1)[0] || "今天在大阪到处乱逛的样子";
    return `我说实话，我会惦记「${favorite}」。\n这种小瞬间最会突然回头戳人。`;
  }

  if (userText.includes("信") || userText.includes("回忆")) {
    return "我已经在偷偷替你攒信了。\n你到回忆页再看，会发现今天没白过。";
  }

  if (userText.includes("邮票") || userText.includes("图鉴")) {
    const latestSticker = albumItems.at(-1)?.label;
    return latestSticker
      ? `我刚刚还在看你收下的「${latestSticker}」。\n这个挺像今天会留下来的纪念。`
      : "你先去收一两枚图鉴嘛。\n不然我都没法陪你一起翻旧账。";
  }

  const latestMemory = getRecentMemoryHighlights(1)[0];
  return latestMemory
    ? `${sceneContext.cue}\n我还在想你今天的「${latestMemory}」。`
    : `${officeState.bubble}。\n你先说，今天在大阪最想先告诉我的是什么？`;
}

function setChatPending(isPending) {
  chatPending = isPending;
  if (chatSendButton) {
    chatSendButton.disabled = isPending;
    chatSendButton.textContent = isPending ? "发送中…" : "发送";
    chatSendButton.classList.toggle("is-loading", isPending);
  }
}

function buildInitialChatGreeting() {
  const sceneContext = getChatSceneContext();
  const officeState = getChatOfficeState();
  const latestSticker = albumItems.at(-1)?.label;
  const stickerText = latestSticker ? `还有，你那个「${latestSticker}」我也记着。` : "";
  return `${sceneContext.opener}\n我刚刚还在${officeState.label}这边晃。${stickerText}`.trim();
}

function buildChatSceneBubbleText() {
  const officeState = getChatOfficeState();
  if (isChatSheetOpen()) {
    return "我在，继续说。";
  }
  if (chatOfficeMotion) {
    return "我边走边听。";
  }
  return state.scene === "free" ? officeState.bubble : getChatSceneContext().cue;
}

function buildChatSceneHintText() {
  const sceneContext = getChatSceneContext();
  const officeState = getChatOfficeState();
  return `${officeState.status}。戳她一下，她可能会先问你：${sceneContext.opener}`;
}

function syncChatOfficeScene() {
  const officeState = getChatOfficeState();
  const sceneContext = getChatSceneContext();
  if (chatSceneCharacter) {
    const position = chatOfficeMotion ? getChatOfficeVisualPosition() : { x: officeState.x, y: officeState.y };
    setChatOfficeVisualPosition(position);
    chatSceneCharacter.dataset.state = chatOfficeMotion ? "walking" : officeState.key;
    chatSceneCharacter.classList.toggle("is-walking", Boolean(chatOfficeMotion));
  }
  if (chatSceneSprite) {
    chatSceneSprite.src = chatOfficeMotion ? getChatOfficeWalkSpriteSrc() : getChatOfficeSpriteSrc();
  }
  if (chatSceneZone) {
    chatSceneZone.textContent = chatOfficeMotion ? "走动中" : officeState.label;
  }
  if (chatSceneBubble) {
    chatSceneBubble.textContent = buildChatSceneBubbleText();
  }
  if (chatSceneStatus) {
    chatSceneStatus.textContent = `${sceneContext.title} · ${officeState.status}`;
  }
  if (chatSceneHint) {
    chatSceneHint.textContent = buildChatSceneHintText();
  }
  syncChatMotionToggle();
}

function restartChatOfficeLoop() {
  stopChatOfficeLoop();
  if (state.currentScreen === "chat") {
    syncChatOfficeScene();
    startChatOfficeLoop();
  }
}

function openChatSheet() {
  if (!chatSheet) return;
  chatSheet.classList.remove("is-hidden");
  chatSheet.setAttribute("aria-hidden", "false");
  syncChatOfficeScene();
  renderChatThread();
}

function closeChatSheet() {
  if (!chatSheet) return;
  chatSheet.classList.add("is-hidden");
  chatSheet.setAttribute("aria-hidden", "true");
  chatCard?.classList.remove("is-keyboard-open");
  syncChatOfficeScene();
}

function renderChatSuggestions() {
  if (!chatMemoryChips) return;
  const suggestions = [];
  suggestions.push(getChatOfficeState().prompt);
  if (state.badges.matcha) suggestions.push("我今天最喜欢抹茶那一页");
  if (state.badges.onsen) suggestions.push("温泉页真的很治愈");
  if (state.badges.shrine) suggestions.push("你觉得神明回信准吗");
  if (albumItems.length) suggestions.push(`你记得我收下的「${albumItems.at(-1).label}」吗`);
  suggestions.push("帮我总结一下今天");

  chatMemoryChips.innerHTML = "";
  suggestions.slice(0, 4).forEach((text) => {
    const chip = document.createElement("button");
    chip.className = "chat-memory-chip";
    chip.type = "button";
    chip.textContent = text;
    chip.addEventListener("click", () => {
      openChatSheet();
      if (chatInput) {
        chatInput.value = text;
        chatInput.style.height = "auto";
        chatInput.style.height = `${Math.min(chatInput.scrollHeight, 112)}px`;
      }
    });
    chatMemoryChips.appendChild(chip);
  });
}

function renderChatThread() {
  if (!chatThread) return;
  chatThread.innerHTML = "";

  const history = state.chatHistory.length
    ? state.chatHistory
    : [
      {
        role: "assistant",
        text: buildInitialChatGreeting(),
        ts: Date.now(),
      },
    ];

  history.forEach((item) => {
    const message = document.createElement("article");
    message.className = `chat-message ${item.role === "user" ? "is-user" : "is-assistant"}`;

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = item.text;

    const meta = document.createElement("span");
    meta.className = "chat-meta";
    meta.textContent = `${item.role === "user" ? "你" : "鹅鹅鹅"} · ${formatClockTime(item.ts || Date.now())}`;

    message.append(bubble, meta);
    chatThread.appendChild(message);
  });

  chatThread.scrollTop = chatThread.scrollHeight;
}

async function sendChatMessage(text) {
  const trimmed = text.trim();
  if (!trimmed || chatPending) return;

  const userMessage = {
    role: "user",
    text: trimmed,
    ts: Date.now(),
  };
  state.chatHistory.push(userMessage);
  saveState();
  renderChatThread();
  addMemory({
    text: `和鹅鹅鹅聊到：「${trimmed.slice(0, 20)}${trimmed.length > 20 ? "…" : ""}」`,
    type: "chat",
    summary: `和鹅鹅鹅聊了关于「${trimmed.slice(0, 12)}${trimmed.length > 12 ? "…" : ""}」的体验感受`,
    diary: `「${formatClockTime(Date.now())} 💬 聊天互动」\n菠萝刚刚又来和我聊天啦。听到菠萝提到了「${trimmed}」，我就知道这一定是菠萝今天真的在意的那个瞬间，所以才会想第一时间说给我听。`,
    imp: trimmed.length >= 40 ? 7 : 5,
  });

  setChatPending(true);

  let replyText = "";
  try {
    const runtimeConfig = getAiRuntimeConfig();
    if (runtimeConfig.textEndpoint) {
      const response = await requestJsonAi({
        endpoint: runtimeConfig.textEndpoint,
        headerName: runtimeConfig.textAuthHeader,
        apiKey: runtimeConfig.apiKey,
        body: {
          prompt: buildChatPrompt(trimmed),
        },
      });
      replyText = extractTextResult(response).trim();
    }
  } catch (error) {
    console.warn("[happy-online] chat ai failed", error);
    replyText = "";
  }

  if (!replyText) {
    replyText = getFallbackChatReply(trimmed);
  }

  state.chatHistory.push({
    role: "assistant",
    text: replyText,
    ts: Date.now(),
  });
  saveState();
  if (shouldPersistAssistantMemory(replyText)) {
    addMemory({
      text: `鹅鹅鹅提到：「${replyText.slice(0, 28)}${replyText.length > 28 ? "…" : ""}」`,
      type: "chat",
      summary: `鹅鹅鹅不经意提到：${replyText.slice(0, 18)}${replyText.length > 18 ? "…" : ""}`,
      diary: `「${formatClockTime(Date.now())} 💬 对话碎片」\n鹅鹅鹅刚刚顺嘴提到「${replyText}」。这句我先替自己记一下，说不定后面还会绕回来。`,
      imp: 4,
    });
  }
  renderChatThread();
  syncChatOfficeScene();
  setChatPending(false);
  void ensureMissingChatDiaryEntries();
}

function renderMemoryHub() {
  const displayMemories = buildDisplayMemoryLog();
  if (memoryDateLabel) memoryDateLabel.textContent = STORY_DATE_TEXT;
  if (memoryTaskCount) memoryTaskCount.textContent = `${getCompletedQuestCount()} / 4 任务完成`;
  if (memoryStickerCount) memoryStickerCount.textContent = `${albumItems.length} 枚图鉴`;
  if (memoryChatCount) memoryChatCount.textContent = `${collectHighValueChatRounds().length} 段聊天`;
  updateMemoryLetterPreview();
  if (!memoryTimeline) return;

  const sortedMemories = [...displayMemories].sort((first, second) => (second.ts || 0) - (first.ts || 0));
  const visibleMemories = sortedMemories.slice(0, 4);
  memoryTimeline.innerHTML = "";

  if (!sortedMemories.length) {
    const empty = document.createElement("article");
    empty.className = "memory-entry";

    const rail = document.createElement("div");
    rail.className = "memory-entry-rail";
    const dot = document.createElement("div");
    dot.className = "memory-entry-dot";
    dot.textContent = formatClockTime(Date.now());
    rail.append(dot);

    const content = document.createElement("div");
    content.className = "memory-entry-content";

    const meta = document.createElement("div");
    meta.className = "memory-entry-meta";
    const tag = document.createElement("span");
      tag.className = "memory-entry-tag is-neutral";
    tag.textContent = "记忆系统";
    meta.appendChild(tag);

    const summary = document.createElement("div");
    summary.className = "memory-entry-summary";
    summary.textContent = "今天的记忆还没开始写进来，先去体验几个地点，或者收一枚图鉴吧。";

    content.append(meta, summary);
    empty.append(rail, content);
    memoryTimeline.appendChild(empty);
    return;
  }

  visibleMemories.forEach((item, index) => {
    const display = buildMemoryEntryDisplay(item);
    const entryId = item.id || `${item.ts || index}-${item.type || "memory"}-${index}`;
    const entry = document.createElement("article");
    entry.className = `memory-entry${expandedMemoryId === entryId ? " is-expanded" : ""}`;

    const rail = document.createElement("div");
    rail.className = "memory-entry-rail";
    const dot = document.createElement("div");
    dot.className = "memory-entry-dot";
    dot.textContent = formatClockTime(item.ts || Date.now());
    const line = document.createElement("div");
    line.className = "memory-entry-line";
    rail.append(dot, line);

    const content = document.createElement("div");
    content.className = "memory-entry-content";

    const button = document.createElement("button");
    button.className = "memory-entry-button";
    button.type = "button";
    button.setAttribute("aria-expanded", expandedMemoryId === entryId ? "true" : "false");
    button.addEventListener("click", () => {
      expandedMemoryId = expandedMemoryId === entryId ? null : entryId;
      renderMemoryHub();
    });

    const meta = document.createElement("div");
    meta.className = "memory-entry-meta";

    const tag = document.createElement("span");
      tag.className = `memory-entry-tag ${getMemoryTagTone(item.type)}`;
    tag.textContent = display.tag;

    const summary = document.createElement("div");
    summary.className = "memory-entry-summary";
    summary.textContent = display.summary;

    meta.append(tag);
    button.append(meta, summary);
    content.appendChild(button);

      const toggle = document.createElement("button");
      toggle.className = "memory-entry-toggle";
      toggle.type = "button";
      toggle.textContent = expandedMemoryId === entryId ? "收起这段记忆 ↑" : "查看更多记忆 →";
      toggle.setAttribute("aria-expanded", expandedMemoryId === entryId ? "true" : "false");
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        expandedMemoryId = expandedMemoryId === entryId ? null : entryId;
        renderMemoryHub();
      });
      content.appendChild(toggle);

    const diary = document.createElement("div");
    diary.className = "memory-entry-diary";
    diary.textContent = display.diary;
    content.appendChild(diary);

    entry.append(rail, content);
    memoryTimeline.appendChild(entry);
  });
}

function setMemoryLetterPending(isPending) {
  memoryLetterPending = isPending;
  if (memoryLetterEntry) {
    memoryLetterEntry.disabled = isPending;
    memoryLetterEntry.classList.toggle("is-loading", isPending);
    memoryLetterEntry.setAttribute("aria-busy", isPending ? "true" : "false");
    if (isPending) {
      updateMemoryLetterPreview("正在整理今天的信件内容…");
    } else {
      updateMemoryLetterPreview();
    }
  }
  if (memoryLetterGenerate) {
    memoryLetterGenerate.disabled = isPending;
    memoryLetterGenerate.textContent = isPending ? "正在重写…" : "重新写一封";
    memoryLetterGenerate.classList.toggle("is-loading", isPending);
  }
}

function openMemoryLetterSheet() {
  memoryLetterSheet?.classList.remove("is-hidden");
  memoryLetterSheet?.setAttribute("aria-hidden", "false");
}

function closeMemoryLetterSheet() {
  memoryLetterSheet?.classList.add("is-hidden");
  memoryLetterSheet?.setAttribute("aria-hidden", "true");
}

async function generateMemoryLetter(forceRegenerate = false) {
  if (memoryLetterPending) return;
  openMemoryLetterSheet();
  if (memoryLetterOutput && !forceRegenerate && memoryLetterOutput.textContent.trim()) {
    return;
  }

  setMemoryLetterPending(true);
  const text = buildTodayLetterFallback();

  if (memoryLetterOutput) {
    memoryLetterOutput.textContent = text;
  }
  updateMemoryLetterPreview(text);

  addMemory({
    text: "鹅鹅鹅把今天写成了一封信。",
    type: "letter",
    summary: "鹅鹅鹅把今天整理成了一封今日总结",
    diary: `「${formatClockTime(Date.now())} ✉️ 今日总结」\n我把菠萝今天走过的路、收下的图鉴，还有聊过的话，慢慢写进一封信里。以后哪天再翻出来看，这些瞬间还是会亮一下。`,
    imp: 7,
  });
  setMemoryLetterPending(false);
}

function wrapCanvasText(context, text, maxWidth) {
  const paragraphs = text.split("\n");
  const lines = [];
  paragraphs.forEach((paragraph) => {
    if (!paragraph) {
      lines.push("");
      return;
    }
    let current = "";
    for (const char of paragraph) {
      const next = current + char;
      if (context.measureText(next).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  });
  return lines;
}

async function buildMemoryLetterImageBlob() {
  const text = memoryLetterOutput?.textContent?.trim() || buildTodayLetterFallback();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const width = 1080;
  canvas.width = width;
  context.font = '44px "STKaiti", "Kaiti SC", "Songti SC", serif';
  const lines = wrapCanvasText(context, text, width - 180);
  const lineHeight = 78;
  const height = Math.max(1600, 280 + lines.length * lineHeight + 240);
  canvas.height = height;

  context.fillStyle = "#f5e9d5";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(180, 137, 112, 0.09)";
  context.beginPath();
  context.arc(150, 160, 120, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(width - 140, 240, 110, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#fffaf1";
  context.fillRect(72, 72, width - 144, height - 144);
  context.strokeStyle = "rgba(150, 106, 79, 0.16)";
  context.strokeRect(72, 72, width - 144, height - 144);

  context.fillStyle = "#5a3928";
  context.font = '700 62px "Songti SC", "STSong", serif';
  context.fillText("今日来信", 128, 176);

  context.fillStyle = "rgba(110, 78, 60, 0.82)";
  context.font = '28px "Songti SC", "STSong", serif';
  context.fillText(STORY_DATE_TEXT, width - 320, 178);

  context.fillStyle = "#5b3a29";
  context.font = '44px "STKaiti", "Kaiti SC", "Songti SC", serif';
  lines.forEach((line, index) => {
    context.fillText(line, 128, 286 + index * lineHeight);
  });

  return canvasToBlob(canvas);
}

async function saveMemoryLetterImage() {
  const blob = await buildMemoryLetterImageBlob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `今日来信-${STORY_DATE_TEXT.replace(/[年月]/g, "-").replace("日", "")}.png`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

async function copyMemoryLetterText() {
  const text = memoryLetterOutput?.textContent?.trim() || buildTodayLetterFallback();
  await navigator.clipboard.writeText(text);
}

async function shareMemoryLetter() {
  const text = memoryLetterOutput?.textContent?.trim() || buildTodayLetterFallback();
  const blob = await buildMemoryLetterImageBlob();
  const file = new File([blob], `今日来信-${Date.now()}.png`, { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: "今日来信",
      text,
      files: [file],
    });
    return;
  }
  if (navigator.share) {
    await navigator.share({
      title: "今日来信",
      text,
    });
    return;
  }
  await copyMemoryLetterText();
}

function applyPetPosition() {
  if (!petDock) return;
  if (state.petPosition && Number.isFinite(state.petPosition.x) && Number.isFinite(state.petPosition.y)) {
    petDock.style.left = `${state.petPosition.x}px`;
    petDock.style.top = `${state.petPosition.y}px`;
    petDock.style.right = "auto";
    petDock.style.bottom = "auto";
  } else {
    petDock.style.left = "";
    petDock.style.top = "";
    petDock.style.right = "16px";
    petDock.style.bottom = `calc(98px + env(safe-area-inset-bottom))`;
  }
  syncMapNpcBubble();
}

function updatePetDockContent() {
  if (!petDockText) return;
  petDockText.textContent = "戳我聊天";
}

function syncMapNpcBubble() {
  if (!npcPeek || !petDock) return;
  const shouldShow = state.currentScreen === "map" && !petDock.classList.contains("is-hidden");
  npcPeek.classList.toggle("is-visible", shouldShow);
  npcPeek.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  if (!shouldShow) return;

  if (npcBubble && !npcHintTimer) {
    npcBubble.textContent = npcLines[npcLineIndex] || "今天去哪一站呀？";
  }

  const petRect = petDock.getBoundingClientRect();
  const bubbleWidth = Math.min(window.innerWidth * 0.48, 220);
  const gap = 1;
  const left = Math.max(10, petRect.left - bubbleWidth - gap);
  const top = Math.max(96, petRect.top + petRect.height * 0.5 - 28);
  npcPeek.style.left = `${left}px`;
  npcPeek.style.top = `${top}px`;
}

function syncPetVisibility(screenName) {
  if (!petDock) return;
  updatePetDockContent();
  const shouldHidePet = ["welcome", "matcha", "onsen", "shrine", "hanabi", "chat"].includes(screenName);
  petDock.classList.toggle("is-hidden", shouldHidePet);
  petDock.style.display = shouldHidePet ? "none" : "";
  petDock.setAttribute("aria-hidden", shouldHidePet ? "true" : "false");
  syncMapNpcBubble();
}

function getMemoryTagTone(type) {
  if (type === "quest") return "is-quest";
  if (type === "event") return "is-event";
  if (type === "chat") return "is-chat";
  if (type === "letter") return "is-letter";
  return "is-neutral";
}

function clampPetPosition(x, y) {
  if (!petDock) return { x, y };
  const width = petDock.offsetWidth || 108;
  const height = petDock.offsetHeight || 118;
  return {
    x: Math.min(Math.max(8, x), window.innerWidth - width - 8),
    y: Math.min(Math.max(84, y), window.innerHeight - height - 8),
  };
}

function initPetDock() {
  if (!petDock) return;
  applyPetPosition();
  syncPetVisibility(state.started ? state.currentScreen || "map" : "welcome");

  petDock.addEventListener("pointerdown", (event) => {
    const rect = petDock.getBoundingClientRect();
    petDragState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
        startX: event.clientX,
        startY: event.clientY,
      moved: false,
    };
    petDock.setPointerCapture(event.pointerId);
  });

  petDock.addEventListener("pointermove", (event) => {
    if (!petDragState || event.pointerId !== petDragState.pointerId) return;
      const movedX = event.clientX - petDragState.startX;
      const movedY = event.clientY - petDragState.startY;
      const movedDistance = Math.hypot(movedX, movedY);
      if (!petDragState.moved && movedDistance < 10) return;
      event.preventDefault();
    const nextX = event.clientX - petDragState.offsetX;
    const nextY = event.clientY - petDragState.offsetY;
    const clamped = clampPetPosition(nextX, nextY);
    petDock.style.left = `${clamped.x}px`;
    petDock.style.top = `${clamped.y}px`;
    petDock.style.right = "auto";
    petDock.style.bottom = "auto";
      syncMapNpcBubble();
    petDragState.moved = true;
  });

  const endDrag = (event) => {
    if (!petDragState || event.pointerId !== petDragState.pointerId) return;
    petDock.releasePointerCapture(event.pointerId);
    if (petDragState.moved) {
        petDragSuppressClickUntil = Date.now() + 250;
      const rect = petDock.getBoundingClientRect();
      state.petPosition = { x: rect.left, y: rect.top };
      saveState();
    } else {
      routeTo("chat");
    }
    petDragState = null;
  };

  petDock.addEventListener("pointerup", endDrag);
  petDock.addEventListener("pointercancel", () => {
    petDragState = null;
  });
    petDock.addEventListener("click", (event) => {
      if (Date.now() < petDragSuppressClickUntil) {
        event.preventDefault();
        return;
      }
      routeTo("chat");
    });
}

function showScreen(screenName) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-hidden", screen.dataset.screen !== screenName);
    screen.classList.toggle("active", screen.dataset.screen === screenName);
  });

  state.currentScreen = screenName;
  if (screenName !== "welcome") {
    state.started = true;
  }
  saveState();
  syncTabs(screenName);

  if (screenName === "matcha") {
    prepareMatchaCanvas();
    startMatchaLoop();
  } else {
    stopMatchaLoop();
  }

  if (screenName === "hanabi") {
    prepareHanabiCanvas();
    startHanabiLoop();
  } else {
    stopHanabiLoop();
  }

  if (screenName !== "backpack") {
    closeSourceSheet();
    closeLabelSheet();
  }
  if (screenName !== "memory") {
    closeMemoryLetterSheet();
  }
  if (screenName === "chat") {
    syncChatOfficeScene();
    startChatOfficeLoop();
    startChatWalkLoop();
  } else {
    closeChatSheet();
    stopChatOfficeLoop();
    stopChatWalkLoop();
  }
  syncPetVisibility(screenName);
}

function syncTabs(screenName) {
  document.querySelectorAll(".tab-bar button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.route === screenName);
  });
}

function syncCompletion() {
  matchaQuest?.classList.toggle("is-complete", Boolean(state.badges.matcha));
  onsenQuest?.classList.toggle("is-complete", Boolean(state.badges.onsen));
  shrineQuest?.classList.toggle("is-complete", Boolean(state.badges.shrine));
  fireworkQuest?.classList.toggle("is-complete", Boolean(state.badges.hanabi));
}

function isHanabiUnlocked() {
  return Boolean(state.badges.matcha && state.badges.onsen && state.badges.shrine);
}

function showMapNpcHint(message, duration = 4200) {
  if (!npcBubble) return;
  window.clearTimeout(npcHintTimer);
  npcBubble.textContent = message;
  npcHintTimer = window.setTimeout(() => {
    npcHintTimer = null;
    syncMapNpcBubble();
  }, duration);
}

function routeTo(route) {
  if (route === "welcome") {
      const preservedChatHistory = Array.isArray(state.chatHistory) ? [...state.chatHistory] : [];
      const preservedPetPosition = state.petPosition
        && Number.isFinite(state.petPosition.x)
        && Number.isFinite(state.petPosition.y)
        ? { ...state.petPosition }
        : null;
    localStorage.removeItem(STORAGE_KEY);
    Object.assign(state, {
      ...defaultState,
      badges: { ...defaultState.badges },
        chatHistory: preservedChatHistory,
        petPosition: preservedPetPosition,
        backpackItems: Array.isArray(state.backpackItems) ? [...state.backpackItems] : [],
    });
    syncCompletion();
    showScreen("welcome");
    return;
  }

  if (route === "matcha") {
    resetMatchaInteraction();
    showScreen("matcha");
    return;
  }

  if (route === "onsen") {
    resetOnsenInteraction();
    showScreen("onsen");
    return;
  }

  if (route === "shrine") {
    resetShrineInteraction();
    showScreen("shrine");
    return;
  }

  if (route === "hanabi") {
    if (!isHanabiUnlocked()) {
      showScreen("map");
      showMapNpcHint("先把抹茶、温泉、神社都体验完，我再陪你去看花火。");
      return;
    }
    resetHanabiInteraction();
    showScreen("hanabi");
    return;
  }

  if (route === "map") {
    showScreen("map");
    return;
  }

  if (route === "backpack") {
    renderAlbum();
    showScreen("backpack");
    return;
  }

  if (route === "chat") {
    closeChatSheet();
    renderChatSuggestions();
    renderChatThread();
    syncChatOfficeScene();
    showScreen("chat");
    return;
  }

  if (route === "memory") {
    renderMemoryHub();
    showScreen("memory");
  }
}

function showAlbumMessage(message) {
  if (albumProgress) {
    albumProgress.textContent = message;
  }
}

function formatStampTimestamp(ts) {
  const date = new Date(ts);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function withAlpha(hex, alpha) {
  const normalized = hex.replace("#", "");
  const fullHex = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;
  const red = parseInt(fullHex.slice(0, 2), 16);
  const green = parseInt(fullHex.slice(2, 4), 16);
  const blue = parseInt(fullHex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getAiRuntimeConfig() {
  const runtime = window.HAPPY_ONLINE_AI_CONFIG || {};
  return {
    imageEndpoint: runtime.imageEndpoint || "/api/ark-image",
    textEndpoint: runtime.textEndpoint || "/api/ark-text",
    apiKey: runtime.apiKey || "",
    imageAuthHeader: runtime.imageAuthHeader || "Authorization",
    textAuthHeader: runtime.textAuthHeader || "Authorization",
    useMock: runtime.useMock !== false,
  };
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read blob as data url"));
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

function normalizeAiErrorMessage(rawMessage, fallback = "AI 暂时没连上") {
  if (!rawMessage) return fallback;
  const collapsed = String(rawMessage).replace(/\s+/g, " ").trim();
  if (!collapsed) return fallback;
  return collapsed.length > 88 ? `${collapsed.slice(0, 88)}…` : collapsed;
}

function getAiErrorMessage(error, fallback) {
  if (!error) return fallback;
  return normalizeAiErrorMessage(error.message, fallback);
}

function buildStampTextPrompt({ label, message, timestampText, sourceType }) {
  const sourceText = sourceType === "camera" ? "现场拍摄" : "相册上传";
  return [
    "你是生日旅行纪念册的文字设计助手。",
    "请为一枚旅行邮票同时生成：题签、回忆摘要、回忆日记。",
    "要求：",
    "1. caption 是 1 句，12-24 字，温柔、克制、像手账上的题签。",
    "2. summary 是 1 句，18-36 字，像回忆页里的一行摘要。",
    "3. diary 是 1 段，55-90 字，语气是鹅鹅鹅在陪伴、观察菠萝，要自然、具体，不要流水账。",
    "4. 不要解释理由，不要分点，不要出现 JSON 以外的内容。",
    "5. 只返回 JSON：{\"caption\":\"...\",\"summary\":\"...\",\"diary\":\"...\"}",
    `物品名：${label}`,
    `补充想说的话：${message || "无"}`,
    `时间：${timestampText}`,
    `来源：${sourceText}`,
  ].join("\n");
}

function buildStampImagePrompt() {
  return [
    "1:1构图，纯白底背景。从输入照片中提取最有识别度的主体元素，转化为一个简约的“冰箱贴式图标",
    "1、保留画面中主体核心轮廓和标志性特征；",
    "2、造型简洁、干净、像旅行纪念品冰箱贴；",
    "3、冰箱贴风格和图形再简化，变成珐琅的透明质感",
    "3、有轻微立体感和投影；",
    "4、边缘清晰，细黑线描边；",
    "5、细节适度简化，不要画得太复杂；",
  ].join("\n");
}

async function prepareImageBlobForAi(imageBlob, { maxSide = 1536, quality = 0.86 } = {}) {
  const image = await loadImageFromBlob(imageBlob);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const longestSide = Math.max(sourceWidth, sourceHeight);
  const needsResize = longestSide > maxSide;
  const shouldCompress = imageBlob.size > 2.4 * 1024 * 1024;

  if (!needsResize && !shouldCompress) {
    return imageBlob;
  }

  const scale = Math.min(1, maxSide / longestSide);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvasToBlob(canvas, "image/jpeg", quality);
}

async function requestJsonAi({ endpoint, headerName, apiKey, body }) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { [headerName]: apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const rawText = await response.text();
  let payload = null;
  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const detail = payload?.error
      || payload?.message
      || rawText
      || `AI request failed with status ${response.status}`;
    throw new Error(normalizeAiErrorMessage(detail, `AI request failed with status ${response.status}`));
  }

  if (payload) return payload;
  if (!rawText) return {};
  throw new Error("AI 返回了空结果。");
}

function extractTextResult(payload) {
  return payload?.output_text
    || payload?.text
    || payload?.content
    || payload?.output?.[0]?.content?.[0]?.text
    || payload?.output?.[1]?.content?.[0]?.text
    || payload?.response?.output_text
    || payload?.choices?.[0]?.message?.content
    || payload?.choices?.[0]?.text
    || "";
}

function isNearWhitePixel(red, green, blue) {
  return red > 238 && green > 238 && blue > 238 && Math.max(red, green, blue) - Math.min(red, green, blue) < 22;
}

function hasWhiteBackdrop(imageSource) {
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  const size = 48;
  sampleCanvas.width = size;
  sampleCanvas.height = size;

  const sourceWidth = imageSource.naturalWidth || imageSource.width;
  const sourceHeight = imageSource.naturalHeight || imageSource.height;
  sampleContext.drawImage(imageSource, 0, 0, sourceWidth, sourceHeight, 0, 0, size, size);
  const { data } = sampleContext.getImageData(0, 0, size, size);

  let borderCount = 0;
  let whiteCount = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const isBorder = x < 4 || y < 4 || x >= size - 4 || y >= size - 4;
      if (!isBorder) continue;
      borderCount += 1;
      const index = (y * size + x) * 4;
      if (isNearWhitePixel(data[index], data[index + 1], data[index + 2])) {
        whiteCount += 1;
      }
    }
  }

  return borderCount > 0 && whiteCount / borderCount > 0.72;
}

function isNearBackdropPixel(red, green, blue, backdrop) {
  const average = (red + green + blue) / 3;
  const neutralRange = Math.max(red, green, blue) - Math.min(red, green, blue);
  const nearBackdrop = Math.abs(red - backdrop.red) < 28
    && Math.abs(green - backdrop.green) < 28
    && Math.abs(blue - backdrop.blue) < 28;
  return (isNearWhitePixel(red, green, blue) || nearBackdrop)
    && average > 226
    && neutralRange < 34;
}

function sampleBackdropColor(data, width, height) {
  const points = [
    [2, 2],
    [width - 3, 2],
    [2, height - 3],
    [width - 3, height - 3],
  ];

  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  points.forEach(([x, y]) => {
    const index = (y * width + x) * 4;
    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
    count += 1;
  });

  return {
    red: Math.round(red / count),
    green: Math.round(green / count),
    blue: Math.round(blue / count),
  };
}

function trimTransparentCanvas(sourceCanvas, padding = 14) {
  const context = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const { width, height } = sourceCanvas;
  const { data } = context.getImageData(0, 0, width, height);

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX === -1 || maxY === -1) {
    return sourceCanvas;
  }

  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropWidth = Math.min(width - cropX, maxX - minX + padding * 2 + 1);
  const cropHeight = Math.min(height - cropY, maxY - minY + padding * 2 + 1);
  const trimmedCanvas = document.createElement("canvas");
  const trimmedContext = trimmedCanvas.getContext("2d");
  trimmedCanvas.width = cropWidth;
  trimmedCanvas.height = cropHeight;
  trimmedContext.drawImage(sourceCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return trimmedCanvas;
}

async function createAutoCutoutBlob(imageBlob) {
  const image = await loadImageFromBlob(imageBlob);
  if (!hasWhiteBackdrop(image)) {
    return imageBlob;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const width = canvas.width;
  const height = canvas.height;
  const backdrop = sampleBackdropColor(data, width, height);
  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pixelIndex = y * width + x;
    if (visited[pixelIndex]) return;
    const index = pixelIndex * 4;
    if (data[index + 3] === 0) return;
    if (!isNearBackdropPixel(data[index], data[index + 1], data[index + 2], backdrop)) return;
    visited[pixelIndex] = 1;
    queue.push(pixelIndex);
  };

  for (let x = 0; x < width; x += 1) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length) {
    const pixelIndex = queue.shift();
    const index = pixelIndex * 4;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    data[index + 3] = 0;

    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = (y * width + x) * 4;
      if (data[index + 3] === 0) continue;
      const average = (data[index] + data[index + 1] + data[index + 2]) / 3;
      const neutralRange = Math.max(data[index], data[index + 1], data[index + 2]) - Math.min(data[index], data[index + 1], data[index + 2]);
      if (average < 225 || neutralRange > 28) continue;

      const neighbors = [
        ((y - 1) * width + x) * 4 + 3,
        ((y + 1) * width + x) * 4 + 3,
        (y * width + (x - 1)) * 4 + 3,
        (y * width + (x + 1)) * 4 + 3,
      ];
      const transparentNeighbors = neighbors.filter((alphaIndex) => data[alphaIndex] === 0).length;
      if (transparentNeighbors >= 2) {
        data[index + 3] = Math.min(data[index + 3], 92);
      }
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvasToBlob(trimTransparentCanvas(canvas), "image/png");
}

function normalizeStampTextResult(rawText, fallbackBaseColor, fallbackMemory) {
  try {
    const parsed = JSON.parse(rawText);
    const parsedCaption = typeof parsed.caption === "string" && parsed.caption.trim()
      ? parsed.caption.trim()
      : "";
    const memoryFallback = parsedCaption
      ? {
        ...fallbackMemory,
        ...buildAlbumMemoryFallback({
          ...fallbackMemory.context,
          caption: parsedCaption,
        }),
      }
      : fallbackMemory;
    return {
      caption: parsedCaption,
      summary: typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : memoryFallback.summary,
      diary: typeof parsed.diary === "string" && parsed.diary.trim()
        ? parsed.diary.trim()
        : memoryFallback.diary,
      baseColor: fallbackBaseColor,
    };
  } catch {
    const fallbackCaption = rawText.trim().slice(0, 24);
    const memoryFallback = fallbackCaption
      ? {
        ...fallbackMemory,
        ...buildAlbumMemoryFallback({
          ...fallbackMemory.context,
          caption: fallbackCaption,
        }),
      }
      : fallbackMemory;
    return {
      caption: fallbackCaption,
      summary: memoryFallback.summary,
      diary: memoryFallback.diary,
      baseColor: fallbackBaseColor,
    };
  }
}

function renderAlbum() {
  if (!albumGrid) return;

  const totalSlots = albumFilter === "all" ? 18 : 6;
  const latestItems = getAlbumDisplayItems(albumFilter);

  albumFilterChips.forEach((chip) => {
    chip.classList.toggle("is-active", (chip.dataset.category || "all") === albumFilter);
  });

  albumGrid.innerHTML = "";
  for (let index = 0; index < totalSlots; index += 1) {
    const item = latestItems[index];
    const slot = document.createElement("article");
      slot.className = `album-slot${item ? "" : " is-empty"}`;

    if (!item) {
      const emptyButton = document.createElement("button");
      emptyButton.className = "album-empty-card-button";
      emptyButton.type = "button";
        emptyButton.setAttribute("aria-label", "收一格新图鉴");
      emptyButton.innerHTML = `
        <div class="album-empty-card" aria-hidden="true">
            <span class="album-empty-mark">?<small>拍照 / 上传</small></span>
        </div>
      `;
      emptyButton.addEventListener("click", () => {
        openSourceSheet();
      });
      slot.appendChild(emptyButton);
      albumGrid.appendChild(slot);
      continue;
    }

    const button = document.createElement("button");
    button.className = "album-slot-button";
    button.type = "button";
    button.setAttribute("aria-label", item.label);
      button.addEventListener("click", () => {
        openLabelSheet({
          sourceBlob: item.blob,
          previewUrl: URL.createObjectURL(item.blob),
          sourceType: item.sourceType || "upload",
          timestamp: item.ts || Date.now(),
          label: item.label,
          message: item.message || "",
          category: item.category || inferAlbumCategory(item.label, item.message),
          editingItemId: item.id,
        });
      });

    const stamp = document.createElement("div");
    stamp.className = "album-slot-stamp";

    const image = document.createElement("img");
    image.src = item.previewUrl;
    image.alt = item.label;
    image.loading = "lazy";
    stamp.appendChild(image);

    const copy = document.createElement("div");
    copy.className = "album-slot-copy";

    const meta = document.createElement("div");
    meta.className = "album-slot-meta";

    const time = document.createElement("span");
    time.className = "album-slot-time";
      time.textContent = formatClockTime(item.ts || Date.now());

    const label = document.createElement("span");
    label.className = "album-slot-label";
    label.textContent = item.label;

    const message = document.createElement("p");
    message.className = "album-slot-message";
    message.textContent = item.message?.trim() || "这一刻已经被收进时间轴里。";

    meta.append(time);
    copy.append(meta, label, message);
    button.append(stamp, copy);
    slot.appendChild(button);
    albumGrid.appendChild(slot);
  }

  if (albumProgress) {
    if (!albumDbReady && !albumDbUnavailable) {
        albumProgress.textContent = "正在展开图鉴背包…";
      return;
    }
    if (albumDbUnavailable) {
        albumProgress.textContent = "图鉴背包暂时不可用";
      return;
    }
      const currentCount = latestItems.length;
      const countText = `${Math.min(currentCount, totalSlots)} / ${totalSlots}`;
      if (albumProgressBadge) {
        albumProgressBadge.textContent = countText;
      }
      albumProgress.textContent = currentCount
        ? `${getAlbumCategoryLabel(albumFilter)}里已经收下 ${currentCount} 格回忆。`
        : `先选一张图片，再把它收进${getAlbumCategoryLabel(albumFilter) === "全部" ? "图鉴" : getAlbumCategoryLabel(albumFilter)}里。`;
  }
}

function getSquareCrop(sourceWidth, sourceHeight) {
  const side = Math.min(sourceWidth, sourceHeight);
  return {
    sx: (sourceWidth - side) / 2,
    sy: (sourceHeight - side) / 2,
    side,
  };
}

function buildRoundedRectPath(context, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function getPixelChannel(pixel, channelIndex) {
  return pixel[channelIndex];
}

function getBoxStats(pixels) {
  const mins = [255, 255, 255];
  const maxs = [0, 0, 0];

  pixels.forEach((pixel) => {
    for (let channelIndex = 0; channelIndex < 3; channelIndex += 1) {
      mins[channelIndex] = Math.min(mins[channelIndex], pixel[channelIndex]);
      maxs[channelIndex] = Math.max(maxs[channelIndex], pixel[channelIndex]);
    }
  });

  const ranges = maxs.map((max, index) => max - mins[index]);
  let longestChannel = 0;
  if (ranges[1] > ranges[longestChannel]) longestChannel = 1;
  if (ranges[2] > ranges[longestChannel]) longestChannel = 2;

  return {
    mins,
    maxs,
    ranges,
    longestChannel,
    longestRange: ranges[longestChannel],
  };
}

function averagePixels(pixels) {
  if (!pixels.length) return [255, 255, 255];

  const totals = [0, 0, 0];
  pixels.forEach((pixel) => {
    totals[0] += pixel[0];
    totals[1] += pixel[1];
    totals[2] += pixel[2];
  });

  return totals.map((total) => Math.round(total / pixels.length));
}

function buildMedianCutPalette(pixels, targetCount) {
  if (!pixels.length) {
    return [];
  }

  let boxes = [pixels.slice()];

  while (boxes.length < targetCount) {
    let selectedIndex = -1;
    let selectedStats = null;

    boxes.forEach((box, index) => {
      if (box.length <= 1) return;
      const stats = getBoxStats(box);
      if (!selectedStats || stats.longestRange > selectedStats.longestRange) {
        selectedIndex = index;
        selectedStats = stats;
      }
    });

    if (selectedIndex === -1 || !selectedStats) {
      break;
    }

    const box = boxes[selectedIndex].slice().sort(
      (first, second) =>
        getPixelChannel(first, selectedStats.longestChannel) - getPixelChannel(second, selectedStats.longestChannel),
    );
    const middle = Math.floor(box.length / 2);
    const firstHalf = box.slice(0, middle);
    const secondHalf = box.slice(middle);

    if (!firstHalf.length || !secondHalf.length) {
      break;
    }

    boxes.splice(selectedIndex, 1, firstHalf, secondHalf);
  }

  return boxes.map((box) => averagePixels(box));
}

function srgbToLinear(value) {
  const normalized = value / 255;
  if (normalized <= 0.04045) {
    return normalized / 12.92;
  }
  return ((normalized + 0.055) / 1.055) ** 2.4;
}

function rgbToLab([r, g, b]) {
  const linearR = srgbToLinear(r);
  const linearG = srgbToLinear(g);
  const linearB = srgbToLinear(b);

  const x = linearR * 0.4124564 + linearG * 0.3575761 + linearB * 0.1804375;
  const y = linearR * 0.2126729 + linearG * 0.7151522 + linearB * 0.072175;
  const z = linearR * 0.0193339 + linearG * 0.119192 + linearB * 0.9503041;

  const refX = 0.95047;
  const refY = 1;
  const refZ = 1.08883;

  const labTransform = (value) => {
    if (value > 0.008856) {
      return value ** (1 / 3);
    }
    return 7.787 * value + 16 / 116;
  };

  const fx = labTransform(x / refX);
  const fy = labTransform(y / refY);
  const fz = labTransform(z / refZ);

  return [
    116 * fy - 16,
    500 * (fx - fy),
    200 * (fy - fz),
  ];
}

function findClosestColor([r, g, b], paletteEntries) {
  let minDist = Infinity;
  let closest = paletteEntries[0].rgb;
  const sourceLab = rgbToLab([r, g, b]);

  for (const entry of paletteEntries) {
    const [pl, pa, pb] = entry.lab;
    const dist =
      (sourceLab[0] - pl) ** 2 +
      (sourceLab[1] - pa) ** 2 +
      (sourceLab[2] - pb) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closest = entry.rgb;
    }
  }

  return closest;
}

function clampColor(value) {
  return Math.max(0, Math.min(255, value));
}

function buildDynamicPaletteFromImageData(imageData) {
  const pixels = [];
  const { data } = imageData;
  let minLuma = 255;
  let maxLuma = 0;

  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] < 5) continue;
    const pixel = [data[index], data[index + 1], data[index + 2]];
    const luma = 0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2];
    minLuma = Math.min(minLuma, luma);
    maxLuma = Math.max(maxLuma, luma);
    pixels.push(pixel);
  }

  const reservedPalette = [];
  if (maxLuma > 240) {
    reservedPalette.push([255, 255, 255]);
  }
  if (minLuma < 28) {
    reservedPalette.push([34, 34, 34]);
  }

  const dynamicPalette = buildMedianCutPalette(pixels, Math.max(0, 24 - reservedPalette.length));
  const palette = [...reservedPalette, ...dynamicPalette];

  const seen = new Set();
  return palette.filter((color) => {
    const key = color.join(",");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ditherImageData(imageData, palette, width, height) {
  const paletteEntries = palette.map((rgb) => ({
    rgb,
    lab: rgbToLab(rgb),
  }));
  const sourceBuffer = new Float32Array(imageData.data.length);
  for (let index = 0; index < imageData.data.length; index += 1) {
    sourceBuffer[index] = imageData.data[index];
  }

  const diffuseError = (x, y, channelOffset, error, factor) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const index = (y * width + x) * 4 + channelOffset;
    sourceBuffer[index] += error * factor;
  };

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (sourceBuffer[index + 3] < 5) continue;

      const original = [
        clampColor(sourceBuffer[index]),
        clampColor(sourceBuffer[index + 1]),
        clampColor(sourceBuffer[index + 2]),
      ];
      const [nextR, nextG, nextB] = findClosestColor(original, paletteEntries);
      const errorR = original[0] - nextR;
      const errorG = original[1] - nextG;
      const errorB = original[2] - nextB;

      imageData.data[index] = nextR;
      imageData.data[index + 1] = nextG;
      imageData.data[index + 2] = nextB;
      imageData.data[index + 3] = 255;

      diffuseError(x + 1, y, 0, errorR, 7 / 16);
      diffuseError(x + 1, y, 1, errorG, 7 / 16);
      diffuseError(x + 1, y, 2, errorB, 7 / 16);
      diffuseError(x - 1, y + 1, 0, errorR, 3 / 16);
      diffuseError(x - 1, y + 1, 1, errorG, 3 / 16);
      diffuseError(x - 1, y + 1, 2, errorB, 3 / 16);
      diffuseError(x, y + 1, 0, errorR, 5 / 16);
      diffuseError(x, y + 1, 1, errorG, 5 / 16);
      diffuseError(x, y + 1, 2, errorB, 5 / 16);
      diffuseError(x + 1, y + 1, 0, errorR, 1 / 16);
      diffuseError(x + 1, y + 1, 1, errorG, 1 / 16);
      diffuseError(x + 1, y + 1, 2, errorB, 1 / 16);
    }
  }

  return imageData;
}

function canvasToBlob(canvas, type = "image/png", quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert canvas to blob"));
        return;
      }
      resolve(blob);
    }, type, quality);
  });
}

async function createStickerBlobFromSource(imageSource) {
  const blurCanvas = document.createElement("canvas");
  const blurContext = blurCanvas.getContext("2d");
  const pixelCanvas = document.createElement("canvas");
  const pixelContext = pixelCanvas.getContext("2d", { willReadFrequently: true });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const blurSize = 256;
  const pixelSize = 72;
  const canvasSize = 960;
  const stickerSize = 768;
  const stickerX = (canvasSize - stickerSize) / 2;
  const stickerY = 96;
  const outlineSize = 14;
  const sourceWidth = imageSource.videoWidth || imageSource.naturalWidth || imageSource.width;
  const sourceHeight = imageSource.videoHeight || imageSource.naturalHeight || imageSource.height;
  const { sx, sy, side } = getSquareCrop(sourceWidth, sourceHeight);
  blurCanvas.width = blurSize;
  blurCanvas.height = blurSize;
  pixelCanvas.width = pixelSize;
  pixelCanvas.height = pixelSize;
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  blurContext.clearRect(0, 0, blurSize, blurSize);
  blurContext.filter = "blur(0.9px) saturate(1.04) contrast(1.02)";
  blurContext.drawImage(imageSource, sx, sy, side, side, 0, 0, blurSize, blurSize);
  blurContext.filter = "none";

  pixelContext.clearRect(0, 0, pixelSize, pixelSize);
  pixelContext.imageSmoothingEnabled = true;
  pixelContext.drawImage(blurCanvas, 0, 0, blurSize, blurSize, 0, 0, pixelSize, pixelSize);
  const imageData = pixelContext.getImageData(0, 0, pixelSize, pixelSize);
  const palette = buildDynamicPaletteFromImageData(imageData);
  const ditheredImageData = ditherImageData(imageData, palette, pixelSize, pixelSize);
  pixelContext.putImageData(ditheredImageData, 0, 0);

  context.clearRect(0, 0, canvasSize, canvasSize);
  context.imageSmoothingEnabled = false;

  context.save();
  context.shadowColor = "rgba(96, 58, 72, 0.18)";
  context.shadowBlur = 34;
  context.shadowOffsetY = 22;
  for (const [offsetX, offsetY] of [
    [-outlineSize, 0],
    [outlineSize, 0],
    [0, -outlineSize],
    [0, outlineSize],
    [-outlineSize, -outlineSize],
    [outlineSize, -outlineSize],
    [-outlineSize, outlineSize],
    [outlineSize, outlineSize],
  ]) {
    context.drawImage(pixelCanvas, stickerX + offsetX, stickerY + offsetY, stickerSize, stickerSize);
  }
  context.restore();

  context.save();
  context.globalCompositeOperation = "source-atop";
  context.fillStyle = "rgba(255, 255, 255, 0.98)";
  context.fillRect(0, 0, canvasSize, canvasSize);
  context.restore();

  context.save();
  context.drawImage(pixelCanvas, stickerX, stickerY, stickerSize, stickerSize);
  context.restore();

  context.save();
  context.strokeStyle = "rgba(104, 71, 88, 0.52)";
  context.lineWidth = 8;
  context.strokeRect(stickerX - 4, stickerY - 4, stickerSize + 8, stickerSize + 8);
  context.restore();

  return canvasToBlob(canvas);
}

function openSourceSheet() {
  sourceSheet?.classList.remove("is-hidden");
  sourceSheet?.setAttribute("aria-hidden", "false");
}

function closeSourceSheet() {
  sourceSheet?.classList.add("is-hidden");
  sourceSheet?.setAttribute("aria-hidden", "true");
}

function openLabelSheet({ sourceBlob, previewUrl, sourceType, timestamp, label = "", message = "", category = "", editingItemId = "" }) {
  if (albumPendingPreviewUrl) {
    URL.revokeObjectURL(albumPendingPreviewUrl);
  }

  albumPendingSourceBlob = sourceBlob;
  albumPendingPreviewUrl = previewUrl;
  albumPendingSourceType = sourceType;
  albumPendingTimestamp = timestamp;
  albumPendingTimestampText = formatClockTime(timestamp);
  albumEditingItemId = editingItemId;

  if (albumLabelInput) {
    albumLabelInput.value = label;
  }
  if (albumMessageInput) {
    albumMessageInput.value = message;
  }
  if (albumLabelPreviewImage) {
    albumLabelPreviewImage.src = albumPendingPreviewUrl;
  }
  if (albumTimestampChip) {
    albumTimestampChip.textContent = `拍摄时间 ${albumPendingTimestampText}`;
  }
  updateAlbumCategorySelection(category || (albumFilter === "all" ? "" : albumFilter));

  labelSheet?.classList.remove("is-hidden");
  labelSheet?.setAttribute("aria-hidden", "false");
  setAlbumSavePending(false);
  window.setTimeout(() => albumLabelInput?.focus(), 120);
}

function closeLabelSheet() {
  albumPendingSourceBlob = null;
  albumPendingSourceType = "upload";
  albumPendingTimestamp = 0;
  albumPendingTimestampText = "";
  albumEditingItemId = "";
  updateAlbumCategorySelection("");
  if (albumPendingPreviewUrl) {
    URL.revokeObjectURL(albumPendingPreviewUrl);
    albumPendingPreviewUrl = "";
  }
  if (albumLabelPreviewImage) {
    albumLabelPreviewImage.removeAttribute("src");
  }
  if (albumTimestampChip) {
    albumTimestampChip.textContent = "";
  }
  setAlbumSavePending(false);
  labelSheet?.classList.add("is-hidden");
  labelSheet?.setAttribute("aria-hidden", "true");
}

function setAlbumSavePending(isPending) {
  albumSavePending = isPending;
  if (albumLabelSave) {
    albumLabelSave.disabled = isPending;
    albumLabelSave.textContent = isPending
      ? (ALBUM_AI_DISABLED ? "保存中…" : "生图中…")
      : "保存到图鉴";
    albumLabelSave.classList.toggle("is-loading", isPending);
  }
  if (albumLabelCancel) {
    albumLabelCancel.disabled = isPending;
  }
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to read uploaded image"));
    };

    image.src = objectUrl;
  });
}

async function loadImageFromBlob(blob) {
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to read image blob"));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function deriveStampBaseColor(imageSource) {
  const colorCanvas = document.createElement("canvas");
  const colorContext = colorCanvas.getContext("2d", { willReadFrequently: true });
  const sourceWidth = imageSource.videoWidth || imageSource.naturalWidth || imageSource.width;
  const sourceHeight = imageSource.videoHeight || imageSource.naturalHeight || imageSource.height;
  const { sx, sy, side } = getSquareCrop(sourceWidth, sourceHeight);
  colorCanvas.width = 24;
  colorCanvas.height = 24;
  colorContext.drawImage(imageSource, sx, sy, side, side, 0, 0, 24, 24);
  const { data } = colorContext.getImageData(0, 0, 24, 24);

  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;
  for (let index = 0; index < data.length; index += 4) {
    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
    count += 1;
  }

  const soften = (value) => Math.round(value * 0.62 + 255 * 0.38);
  const toHex = (value) => soften(Math.round(value / count)).toString(16).padStart(2, "0");
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

async function createLocalStampMock({ imageBlob }) {
  return createAutoCutoutBlob(imageBlob);
}

async function requestAiStampRender({ imageBlob, label, message, timestamp, timestampText, sourceType }) {
  const image = await loadImageFromBlob(imageBlob);
  const fallbackBaseColor = deriveStampBaseColor(image);
  const runtimeConfig = getAiRuntimeConfig();
  let caption = "";
  let baseColor = fallbackBaseColor;
  let textIssue = "";
  let imageIssue = "";
  let memorySummary = "";
  let memoryDiary = "";
  const fallbackMemory = buildAlbumMemoryFallback({
    label,
    message,
    timestampText,
    sourceType,
    caption: "",
  });
  fallbackMemory.context = { label, message, timestampText, sourceType };

  if (runtimeConfig.textEndpoint) {
    try {
      const textPayload = await requestJsonAi({
        endpoint: runtimeConfig.textEndpoint,
        headerName: runtimeConfig.textAuthHeader,
        apiKey: runtimeConfig.apiKey,
        body: {
          prompt: buildStampTextPrompt({
            label,
            message,
            timestampText,
            sourceType,
          }),
        },
      });
      const normalized = normalizeStampTextResult(extractTextResult(textPayload), fallbackBaseColor, fallbackMemory);
      caption = normalized.caption;
      baseColor = normalized.baseColor;
      memorySummary = normalized.summary;
      memoryDiary = normalized.diary;
    } catch (error) {
      console.warn("[happy-online] stamp text ai failed", error);
      caption = "";
      baseColor = fallbackBaseColor;
      textIssue = getAiErrorMessage(error, "题签服务暂时没连上");
    }
  }

  let blob;
  try {
    const preparedImageBlob = await prepareImageBlobForAi(imageBlob);
    const imageDataUrl = await blobToDataUrl(preparedImageBlob);
    const imagePayload = await requestJsonAi({
      endpoint: runtimeConfig.imageEndpoint,
      headerName: runtimeConfig.imageAuthHeader,
      apiKey: runtimeConfig.apiKey,
      body: {
        model: AI_MODEL_CONFIG.image.model,
        prompt: buildStampImagePrompt(),
        image: imageDataUrl,
      },
    });
    const generatedDataUrl = imagePayload?.imageDataUrl;
    if (!generatedDataUrl) {
      throw new Error("No generated image returned");
    }
    blob = await createAutoCutoutBlob(await dataUrlToBlob(generatedDataUrl));
  } catch (error) {
    console.warn("[happy-online] stamp image ai failed", error);
    imageIssue = getAiErrorMessage(error, "贴纸生成暂时没连上");
    blob = await createLocalStampMock({
      imageBlob,
    });
  }

  return {
    blob,
    caption,
    summary: memorySummary || buildAlbumMemoryFallback({
      label,
      message,
      timestampText,
      sourceType,
      caption,
    }).summary,
    diary: memoryDiary || buildAlbumMemoryFallback({
      label,
      message,
      timestampText,
      sourceType,
      caption,
    }).diary,
    baseColor,
    timestamp,
    timestampText,
    sourceType,
    modelMeta: {
      imageModel: AI_MODEL_CONFIG.image.displayName,
      imageApiModel: AI_MODEL_CONFIG.image.model,
      imageResourcePackageId: AI_MODEL_CONFIG.image.resourcePackageId,
      textModel: AI_MODEL_CONFIG.text.displayName,
      textApiModel: AI_MODEL_CONFIG.text.model,
      textResourcePackageId: AI_MODEL_CONFIG.text.resourcePackageId,
      imagePrompt: buildStampImagePrompt({
        label,
        message,
        timestampText,
        caption,
        baseColor,
      }),
    },
    aiStatus: {
      textIssue,
      imageIssue,
    },
  };
}

async function handleAlbumFile(file, sourceType) {
  if (!file) return;
  try {
    showAlbumMessage("正在载入这张图，先用原图帮你测试交互…");
    const preparedBlob = file;
    const previewUrl = URL.createObjectURL(preparedBlob);
    closeSourceSheet();
    openLabelSheet({
      sourceBlob: preparedBlob,
      previewUrl,
      sourceType,
      timestamp: Date.now(),
    });
    showAlbumMessage("把物品名填上，再保存到图鉴里。");
  } catch {
    showAlbumMessage("这张图片没有读出来，换一张试试。");
  }
}

async function buildAlbumDirectSaveResult({ imageBlob, label, message, timestamp, timestampText, sourceType }) {
  const image = await loadImageFromBlob(imageBlob);
  return {
    blob: imageBlob,
    caption: "",
    summary: buildAlbumMemoryFallback({
      label,
      message,
      timestampText,
      sourceType,
      caption: "",
    }).summary,
    diary: buildAlbumMemoryFallback({
      label,
      message,
      timestampText,
      sourceType,
      caption: "",
    }).diary,
    baseColor: deriveStampBaseColor(image),
    timestamp,
    timestampText,
    sourceType,
    modelMeta: {
      mode: ALBUM_AI_DISABLED ? "original-fallback" : "ai",
    },
  };
}

async function saveAlbumItem({ label, message }) {
  if (!albumPendingSourceBlob || albumSavePending) return;

  try {
    setAlbumSavePending(true);
    showAlbumMessage(ALBUM_AI_DISABLED ? "先用原图把这一格保存下来，方便你测试交互。" : "正在生成贴纸，并整理这格回忆的题签…");
    const result = ALBUM_AI_DISABLED
      ? await buildAlbumDirectSaveResult({
        imageBlob: albumPendingSourceBlob,
        label,
        message,
        timestamp: albumPendingTimestamp || Date.now(),
        timestampText: albumPendingTimestampText || formatClockTime(Date.now()),
        sourceType: albumPendingSourceType,
      })
      : await requestAiStampRender({
        imageBlob: albumPendingSourceBlob,
        label,
        message,
        timestamp: albumPendingTimestamp || Date.now(),
        timestampText: albumPendingTimestampText || formatStampTimestamp(Date.now()),
        sourceType: albumPendingSourceType,
      });

    const item = {
        id: albumEditingItemId || `stamp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      message,
        caption: result.caption || "",
        category: albumPendingCategory || inferAlbumCategory(label, message),
      ts: result.timestamp,
      timestampText: result.timestampText,
      sourceType: result.sourceType,
      baseColor: result.baseColor,
      modelMeta: result.modelMeta,
      blob: result.blob,
    };

    await putAlbumStoreItem(item);
    addMemory({
      text: message?.trim()
          ? `收下一枚「${label}」图鉴，还写下了「${message.trim()}」`
          : `收下一枚「${label}」图鉴`,
      type: "event",
        summary: result.summary || buildAlbumMemoryFallback({
          label,
          message,
          timestampText: formatClockTime(result.timestamp),
          sourceType: result.sourceType,
          caption: result.caption || "",
        }).summary,
        diary: result.diary || buildAlbumMemoryFallback({
          label,
          message,
          timestampText: formatClockTime(result.timestamp),
          sourceType: result.sourceType,
          caption: result.caption || "",
        }).diary,
        stampCaption: result.caption || "",
        relatedLabel: label,
      imp: 6,
    });
    closeLabelSheet();
    await loadAlbumItems();
    renderAlbum();
    const aiStatus = result.aiStatus || {};
    if (aiStatus.imageIssue && aiStatus.textIssue) {
      showAlbumMessage(`已经把「${label}」收进图鉴了；AI 题签和贴纸都失败了，先用了本地兜底。`);
    } else if (aiStatus.imageIssue) {
      showAlbumMessage(`已经把「${label}」收进图鉴了；贴纸 AI 暂时没连上，先用了本地裁切。`);
    } else if (aiStatus.textIssue) {
      showAlbumMessage(`已经把「${label}」收进图鉴了；题签 AI 暂时没连上，先留空保存。`);
    } else {
      showAlbumMessage(`已经把「${label}」收进图鉴了`);
    }
  } catch (error) {
    console.warn("[happy-online] save album item failed", error);
    showAlbumMessage("这格图鉴没有保存成功，再试一次。");
    setAlbumSavePending(false);
  }
}

function getAngleFromEvent(event) {
  return Math.atan2(event.clientY - stirCenter.y, event.clientX - stirCenter.x);
}

function normalizeDelta(delta) {
  if (delta > Math.PI) return delta - Math.PI * 2;
  if (delta < -Math.PI) return delta + Math.PI * 2;
  return delta;
}

function updateMatchaCounter() {
  if (matchaCounter) {
    matchaCounter.textContent = `🌀 ×${matchaRounds}`;
  }
}

function updateOnsenCounter() {
  if (onsenCounter) {
    onsenCounter.textContent = `♨ ×${onsenRipples}`;
  }
}

function getMatchaComment(rounds) {
  return matchaComments.find((comment) => rounds >= comment.min)?.text || matchaComments.at(-1).text;
}

function getMatchaBadgeText(rounds) {
  const tier = Math.floor(rounds / 10);
  if (tier >= 3) {
    return `${rounds} 圈达成，茶筅已经冒出大阪限定残影了。`;
  }
  if (tier === 2) {
    return `${rounds} 圈达成，泡沫细得像夏日祭的云。`;
  }
  return `${rounds} 圈达成，抹茶徽章正式授与。`;
}

function showMatchaBadge(rounds) {
  isStirring = false;
  previousAngle = null;
  stirZone?.classList.remove("is-stirring");
  if (badgeResult) {
    badgeResult.textContent = getMatchaBadgeText(rounds);
  }
  badgeModal?.classList.remove("is-hidden");
}

function completeMatcha() {
  const currentMilestone = Math.floor(matchaRounds / 10) * 10;
  if (currentMilestone < 10 || currentMilestone <= lastBadgeRound) {
    return;
  }

  lastBadgeRound = currentMilestone;
  if (!state.badges.matcha) {
    addMemory({
      text: "在抹茶体验里认真搅满了十圈，茶香终于慢慢冒出来。",
      type: "quest",
        summary: "体验了【抹茶之旅】，获得茶道徽章",
        diary: `「${formatClockTime(Date.now())} 🍵 抹茶之旅」\n菠萝今天去体验了抹茶！菠萝搅了好多圈，看起来很认真的样子。光是想到菠萝把茶香一点点搅出来，我都会替菠萝觉得今天很值得。`,
      imp: 7,
    });
    state.badges.matcha = true;
    setChatScene("matcha");
    if (!state.backpackItems.includes("matcha-badge")) {
      state.backpackItems.push("matcha-badge");
    }
    saveState();
    syncCompletion();
  }

  showMatchaBadge(currentMilestone);
}

function resetMatchaInteraction() {
  particles = [];
  isStirring = false;
  previousAngle = null;
  accumulatedAngle = 0;
  matchaRounds = 0;
  lastBadgeRound = 0;
  stirZone?.classList.remove("is-stirring");
  badgeModal?.classList.add("is-hidden");
  if (matchaNpcBubble) {
    matchaNpcBubble.textContent = "搅起来搅起来，空气里都是茶香啦。";
  }
  updateMatchaCounter();
}

function getOnsenComment(count) {
  if (count >= 8) return onsenComments[3];
  if (count >= 5) return onsenComments[2];
  if (count >= 2) return onsenComments[1];
  return onsenComments[0];
}

function showOnsenBadge() {
  if (onsenBadgeResult) {
    onsenBadgeResult.textContent = "8 道水波荡开，温泉徽章正式授与。今天的疲惫可以先寄存在大阪。";
  }
  onsenBadgeModal?.classList.remove("is-hidden");
}

function completeOnsen() {
  if (onsenRipples < 8 || onsenCompleted) {
    return;
  }

  onsenCompleted = true;
  if (!state.badges.onsen) {
    addMemory({
      text: "在温泉水面点开了八道涟漪，把今天的疲惫先寄存在热气里。",
      type: "quest",
        summary: "体验了【温泉物语】，把疲惫泡进热气里",
        diary: `「${formatClockTime(Date.now())} ♨️ 温泉物语」\n菠萝今天在温泉页点开了好多水波纹，像是把一路的疲惫都慢慢泡散了。热气浮起来的时候，我都想替菠萝说一句“今天辛苦啦”。`,
      imp: 7,
    });
    state.badges.onsen = true;
    setChatScene("onsen");
    if (!state.backpackItems.includes("onsen-badge")) {
      state.backpackItems.push("onsen-badge");
    }
    saveState();
    syncCompletion();
  }

  showOnsenBadge();
}

function resetOnsenInteraction() {
  onsenRipples = 0;
  onsenCompleted = false;
  onsenBadgeModal?.classList.add("is-hidden");
  if (onsenNpcBubble) {
    onsenNpcBubble.textContent = onsenComments[0];
  }
  updateOnsenCounter();
}

function updateWishCount() {
  if (!wishInput || !wishCount) return;
  wishCount.textContent = `${wishInput.value.length}/30`;
}

function openWishPanel() {
  wishPanel?.classList.add("is-open");
  window.setTimeout(() => wishInput?.focus(), 120);
}

function closeWishPanel() {
  wishPanel?.classList.remove("is-open");
}

function getShrineReply(wish) {
  let hash = 0;
  for (const char of wish) {
    hash = (hash + char.charCodeAt(0)) % shrineReplies.length;
  }
  return shrineReplies[(hash + Math.floor(Math.random() * shrineReplies.length)) % shrineReplies.length];
}

function showShrineBadge() {
  if (shrineBadgeResult) {
    shrineBadgeResult.textContent = "神明悄悄在木牌背面写了回信。";
  }
  shrineBadgeModal?.classList.remove("is-hidden");
}

function completeShrine(wish) {
  const reply = getShrineReply(wish);
  lastWish = wish;
  if (emaWish) {
    emaWish.textContent = wish;
  }
  if (emaReply) {
    emaReply.textContent = reply;
  }
  if (shrineNpcBubble) {
    shrineNpcBubble.textContent = `神明回信：${reply}`;
  }

  emaPlaque?.classList.remove("is-hung", "is-flipped");
  void emaPlaque?.offsetWidth;
  emaPlaque?.classList.add("has-wish", "is-hung");
  window.setTimeout(() => emaPlaque?.classList.add("is-flipped"), 620);

  if (!state.badges.shrine) {
    addMemory({
      text: `把「${wish}」写上绘马，神明回了你一句「${reply}」。`,
      type: "quest",
        summary: "体验了【神社巫女】，把心愿轻轻挂好",
        diary: `「${formatClockTime(Date.now())} ⛩️ 神社巫女」\n菠萝把「${wish}」认真写上绘马，神明还回了菠萝一句「${reply}」。那一瞬间很像有人替菠萝轻轻点了点头，说“会实现的”。`,
      imp: 7,
    });
    state.badges.shrine = true;
    setChatScene("shrine");
    if (!state.backpackItems.includes("shrine-badge")) {
      state.backpackItems.push("shrine-badge");
    }
    saveState();
    syncCompletion();
    window.setTimeout(showShrineBadge, 980);
  }
}

function resetShrineInteraction() {
  closeWishPanel();
  shrineBadgeModal?.classList.add("is-hidden");
  wishInput && (wishInput.value = "");
  updateWishCount();
  if (shrineNpcBubble) {
    shrineNpcBubble.textContent = "写认真一点，神明说不定真的会偷看。";
  }
  if (!lastWish) {
    emaPlaque?.classList.remove("has-wish", "is-hung", "is-flipped");
  }
}

function prepareHanabiCanvas() {
  if (!hanabiCanvas) return;
  const ratio = window.devicePixelRatio || 1;
  const rect = hanabiCanvas.getBoundingClientRect();
  hanabiCanvas.width = Math.floor(rect.width * ratio);
  hanabiCanvas.height = Math.floor(rect.height * ratio);
  hanabiCtx = hanabiCanvas.getContext("2d");
  hanabiCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function updateHanabiCounter() {
  if (hanabiCounter) {
    hanabiCounter.textContent = `🎆 ×${fireworkCount}/10`;
  }
}

function createFirework(targetX, targetY) {
  if (!hanabiCanvas || hanabiLocked || fireworkCount >= 10) return;
  const rect = hanabiCanvas.getBoundingClientRect();
  const startX = rect.width / 2;
  const startY = rect.height + 18;
  fireworkCount += 1;
  updateHanabiCounter();

  const isFinal = fireworkCount === 10;
  fireworks.push({
    x: startX,
    y: startY,
    sx: startX,
    sy: startY,
    tx: targetX,
    ty: targetY,
    progress: 0,
    color: isFinal ? "#FFD700" : fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
    final: isFinal,
  });

  if (isFinal) {
    hanabiLocked = true;
    if (hanabiHint) {
      hanabiHint.textContent = "最后一朵花火，正在把今天写成信。";
    }
  }
}

function explodeFirework(firework) {
  const total = firework.final ? 280 : 90 + Math.floor(Math.random() * 35);
  const baseColor = firework.final ? "#FFD700" : firework.color;
  for (let index = 0; index < total; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (firework.final ? 2.4 : 1.5) + Math.random() * (firework.final ? 4.8 : 3.2);
    fireworkParticles.push({
      x: firework.tx,
      y: firework.ty,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: firework.final ? 1.8 : 1,
      decay: firework.final ? 0.008 : 0.014 + Math.random() * 0.006,
      size: firework.final ? 1.7 + Math.random() * 2.8 : 1.2 + Math.random() * 2.2,
      color: Math.random() > 0.18 ? baseColor : fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
      final: firework.final,
    });
  }

  if (firework.final) {
    window.setTimeout(revealMemoryScene, 1500);
  }
}

function drawHanabiFrame() {
  if (!hanabiCtx || !hanabiCanvas) return;
  const rect = hanabiCanvas.getBoundingClientRect();

  hanabiCtx.globalCompositeOperation = "destination-out";
  hanabiCtx.fillStyle = "rgba(0, 0, 0, 0.16)";
  hanabiCtx.fillRect(0, 0, rect.width, rect.height);
  hanabiCtx.globalCompositeOperation = "source-over";

  fireworks = fireworks.filter((firework) => {
    firework.progress += 0.035;
    const eased = 1 - Math.pow(1 - Math.min(firework.progress, 1), 3);
    firework.x = firework.sx + (firework.tx - firework.sx) * eased;
    firework.y = firework.sy + (firework.ty - firework.sy) * eased;

    hanabiCtx.beginPath();
    hanabiCtx.strokeStyle = firework.color;
    hanabiCtx.globalAlpha = 0.72;
    hanabiCtx.lineWidth = firework.final ? 2.2 : 1.5;
    hanabiCtx.moveTo(firework.x, firework.y + 24);
    hanabiCtx.lineTo(firework.x, firework.y);
    hanabiCtx.stroke();
    hanabiCtx.globalAlpha = 1;

    hanabiCtx.beginPath();
    hanabiCtx.fillStyle = firework.color;
    hanabiCtx.arc(firework.x, firework.y, firework.final ? 3.6 : 2.4, 0, Math.PI * 2);
    hanabiCtx.fill();

    if (firework.progress >= 1) {
      explodeFirework(firework);
      return false;
    }
    return true;
  });

  fireworkParticles = fireworkParticles.filter((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += particle.final ? 0.015 : 0.035;
    particle.vx *= 0.992;
    particle.vy *= 0.992;
    particle.life -= particle.decay;

    if (particle.life <= 0) return false;

    hanabiCtx.beginPath();
    hanabiCtx.globalAlpha = Math.min(1, particle.life);
    hanabiCtx.fillStyle = particle.color;
    hanabiCtx.shadowColor = particle.color;
    hanabiCtx.shadowBlur = particle.final ? 15 : 9;
    hanabiCtx.arc(particle.x, particle.y, particle.size * Math.max(0.4, particle.life), 0, Math.PI * 2);
    hanabiCtx.fill();
    hanabiCtx.shadowBlur = 0;
    hanabiCtx.globalAlpha = 1;
    return true;
  });
}

function startHanabiLoop() {
  if (hanabiAnimationFrameId) return;
  const tick = () => {
    drawHanabiFrame();
    hanabiAnimationFrameId = window.requestAnimationFrame(tick);
  };
  hanabiAnimationFrameId = window.requestAnimationFrame(tick);
}

function stopHanabiLoop() {
  if (!hanabiAnimationFrameId) return;
  window.cancelAnimationFrame(hanabiAnimationFrameId);
  hanabiAnimationFrameId = null;
}

function getCompletedMemoryText() {
  const completed = Object.entries(state.badges)
    .filter(([, done]) => done)
    .map(([key]) => memoryFragments[key])
    .filter(Boolean);
  const journey = completed.length ? completed.join("，") : "从大阪地图出发";
  return `你在大阪的夜色里认真走过了这些小小的仪式：${journey}。鹅鹅鹅替远在上海的我说：生日快乐菠萝，天天开心：）`;
}

function typeMemoryText(text) {
  if (!memoryCopy) return;
  window.clearTimeout(memoryTypeTimer);
  memoryCopy.textContent = "";
  memoryTypeIndex = 0;
  const typeNext = () => {
    memoryCopy.textContent = text.slice(0, memoryTypeIndex);
    memoryTypeIndex += 1;
    if (memoryTypeIndex <= text.length) {
      memoryTypeTimer = window.setTimeout(typeNext, 40);
    }
  };
  typeNext();
}

function completeHanabi() {
  if (!state.badges.hanabi) {
    addMemory({
      text: "在大阪夜空下放完了十朵花火，最后一朵把今天写成了回忆。",
      type: "quest",
      summary: "体验了【烟火大会】，获得烟火徽章",
      diary: `「${formatClockTime(Date.now())} 🎆 烟火大会」\n菠萝今晚看到的花火真的很热闹。菠萝把最后一朵烟火也点亮的时候，我就知道这一天已经被菠萝好好收下了，亮晶晶的，像会发光的回忆。`,
      imp: 8,
    });
    state.badges.hanabi = true;
    setChatScene("hanabi");
    if (!state.backpackItems.includes("hanabi-badge")) {
      state.backpackItems.push("hanabi-badge");
    }
    saveState();
    syncCompletion();
  }
}

function revealMemoryScene() {
  hanabiCard?.classList.add("is-memory-ready");
  memoryText = getCompletedMemoryText();
  typeMemoryText(memoryText);
  completeHanabi();
}

function resetHanabiInteraction() {
  fireworks = [];
  fireworkParticles = [];
  fireworkCount = 0;
  hanabiLocked = false;
  memoryText = "";
  window.clearTimeout(memoryTypeTimer);
  memoryCopy && (memoryCopy.textContent = "");
  memorySaveButton && (memorySaveButton.textContent = "♡ 收藏这段回忆");
  memorySaveButton?.classList.remove("is-saved");
  hanabiCard?.classList.remove("is-memory-ready");
  if (hanabiHint) {
    hanabiHint.textContent = "点击夜空，放满十朵花火";
  }
  if (hanabiCtx && hanabiCanvas) {
    const rect = hanabiCanvas.getBoundingClientRect();
    hanabiCtx.clearRect(0, 0, rect.width, rect.height);
  }
  updateHanabiCounter();
}

function prepareMatchaCanvas() {
  if (!matchaCanvas) return;
  const ratio = window.devicePixelRatio || 1;
  const rect = matchaCanvas.getBoundingClientRect();
  matchaCanvas.width = Math.floor(rect.width * ratio);
  matchaCanvas.height = Math.floor(rect.height * ratio);
  matchaCtx = matchaCanvas.getContext("2d");
  matchaCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function addParticles(x, y) {
  const count = Math.min(8, 3 + matchaRounds);
  for (let index = 0; index < count; index += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * (1.2 + matchaRounds * 0.12),
      vy: (Math.random() - 0.5) * (1.2 + matchaRounds * 0.12),
      life: 1,
      size: 2 + Math.random() * 4,
      hue: 95 + Math.random() * 28,
    });
  }
  if (particles.length > 120) {
    particles.splice(0, particles.length - 120);
  }
}

function drawMatchaParticles() {
  if (!matchaCtx || !matchaCanvas) return;
  const rect = matchaCanvas.getBoundingClientRect();
  matchaCtx.clearRect(0, 0, rect.width, rect.height);

  particles = particles.filter((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx += (stirCenter.x - particle.x) * 0.0008;
    particle.vy += (stirCenter.y - particle.y) * 0.0008;
    particle.life -= 0.018;

    if (particle.life <= 0) return false;

    matchaCtx.beginPath();
    matchaCtx.fillStyle = `hsla(${particle.hue}, 52%, ${42 - matchaRounds}%, ${particle.life * 0.58})`;
    matchaCtx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
    matchaCtx.fill();
    return true;
  });
}

function startMatchaLoop() {
  if (animationFrameId) return;
  const tick = () => {
    drawMatchaParticles();
    animationFrameId = window.requestAnimationFrame(tick);
  };
  animationFrameId = window.requestAnimationFrame(tick);
}

function stopMatchaLoop() {
  if (!animationFrameId) return;
  window.cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
}

startButton?.addEventListener("click", () => {
  startButton.classList.add("is-pressed");
  showScreen("map");
});

document.addEventListener("click", (event) => {
  if (wishPanel?.classList.contains("is-open")) {
    const clickedInsidePanel = event.target.closest(".wish-panel");
    const clickedEma = event.target.closest(".ema-plaque");
    if (!clickedInsidePanel && !clickedEma) {
      closeWishPanel();
    }
  }

  if (sourceSheet && !sourceSheet.classList.contains("is-hidden")) {
    const clickedInsideSourceCard = event.target.closest(".source-sheet-card");
    if (!clickedInsideSourceCard && event.target.closest(".source-sheet")) {
      closeSourceSheet();
    }
  }

  if (labelSheet && !labelSheet.classList.contains("is-hidden")) {
    const clickedInsideLabelCard = event.target.closest(".label-sheet-card");
    if (!clickedInsideLabelCard && event.target.closest(".label-sheet")) {
      closeLabelSheet();
      renderAlbum();
    }
  }

  if (memoryLetterSheet && !memoryLetterSheet.classList.contains("is-hidden")) {
    const clickedInsideLetterCard = event.target.closest(".memory-letter-sheet-card");
    if (!clickedInsideLetterCard && event.target.closest(".memory-letter-sheet")) {
      closeMemoryLetterSheet();
    }
  }

  const routeTarget = event.target.closest("[data-route]");
  if (!routeTarget) return;
  routeTo(routeTarget.dataset.route);
});

emaPlaque?.addEventListener("click", (event) => {
  event.stopPropagation();
  openWishPanel();
});

wishInput?.addEventListener("input", updateWishCount);

wishSubmit?.addEventListener("click", () => {
  const wish = wishInput?.value.trim() || "";
  if (!wish) {
    if (shrineNpcBubble) {
      shrineNpcBubble.textContent = "空白绘马神明看不懂啦。";
    }
    return;
  }

  closeWishPanel();
  completeShrine(wish);
});

hanabiCanvas?.addEventListener("pointerdown", (event) => {
  if (hanabiLocked || fireworkCount >= 10) return;
  event.preventDefault();
  const rect = hanabiCanvas.getBoundingClientRect();
  createFirework(event.clientX - rect.left, event.clientY - rect.top);
});

memorySaveButton?.addEventListener("click", () => {
  if (!memoryText) return;
  if (!state.backpackItems.includes("hanabi-memory")) {
    state.backpackItems.push("hanabi-memory");
  }
  saveState();
  addMemory({
    text: "把花火之后那段今日回忆认真收藏了起来。",
    type: "letter",
    imp: 6,
  });
  memorySaveButton.textContent = "♥ 已收藏";
  memorySaveButton.classList.add("is-saved");
});

chatSceneCharacter?.addEventListener("click", () => {
  openChatSheet();
});

chatMotionToggle?.addEventListener("click", () => {
  state.officeDynamicEnabled = !state.officeDynamicEnabled;
  saveState();
  if (!state.officeDynamicEnabled) {
    stopChatOfficeMotion();
    chatOfficeVisualPosition = null;
  }
  restartChatOfficeLoop();
  if (state.officeDynamicEnabled && state.currentScreen === "chat" && !isChatSheetOpen()) {
    runChatOfficeMotionTo(getNextDynamicOfficeStateKey());
  }
});

chatComposer?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nextMessage = chatInput?.value.trim() || "";
  if (!nextMessage) {
    chatInput?.focus();
    return;
  }
  if (chatInput) {
    chatInput.value = "";
    chatInput.style.height = "";
  }
  await sendChatMessage(nextMessage);
});

chatInput?.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 112)}px`;
});

chatInput?.addEventListener("focus", () => {
  chatCard?.classList.add("is-keyboard-open");
});

chatInput?.addEventListener("blur", () => {
  chatCard?.classList.remove("is-keyboard-open");
});

chatSheetClose?.addEventListener("click", () => {
  closeChatSheet();
});

memoryLetterEntry?.addEventListener("click", () => {
  generateMemoryLetter();
});

memoryLetterGenerate?.addEventListener("click", () => {
  generateMemoryLetter(true);
});

albumFilterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    albumFilter = chip.dataset.category || "all";
    renderAlbum();
  });
});

albumCategoryChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    updateAlbumCategorySelection(chip.dataset.category || "");
  });
});

memoryLetterClose?.addEventListener("click", () => {
  closeMemoryLetterSheet();
});

memoryLetterSave?.addEventListener("click", async () => {
  await saveMemoryLetterImage();
});

memoryLetterCopy?.addEventListener("click", async () => {
  await copyMemoryLetterText();
});

memoryLetterShare?.addEventListener("click", async () => {
  await shareMemoryLetter();
});

albumSourceCamera?.addEventListener("click", () => {
  albumCameraInput?.click();
});

albumSourceUpload?.addEventListener("click", () => {
  albumUploadInput?.click();
});

albumSourceCancel?.addEventListener("click", () => {
  closeSourceSheet();
});

albumCameraInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    event.target.value = "";
    return;
  }
  try {
    await handleAlbumFile(file, "camera");
  } catch {
    showAlbumMessage("这张图片没读出来，换一张试试。");
  }
  event.target.value = "";
});

albumUploadInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    event.target.value = "";
    return;
  }
  try {
    await handleAlbumFile(file, "upload");
  } catch {
    showAlbumMessage("这张图片没读出来，换一张试试。");
  }
  event.target.value = "";
});

albumLabelCancel?.addEventListener("click", () => {
  closeLabelSheet();
  renderAlbum();
});

albumLabelSave?.addEventListener("click", async () => {
  const label = albumLabelInput?.value.trim() || "";
  if (!label) {
    albumLabelInput?.focus();
    showAlbumMessage("先把物品名写上。");
    return;
  }
  if (!albumPendingCategory) {
    albumCategoryChips[0]?.focus();
    showAlbumMessage("先选一个分类标签，比如食物 / 风景 / 道具。");
    return;
  }
  await saveAlbumItem({
    label,
    message: albumMessageInput?.value.trim() || "",
  });
});

albumLabelDownload?.addEventListener("click", () => {
  if (!albumPendingSourceBlob) return;
  const label = albumLabelInput?.value.trim() || "图鉴图片";
  downloadBlob(albumPendingSourceBlob, `${label}.png`);
});

stirZone?.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  const rect = stirZone.getBoundingClientRect();
  stirCenter = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
  isStirring = true;
  previousAngle = getAngleFromEvent(event);
  stirZone.setPointerCapture(event.pointerId);
  stirZone.classList.add("is-stirring");
});

stirZone?.addEventListener("pointermove", (event) => {
  if (!isStirring || previousAngle === null) return;
  event.preventDefault();

  const angle = getAngleFromEvent(event);
  const delta = normalizeDelta(angle - previousAngle);
  accumulatedAngle += Math.abs(delta);
  previousAngle = angle;

  const nextRounds = Math.floor(accumulatedAngle / (Math.PI * 2));
  if (nextRounds !== matchaRounds) {
    matchaRounds = nextRounds;
    updateMatchaCounter();
    if (matchaNpcBubble) {
      matchaNpcBubble.textContent = getMatchaComment(matchaRounds);
    }
    completeMatcha();
  }

  addParticles(event.clientX, event.clientY);
});

stirZone?.addEventListener("pointerup", (event) => {
  if (!isStirring) return;
  isStirring = false;
  previousAngle = null;
  stirZone.releasePointerCapture(event.pointerId);
  stirZone.classList.remove("is-stirring");

  if (matchaNpcBubble) {
    matchaNpcBubble.textContent = getMatchaComment(matchaRounds);
  }
  completeMatcha();
});

stirZone?.addEventListener("pointercancel", () => {
  isStirring = false;
  previousAngle = null;
  stirZone.classList.remove("is-stirring");
});

onsenWaterZone?.addEventListener("pointerdown", (event) => {
  event.preventDefault();

  const rect = onsenWaterZone.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "onsen-ripple";
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  onsenWaterZone.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), { once: true });

  const steam = document.createElement("span");
  steam.className = "onsen-tap-steam";
  steam.style.left = `${event.clientX - rect.left}px`;
  steam.style.top = `${event.clientY - rect.top}px`;
  onsenWaterZone.appendChild(steam);
  steam.addEventListener("animationend", () => steam.remove(), { once: true });

  onsenRipples += 1;
  updateOnsenCounter();
  if (onsenNpcBubble) {
    onsenNpcBubble.textContent = getOnsenComment(onsenRipples);
  }
  completeOnsen();
});

window.addEventListener("resize", () => {
  syncViewportMetrics();
  prepareMatchaCanvas();
  prepareHanabiCanvas();
  syncMapNpcBubble();
});

window.visualViewport?.addEventListener("resize", syncViewportMetrics);
window.visualViewport?.addEventListener("resize", syncMapNpcBubble);
window.visualViewport?.addEventListener("scroll", () => {
  syncViewportMetrics();
  syncMapNpcBubble();
});

window.addEventListener("beforeunload", () => {
  revokeAlbumObjectUrls();
  if (albumPendingPreviewUrl) {
    URL.revokeObjectURL(albumPendingPreviewUrl);
  }
});

window.setInterval(() => {
  if (state.currentScreen !== "map" || npcHintTimer) return;
  npcLineIndex = (npcLineIndex + 1) % npcLines.length;
  syncMapNpcBubble();
}, 6000);

syncCompletion();
ensureSeedMemories();
syncViewportMetrics();
renderAlbum();
initAlbumStore();
renderChatSuggestions();
renderChatThread();
syncChatOfficeScene();
renderMemoryHub();
initPetDock();
showScreen(state.started ? state.currentScreen || "map" : "welcome");
