// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'pp14frwua4'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-ch11m2eo.auth0.com',            // Auth0 domain
  clientId: '7kFz5EWETg5GFQI8w1ZndZCPiQVDCQx7',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
