// This test will demonstrate the same tests as the basic-test but under a larger load using stages and thresholds to cause failures if our tests do not match expected results
import { check, group } from "k6";
import http from "k6/http";
import { Rate } from "k6/metrics";

const baseUrl = 'https://test.k6.io/';
const payload = JSON.stringify({
  username: "test_user",
  password: "1234",
});

let checkFailureRate = new Rate("check_failure_rate");

export let options = {
  stages: [
      { target: 200, duration: "1m" },
      { target: 200, duration: "3m" },
      { target: 0, duration: "1m" }
  ],
  thresholds: {
      "http_req_duration": ["p(95)<500"],
      "check_failure_rate": ["rate<0.3"]
  },
}

const params = {
  headers: {
    "Content-Type": "application/json",
  },
};

export default function() {
  group('GET request', function() {
    let result = http.get(`${baseUrl}contacts.php`);
    let checkResult = check(result, {
      'Status code is 200': result.status === 200
    }
    )
    checkFailureRate.add(!checkResult);
  });

  group('POST Request', function() {
    let result = http.post(`${baseUrl}my_messages.php`, payload, params);
    let checkResult = check(result, {
      'Status code is 200': result.status === 200
    }
    )
    checkFailureRate.add(!checkResult);
  })
}