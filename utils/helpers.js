import { check } from 'k6';

// ***************** BROWSER FUNCTIONS ******************** //

// Function to check the heading on web based tests when we reach a new page
export async function checkHeading(pageName, pageTitleLocator, pageTitleExpected){
  let pageTitle = await pageTitleLocator.textContent();
  check(pageTitle, {
    [`${pageName} is correct`]: title => title.includes(pageTitleExpected)
  })
}

// Function to return the heading element on a page
export async function getHeading(page){
  return await page.locator('h1[class="govuk-fieldset__heading"]');
}

// Function to wait for a heading to appear on a page before proceeeding with the next steps
export async function waitForHeading(page){
  await page.waitForSelector('h1[class="govuk-fieldset__heading"]');
}

// *********** PROTOCOL FUNCTIONS ******************* // 

// Function to check the response of our protocol tests
export function checkResponse(res, pageName, titleContent){
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