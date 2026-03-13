export const SetResponseCorsHeaders:() => IHandler = () => async (req, res, next) => {
  if(req.headers.origin) res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header([
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Credentials",
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept"
  ]);
  //console.log(res.getHeaders())
  next();
};
export default SetResponseCorsHeaders;