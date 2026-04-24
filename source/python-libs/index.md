---
title: Python 静态库仓库
date: 2026-04-24 10:00:00
category: Python库
layout: page
---

## 📦 库索引
> 基于 GitHub Pages 托管的静态 wheel 仓库。

| 包名 | 最新版本 | 下载链接 | 说明文档 |
| :--- | :--- | :--- | :--- |
| **Projection** | v0.1.0 | [whl](https://pip.wgists.me/dist/Projection/projection_tools-0.1.0-py3-none-any.whl) | [查看](#projection-tools) |
| **calib-snap** | v0.1.0 | [whl](https://pip.wgists.me/dist/calib-snap/calib_snap-0.1.0-py3-none-any.whl) | [查看](#calib-snap) |
| **dataset** | v0.1.0 | [whl](https://pip.wgists.me/dist/dataset/dataset-0.1.0-py3-none-any.whl) | [查看](#dataset) |
| **fov_filter** | v0.1.0 | [whl](https://pip.wgists.me/dist/fov_filter/fov_filter-0.1.0-py3-none-any.whl) | [查看](#fov-filter) |
| **split_bag** | v0.1.0 | [whl](https://pip.wgists.me/dist/split_bag/split_bag-0.1.0-py3-none-any.whl) | [查看](#split-bag) |

---

## 📖 详细文档

## Projection {#projection-tools}

用于 LiDAR-相机投影检查的 Rerun 工作台。

### 安装

建议在已 `source` ROS 环境后安装 wheel：

```bash
uv pip install /home/ww/pip-repo/dist/Projection/projection_tools-0.1.0-py3-none-any.whl
```

### 启动

最简单的使用方式：

```bash
source /opt/ros/noetic/setup.bash
projection-rerun \
  --bag /path/to/input.bag \
  --yaml /path/to/camera.yaml
```

默认会启动本地 Web 服务：

- `http://127.0.0.1:8765`

如果需要，也可以额外覆盖 topic：

```bash
projection-rerun \
  --bag /path/to/input.bag \
  --yaml /path/to/camera.yaml \
  --image-topic /camera/image_semantic \
  --overlay-image-topic /camera/image_raw \
  --cloud-topic /lidar/points
```

### 配置文件格式

程序会从 YAML 中读取以下字段：

#### 顶层字段

- `semantic_image_topic`
  语义图像 topic
- `overlay_image_topic`
  叠加显示图像 topic
- `pointcloud_topic`
  点云 topic

说明：

- 如果没有 `pointcloud_topic`，程序还会尝试读取 `raw_pointcloud_topic` 或 `compensated_pointcloud_topic`
- 也支持从 `input_sources.semantic_pointcloud.topic` 中提取点云 topic

#### `semantic_camera` 字段

- `image_width`
  图像宽度
- `image_height`
  图像高度
- `camera_matrix.fx`
  相机内参 `fx`
- `camera_matrix.fy`
  相机内参 `fy`
- `camera_matrix.cx`
  相机内参 `cx`
- `camera_matrix.cy`
  相机内参 `cy`
- `distortion_coeffs`
  畸变参数数组
- `lidar_to_camera_transform`
  `4 x 4` 外参矩阵，含旋转和平移

### 示例配置

下面是一份可直接参考的 YAML 示例：

```yaml
semantic_image_topic: /usb_cam/image_semantic_id
overlay_image_topic: /usb_cam/image_raw
pointcloud_topic: /mfla/frame_cloud

semantic_camera:
  image_width: 1280
  image_height: 720

  camera_matrix:
    fx: 923.128
    fy: 921.447
    cx: 640.0
    cy: 360.0

  distortion_coeffs:
    - 0.0123
    - -0.0345
    - 0.0001
    - -0.0002
    - 0.0

  lidar_to_camera_transform:
    - [0.0, -1.0, 0.0, 0.12]
    - [0.0, 0.0, -1.0, 0.03]
    - [1.0, 0.0, 0.0, 0.25]
    - [0.0, 0.0, 0.0, 1.0]
```

### 启动示例

```bash
source /opt/ros/noetic/setup.bash
projection-rerun \
  --bag /home/ww/bags/demo.bag \
  --yaml /home/ww/config/minimal_semantic_robot.yaml
```

### 运行前提

- 可用的 ROS 环境
- 能访问的 `rosbag`
- 正确的 YAML 配置

---

## calib-snap {#calib-snap}

用于标定采集的图像 + 点云配对工具。支持三种输入方式：

- `rtsp`：从 RTSP 拉流读图像，再和 ROS `PointCloud2` 配对保存
- `camera`：从本地摄像头或 `/dev/video*` 读图像，再和 ROS `PointCloud2` 配对保存
- `dual_ros`：图像和点云都直接从 ROS 话题读取

安装后可直接使用 `calib-snap` 命令。

### 依赖

- Python >= 3.8
- `numpy`
- `opencv-python`
- ROS 环境（提供 `rospy`、`sensor_msgs`、`cv_bridge`）

### 安装

建议在已 `source` ROS 环境后安装 wheel：

```bash
pip install https://pip.wgists.me/dist/calib-snap/calib_snap-0.1.0-py3-none-any.whl
```

如果要直接在仓库里用 `uv` 跑别名命令，建议先建一个可复用系统 ROS 包的环境：

```bash
cd /home/ww/pip-repo/code
uv venv --python "$(which python3)" --system-site-packages
source .venv/bin/activate
source /opt/ros/noetic/setup.bash
uv pip install .
```

### 使用

RTSP 模式：

```bash
calib-snap \
  --input-mode rtsp \
  --rtsp-uri rtsp://127.0.0.1:8554/test \
  --pointcloud-topic /livox/lidar
```

摄像头模式：

```bash
calib-snap \
  --input-mode camera \
  --camera-source 0 \
  --pointcloud-topic /livox/lidar
```

也可以直接传设备路径：

```bash
calib-snap \
  --input-mode camera \
  --camera-source /dev/video0 \
  --pointcloud-topic /livox/lidar
```

双 ROS 话题模式：

```bash
calib-snap \
  --input-mode dual_ros \
  --source-image-topic /g1/camera/0/color/image_raw \
  --pointcloud-topic /livox/lidar
```

### 热键

- `s`：保存当前图像 and 最近一帧点云
- `q`：退出

### 输出

默认输出目录为当前目录下的 `data/`：

- `images/`：采集图片
- `pointclouds/`：对应点云 PCD

在 `rtsp` and `camera` 模式下，图像还会额外发布到：

- `/calib/image_raw`
- `/calib/image_raw/compressed`

### 常用参数

- `--output-dir`：输出目录
- `--image-ext`：图片格式，支持 `png/jpg/jpeg`，默认 `png`
- `--pcd-fields`：保存到 PCD 的字段列表，默认 `x,y,z,intensity`
- `--max-pointcloud-age`：允许配对的最大点云时延，默认 `0.5`
- `--fps`：RTSP/Camera 采集和发布频率

---

## dataset {#dataset}

ROS 图像数据采集工具的 Python 包。安装后可用 `dataset` 命令直接启动采集。

### 依赖

- Python >= 3.8
- `opencv-python`
- `numpy`
- ROS 环境（提供 `rospy`、`sensor_msgs`、`cv_bridge`）

### 安装

建议在已 `source` ROS 环境后安装：

```bash
uv venv
uv pip install -e /home/ww/test/scripts/dateset
```

### 运行

```bash
dataset /camera/image_raw 10 ./images
```

或使用配置文件：

```bash
dataset --config config.toml
```

参数说明：

- `topic`：ROS 图像话题名称
- `interval`：采集间隔帧数（每隔多少帧保存一张图片）
- `save_dir`：图片保存目录
- `-f, --format`：图片格式（jpg/png），默认 jpg
- `-p, --prefix`：图片文件名前缀，默认 img
- `-q, --quality`：图片质量（1-100），默认 95

### 直接用 Python 运行

```bash
python /home/ww/test/scripts/dateset/dataset.py /camera/image_raw 10 ./images
```

### 配置文件示例

```toml
[collector]
topic = "/camera/image_raw"
interval = 10
save_dir = "./images"
format = "jpg"
prefix = "img"
quality = 95
```

### 常见问题

- 如果提示 `rospy 未安装或 ROS 环境未加载`，请先 `source` ROS setup（例如 `source /opt/ros/noetic/setup.bash` ）。

---

## fov_filter {#fov-filter}

基于 ROS1 的 PointCloud2 FOV 过滤器。它直接读取 bag 包中的点云话题，按多个水平/垂直 FOV 区域以及距离范围做实时过滤，并把结果发布到 ROS 话题。

这个包自带 bag 播放控制，不依赖 `rosbag play`，因此支持：

- 暂停 / 继续
- 单步前进 / 单步后退
- 动态新增、更新、删除 FOV 区域
- 参数变化后立即对当前帧重新过滤并重发
- 可选把被过滤掉的点云标成红色单独可视化

### 依赖

- Python >= 3.8
- `numpy`
- `PyYAML`
- ROS1 环境（提供 `rospy`、`rosbag`、`sensor_msgs`、`std_msgs`、`rosgraph_msgs`）

### 安装

建议在已 `source` ROS 环境后安装：

```bash
cd /home/ww/test/scripts/fov_filter
uv venv --python "$(which python3)" --system-site-packages
source .venv_ros/bin/activate
source /opt/ros/noetic/setup.bash
uv pip install -e .
```

如果你的 `python3` 来自 conda 或其它自定义环境，这种方式会把当前 Python 环境里的 ROS 相关运行时依赖一并复用进 去，通常比裸 `uv venv` 更稳。

构建 wheel：

```bash
uv build --wheel
```

从 wheel 安装：

```bash
uv pip install dist/fov_filter-0.1.0-py3-none-any.whl
```

构建结果在 `dist/` 下，安装后可直接使用三个命令：

- `fov-filter`
- `fov-filter-ctl`
- `fov-filter-ui`

### 启动

```bash
source /opt/ros/noetic/setup.bash
roscore
```

另开终端运行：

```bash
source /opt/ros/noetic/setup.bash
fov-filter \
  --bag /home/ww/bags/ren/go7.bag \
  --topic /mfla/frame_cloud \
  --paint-rejected \
  --region front:-45:45:-15:20 \
  --region side_left:45:110:-20:25
```

默认发布的话题：

- `/fov_filter/cloud`：过滤后保留的点云
- `/fov_filter/rejected`：被过滤掉的点云
- `/fov_filter/visualized`：可选的彩色可视化点云，过滤掉的点为红色
- `/fov_filter/state`：当前播放与区域状态，JSON 字符串
- `/fov_filter/command`：控制命令输入，JSON 字符串

### 动态控制

如果你不想手动敲命令，直接开桌面滑块面板：

```bash
fov-filter-ui
```

建议的使用方式：

1. 先启动 `fov-filter`
2. 再启动 `fov-filter-ui`
3. 在 UI 里拖动帧滑块，并结合区域数值输入做精调

UI 提供：

- 播放 / 暂停 / 前进一帧 / 后退一帧
- bag 帧位置滑块
- 播放倍率步进输入器
- 区域列表
- 水平 / 垂直角 / 距离的滑块 + 手动输入
- 动态新增 / 删除区域
- `paint_rejected`、`publish_rejected`、`loop` 开关
- 配置文件加载 / 导出按钮
- 橙红主按钮 + 暖色滑块的统一配色

暂停：

```bash
fov-filter-ctl pause
```

继续播放：

```bash
fov-filter-ctl play
```

单步前进和后退：

```bash
fov-filter-ctl next
fov-filter-ctl prev
```

动态新增区域：

```bash
fov-filter-ctl add \
  --name center \
  --h-min -30 --h-max 30 \
  --v-min -10 --v-max 15 \
  --d-min 0.0 --d-max 1.6
```

更新区域：

```bash
fov-filter-ctl update \
  --name center \
  --h-min -20 --h-max 20 \
  --v-min -8 --v-max 12 \
  --d-min 0.0 --d-max 1.2
```

删除区域：

```bash
fov-filter-ctl remove --name center
```

查看当前状态：

```bash
fov-filter-ctl status
```

从 TOML/YAML 重新加载配置：

```bash
fov-filter-ctl load-config /home/ww/test/scripts/fov_filter/config.example.toml
```

导出当前启用区域为 `filter_regions` YAML：

```bash
fov-filter-ctl export-config ./filter_regions.yaml
```

### 配置文件

可使用 `--config` 指定 TOML/YAML 文件。示例 TOML 见 [config.example.toml](/home/ww/test/scripts/fov_filter/config.example.toml)。UI 和 `fov-filter-ctl export-config` 导出的 YAML 顶层为 `filter_regions:`。

### 参数说明

- `--bag`：bag 文件路径
- `--topic`：需要读取的 PointCloud2 话题
- `--region`：启动时添加的区域，格式 `name:hmin:hmax:vmin:vmax[:enabled][:dmin:dmax]`
- `--rate`：播放倍率，默认 `1.0`
- `--start-paused`：启动后先暂停
- `--loop`：播到末尾后循环
- `--paint-rejected`：发布彩色可视化点云并将过滤点标红
- `--publish-clock`：同步发布 `/clock`

水平角定义为 `atan2(y, x)`，内部按 `[0, 360)` 归一化比较，因此同时支持 `-45..45` 和 `315..45` 这两种写法。垂直角定义为 `atan2(z, hypot(x, y))`，范围 `[-90, 90]` 度。距离使用三维欧氏距离，单位米，当前默认编辑范围为 `0~2m`。

若未配置任何启用中的区域，则默认不过滤，直接保留所有有效点。

---

## split_bag {#split-bag}

将 ROS bag （包含图片和点云）拆分为单帧图片与点云输出。

[split_bag-0.1.0-py3-none-any.zip](https://www.yuque.com/attachments/yuque/0/2026/zip/38905876/1769509612435-35fb9d53-a8c0-4fb0-8b78-d96d023ecf51.zip)

### 安装
```cpp
pip install split_bag-0.1.0-py3-none-any.whl
```

### 使用
```cpp
split_bag --input /path/to/bags \
    --img-output ./images \
    --pcd-output ./pointclouds \
    --image-topic /usb_cam/image_raw \
    --pointcloud-topic /livox/lidar_192_168_123_100    
```

参数：

+ `--input` bag包路径
+ `--img-output` 输出图片路径
+ `--pcd-output`输出点云路径
+ `--image-topic`（默认：`/usb_cam/image_raw`）
+ `--pointcloud-topic`（默认：`/livox/lidar_192_168_123_100`）
