---
title: ripgrep
date: 2026-04-28 21:00:00
author: wei wang
tags: [ripgrep, grep]
index_img: /img/RG.png
---

## 1. rg 是什么
`rg` 是 `ripgrep` 的命令行搜索工具，主要用于在代码工程中快速搜索文本、函数名、变量名、配置项、报错信息等。

它可以理解为更快、更适合代码仓库的 `grep`。

主要特点：

+  默认递归搜索当前目录。 
+  默认跳过 `.gitignore` 中忽略的文件和目录。 
+  默认跳过 `.git/`、`build/`、`node_modules/` 等无关内容。 
+  支持正则表达式。 
+  搜索速度快，适合大型代码仓库。 
+  输出默认包含文件名、行号和匹配内容。 

## 2. 安装
Ubuntu / Debian：

```cpp
sudo apt update
sudo apt install ripgrep
```

检查是否安装成功：

```cpp
rg --version
```

## 3. 基本用法
在当前目录搜索关键词：

```cpp
rg "keyword"
```

示例：

```cpp
rg "ERRCODE_MSOPTIMEOUT"
```

在指定目录搜索：

```cpp
rg "keyword" /path/to/project
```

示例：

```cpp
rg "PahoMqttCpp" ~/monitor_ws/src
```

搜索函数名、变量名、类名：

```cpp
rg "publishPointCloud"
    rg "time_mode"
    rg "cloud_registered"
```

## 4. 常用参数
忽略大小写：

```cpp
rg -i "error"
```

只显示匹配到的文件名：

```cpp
rg -l "keyword"
```

统计每个文件中的匹配次数：

```cpp
rg -c "keyword"
```

显示匹配行前后上下文：

```cpp
rg -C 3 "keyword"
```

只显示匹配行前 3 行：

```cpp
rg -B 3 "keyword"
```

只显示匹配行后 3 行：

```cpp
rg -A 3 "keyword"
```

搜索隐藏文件：

```cpp
rg --hidden "keyword"
```

搜索被 `.gitignore` 忽略的文件：

```cpp
rg -u "keyword"
```

更强制地搜索所有内容：

```cpp
rg -uu "keyword"
    rg -uuu "keyword"
```

一般日常开发中，`-u` 通常已经足够。

## 5. 按文件类型搜索
搜索 C++ 文件：

```cpp
rg "ros::Publisher" -t cpp
```

搜索 Python 文件：

```cpp
rg "import rospy" -t py
```

搜索 Markdown 文件：

```cpp
rg "安装" -t md
```

搜索 CMake 文件：

```cpp
rg "find_package" -t cmake
```

常见类型：

```cpp
-t cpp
-t py
-t cmake
-t yaml
-t json
-t md
```

## 6. 按文件后缀搜索
搜索 `.cpp` 文件：

```cpp
rg "keyword" -g "*.cpp"
```

搜索 `.hpp` 文件：

```cpp
rg "keyword" -g "*.hpp"
```

搜索 `.launch` 文件：

```cpp
rg "topic_name" -g "*.launch"
```

搜索 `.yaml` 文件：

```cpp
rg "max_height" -g "*.yaml"
```

搜索多个类型：

```cpp
rg "keyword" -g "*.cpp" -g "*.hpp" -g "*.h"
```

## 7. 排除目录或文件
排除 `build` 目录：

```cpp
rg "keyword" -g "!build"
```

排除多个目录：

```cpp
rg "keyword" -g "!build" -g "!devel" -g "!install"
```

## 8. 查找文件名
列出当前目录下所有文件：

```cpp
rg --files
```

查找某个文件：

```cpp
rg --files | rg "CMakeLists.txt"
```

查找所有 launch 文件：

```cpp
rg --files | rg "\.launch$"
```

查找配置文件：

```cpp
rg --files | rg "\.yaml$"
```

查找某个 CMake 配置文件：

```cpp
rg --files | rg "PahoMqttCppConfig.cmake"
```

## 9. 排查报错时的用法
遇到编译错误时，直接搜索报错关键词：

```cpp
rg "PahoMqttCpp::paho-mqttpp3"
```

遇到运行时报错：

```cpp
rg "ERRCODE_MSOPTIMEOUT"
```

遇到库找不到：

```cpp
rg "libtf_conversions"
```

遇到参数不生效：

```cpp
rg "参数名"
```

例如：

```cpp
rg "visibility_cleanup"
    rg "min_variance"
    rg "mahalanobis_distance_threshold"
```

## 10. 和 grep 的对比
传统写法：

```cpp
grep -R "keyword" .
```

推荐使用：

```cpp
rg "keyword"
```

`rg` 的优势是：

+  命令更短。 
+  默认递归搜索。 
+  默认显示行号。 
+  默认跳过无关目录。 
+  在大型工程中速度更快。 
+  输出更适合代码阅读。 

## 11. 推荐常用命令组合
日常搜索：

```cpp
rg "关键词"
```

指定文件类型：

```cpp
rg "关键词" -g "*.cpp"
```

查看上下文：

```cpp
rg "关键词" -C 3
```

只看文件名：

```cpp
rg -l "关键词"
```

查找文件：

```cpp
rg --files | rg "文件名"
```

ROS 工程排除构建目录：

```cpp
rg "关键词" -g "!build" -g "!devel" -g "!install" -g "!log"
```

强制搜索隐藏文件：

```cpp
rg --hidden "关键词"
```

搜索所有文件，包括被忽略的文件：

```cpp
rg -u "关键词"
```

## 12. 速查表
| 目的 | 命令 |
| --- | --- |
| 搜索关键词 | `rg "keyword"` |
| 指定目录搜索 | `rg "keyword" /path/to/dir` |
| 忽略大小写 | `rg -i "keyword"` |
| 显示上下文 | `rg -C 3 "keyword"` |
| 只显示文件名 | `rg -l "keyword"` |
| 搜索指定后缀 | `rg "keyword" -g "*.cpp"` |
| 排除目录 | `rg "keyword" -g "!build"` |
| 搜索隐藏文件 | `rg --hidden "keyword"` |
| 搜索被忽略文件 | `rg -u "keyword"` |
| 列出所有文件 | `rg --files` |
| 查找文件名 | `rg --files |


核心记忆：

```cpp
rg "关键词"
rg "关键词" -C 3
rg "关键词" -g "*.cpp"
rg -l "关键词"
rg --files | rg "文件名"
```

