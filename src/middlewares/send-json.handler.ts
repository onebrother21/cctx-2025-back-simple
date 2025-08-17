export const SendJson:() => IHandler = () => (req,res,next) => {
  const {
    status,
    success,
    message,
    data,
    enc,
    token,
    csrfToken,
  } = res.locals;
  if(success) res.status(status || 200).json({
    success,
    message,
    data,
    enc,
    ...(token?{token}:{}),
    csrfToken,
  });
  else {
    // console.warn(res.locals);
    next();
  }
};
export default SendJson;