const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 1. Login to OrangeHRM
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', { waitUntil: 'networkidle2' });
  await page.type('input[name="username"]', 'Admin');
  await page.type('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2' });

  // 2. Define menu pages to visit
  const menuPages = [
    { name: 'Dashboard', url: 'https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index' },
    { name: 'PIM', url: 'https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList' },
    { name: 'Leave', url: 'https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveList' },
    { name: 'Time', url: 'https://opensource-demo.orangehrmlive.com/web/index.php/time/viewTimeModule' },
    { name: 'Recruitment', url: 'https://opensource-demo.orangehrmlive.com/web/index.php/recruitment/viewRecruitmentModule' }
  ];

  const allLocators = {};

  // 3. Visit each page and extract locators
  for (const pageInfo of menuPages) {
    await page.goto(pageInfo.url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit for rendering

    const locators = await page.evaluate(() => {
      const data = [];
      document.querySelectorAll('*').forEach(el => {
        data.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          class: el.className || '',
          name: el.getAttribute('name') || '',
          text: el.innerText ? el.innerText.trim().substring(0, 100) : ''
        });
      });
      return data;
    });

    allLocators[pageInfo.name] = locators;
    console.log(`✅ Collected locators from ${pageInfo.name}`);
  }

  // 4. Save to JSON file
  const filePath = 'E:/Scraplocators/crawled-locators.json';
  fs.writeFileSync(filePath, JSON.stringify(allLocators, null, 2), 'utf8');
  console.log(`🎉 All locators saved to: ${filePath}`);

  await browser.close();
})();
