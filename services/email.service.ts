import * as metro from '@util/metrica';
import { sendEmail } from './ses';

const footer = '';
/**
 * create account email
 */
export const sendCreateAccountEmail = async (name: string, email: string): Promise<any> => {
  const mid = metro.metricStart('sendCreateAccountEmail');
  try {
    const data = await sendEmail(
      `Welcome ${name}! <br/> <br/> 
      We're happy to have you join the community. <br/>
      Enjoy the online ordering service and stay safe. <br/>
      
      ${footer}
      `,
      'Account Created',
      email
    );
    metro.metricStop(mid);
    return data;
  } catch (err) {
    metro.metricStop(mid);
    throw err;
  }
};
/**
 * order submitted email
 */
export const sendOrderSubmittedEmail = async (
  storeName: string,
  orderLink: string,
  orderId: string,
  email: string
): Promise<any> => {
  const mid = metro.metricStart('sendCreateAccountEmail');
  try {
    const data = await sendEmail(
      `
      Your order has been submitted! <br/> 
      You can find your order information <href target="${orderLink}">here</href>. <br/>
      ${footer}
      `,
      'Order Submitted - ' + storeName,
      email
    );
    metro.metricStop(mid);
    return data;
  } catch (err) {
    metro.metricStop(mid);
    throw err;
  }
};

/**
 * order ready email
 */
export const orderReady = (storeName: string, orderLink: string, orderId: string, email: string): Promise<any> => {
  return sendEmail(
    `
    Your order for ${storeName} is ready<href target="${orderLink}">here</href>.    
    ${footer}
    `,
    'Order Submitted - ' + storeName,
    email
  );
};
