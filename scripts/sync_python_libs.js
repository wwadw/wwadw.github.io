const https = require('https');

const BASE_URL = 'https://pip.wgists.me/';
const DOCS_BASE_URL = 'https://pip.wgists.me/docs/';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Status: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

let cachedData = null;

// 使用 Generator 代替 Filter，这样 Hexo 会强制渲染这些内容，且不需要写入磁盘
hexo.extend.generator.register('python_libs', async function() {
  if (!cachedData) {
    console.log('[Sync] Fetching Python libraries from ' + BASE_URL);
    try {
      const html = await fetchUrl(BASE_URL);
      const packages = [];
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
          if (wheelLink.startsWith('./')) wheelLink = BASE_URL + wheelLink.substring(2);
          packages.push({ name, version, wheelLink });
        }
      }
      cachedData = packages;
    } catch (err) {
      console.error(`[Sync] Error: ${err.message}`);
      return [];
    }
  }

  const packages = cachedData;
  const now = new Date();
  
  // 1. 生成主索引页
  const indexPage = {
    path: 'python-libs/index.html',
    layout: ['page', 'post'],
    data: {
      title: 'Python 静态库仓库',
      date: now,
      content: `
<style>
  .pkg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
  .pkg-card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; background: #fff; transition: all 0.2s; display: flex; flex-direction: column; justify-content: space-between; }
  .pkg-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.08); }
  .pkg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .pkg-name { font-size: 1.25rem; font-weight: bold; color: #2f4154; }
  .pkg-version { font-size: 0.85rem; background: #f0f0f0; padding: 2px 8px; border-radius: 99px; color: #666; }
  .pkg-actions { display: flex; gap: 12px; margin-top: 24px; }
  .pkg-btn { flex: 1; text-align: center; padding: 10px 0; border-radius: 8px; text-decoration: none !important; font-size: 0.85rem; font-weight: 500; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .pkg-btn-docs { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff !important; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
  .pkg-btn-whl { background: transparent; border: 1.5px solid #10b981; color: #10b981 !important; }
  [data-user-color-scheme="dark"] .pkg-card { background: #252d38; border-color: #435266; }
  [data-user-color-scheme="dark"] .pkg-name { color: #c4c6c9; }
</style>
<div class="pkg-grid">
  ${packages.map(pkg => `
    <div class="pkg-card">
      <div class="pkg-header">
        <div class="pkg-name">${pkg.name}</div>
        <div class="pkg-version">v${pkg.version.replace(/^v/, '')}</div>
      </div>
      <div class="pkg-actions">
        <a href="./${pkg.name}/" class="pkg-btn pkg-btn-docs">使用文档</a>
        <a href="${pkg.wheelLink}" class="pkg-btn pkg-btn-whl">下载 WHL</a>
      </div>
    </div>
  `).join('')}
</div>`
    }
  };

  // 2. 生成各包详情页
  const detailPages = await Promise.all(packages.map(async (pkg) => {
    try {
      const docContent = await fetchUrl(`${DOCS_BASE_URL}${pkg.name}.md`);
      return {
        path: `python-libs/${pkg.name}/index.html`,
        layout: ['page', 'post'],
        data: {
          title: `${pkg.name} 使用文档`,
          date: now,
          content: `<p><a href="../">← 返回索引</a></p>\n\n` + hexo.render.renderSync({ text: docContent, engine: 'markdown' })
        }
      };
    } catch (e) {
      return null;
    }
  }));

  return [indexPage, ...detailPages.filter(Boolean)];
});
