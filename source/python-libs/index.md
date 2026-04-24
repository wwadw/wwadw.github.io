---
title: Python 静态库仓库
date: 2026-04-24 06:25:07
category: Python库
layout: page
---

<style>
  .pkg-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 30px;
  }
  .pkg-card {
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 20px;
    background: #fff;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .pkg-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  }
  .pkg-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .pkg-name {
    font-size: 1.25rem;
    font-weight: bold;
    color: #2f4154;
  }
  .pkg-version {
    font-size: 0.85rem;
    background: #f0f0f0;
    padding: 2px 8px;
    border-radius: 99px;
    color: #666;
  }
  .pkg-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
  .pkg-btn {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    border-radius: 8px;
    text-decoration: none !important;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .pkg-btn-docs {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff !important;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  }
  .pkg-btn-docs:hover {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
    transform: translateY(-2px);
  }
  .pkg-btn-whl {
    background: transparent;
    border: 1.5px solid #10b981;
    color: #10b981 !important;
  }
  .pkg-btn-whl:hover {
    background: #f0fdf4;
    color: #059669 !important;
    transform: translateY(-2px);
  }
  .pkg-btn i {
    font-size: 1rem;
  }
  [data-user-color-scheme="dark"] .pkg-card {
    background: #252d38;
    border-color: #435266;
  }
  [data-user-color-scheme="dark"] .pkg-name {
    color: #c4c6c9;
  }
  [data-user-color-scheme="dark"] .pkg-btn-docs {
    background: linear-gradient(135deg, #059669 0%, #065f46 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  [data-user-color-scheme="dark"] .pkg-btn-whl {
    border-color: #059669;
    color: #34d399 !important;
  }
  [data-user-color-scheme="dark"] .pkg-btn-whl:hover {
    background: rgba(5, 150, 105, 0.1);
    color: #10b981 !important;
  }
</style>

## 📦 库仓库概览
> 自动同步自 [pip.wgists.me](https://pip.wgists.me/)，为您提供最新的 Python 静态库支持。

<div class="pkg-grid">

  <div class="pkg-card">
    <div class="pkg-header">
      <div class="pkg-name">Projection</div>
      <div class="pkg-version">v0.1.0</div>
    </div>
    <div class="pkg-actions">
      <a href="./Projection/" class="pkg-btn pkg-btn-docs">
        <i class="iconfont icon-article"></i>使用文档
      </a>
      <a href="https://pip.wgists.me/dist/Projection/projection_tools-0.1.0-py3-none-any.whl" class="pkg-btn pkg-btn-whl">
        <i class="iconfont icon-download"></i>下载 WHL
      </a>
    </div>
  </div>
  <div class="pkg-card">
    <div class="pkg-header">
      <div class="pkg-name">calib-snap</div>
      <div class="pkg-version">v0.1.0</div>
    </div>
    <div class="pkg-actions">
      <a href="./calib-snap/" class="pkg-btn pkg-btn-docs">
        <i class="iconfont icon-article"></i>使用文档
      </a>
      <a href="https://pip.wgists.me/dist/calib-snap/calib_snap-0.1.0-py3-none-any.whl" class="pkg-btn pkg-btn-whl">
        <i class="iconfont icon-download"></i>下载 WHL
      </a>
    </div>
  </div>
  <div class="pkg-card">
    <div class="pkg-header">
      <div class="pkg-name">dataset</div>
      <div class="pkg-version">v0.1.0</div>
    </div>
    <div class="pkg-actions">
      <a href="./dataset/" class="pkg-btn pkg-btn-docs">
        <i class="iconfont icon-article"></i>使用文档
      </a>
      <a href="https://pip.wgists.me/dist/dataset/dataset-0.1.0-py3-none-any.whl" class="pkg-btn pkg-btn-whl">
        <i class="iconfont icon-download"></i>下载 WHL
      </a>
    </div>
  </div>
  <div class="pkg-card">
    <div class="pkg-header">
      <div class="pkg-name">fov_filter</div>
      <div class="pkg-version">v0.1.0</div>
    </div>
    <div class="pkg-actions">
      <a href="./fov_filter/" class="pkg-btn pkg-btn-docs">
        <i class="iconfont icon-article"></i>使用文档
      </a>
      <a href="https://pip.wgists.me/dist/fov_filter/fov_filter-0.1.0-py3-none-any.whl" class="pkg-btn pkg-btn-whl">
        <i class="iconfont icon-download"></i>下载 WHL
      </a>
    </div>
  </div>
  <div class="pkg-card">
    <div class="pkg-header">
      <div class="pkg-name">split_bag</div>
      <div class="pkg-version">v0.1.0</div>
    </div>
    <div class="pkg-actions">
      <a href="./split_bag/" class="pkg-btn pkg-btn-docs">
        <i class="iconfont icon-article"></i>使用文档
      </a>
      <a href="https://pip.wgists.me/dist/split_bag/split_bag-0.1.0-py3-none-any.whl" class="pkg-btn pkg-btn-whl">
        <i class="iconfont icon-download"></i>下载 WHL
      </a>
    </div>
  </div>
</div>

---
