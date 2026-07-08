# 策略侧 PRD（含 AI API）

## 1. 图鉴能力方向
- 当前方向：从“像素风图鉴”切换为“AI 邮票时间轴”。
- 用户动作：
  - 点击 `收一枚新邮票`
  - 选择 `现在拍一张` 或 `从相册选择`
  - 自动记录时间
  - 必填 `物品名`
  - 可选填写 `想说的话`
  - 交给 AI 生成邮票图

## 2. 当前已接入的模型选择

### 2.1 生图模型
- Provider：Doubao
- Model：`Doubao-Seedream-5.0-Lite`
- 资源包：`Doubao-Seedream-5.0-Lite-免费在线推理资源包`
- Resource Package ID：`rpi-20260328145055-m84bv`

### 2.2 文字模型
- Provider：Doubao
- Model：`Doubao-Seed-2.0-lite`
- 资源包：`Doubao-Seed-2.0-lite免费在线推理资源包`
- Resource Package ID：`rpi-20260328143906-7mqqv`

## 3. 当前代码状态
- 前端已完成：
  - 邮票时间轴 UI
  - 拍照 / 相册双入口
  - 自动时间抓取
  - `物品名` 必填、`想说的话` 可选
  - IndexedDB + Blob 存储
- `app.js` 已写入模型配置常量：
  - 文案模型配置
  - 生图模型配置
  - prompt 构建逻辑
  - API transport 占位
- 当前仍使用本地 mock 生成邮票图，等待正式 API 接入

## 4. 下一步待补充
- 图片生成接口地址
- 文本生成接口地址
- 鉴权方式
- 返回格式：
  - 文本接口返回字段
  - 生图接口返回 `url / base64 / blob` 的具体形式
