/* 
This is a test to show K6 ability to run API functionality testing to try to use the same tool for performance and API testing
To get tests to "Fail" in K6 we need to use thresholds, just using a check will check the result from a response but will use this 
to update metrics, because usually you would run thousands of requests and you wouldn't want your performance tests to fail because 
1/20031 for example errored, we take percentages to ensure we hit a certain threshold. So to check the functionality of our API, I
have ran a single user against each request and created a threshold to check if the "checks" are at 100%, if not then it will error
and the test names and number of tests failed will be logged.
*/
import { check, group } from "k6";
import http from "k6/http";

const baseUrl = 'https://reqres.in/';
let failures = [];
let testName = '';

const postPayload = JSON.stringify({
  "name": "morpheus",
  "job": "leader"
});
const putPayload = JSON.stringify({
  "name": "morpheus",
  "job": "zion resident"
});

export let options = {
  thresholds: {
      "checks": ["rate==1.00"]
  },
}

export default function() {

  group(testName = 'Get list of users', function() {
    let result = http.get(`${baseUrl}api/users?page=2`);
    let checkResult = check(result, {
      'Status code is 200': result.status === 200
    }
    )
    checkFailures(checkResult, testName);
  });

  group(testName = 'Get single user', function() {
    let result = http.get(`${baseUrl}api/users/2`);
    let checkResult = check(result, {
      'Status code is 200': result.status === 200
    }
    )
    checkFailures(checkResult, testName);
  });

  group(testName = 'Post single user', function() {
    let result = http.post(`${baseUrl}api/users`, postPayload);
    let checkResult = check(result, {
      'Status code is 201': result.status === 200
    }
    )
    checkFailures(checkResult, testName);
  });

  group(testName = 'Update single user', function() {
    let result = http.put(`${baseUrl}api/users/2`, putPayload);
    let checkResult = check(result, {
      'Status code is 200': result.status === 200
    }
    )
    checkFailures(checkResult, testName);
  });

  group(testName = 'Delete single user', function() {
    http.delete
    let result = http.del(`${baseUrl}api/users/2`);
    let checkResult = check(result, {
      'Status code is 204': result.status === 200
    }
    )
    checkFailures(checkResult, testName);
  });

  logFailures();

}

function checkFailures(checkResult, testName){
  if(!checkResult){
    failures.push(`${testName} - Failed`);
  }
}

function logFailures()
{
  console.log(`Failed tests: ${failures.length}`);
  console.log(`Failures:\n${failures.join('\n')}`)
}