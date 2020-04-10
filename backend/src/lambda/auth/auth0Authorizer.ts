import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import authConfig from '../../config';

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const jwksUrl = authConfig.jwksUrl;
const kid = authConfig.kid;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)





  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  if (!authHeader) throw new Error('No authentication header!');
  if (!authHeader.toLowerCase().startsWith('bearer ')) throw new Error('Invalid authentication header!');


  const cert = await getCert();

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}



interface ISigningKey {
  keys: [
    {
      kid: string,
      x5c: [string]
    }
  ],
}

function getCert (): Promise<string> {
   return Axios.get(jwksUrl)
     .then((res) => {
       const signingKey: ISigningKey  = res.data;
       if (signingKey.keys && Array.isArray(signingKey.keys)) {
         const key = signingKey.keys.find(x => x.kid === kid);
         if (key) {
           return key.x5c[0];
         }
       }
       throw new Error("Key not found!");
     })
}
