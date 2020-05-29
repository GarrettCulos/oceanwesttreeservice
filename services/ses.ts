import AWS from 'aws-sdk';
import { environment } from '@config/environment';
/**
 * To enable SES you must verify the domain of the sending email.
 * To do this navigate to https://console.aws.amazon.com/ses  and verify the domain.
 */
export const ses = new AWS.SES({ ...environment.SES.config });
export const sendEmail = (html: string, subject: string, targetEmail: string): Promise<any> => {
  const params: AWS.SES.SendEmailRequest = {
    Destination: {
      ToAddresses: [targetEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: environment.SES.sourceEmail,
  };
  return new Promise((resolve, reject) => {
    if (!environment.SES.isEnabled) {
      return resolve('feature not enabled, continue as usual');
    }
    ses.sendEmail(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        return reject(err);
      } else {
        console.log(data);
        return resolve(data);
      }
    });
  });
};
