// This is an example of a loaded SOAP API test using K6 which increases the number of VUs overtime in a ramping format
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.01", abortOnFail: true }], 
    http_req_duration: ['p(99)<1000'], 
  },
  scenarios: {
    breaking: {
      executor: "ramping-vus",
      stages: [
        { duration: "10s", target: 20 },
        { duration: "50s", target: 20 },
        { duration: "50s", target: 40 },
        { duration: "50s", target: 60 },
        { duration: "50s", target: 80 },
        { duration: "50s", target: 100 },
        { duration: "50s", target: 120 },
        { duration: "50s", target: 140 },
      ],
    },
  },
};

const numbermultiplicationArray = [
  {"inputOne": 4,"inputTwo":6, "output": 24},
]

const soapReqBody = `
  <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <Multiply xmlns="http://tempuri.org/">
        <intA>${numbermultiplicationArray[0].inputOne}</intA>
        <intB>${numbermultiplicationArray[0].inputTwo}</intB>
      </Multiply>
    </soap:Body>
  </soap:Envelope>`;

export default function () {
  // When making a SOAP POST request we must not forget to set the content type to text/xml
  const res = http.post(
    'http://www.dneonline.com/calculator.asmx',
    soapReqBody,
    { headers: { 'Content-Type': 'text/xml' } }
  );

  // Make sure the response is correct
  check(res, {
    'status is 200': (r) => r.status === 200,
    'number is present': (r) => r.body.indexOf(numbermultiplicationArray[0].output) !== -1,
  });

  sleep(1);
}