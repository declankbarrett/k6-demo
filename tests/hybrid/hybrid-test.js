/* 
  This is a test to show hybrid testing capabilities using K6, it uses the browser to test frontend performance metrics at a low VU rate, while also running through the E2E journey
  using protocols to test the backend at a larger user rate.
*/  
import { browser } from 'k6/browser'
import http from 'k6/http'
import { check, sleep } from 'k6';

// Constants
const startPageTitleContent = 'Apply online for a UK passport';
const overseasHeadingContent = 'Do you live in the UK?';
const dateOfBirthHeadingContent = 'Date of birth';
const baseUrl = '';

// Function to check the heading on web based tests when we reach a new page
async function checkHeading(pageName, pageTitleLocator, pageTitleExpected){
  let pageTitle = await pageTitleLocator.textContent();
  check(pageTitle, {
    [`${pageName} is correct`]: title => title.includes(pageTitleExpected)
  })
}

// Function to return the heading element on a page
async function getHeading(page){
  return await page.locator('h1[class="govuk-fieldset__heading"]');
}

// Function to wait for a heading to appear on a page before proceeeding with the next steps
async function waitForHeading(page){
  await page.waitForSelector('h1[class="govuk-fieldset__heading"]');
}

// Function to check the response of our protocol tests
function checkResponse(res, pageName, titleContent){
  check(res, {
    [`${pageName} - Status is 200`]: res => res.status === 200,
    [`${pageName} - Heading appears in body`]: (res) => res.body.includes(titleContent),
})
}

// Function to retrieve the token on each protocol execution to allow the next to run with this token in the params
export function getToken(res){
  const csrfTokenRegExp = /name="x-csrf-token" value="([^"]+)"/;
  const match = res.body.match(csrfTokenRegExp);

  let csrfToken = null;
  if (match && match.length > 1) {
    csrfToken = match[1];
  }
  return csrfToken;
}

// Options to dictate the performance run config for each test
export const options = {
  scenarios: {
      ui1: {
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
      ui2: {
          executor: 'constant-vus',
          exec: 'browserTest',
          options: {
              browser: {
                  type: 'chromium',
              },
          },
          vus: 2,
          startTime: '30s',
          duration: '30s'
      },
      backend: {
          executor: 'constant-vus',
          exec: 'protocolTest',
          vus: 1,
          startTime: '30s',
          duration: '60s'
      }
  },
  thresholds: {
      'browser_http_req_duration{scenario:ui1}': [],
      'browser_http_req_duration{scenario:ui2}': [],
  },
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
