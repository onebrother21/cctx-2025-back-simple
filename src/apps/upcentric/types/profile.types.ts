import Types from "../../../types";

export enum IUpcentricProfiles {
  ADMIN = "app-admn",
  ACCT_MGR = "acct-mgr"
}
export type IUpcentricClient = Omit<Types.IProfile,"dob">;
export type IUpcentricVendor = Omit<Types.IProfile,"dob">;
export type IUpcentricContact = Omit<Types.IProfile,"dob"> & {
  meta:{
    ref:string,
    rel:string
  }
};

export type IUpcentricSubject = Types.IProfile & {
  meta:{
    type:"primary"|"secondary";
    addrOnDateOfLoss:AddressObj;
    currentAddr:AddressObj;
    currentPhn:PhoneNumber;
    hasAtty:boolean;
    attyInfo:Types.IProfile;
  };
};
export type IUpcentricAdmin = Types.IProfile & {
  meta:{
    user:string;
    scopes:string[];
    rateAmt:number;
    rateUnit:"hr"|"attempt";
    mileageRate:number;
  };
};

export enum IUpcentricProfileActions {
  // AUTH
  TEST_AUTH = "logged in",
  USER_CREATED = "created",
  USER_VERIFIED = "verified",
  USER_REGISTERED = "registered",
  USER_LOGIN = "logged in",
  UNRECOGNIZED_LOGIN = "logged in - unrecognized",
  USER_LOGOUT = "logged out",
  FORGOT_PASSWORD = "forgot pswd",
  RESET_PASSWORD_SUCCESS = "reset pswd",
}
export enum IUpcentricProfileActionsUF {
  // AUTH
  TEST_AUTH = "test-auth",
  REGISTER = "user {{username}} registered, status changed to 'enabled'",
  VERIFY = "user {{username}} registered, status changed to 'verified'",
  LOGIN = "user {{username}} logged in, status changed to 'active'",
  UNRECOGNIZED_LOGIN = "user {{username}} registered, status changed to 'enabled'",
  FORGOT_PASSWORD = "user {{username}} forgot pswd, reset link sent to email, status changed to 'locked'",
  RESET_PASSWORD_SUCCESS = "user {{username}} reset pswd, status changed to 'enabled'",
  
  // TEST
  TEST_EMAIL = "test-email",
  SEND_INVOICE = "Welcome {{name}}, here is your invoice {{invoice}}",

  ADMIN_REGISTERED = "Welcome {{user}}, thank you for registering your admin account {{adminName}} with us!",
  ADMIN_ACCT_TEMP_PSWD = "Your temporary passcode to add a user is {{tempPswd}}, It expires in 15 minutes.",
  ADMIN_ACCT_USER_JOINED = "{{user}} has joined the {{adminName}} admin account.",
  ADMIN_ACCT_USER_LEFT = "{{user}} has left the {{adminName}} admin account.",
  ADMIN_ACCT_USER_REMOVED = "{{user}} has been removed from the {{adminName}} admin account.",
  ADMIN_ACCT_MGR_UPDATED = "{{user}} is now managing the {{adminName}} admin account.",
  ADMIN_DISABLED = "Admin account {{adminName}} has been disabled.",
  ADMIN_REMOVED = "Admin account {{adminName}} has been removed.",

  VENDOR_REGISTERED = "Welcome {{user}}, thank you for registering your vendor account {{vendorName}} with us!",
  VENDOR_ACCT_TEMP_PSWD = "Your temporary passcode to add a user is {{tempPswd}}, It expires in 15 minutes.",
  VENDOR_ACCT_USER_JOINED = "{{user}} has joined the {{vendorName}} vendor account.",
  VENDOR_ACCT_USER_LEFT = "{{user}} has left the {{vendorName}} vendor account.",
  VENDOR_ACCT_USER_REMOVED = "{{user}} has been removed from the {{vendorName}} vendor account.",
  VENDOR_ACCT_MGR_UPDATED = "{{user}} is now managing the {{vendorName}} vendor account.",
  VENDOR_DISABLED = "Vendor account {{vendorName}} has been disabled.",
  VENDOR_REMOVED = "Vendor account {{vendorName}} has been removed.",
  
  COURIER_REGISTERED = "Welcome {{user}}, thank you for registering your courier account {{courierName}} with us!",
  COURIER_ACCT_TEMP_PSWD = "Your temporary passcode to add a user is {{tempPswd}}, It expires in 15 minutes.",
  COURIER_ACCT_USER_JOINED = "{{user}} has joined the {{courierName}} courier account.",
  COURIER_ACCT_USER_LEFT = "{{user}} has left the {{courierName}} courier account.",
  COURIER_ACCT_USER_REMOVED = "{{user}} has been removed from the {{courierName}} courier account.",
  COURIER_ACCT_MGR_UPDATED = "{{user}} is now managing the {{courierName}} courier account.",
  COURIER_DISABLED = "Courier account {{courierName}} has been disabled.",
  COURIER_REMOVED = "Courier account {{courierName}} has been removed.",
  COURIER_ASSIGNED = `You have been assigned order {{orderId}}. Please accept or reject.`,
  COURIER_ASSIGNMENT_CANCELLED = `Order assignment canceled: {{orderId}}`,

  ORDER_PLACED = "Your order #{{orderId}} has been received.",
  ORDER_UPDATE = "Your order #{{orderId}} has been updated.",
  ORDER_COMPLETE = "Thank you for your order, {{name}}! Your order #{{orderNumber}} has been complete.",
  ORDER_CONFIRMATION = "Thank you for your order, {{name}}! Your order #{{orderNumber}} has been confirmed.",

  ORDER_OUT_FOR_DELIVERY = "Good news, {{name}}! Your order #{{orderNumber}} has been picked up and is on its way.",
  PAYMENT_SUCCESS = "Hi {{name}}, your payment of {{amount}} was successfully processed. Thank you for shopping with us!",
  PAYMENT_FAILED = "Oops, {{name}}. Your payment of {{amount}} could not be processed. Please check your payment details.",
  NEW_MESSAGE = "You have a new message from {{senderName}}: {{message}}",
  CHAT_INVITE = "{{senderName}} has invited you to a chat. Click here to join: {{inviteLink}}",
  DELIVERY_STATUS = "Your package is {{status}}, {{name}}. Track your delivery here: {{trackingLink}}",
  DRIVER_UI_UPDATE = "Hello driver {{name}}, new job assigned. Check your dashboard for details.",
  PROMOTIONAL_OFFER = "Hi {{name}}, don’t miss out on our latest offer: {{offerDetails}}. Shop now!",
  ACCOUNT_UPDATE = "Your account has been updated successfully, {{name}}.",
  INVOICE_READY = "Hi {{name}}, your invoice #{{invoiceNumber}} is ready. View it here: {{invoiceLink}}",
  USER_FEEDBACK_REQUEST = "Hello {{name}}, we value your opinion. Please take a moment to provide feedback on your recent experience.",
  SYSTEM_ALERT = "Alert: {{alertMessage}}",
  SHIPPING_DELAY = "Hello {{name}}, we regret to inform you that your order #{{orderNumber}} has been delayed. We apologize for the inconvenience.",
}