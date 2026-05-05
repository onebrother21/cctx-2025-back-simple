
import { EncryptData } from './encryption.handlers';
import { localsCheck } from './custom.handlers';
import SetCorsResponseHeaders from "./set-cors-headers.handler";
import SetUserSession from "./set-user-session.handler";
import SendJson from "./send-json.handler";
import { RequestHandler, Router } from 'express';

export * from './auth-jwt.handler';
export * from "./check-admin-scopes.handler";
export * from "./check-user-role.handler";
export * from "./check-validation.handler";
export * from './configure-cors.handler';
export * from './configure-cors-socketio.handler';
export * from './configure-session.handler';
export * from './custom.handlers';
export * from './encryption.handlers';
export * from "./not-found.handler";
export * from "./send-error.handler";
export * from "./set-business-vars.handler";
export * from "./set-csrf-token.handler";
export * from "./set-user-device.handler";
export * from "./upload.handler";

export const loadV5 = (...args:(RequestHandler|IHandler|Router)[]) => [...args] as RequestHandler[];

// MORGAN
export const morganOutputTemplate = ':method :url :status [:remote-addr :user-agent :date[iso]]';
//':res[content-length] - :response-time ms'
export const PostMiddleware = [
  EncryptData(),
  SetUserSession(),
  SetCorsResponseHeaders(),
  // localsCheck(),
  SendJson(),
];