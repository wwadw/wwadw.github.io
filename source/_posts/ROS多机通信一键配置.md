---
title: ROS 多机通信一键配置
date: 2026-05-12 18:00:00
author: wei wang
index_img: /img/Duoji.png
tags:
  - ROS
  - Shell
  - 多机通信
categories:
  - 机器人
---

# ROS 多机通信一键配置

在多台机器人之间切换 ROS Master 时，需要手动设置 `ROS_MASTER_URI`、hosts 映射等，非常繁琐。这个 Bash 函数可以一键完成所有配置。

## 功能

支持两种模式：

1. **自动解析模式**：`master <subnet> <last_ip>` — 自动从 ROS 话题提取 hostname
2. **手动指定模式**：`master <name> <subnet> <last_ip>` — 直接指定 hostname

退出子 shell 后，所有配置自动清除。

## 前置依赖

```bash
sudo apt install libnss-wrapper
```

## 原理

1. 通过 `/rosout` 话题获取远程节点信息
2. 用 `rostopic info /rosout` 解析 URI 中的 hostname
3. 使用 `libnss_wrapper` 创建临时 hosts 映射，无需修改系统 `/etc/hosts`

## 代码

将以下函数添加到 `~/.bashrc` 或 `~/.zshrc`：

```bash
master() {
    if [ $# -eq 3 ]; then
        # 手动输入模式：master <name> <subnet> <last_ip>
        local NAME=$1
        local SUBNET=$2
        local LAST=$3
        local IP="192.168.${SUBNET}.${LAST}"
        echo "Manual mode: ${NAME} -> ${IP}"
    elif [ $# -eq 2 ]; then
        # 自动解析模式：master <subnet> <last_ip>
        local SUBNET=$1
        local LAST=$2
        local IP="192.168.${SUBNET}.${LAST}"

        # 临时设置 ROS_MASTER_URI 指向目标 IP
        export ROS_MASTER_URI="http://${IP}:11311"
        echo "Trying to contact ROS master at ${ROS_MASTER_URI} ..."

        # 等待 ROS master 可以访问
        if ! rostopic list >/dev/null 2>&1; then
            echo "Error: cannot reach ROS master at ${IP}"
            return 1
        fi

        # 使用 /rosout 提取 hostname
        local HOST=$(rostopic info /rosout 2>/dev/null | grep -oP 'http://\K[^:/]+' | head -n1)

        if [ -z "$HOST" ]; then
            echo "Warning: cannot detect hostname from /rosout, using IP as hostname"
            HOST=$IP
        else
            # 尝试解析 IP
            local RESOLVED_IP=$(getent hosts "$HOST" | awk '{print $1}')
            if [ -n "$RESOLVED_IP" ]; then
                IP=$RESOLVED_IP
            fi
        fi

        local NAME=$HOST
        echo "Detected host: ${NAME} -> ${IP}"
    else
        echo "Usage:"
        echo "  master <subnet> <last_ip>       # auto detect hostname from ROS topic /rosout"
        echo "  master <name> <subnet> <last_ip> # manual name+IP"
        return 1
    fi

    # 创建临时 hosts
    export NSS_WRAPPER_HOSTS=$(mktemp)
    echo "${IP} ${NAME}" > "$NSS_WRAPPER_HOSTS"
    export NSS_WRAPPER_PASSWD=/etc/passwd
    export LD_PRELOAD=libnss_wrapper.so

    # 设置 ROS_MASTER_URI
    export ROS_MASTER_URI="http://${IP}:11311"

    echo "Temporary hosts set: ${NAME} -> ${IP}"
    echo "ROS_MASTER_URI set to ${ROS_MASTER_URI}"
    echo "Launching new shell (exit to clear mapping)..."
    bash
}
```

## 使用示例

### 自动解析 hostname

```bash
master 10 11
```

输出：

```
Trying to contact ROS master at http://192.168.10.11:11311 ...
Detected host: robot-008 -> 192.168.10.11
Temporary hosts set: robot-008 -> 192.168.10.11
ROS_MASTER_URI set to http://192.168.10.11:11311
Launching new shell (exit to clear mapping)...
```

### 手动指定 name + IP

```bash
master myrobot 10 11
```

输出：

```
Manual mode: myrobot -> 192.168.10.11
Temporary hosts set: myrobot -> 192.168.10.11
ROS_MASTER_URI set to http://192.168.10.11:11311
Launching new shell (exit to clear mapping)...
```

## 注意事项

1. **必须能访问远程 ROS Master**，否则无法获取 `/rosout` 信息
2. `/rosout` 是 ROS1 标准话题，通常每台 ROS Master 都会发布
3. 退出子 shell 后，hosts 映射和 ROS 环境自动清除
4. 如果 hostname 解析失败，会使用 IP 作为 hostname
5. 手动模式不需要访问 ROS Master，适合网络不通时使用
