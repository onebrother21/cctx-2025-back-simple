const { ObjectId } = require("mongodb");

use('ccdev-2025');

//create business vars
const createBusinessVars = () => {
  db.getCollection('bvars').insertOne({
    status: 'active',
    appInfo: {
      id: '1',
      name: 'ccdev-2025-front-new',
      version: '1.0.0',
      hash: 'e6052aba-74e4-cfea-1295-dabe9ef6cbea'
    },
    apiInfo: {
      id: '1',
      name: 'ccdev-2025-back-new',
      version: '1.2.4',
      hash: '7594780a-5fee-942d-006a-f25725a212ed'
    },
    rates: {
      service: 0.06,
      delivery: 0.2,
      weather: 0,
      addlrisk: 0,
      admin: 0.05
    },
    deliveryAdminRate: 0.02,
    hrsOfOperation: '8AM - 5PM CST',
    terms: [
      'products not for redistribution',
      'products for personal use only for recreational or medicinal purposes',
      'products not for sale to minors',
      'products cannot be procured for minors'
    ],
    rules: [
      'periodic vehicle mileage check',
      'periodic courier insurance check'
    ],
    serviceAreaRadius: '11.5 mi',
    procurementStrategy: 'proxy',
    vehicleMileageCap: 175000,
    slas: {
      vendorPrepTime: '10 min',
      deliveryTimeFromVendor: '15 min',
      customerVerificationOnDelivery: '4 min',
      totalOrderFulfillmentTime: '29 min'
    },
    maxQtyPerPurchase: '28 g',
    origins: [
      'http://localhost:3000',
      'http://localhost:8022',
      'http://localhost:4400',
      'http://192.168.1.65:4400'
    ],
    blacklist: [ '123.45.67.890' ],
    createdOn: '2025-02-15T22:10:04.235Z',
    updatedOn: '2025-02-15T23:29:01.534Z',
    maxAdminFee: '$5',
    maxServiceFee: '$12',
    allowMultipleCouriersPerVehicle: false,
    allowMultipleMgrsPerVendor: false,
    allowMultipleUsersPerVendor: true,
    id: '67b0e781b903131f834ba70a',
    master: '680417297782ecb3c6cf7375'
  });
};

//update business vars
const updateBusinessVars = async (id) => {
  const o = await db.getCollection('bvars').findOneAndUpdate({_id:new ObjectId(id)},{$set:{
    origins: [
      'http://localhost:3000',
      'http://localhost:8022',
      'http://localhost:4400',
      'http://192.168.1.65:4400',
      'http://192.168.1.65:3000'
    ],
    newVariable:"very important"
  }});
  if(o) console.log("updated succesfully",o.id);
  else console.log("something went wrong")
};

updateBusinessVars("684cd89ad1f719c40fb579d1");