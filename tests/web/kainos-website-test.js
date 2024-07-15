// This is a test to show the capabilities of K6 to run its own browser like other automation testing frameworks, the funtionality however is slightly more limited
import { browser } from 'k6/browser'
import http from 'k6/http'
import { check, sleep } from 'k6';

const workdayTitle = "Get live and thrive with one of the community's first Workday partners";

export const options = {
  scenarios: {
    browser: {
      executor: 'per-vu-iterations',
      exec: 'browserTest',
      options: {
        browser: {
          type: 'chromium',
        }
      }
    },
    protocol: {
      executor: 'constant-vus',
      exec:'protocolTest',
      vus:5,
      duration: '30s'
    }
  }
}

export async function browserTest() {
  const page = await browser.newPage();

  try {
    await page.goto('https://www.kainos.com');
    sleep(1);
    const element = page.locator('#ccc-reject-settings');
    await element.click();
    sleep(1);
    const workdayLink = page.locator("//a[@class='mega-menu__link mega-menu__title'][normalize-space()='Workday']");
    await workdayLink.click();
    const textContent = await page.locator('h1').textContent();
    check(textContent, {
      'Workday page has loaded with correct header': (text) => text === workdayTitle
    });


} finally {
    page.close();
}
}

export function protocolTest() {
  const res = http.get("https://www.kainos.com");
  check(res, {
    "Status is 200": res => res.status === 200
  })
}