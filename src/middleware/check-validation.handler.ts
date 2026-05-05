import { validationResult } from "express-validator";
import Utils from "@utils";

export const CheckValidation:() => IHandler = () => (req,res,next) => {
  const result = validationResult(req);
  if (result.isEmpty()) next();
  else next(new Utils.AppError({
    status:400,
    message:"Please check your data!",
    errors: result.array()
  }));
};
export default CheckValidation;