import mongoose from 'mongoose';
import Utils from '@utils';
mongoose.Promise = import("bluebird");

export const initDb = async () => {
  try {
    const dbLabel = `DB_URI_${(Utils.isProd() || Utils.isEnv("live"))?"LIVE":"LOCAL"}`;
    const dbUri = process.env[dbLabel] || '';
    const dbName = process.env.DB_NAME;
    if(!dbUri) throw {status:500,message:"No mongodb connection string provided"};

    const conn = await mongoose.connect(dbUri,{
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
export default initDb;