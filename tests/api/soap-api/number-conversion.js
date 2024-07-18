// This is a simple SOAP API test using an example script found online to demonstrate K6 ability to test SOAP APIs as well as its preferred REST APIs.
import http from 'k6/http';
import { check, sleep } from 'k6';

const soapReqBody = `
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <NumberToWords xmlns="http://www.dataaccess.com/webservicesserver/">
        <ubiNum>500</ubiNum>
      </NumberToWords>
    </soap:Body>
  </soap:Envelope>`;

export default function () {
  // When making a SOAP POST request we must not forget to set the content type to text/xml
  const res = http.post(
    'https://www.dataaccess.com/webservicesserver/NumberConversion.wso',
    soapReqBody,
    { headers: { 'Content-Type': 'text/xml' } }
  );

  // Make sure the response is correct
  check(res, {
    'status is 200': (r) => r.status === 200,
    'number is present': (r) => r.body.indexOf('five hundred') !== -1,
  });

  sleep(1);
}