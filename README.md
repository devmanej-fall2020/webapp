# webapp
CSYE6225 Fall 2020 WebApp

Cloud Computing Coursework Project

Prerequisites:
The following are to be installed:
1. Node.js
2. MySQL Server
3. npm
4. A code editor - preferably Visual Studio Code
5. Application to view/access mysql database - Either command line or MySQL Workbench
6. REST API testing tool - preferably Postman

Installation Steps:
1. Clone repository from GitHub.
2. Open the code in the code editor of your choice, and run the command npm install. This will install all the dependencies listed in package.json.
3. Run the command npm start. While running locally, the application will be hosted at http://localhost:4000/.

Running the Application:
1. Navigate to the address http://localhost:4000/. There are three API endpoints in this application.

    1. POST: The endpoint for this request is "/v1/user", which has to be appended after the address above. This request creates a new user. It performs a POST request to the application and the endpoint is not protected i.e. authorization is not required. The response will include the status of your request, and also the information that has been passed to the application if successful. An example request schema is listed below.

            {
                "first_name": "Jane",
                "last_name": "Doe",
                "password": "skdjfhskdfjhg",
                "username": "jane.doe@example.com"
            }

    2. GET : The endpoint for this request is "/v1/user/self", which has to be appended after the address mentioned in the installation steps.This request fetches the user information. It performs a GET request to the application and the endpoint is protected i.e. authorization is required. For authorization, the Authorization tab in Postman can be utilized, and the username and password can be inputted. The response will include the status of your request, and also the information that has been passed to the application if successful.

    3. PUT : The endpoint for this request is "/v1/user/self", which has to be appended after tthe address mentioned in the installation steps.This request updates the user information. It performs a PUT request to the application and the endpoint is protected i.e. authorization is required. For authorization, the Authorization tab in Postman can be utilized, and the username and password can be inputted. The response will include the status of your request, and also the information that has been passed to the application if successful. An example request schema is listed below.

            {
                "first_name": "Jane",
                "last_name": "Doe",
                "password": "skdjfhskdfjhg",
                "username": "jane.doe@example.com"
            }

Testing Steps:
1. The application has test cases included. To perform testing, run npm test. The test suite will run the tests, and provide information on whether the tests have passed.

Importing Certificate in AWS Certificate Manager:
1. In AWS, we generally have two ways of importing a certificate to Certificate Manager, one is through CLI and one is through AWS Console.
2. In this application, we will be importing the certificate through the CLI. You will first have to change the user profile in the CLI to the AWS account you would like to add the changes to.
You can achieve this by ```export AWS_PROFILE=prod``` where prod stands for the alias to production account.
3.  The command to import the certificate is listed below.

```$ aws acm import-certificate --certificate fileb://certificate_body.pem --certificate-chain fileb://certificate_chain.pem  --private-key fileb://private_key.pem```

where,
    1. --certificate stands for the certificate body
    2. --certificate-chain stands for certificate chain
    3. --private-key stands for private key
