# 设计规格书：新增 Python 静态库与个人作品集板块

- **日期**: 2026-04-24
- **状态**: 待评审
- **主题**: 在基于 Hexo Fluid 的博客中集成 Python 包索引文档及个人作品集页面。

## 1. 目标
在现有博客中新增两个主要功能板块：
1. **Python 静态库板块**：整合 `pip.wgists.me` 上的包索引及详细 Markdown 文档。
2. **个人作品集板块**：展示个人作品入口链接及二维码。

## 2. 详细设计

### 2.1 导航栏变更 (`_config.fluid.yml`)
在 `navbar.menu` 中新增两个项，使其作为主要导航入口：
- `Python库`: 链接至 `/python-libs/`
- `作品集`: 链接至 `/portfolio/`

### 2.2 Python 静态库页面 (`source/python-libs/index.md`)
- **分类**: 设置为 `Python库`。
- **布局**: `page`。
- **页面结构**:
    - **包索引表**: 包含包名、版本、`.whl` 下载链接及页内文档锚点。
    - **整合文档内容**: 抓取 `https://pip.wgists.me/docs/` 下的 5 个 Markdown 文件：
        1. `Projection.md`
        2. `calib-snap.md`
        3. `dataset.md`
        4. `fov_filter.md`
        5. `split_bag.md`
    - **展示方式**: 采用标准的 Markdown 标题（H2/H3）分隔，利用 Fluid 主题生成的目录（TOC）进行快速跳转。

### 2.3 个人作品集页面 (`source/portfolio/index.md`)
- **布局**: `page`。
- **页面内容**:
    - 文本介绍及指向 `https://pip.wgists.me/` 的超链接。
    - 居中展示的二维码图片（初始使用占位图 `/img/portfolio_qr.png`）。

### 2.4 资源管理
- **二维码图片**: 在 `source/img/` 下创建或放置 `portfolio_qr.png`。

## 3. 实施策略
1. **抓取阶段**: 使用 `curl` 批量下载 `pip.wgists.me` 上的 5 个 `.md` 文档。
2. **生成阶段**: 
    - 创建 `source/python-libs/index.md`，手动构建索引表并拼接 MD 内容。
    - 创建 `source/portfolio/index.md`。
3. **配置阶段**: 修改 `_config.fluid.yml` 以激活导航菜单。
4. **验证阶段**: 运行 `hexo clean && hexo g`，检查生成页面是否符合预期。

## 4. 后续维护
- 当 `pip.wgists.me` 更新包时，需重新抓取并更新 `python-libs/index.md` 中的相应章节。
