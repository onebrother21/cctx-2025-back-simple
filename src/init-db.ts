import mongoose from 'mongoose';
import Utils from '@utils';
mongoose.Promise = import("bluebird");

const env = process.env.NODE_ENV || "";
const db = `DB_URI_${/live/i.test(env)?"LIVE":"LOCAL"}`;
process.env.DB = process.env[db] || "";

const dbString = process.env.DB;
const dbName = process.env.DB_NAME;
let options = {
  //user: process.env.DB_USER,
  //pass: process.env.DB_PASS,
  dbName,
};
class Db {
  public static connect = async () => {
    try {
      const conn = await mongoose.connect(dbString,{
        "dbName":dbName,
        "connectTimeoutMS":10000,
        "socketTimeoutMS":10000
      });
      Utils.ok("mongodb","Connected");
      return conn;
    }
    catch(err:any) {
      if(err.message.indexOf("ECONNREFUSED") !== -1) {
        Utils.error("mongodb","The server was not able to connect. Check your internet connection and MDB service.");
        process.exit(1);
      }
      else {
        Utils.error("mongodb",`Connection error. ${err}`);
        throw err;
      }
    }
  };
}
export default Db;