export const PageNotFound:() => IHandler = () => (req,res) => {
  res.status(404).json({
    status:404,
    success:false,
    message:"resource not found"
  });
};
export default PageNotFound;