# k6-demo

# Summary

This is a project to demonstrate the basic capabilites of K6 as a performance testing tool. In use on a project we would have more features embedded, but for the sake of learning
this repo only contains the tests, and the config for each test.

The repo covers:

- Basic testing of REST API
- Basic testing of SOAP API
- Basic UI test (on Kainos website)
- A full hybrid test

# Prerequisites

- The only essential to use and run this repository is to install K6
- This can be done through homebrew
  - brew install k6
    - If you are using other devices and do not have homebrew, please see (https://grafana.com/docs/k6/latest/set-up/install-k6/)

# Running the tests

To run the tests that are within the api/web folders, we need to run

- k6 run <path to file>
  - For example k6 run tests/api/rest-api/basic-test.js

The tests which incorporate the web can be run in headless mode by adjusting the run command as such

- K6_BROWSER_HEADLESS=false k6 run <path to file>

# The hybrid test

The hybrid test is the most complete test in the repo, and covers off mulitple different types of performance testing, these include:

- Smoke
  - npm run test:smoke
- Load
  - npm run test:load
- Stress
  - npm run test:stress
- Soak
  - npm run test:soak

To run these we have seperate run commmands which are outlined in the package.json, all of these run the web tests in headed mode, to change this either remove the K6_BROWSER_HEADLESS=false from the run command or change the false to true

You are also welcome to change the run config for these tests in the test-config file which can be found in the utils folder.

# Visual Outputs

When running a test, the performance metrics are displayed in the terminal, however I have set up a html file which is created on test runs to display this information in a
more user friendly way

Alternative we can view our performance using k6 cloud and grafana (however this does require an account), using the trial account I have managed to run the smoke tests and the
graphical results of this can be seen in the screenshots folder.

To run this you need to:

- Install k6 (brew install k6)
- Authenticate (k6 login cloud --token <your k6 cloud token>)
- run the tests (npm run test:grafana) - This is currently only set up to run the smoke tests, you can simply change the 'test_mode' in the run command in the package.json

# Further adjustments

As this is a K6 demo repo, I have not included things such as POM(Page Object Model) to the structure of the tests which interacting with web elements. In reality we would do this
however to not add extra complexity to the repo, I have just included finding elements inside the test functions themselves.
