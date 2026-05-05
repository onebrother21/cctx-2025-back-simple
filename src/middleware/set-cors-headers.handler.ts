export const SetCorsResponseHeaders:() => IHandler = () => async (req, res, next) => {
  if(req.headers.origin) res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header("Access-Control-Expose-Headers","x-cctx-e2e");
  res.header([
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Credentials",
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "x-cctx-e2e"
  ]);
  //console.log(res.getHeaders())
  next();
};
export default SetCorsResponseHeaders;