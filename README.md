# DATA UPLOADER
An API service for uploading bulk csv and json data to restful API

## Setup
- clone this repo and cd into its local folder
- run 'npm install'
- create a .env file in your project directory
- enter the following 4 keys and their corresponding values in the .env file. (The values used here are for illustration purpose. PORT is optional. If not specified, the server will run on port 5001)
```
EMAIL=john.doe@gmail.com
PASSWORD=somePassword
LOGIN_URL=https://example.com/login
API_URL=https://api.example.com/v1
PORT=5023
```
- run `npm start` to start the server. (server runs on `localhost:<PORT>` )

## Upload csv data
To upload a csv dataset:
- create a POST request with a Content-Type of `multipart/form-data;`
- The form data should contain a key `csv`
- The value of the above key should be your csv file
- send the POST request to your uploader server while indicating the particular endpoint (`localhost:<PORT>/:endpoint/csv`)
- E.g. When uploading new users (and did not specify custom PORT in .env file), the URL becomes: `localhost:5001/users/csv`

## Upload json data
- create a POST request with a Content-Type of `application/json`
- The request body should be an array of the records to be uploaded
- send a POST request to your uploader server while indicating the particular API endpoint you want to upload to (`localhost:<PORT>/:endpoint/json`)
- E.g. When uploading new location records to your API (and did not specify custom PORT in .env file), the URL becomes: `localhost:5001/locations/json`
