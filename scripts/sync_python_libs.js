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

hexo.extend.filter.register('before_generate', async function() {
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

## 📦 库索引
> 基于 GitHub Pages 托管的静态 wheel 仓库。

| 包名 | 最新版本 | 下载链接 | 说明文档 |
| :--- | :--- | :--- | :--- |
`;

    for (const pkg of packages) {
      indexContent += `| **${pkg.name}** | ${pkg.version} | [whl](${pkg.wheelLink}) | [查看](./${pkg.name}/) |\n`;
    }

    indexContent += `\n---\n\n## 📖 详细文档\n点击上方表格中的“查看”以阅读各库的详细使用文档。\n`;

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

  } catch (err) {
    console.error(`[Sync] Error during auto-sync: ${err.message}`);
  }
});
