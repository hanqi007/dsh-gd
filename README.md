# dsh-gd

DSH 启动动画（**星布谷地**）：一座漂浮在星海上的小岛——草地、树影、亮着灯的小屋、四颗缓慢漂移的小星球，
标题浮现后揭幕。全部原创内联 SVG + CSS 绘制，不含任何截图、视频或外部素材。

带设置面板（设置 →「星布谷地」），可调播放时机、速度、停留时长、文案与交互开关；web profile 与
DeepSeek Harness Desktop 通用。

## 场景

| 元素 | 做法 |
|---|---|
| 星空 | 深蓝→墨绿渐变 + 110 颗随机星尘（各自闪烁） |
| 主岛 | 草地椭圆 + 岩层渐变底座，整体缓慢上下浮动 |
| 树 | 圆形树冠叠三层色，树干圆角矩形 |
| 小屋 | 三角屋顶 + 墙体 + 拱门内暖光 + 圆形窗（呼吸） |
| 小星球 | 四颗不同色球体，各自漂移（周期与延迟不同） |
| 文字 | 标题 + 副标题，延迟浮现 |
| 加载 | 细进度条走满 |

## 配置

存 `~/.dsh/dsh-gd.json`，也可在设置面板里改（改完立即写盘，下次刷新生效）。

| 键 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `enabled` | boolean | `true` | 关掉后直接进主界面 |
| `mode` | enum | `session` | `session` / `always` / `once` / `daily` |
| `speed` | number | `1` | 0.35 – 3，缩放文字、加载条、漂浮动画与停留时长 |
| `duration` | number | `6200` | 停留多久自动揭幕（毫秒，1200 – 20000） |
| `title` | string | `星布谷地` | 主标题 |
| `sub` | string | `LOOMIX · GUDI` | 副标题 |
| `allowSkip` | boolean | `true` | 点击/按键跳过 |
| `showLoading` | boolean | `true` | 底部加载条 |

脏数据不会写坏配置：非法 `mode` 回退 `session`，数字夹到区间，空白标题回退默认值。

## 行为

- 点任意处 / 按任意键 → 立即揭幕（`allowSkip` 关掉后不响应）
- 不操作 → `duration` 毫秒后自动揭幕
- 揭幕是淡出后移除根节点、解除滚动锁
- 模式命中（如 `session` 已播过）时**直接移除、不渲染**，不会闪一帧黑屏
- 兜底计时器保证任何异常都不会把用户困在黑屏里

## 结构

```
dsh-gd/
├─ build.mjs          src → lib（拼接运行时、注入默认值、生成 demo）
├─ src/
│  ├─ scene.js        场景 SVG（纯函数：buildScene / buildLayer）
│  ├─ boot.js         运行时：配置、模式、时序、跳过、揭幕
│  ├─ boot.css        样式（时长全部写成 calc(基准 / var(--gd-speed))）
│  └─ client.js       设置面板 + 桌面端自举
├─ lib/               构建产物（index.js 手写，其余由 build 生成）
├─ test/              host / splash / panel 三个冒烟套件
└─ demo.html          双击即看
```

## 接口

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/dsh-gd/config` | 当前配置 + 默认值 + 版本 |
| POST | `/dsh-gd/config` | 保存配置（返回归一化后的结果） |
| GET | `/dsh-gd/splash.css` | 样式 |
| GET | `/dsh-gd/splash.js` | 运行时 |
| GET | `/dsh-gd/replay` | 独立的预览页（设置面板「立即预览」用） |

## 桌面端

桌面端不走 Host 的 `tapIndex` 注入，由 `lib/client.js` 的 `selfBoot()` 兜底：读配置 → 判断模式 →
自己挂根节点、拉 CSS 与运行时。所以 desktop 与 web 表现一致。

## 构建与测试

```bash
node build.mjs
node test/smoke-host.mjs    # 37 项
node test/smoke-splash.mjs  # 35 项（在假 DOM 里真跑运行时）
node test/smoke-panel.mjs   # 26 项
```

全绿：98 项。

## 安装

```bash
dsh plugin --profile desktop add ./dsh-gd-2.0.0.tgz
```

装完重启应用生效。

## License

MIT

## 许可证

本项目采用**自定义许可证**，基于 Apache License 2.0 附加限制，详见 [LICENSE-CUSTOM.md](./LICENSE-CUSTOM.md)。

简单说明：

- ✅ 免费使用、修改、分发
- ✅ 为围绕本软件的服务收费（技术支持、定制、托管、培训）
- ❌ 不得把本软件本身当作收费主体（卖安装包、卖下载链接、单独计价）
- ❌ 不得在自身不是收费主体的前提下收取分发费用

Apache 2.0 全文见 [LICENSE](./LICENSE)。
