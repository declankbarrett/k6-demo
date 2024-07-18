/* 
  This is a test to show hybrid testing capabilities using K6, it uses the browser to test frontend performance metrics at a low VU rate, while also running through the E2E journey
  using protocols to test the backend at a larger user rate.
*/  
import { browser } from 'k6/browser'
import http from 'k6/http'
import { sleep } from 'k6';
import { config } from '../../utils/test-config.js'
import { getToken, waitForHeading, getHeading, checkHeading, checkResponse } from '../../utils/helpers.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

// Constants
const startPageTitleContent = 'Apply online for a UK passport';
const overseasHeadingContent = 'Do you live in the UK?';
const dateOfBirthHeadingContent = 'Date of birth';
const baseUrl = config['base_url'];
const test_mode = __ENV.test_mode;
const testStages = config[test_mode]["stages"];

// Options to dictate the performance run config for each test
export const options = {
  scenarios: {
      frontend: {
          executor: 'constant-vus',
          exec: 'browserTest',
          options: {
              browser: {
                  type: 'chromium',
              },
          },
          vus: 2,
          startTime: '0s',
          duration: '30s'
      },
      backend: {
        executor: 'ramping-vus',  // Changed from 'constant-vus' to 'ramping-vus'
        exec: 'protocolTest',
        startTime: '30s',
        stages: testStages
    },
  },

  thresholds: {
      'browser_http_req_duration{scenario:frontend}': [],
      'browser_http_req_duration{scenario:ui2}': [],
  },
}

// Creates a HTML file to summarise the test results
export function handleSummary(data) {
  return {
      [`test-results/${test_mode}-performance-summary.html`]: htmlReport(data),
  };
}

// Browser test steps
export async function browserTest() {
  const page = await browser.newPage();

  try {
    // Go to start page and check heading
    await page.goto(`${baseUrl}/start`);
    sleep(1);
    const startPageTitle = page.locator('.govuk-heading-xl');
    await checkHeading('Start Page', startPageTitle, startPageTitleContent)

    //Click start button
    const startButton = page.locator('a[class="govuk-button govuk-button--start"]');
    await startButton.click();
    sleep(1)

    //Wait  for page to load and then check heading of overseas page
    await waitForHeading(page);
    const overseasHeading = await getHeading(page);
    await checkHeading('Overseas Page', overseasHeading, overseasHeadingContent)
    sleep(1)

    // Click 'Yes' radio button on overseas page and click submit
    const nationalityInput = page.locator('#isUKApplication-true');
    await nationalityInput.click();
    const submitNationality = page.locator('button[class="govuk-button button"]');
    await submitNationality.click();
    sleep(1);

    //Wait for date of birth page to load and check heading
    await waitForHeading(page);
    const dateOfBirthHeading = await getHeading(page);
    await checkHeading('Date of Birth Page', dateOfBirthHeading, dateOfBirthHeadingContent);

} finally {
    page.close();
}
}

//Protocol test steps
export function protocolTest() {
  let res = http.get(`${baseUrl}/start`);
  checkResponse(res, 'Start page', startPageTitleContent);

  res = http.get(`${baseUrl}/filter/`);
  let csrfToken = getToken(res);
  checkResponse(res, 'Overseas Page', overseasHeadingContent);

  const params = {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
    "x-csrf-token": csrfToken,
    "isUKApplication": true
  };
  res = http.post(`${baseUrl}/filter/overseas`, params);
  checkResponse(res, 'Date of Birth page', dateOfBirthHeadingContent);

}