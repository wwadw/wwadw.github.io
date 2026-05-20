---
title: termrec - 终端命令记录工具
date: 2026-05-19 21:10:00
tags:
  - 工具
  - 终端
  - Linux
categories:
  - 工具分享
---

# termrec - 终端命令记录工具

记录终端会话中运行的所有命令，支持查看、导出和管理。

<!--more-->

## 功能特性

- 📝 记录终端会话中的所有命令
- ⏱️ 自动记录命令执行时间
- 📊 统计命令数量和会话时长
- 📤 导出命令记录为文本文件
- 🎨 彩色终端输出
- 🔧 支持 Bash 和 Zsh

## 安装

```bash
git clone https://github.com/wwadw/termrec.git
cd termrec
./install.sh
source ~/.bashrc
```

## 使用方法

### 开始记录

```bash
termrec start [会话名称]
```

### 停止记录

```bash
termrec stop
```

### 查看记录列表

```bash
termrec list
```

输出示例：

```
=== 终端记录列表 ===

1. 20260519_202745_my-work [已完成]
   名称: my-work
   开始: 2026-05-19T20:27:45+08:00
   命令数: 5
```

### 查看记录内容

```bash
termrec show <记录ID>
```

输出示例：

```
=== 记录详情: my-work ===
ID: 20260519_202745_my-work
开始: 2026-05-19T20:27:45+08:00
结束: 2026-05-19T20:28:24+08:00

=== 命令历史 ===
     1  # termrec 开始记录: Tue May 19 20:27:45 CST 2026
     2  # 会话: my-work
     3  # 目录: /home/ww
     4  
     5  [2026-05-19 20:27:45] termrec start my-work
     6  [2026-05-19 20:28:07] ls
     7  [2026-05-19 20:28:12] cd elevation_
     8  [2026-05-19 20:28:14] cd elevation_ws/
     9  [2026-05-19 20:28:16] ls
```

### 导出记录

```bash
# 导出到当前目录
termrec export <记录ID>

# 导出到指定目录
termrec export <记录ID> /path/to/dir
```

### 其他命令

```bash
termrec delete <id>     # 删除记录
termrec clean           # 清理所有记录
termrec status          # 查看当前状态
termrec help            # 查看帮助
```

## 使用场景

1. **调试记录**：记录调试过程中的命令，方便回顾
2. **操作审计**：记录服务器操作，便于追溯
3. **学习笔记**：记录学习过程中的命令实践
4. **教程制作**：生成命令记录，用于编写教程

## 记录文件

所有记录保存在 `~/.termrec/` 目录：

| 文件 | 说明 |
|------|------|
| `.meta` | 元数据（会话名、时间等）|
| `.history` | Bash 历史记录 |
| `.cmdlog` | 命令日志（带时间戳）|
| `.log` | 终端完整输出 |

## GitHub

项目地址：https://github.com/wwadw/termrec

欢迎 Star 和 PR！
