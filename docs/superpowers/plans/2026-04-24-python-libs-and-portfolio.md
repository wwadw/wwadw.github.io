# Python Libraries and Portfolio Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate a Python library index/documentation page and a portfolio page into the Hexo Fluid blog.

**Architecture:** Create two new custom pages in `source/`. The Python library page will be categorized under "Python库" and will contain a table of contents and consolidated documentation. The portfolio page will feature a link and a QR code. The navigation bar will be updated to include these pages.

**Tech Stack:** Hexo, Fluid Theme, Markdown.

---

### Task 1: Navigation Bar Update

**Files:**
- Modify: `_config.fluid.yml`

- [ ] **Step 1: Add new menu items to `navbar.menu`**

Update the `menu` list to include "Python库" and "作品集".

```yaml
  menu:
    - { key: "home", link: "/", icon: "iconfont icon-home-fill" }
    - { key: "archive", link: "/archives/", icon: "iconfont icon-archive-fill" }
    - { key: "category", link: "/categories/", icon: "iconfont icon-category-fill" }
    - { key: "tag", link: "/tags/", icon: "iconfont icon-tags-fill" }
    - { key: "pythonlibs", link: "/python-libs/", icon: "iconfont icon-code" }
    - { key: "portfolio", link: "/portfolio/", icon: "iconfont icon-link-fill" }
    - { key: "about", link: "/about/", icon: "iconfont icon-user-fill" }
```

- [ ] **Step 2: Run Hexo generate to verify config**

Run: `hexo g`
Expected: Success, no config errors.

- [ ] **Step 3: Commit**

```bash
git add _config.fluid.yml
git commit -m "config: add python-libs and portfolio to navbar"
```

### Task 2: Python Libraries Page Creation

**Files:**
- Create: `source/python-libs/index.md`

- [ ] **Step 1: Create the Python Libraries page with Front-matter and Index Table**

```markdown
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
```

- [ ] **Step 2: Append concatenated documentation content**

Append the content of the 5 MD files fetched earlier, ensuring they start with proper headers (H2/H3).

- [ ] **Step 3: Commit**

```bash
git add source/python-libs/index.md
git commit -m "feat: create python libraries index and docs page"
```

### Task 3: Portfolio Page Creation

**Files:**
- Create: `source/portfolio/index.md`
- Create: `source/img/portfolio_qr.png` (using a dummy image)

- [ ] **Step 1: Create the Portfolio page**

```markdown
---
title: 个人作品集
date: 2026-04-24 10:00:00
layout: page
---

## 🚀 我的项目展示

[点击访问作品集：pip.wgists.me](https://pip.wgists.me/)

<div style="text-align: center; margin-top: 40px;">
  <img src="/img/portfolio_qr.png" alt="作品集二维码" style="width: 200px; border: 1px solid #ddd; padding: 10px; border-radius: 10px;">
  <p style="color: #888; margin-top: 10px;">扫码移动端访问</p>
</div>
```

- [ ] **Step 2: Create a placeholder QR code image**

Since we don't have the actual QR code, we'll use a simple placeholder if available, or just create an empty file for now.

Run: `touch source/img/portfolio_qr.png`

- [ ] **Step 3: Commit**

```bash
git add source/portfolio/index.md source/img/portfolio_qr.png
git commit -m "feat: create portfolio page with placeholder qr"
```

### Task 4: Final Validation

- [ ] **Step 1: Run Hexo clean, generate and check for errors**

Run: `hexo clean && hexo g`
Expected: Success.

- [ ] **Step 2: Final Commit**

```bash
git commit --allow-empty -m "chore: complete python libs and portfolio integration"
```
