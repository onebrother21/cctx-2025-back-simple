import mongoose from 'mongoose';
import Utils from '@utils';

mongoose.Promise = import("bluebird");

const env = process.env["NODE_ENV"] || "";
process.env.DB = process.env[`DB_URI_${/live/.test(env)?"LIVE":"LOCAL"}`] || "";

const dbString = process.env.DB;
const dbName = process.env.DB_NAME;
let options = {
  //user:process.env.DB_USER,
  //pass: process.env.DB_PASS,
  dbName
};

class Db {
  public static connect = async () => {
    try {
      const conn = await mongoose.connect(dbString,{
        "dbName":dbName,
        "connectTimeoutMS":10000,
        "socketTimeoutMS":10000
      });
      Utils.print("ok","cctx-dev-back","MongoDb (connected)");
      return conn;
    }
    catch(err:any) {
      if(err.message.indexOf("ECONNREFUSED") !== -1) {
        Utils.print("error","cctx-dev-back","mongodb","The server was not able to connect. Check your internet connection and MDB service.");
        process.exit(1);
      }
      else {
        Utils.print("error","cctx-dev-back","mongodb",`Connection error. ${err}`);
        throw err;
      }
    }
  };
}
export default Db;