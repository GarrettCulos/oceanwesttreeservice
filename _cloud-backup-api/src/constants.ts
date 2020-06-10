export const DISALLOWED_PASSWORDS = 'banger';
export const EXPIRES_IN = 14400;
export const CREATE_TOKEN_TYPE = 'create-account-token';
export const AUTHENTICATION_TOKEN_TYPE = 'authencation-token';
export const USER_PRIMARY_KEY = 'USR';
export const ORDER_PRIMARY_KEY = 'OID';
export const ORDER_ITEM_KEY = 'OIID';
export const CLIENT_PRIMARY_KEY = 'CLIENT';
export const PRIVATE_STORE_PRIMARY_KEY = 'STORE_PRIVATE';

export const userPkPrefix = (s = '') => `${USER_PRIMARY_KEY}-${s}`;
export const orderSkPrefix = (s = '') => `${ORDER_PRIMARY_KEY}-${s}`;
export const orderItemSkPrefix = (s = '') => `${ORDER_ITEM_KEY}-${s}`;
export const storePkPrefix = (s = '') => `STR-${s}`;
export const storeItemPrefix = (s = '') => `ITM-${s}`;
export const permissionsPrefix = (s = '') => `PERM-${s}`;
