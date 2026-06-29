cat << 'EOF' > /root/google-location-fixer/index.js
console.log(`[${new Date().toLocaleString()}] === Script started ===`);
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const path = require('path');

puppeteer.use(StealthPlugin());

  // 定义一些符合洛杉矶本地特征的搜索词汇库
const searchQueries = [
  // === 交通与通勤 (洛杉矶人的绝对刚需) ===
  "101 freeway traffic Southbound",
  "405 traffic right now",
  "LAX airport parking rates",
  "gas prices near me",
  "metro E line schedule",

  // === 本地餐饮与商超 (极具地域特征) ===
  "In-N-Out Burger locations nearby",
  "best tacos in East LA",
  "Grand Central Market hours",
  "closest Ralphs grocery store",
  "CVS pharmacy open 24 hours",
  "Trader Joe's near me",
  "Home Depot hardware store LA",

  // === 电子、硬件与IT (建立符合技术背景的真实用户画像) ===
  "Micro Center Tustin hours",
  "computer hardware stores Los Angeles",
  "electronics recycling center near me",
  "computer monitor repair shop LA",
  "office supplies nearby",
  "best ISP in Los Angeles area",
  "Azure data center latency West US",

  // === 天气、休闲与本地资讯 ===
  "air quality index Los Angeles",
  "Los Angeles weather forecast next 3 days",
  "Dodgers game score today",
  "Griffith Observatory parking",
  "Santa Monica pier events this weekend",
  "earthquake update LA today"
];

// 辅助函数：随机延迟，模拟人类停顿
const delay = (min, max) => new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1) + min)));

async function run() {
  console.log('Starting advanced browser session...');
  
  // 设置一个固定目录来保存浏览器的 Cookie 和缓存（极大地提升真人可信度）
  const userDataDir = path.join(__dirname, 'chrome-profile');

  const browser = await puppeteer.launch({
    headless: "new", 
    executablePath: '/usr/bin/google-chrome', 
    userDataDir: userDataDir, // 保存用户状态
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled' // 进一步隐藏自动化特征
    ]
  });
  
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://www.google.com', ['geolocation']);

  const page = await browser.newPage();

  // 设置语言、视口大小，模拟普通笔记本电脑
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
  await page.setViewport({ width: 1366, height: 768 });
  
  // 注入洛杉矶随机坐标
  const baseLat = 34.0522;
  const baseLng = -118.2437;
  const randomLat = baseLat + (Math.random() - 0.5) * 0.02;
  const randomLng = baseLng + (Math.random() - 0.5) * 0.02;
  
  console.log(`Setting location to LA: [${randomLat.toFixed(4)}, ${randomLng.toFixed(4)}]`);
  await page.setGeolocation({ latitude: randomLat, longitude: randomLng });

  try {
    // === 第一阶段：模拟真人搜索 ===
    console.log('Navigating to Google Search...');
    await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });
    
    // 随机挑选一个搜索词
    const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    console.log(`Typing search query: "${query}"`);
    
    // 等待搜索框出现 (兼容不同的选择器)
    const searchInputSelector = 'textarea[name="q"], input[name="q"]';
    await page.waitForSelector(searchInputSelector);
    
    // 模拟人类打字，每个字符间隔 50-150 毫秒
    await page.type(searchInputSelector, query, { delay: Math.random() * 100 + 50 });
    
    // 按下回车并等待结果页面加载
    await Promise.all([
      page.keyboard.press('Enter'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // 在搜索结果页随机上下滚动一下，假装在看结果
    console.log('Scrolling through search results...');
    await page.evaluate(() => window.scrollBy(0, 500));
    await delay(2000, 4000);
    await page.evaluate(() => window.scrollBy(0, -300));
    await delay(1000, 3000);


    // === 第二阶段：访问地图发送定位 ===
    console.log('Navigating to Google Maps...');
    await page.goto('https://www.google.com/maps', { waitUntil: 'networkidle2' });
    
    // 点击地图页面左下角的“定位到我的位置”按钮 (增加主动触发定位的概率)
    try {
      // 这里的选择器可能会随 Google 更新而变化，如果找不到就忽略，不影响大局
      const locationButton = await page.$('button[aria-label="Show Your Location"]');
      if (locationButton) {
         await locationButton.click();
         console.log('Clicked "Show Your Location" button.');
      }
    } catch (e) {
      // 忽略找不到按钮的错误
    }

    console.log('Waiting 5-10 seconds for location beacon to establish...');
    await delay(5000, 10000); // 停留 5-10 秒
    
    console.log('Session completed successfully.');
  } catch (error) {
    console.error('Error during navigation:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
console.log(`[${new Date().toLocaleString()}] === Script finished ===`);
EOF
