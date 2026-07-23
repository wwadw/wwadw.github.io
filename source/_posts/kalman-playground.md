---
title: Kalman Playground：用动态过程理解预测、增益和更新
date: 2026-07-23 10:30:00
tags:
  - Kalman
  - 目标追踪
  - 可视化
  - 工具
categories:
  - 工具分享
---

# Kalman Playground：用动态过程理解预测、增益和更新

Kalman 滤波最容易卡住的地方，通常不是公式本身，而是“预测值、测量值、Kalman Gain、协方差”之间到底怎么互相拉扯。

我做了一个小的交互实验台，可以在浏览器里一步一步观察：

- Predict 如何把上一时刻状态推出当前预测状态；
- Innovation 如何表示“测量值和预测值差了多少”；
- Kalman Gain 如何决定这次更新更相信预测还是测量；
- Update 后状态点如何移动；
- 协方差/不确定性圈如何随着参数变化收缩或放大。

<!--more-->

在线访问：

- GitHub Pages：<https://wwadw.github.io/kalman-playground/>
- 自定义域名：<https://weiwang.wgists.me/kalman-playground/>

如果是在本地预览博客：

```bash
cd /home/ww/my_blog
npm run server
```

然后打开：

```text
http://localhost:4000/kalman-playground/
```

## 怎么使用

页面左侧可以切换滤波器模型：

| 模型 | 状态 | 测量输入 | 适合观察 |
|---|---|---|---|
| 1D KF | `[x, v]` | `position` | 最基础的位置/速度 Kalman 更新 |
| 2D CV-KF | `[x, y, vx, vy]` | `x, y` | 常见 2D 目标追踪 |
| EKF | `[x, y, vx, vy]` | `range, bearing` | 非线性观测 + Jacobian |
| UKF | `[x, y, vx, vy]` | `range, bearing` | Sigma points 非线性更新 |

每次实验可以按这个顺序走：

1. 输入一个测量值，或者直接点击中间坐标画布添加点；
2. 点 `Predict`，观察黄色预测点和黄色不确定性圈；
3. 点 `Innovation / Gain`，观察白色测量点、红色 residual 箭头和 Kalman Gain；
4. 点 `Update`，观察青色更新点如何从预测点被拉向测量点；
5. 调整 `Q/R/P0/gate/dt`，重复观察轨迹变化。

## 输入格式

不同滤波器需要的测量格式不同：

```text
1D KF:      4.2
2D CV-KF:   4.2, 1.1
EKF / UKF:  4.4, 0.25
```

其中 EKF / UKF 的输入是：

```text
range, bearing(rad)
```

如果不想手动输入，可以直接点击中间画布。页面会自动把点击坐标转换成当前滤波器需要的测量格式：

- `1D KF`：点击位置的 x 坐标会作为 position；
- `2D CV-KF`：点击点会作为 `x, y`；
- `EKF / UKF`：点击点会转换成 `range, bearing`。

## 图上的圈是什么

图上的圈/椭圆表示协方差，也就是滤波器对当前状态的“不确定性”。

直觉上可以这样看：

- 圈越大：滤波器越不确定；
- 圈越小：滤波器越有把握；
- `Q` 越大：预测阶段更容易发散，圈会变大；
- `R` 越大：测量更不可信，更新时状态点不会被测量拉得太猛；
- `P0` 越大：初始状态更不确定，前几次测量影响会更明显。

颜色含义：

| 颜色 | 含义 |
|---|---|
| 绿色 | 上一时刻/当前后验状态 |
| 黄色 | Predict 后的预测状态 |
| 白色 | 当前测量值 |
| 青色 | Update 后的新状态 |
| 红色箭头 | Innovation / residual，也就是测量和预测的差 |

## 为什么这个工具有用

调 Kalman 参数时，很容易陷入“Q、R、P 到底该怎么改”的迷雾里。这个实验台不是为了替代真实 bag/log 验证，而是帮助先建立直觉：

- 目标跟得太慢：通常要看 `Q` 是否太小，或 `R` 是否太大；
- 轨迹抖动明显：通常要看 `R` 是否太小，或 `Q` 是否太大；
- 初始几帧跳动大：通常和 `P0`、首帧测量、初始速度假设有关；
- 离群点把轨迹拉飞：需要关注 gate 和异常测量筛选。

先在这里把“预测、测量、更新”的关系看明白，再回到真实追踪系统里调参，会省很多玄学时间。

## GitHub Pages 托管方式

这个工具是纯静态页面，只有：

```text
index.html
styles.css
app.js
```

在 Hexo 里放在：

```text
source/kalman-playground/
```

执行：

```bash
npm run build
npm run deploy
```

部署后就可以通过 GitHub Pages 随时访问：

```text
https://wwadw.github.io/kalman-playground/
```

如果自定义域名配置正常，也可以访问：

```text
https://weiwang.wgists.me/kalman-playground/
```
