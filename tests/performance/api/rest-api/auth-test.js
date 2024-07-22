// This test is just to show an example of a login using a csrftoken, stripped from the k6 example script, utilising a json file to fill the data in the request also.
// Becuase this is just an example showing auth, I did not put any load on this test
import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

let successfulLogins = new Counter("successful_logins");
let checkFailureRate = new Rate("check_failure_rate");
let timeToFirstByte = new Trend("time_to_first_byte", true);
const loginData = JSON.parse(open("../../../../utils/users.json")); 

// If our tests results fall outside of our thresholds the tests will fail, we can set thresholds based on the performance metrics required per project
export let options = {
  thresholds: {
      "http_req_duration": ["p(95)<1500"],
      "check_failure_rate": ["rate<0.3"]
  },
}

// This function is a login test using the sample K6 test and K6 API, it will grab a token and use this token in the next request to authenticate login
export default function() {
  group("Login", function() {
    let res = http.get("http://test.k6.io/my_messages.php");
    let checkRes = check(res, {
        "Users should not be auth'd. Is unauthorized header present?": (r) => r.body.indexOf("Unauthorized") !== -1
    });
        
    //extracting the CSRF token from the response

    const vars = {};

    vars["csrftoken"] = res
        .html()
        .find("input[name=csrftoken]")
        .first()
        .attr("value");   
        
      console.log(`${vars['csrftoken']}`)

    // Record check failures
    checkFailureRate.add(!checkRes);
    // Randomise the user from the user.json file used in the tests, I did not use this as it caused the test to fail as only 1 user is an admin, still a useful line of code however
    let position = Math.floor(Math.random()*loginData.users.length);
    let credentials = loginData.users[0];
    console.log(`${credentials.username}`);

    res = http.post("http://test.k6.io/login.php", { login: credentials.username, password: credentials.password, redir: '1', csrftoken: `${vars["csrftoken"]}` });
    checkRes = check(res, {
        "is logged in welcome header present": (r) => r.body.indexOf("Welcome, admin!") !== -1
    });
            // Record successful logins
            if (checkRes) {
              successfulLogins.add(1);
          }

          // Record check failures
          checkFailureRate.add(!checkRes, { page: "login" });

          // Record time to first byte and tag it with the URL to be able to filter the results in Insights
          timeToFirstByte.add(res.timings.waiting, { ttfbURL: res.url });

          sleep(10);
      });
}


