# DATA UPLOADER
An API service for uploading bulk csv and json data to restful API

## Setup
- clone this repo and cd into its local folder
- run 'npm install'
- create a .env file in your project directory
- enter the following 4 keys and their corresponding values in the .env file. (The values used here are for illustration purpose. PORT is optional. If not specified, the server will run on port 5001)
-- EMAIl=john.doe@gmail.com
-- PASSWORD=somePassword
-- LOGIN_URL=https://example.com/login
-- API_URL=https://api.example.com/v1
-- PORT=5023
- run `npm start` to start the server. (server runs on `localhost:

## Upload csv data
- send a POST request with a form data content-type. The form data should contain a key `csv`. The value of that key should be your csv file
