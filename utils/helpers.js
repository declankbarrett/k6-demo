import { check } from 'k6';

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