export const SendJson:() => IHandler = () => (req,res,next) => {
  const {
    status,
    success,
    message,
    data,
    tokens,
  } = res.locals;
  if(success) res.status(status || 200).json({
    success,
    message,
    data,
    tokens,
  });
  else {
    // console.warn(res.locals);
    next();
  }
};
export default SendJson;