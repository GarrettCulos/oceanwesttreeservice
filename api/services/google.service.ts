import { OAuth2Client } from 'google-auth-library';
import { environment } from '@config/environment';

const client = new OAuth2Client(environment.GOOGLE_CLIENT_ID);

export function verifyGoogleToken(token: string): Promise<any> {
  return client.verifyIdToken({
    idToken: token,
    audience: environment.GOOGLE_CLIENT_ID,
    // Specify the CLIENT_ID of the app that accesses the back end
  });
}
