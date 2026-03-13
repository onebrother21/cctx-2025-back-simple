export const CheckUserRole:(roles?:string[]) => IHandler = (roles) => (req,res,next) => {
  const role = req.user.role;
  if(roles && !roles.includes(role)) res.status(401).json({
    succes:false,
    message:"Unauthorized role!"
  });
  else next();
};
export default CheckUserRole;