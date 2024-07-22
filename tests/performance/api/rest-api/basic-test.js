// This basic test is just going to show an example of a GET and POST request using K6 with just a single VU
import { check, group, sleep } from "k6";
import http from "k6/http";

const baseUrl = 'https://test.k6.io/';
const payload = JSON.stringify({
  username: "test_user",
  password: "1234",
});

const params = {
  headers: {
    "Content-Type": "application/json",
  },
};

export default function() {
  group('GET request', function() {
    let result = http.get(`${baseUrl}contacts.php`);
    check(result, {
      'Status code is 200': result.status === 200
    }
    )
  });

  group('POST Request', function() {
    let result = http.post(`${baseUrl}my_messages.php`, payload, params);
    check(result, {
      'Status code is 200': result.status === 200
    }
    )
  })
}