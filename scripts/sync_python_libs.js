const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://pip.wgists.me/';
const DOCS_BASE_URL = 'https://pip.wgists.me/docs/';

/**
 * Fetch content from a URL using native https module
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request Failed. Status Code: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

let isSynced = false;

hexo.extend.filter.register('before_generate', async function() {
  if (isSynced) return;
  isSynced = true;
  
  // This filter runs before each 'hexo generate'
  
  console.log('[Sync] Fetching Python libraries from ' + BASE_URL);
  
  try {
    const html = await fetchUrl(BASE_URL);
    const packages = [];
    
    // Extract packages using the structure analyzed
    // Look for <article class="card"> sections
    const cardRegex = /<article class="card">([\s\S]*?)<\/article>/g;
    let match;

    while ((match = cardRegex.exec(html)) !== null) {
      const cardHtml = match[1];
      const nameMatch = /<span class="badge">([^<]+)<\/span>/.exec(cardHtml);
      const versionMatch = /<span class="version">([^<]+)<\/span>/.exec(cardHtml);
      const wheelMatch = /<a class="link-button" href="([^"]+\.whl)">/.exec(cardHtml);
      
      if (nameMatch && versionMatch) {
        const name = nameMatch[1].trim();
        const version = versionMatch[1].trim();
        let wheelLink = wheelMatch ? wheelMatch[1] : '';
        
        // Convert relative link to absolute
        if (wheelLink.startsWith('./')) {
          wheelLink = BASE_URL + wheelLink.substring(2);
        } else if (wheelLink && !wheelLink.startsWith('http')) {
          wheelLink = BASE_URL + wheelLink;
        }
        
        packages.push({ name, version, wheelLink });
      }
    }

    if (packages.length === 0) {
      console.warn('[Sync] No packages found on the page.');
      return;
    }

    console.log(`[Sync] Found ${packages.length} packages.`);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Generate main index page: source/python-libs/index.md
    let indexContent = `---
title: Python 静态库仓库
date: ${now}
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
`;

    for (const pkg of packages) {
      indexContent += `
  <div class="pkg-card">
    <div class="pkg-header">
      <div class="pkg-name">${pkg.name}</div>
      <div class="pkg-version">v${pkg.version.replace(/^v/, '')}</div>
    </div>
    <div class="pkg-actions">
      <a href="./${pkg.name}/" class="pkg-btn pkg-btn-docs">
        <i class="iconfont icon-article"></i>使用文档
      </a>
      <a href="${pkg.wheelLink}" class="pkg-btn pkg-btn-whl">
        <i class="iconfont icon-download"></i>下载 WHL
      </a>
    </div>
  </div>`;
    }

    indexContent += `
</div>

---
`;

    const pythonLibsDir = path.join(hexo.source_dir, 'python-libs');
    if (!fs.existsSync(pythonLibsDir)) {
      fs.mkdirSync(pythonLibsDir, { recursive: true });
    }
    
    const indexPath = path.join(pythonLibsDir, 'index.md');
    fs.writeFileSync(indexPath, indexContent);
    console.log('[Sync] Updated source/python-libs/index.md');

    // 2. Fetch and generate individual doc pages
    for (const pkg of packages) {
      const docUrl = `${DOCS_BASE_URL}${pkg.name}.md`;
      console.log(`[Sync] Fetching docs for ${pkg.name} from ${docUrl}`);
      
      try {
        const docContent = await fetchUrl(docUrl);
        const pkgDirPath = path.join(pythonLibsDir, pkg.name);
        if (!fs.existsSync(pkgDirPath)) {
          fs.mkdirSync(pkgDirPath, { recursive: true });
        }
        
        const pageContent = `---
title: ${pkg.name} 使用文档
date: ${now}
category: Python库
layout: page
---

[← 返回索引](../)

${docContent}
`;
        fs.writeFileSync(path.join(pkgDirPath, 'index.md'), pageContent);
        console.log(`[Sync] Updated source/python-libs/${pkg.name}/index.md`);
      } catch (err) {
        console.error(`[Sync] Failed to fetch docs for ${pkg.name}: ${err.message}`);
      }
    }

    // IMPORTANT: Tell Hexo to process the newly created files
    await hexo.source.process();

  } catch (err) {
    console.error(`[Sync] Error during auto-sync: ${err.message}`);
  }
});
