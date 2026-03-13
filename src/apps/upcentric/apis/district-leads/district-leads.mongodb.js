const { ObjectId } = require("mongodb");

/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('ccdev-2025');

// Insert a few documents into the sales collection.
/*db.getCollection('sales').insertMany([
  { 'item': 'abc', 'price': 10, 'quantity': 2, 'date': new Date('2014-03-01T08:00:00Z') },
  { 'item': 'jkl', 'price': 20, 'quantity': 1, 'date': new Date('2014-03-01T09:00:00Z') },
  { 'item': 'xyz', 'price': 5, 'quantity': 10, 'date': new Date('2014-03-15T09:00:00Z') },
  { 'item': 'xyz', 'price': 5, 'quantity': 20, 'date': new Date('2014-04-04T11:21:39.736Z') },
  { 'item': 'abc', 'price': 10, 'quantity': 10, 'date': new Date('2014-04-04T21:23:13.331Z') },
  { 'item': 'def', 'price': 7.5, 'quantity': 5, 'date': new Date('2015-06-04T05:08:13Z') },
  { 'item': 'def', 'price': 7.5, 'quantity': 10, 'date': new Date('2015-09-10T08:43:00Z') },
  { 'item': 'abc', 'price': 10, 'quantity': 5, 'date': new Date('2016-02-06T20:20:13Z') },
]);
*/

// Run a find command to view items sold on April 4th, 2014.
db.getCollection('cases').findOneAndUpdate({_id:new ObjectId("683de36905e7318bf8036e78")},{
  $set:{"notes.1.time":new Date("2025-05-23T05:00:00.000Z")}
});
const g = db.getCollection('cases').find({reqNo:"000002"}).toArray();
//const f = db.getCollection('cases').findOne({_id:new ObjectId("683de36905e7318bf8036e78")});
/*
db.getCollection('cases').findOneAndUpdate({_id:new ObjectId("6833f8fd1161c6f57c118d68")},
  {$set:{
    "vendor": {
      "name": "Hardesty Private Investigations",
      "emails": [],
      "phns": [
        "1-800-595-0830"
      ],
      "addrs": [
        {
          "streetAddr": "PO Box 624",
          "city": "Brighton",
          "state": "MI",
          "postal": "48116",
          "country": "USA"
        }
      ]
    },
    "client": {
      "name": "kevin mcneely",
      "emails": [],
      "phns": [
        "1-248-945-1040"
      ],
      "org": "Miller & Tischler",
      "addrs": []
    },
    "subjects": [
      {
        "name": "lachrissa parker",
        "emails": [
          "alachrissa.parke225@yahoo.com",
          "lachrissa.parker@yahoo.com"
        ],
        "addrs": [
          {
            "streetAddr": "9566 Cheyenne St",
            "city": "Detroit",
            "state": "MI",
            "postal": "48227",
            "country": "USA",
            "info": "9566, Cheyenne Street, Pride Ave Community, Detroit, Wayne County, Michigan, 48227, USA",
            "loc": {
              "type": "Point",
              "coordinates": [
                -83.1738022,
                42.3669266
              ]
            }
          }
        ],
        "phns": [
          "1-313-850-7755",
          "1-313-744-8801"
        ],
        "dob":"1984-07-29T05:00:00Z",
        "type": "primary"
      },
      {
        "name": "tiffany knight",
        "emails": [],
        "addrs": [
          {
            "streetAddr": "16870 Fairfield St",
            "city": "Detroit",
            "state": "MI",
            "postal": "48221",
            "country": "USA",
            "info": "16870, Fairfield Street, University District, Detroit, Wayne County, Michigan, 48221, USA",
            "loc": {
              "type": "Point",
              "coordinates": [
                -83.134938,
                42.415924
              ]
            }
          },
          {
            "streetAddr": "9242 Mansfield St, Apt. 103",
            "city": "Detroit",
            "state": "MI",
            "postal": "48228",
            "country": "USA",
            "info": "9242, Mansfield Street, Fishkorn, Detroit, Wayne County, Michigan, 48228, USA",
            "loc": {
              "type": "Point",
              "coordinates": [
                -83.2034053,
                42.3633439
              ]
            }
          }
        ],
        "phns": [
          "1-313-970-9871"
        ],
        "type": "secondary"
      }
    ],
    "details": {
      "rush": true,
      "objective": "full",
      "dueOn":"2025-05-16T05:00:00Z",
      "dateOfAccident": "2024-06-23T05:00:00Z",
      "specialNotes": "39 years old. Citizens assigned by MACP. Refusing to appear for EVO. Establish no auto, did not have permisson from owner to use the car",
      "vehicleDesc": "2020 Volkswagon Tiguan",
      "isQNAReq": true,
      "questions": [
        "who owned the vehicle",
        "does LaChrissa own a vehicle",
        "does LaChrissa have auto insurance",
        "did LaChrissa had permission",
        "how did she attain the vehicle",
        "who are her relatives"
      ]
    },
    "reqNo": "00002",
    "statusUpdates": [
      {
        "name": "new",
        "time":"2025-05-26T05:15:41.562Z"
      },
      {
        "name": "in-progress",
        "time": "2025-05-26T05:15:58.334Z"
      },
      {
        "name": "completed",
        "time": "2025-05-26T05:16:26.531Z",
        "info": {
          "reason": "performed full investigation, invterviewed subjects, no further action required."
        }
      }
    ],
    "files": [
      {
        "originDate":"2025-05-26T05:15:55.175Z",
        "originLoc": "Detroit, MI, USA",
        "originName": "00094156.pdf",
        "mimeType": "pdf",
        "size": 236748,
        "location": "cloudinary.com/buckets/13782/1892jd09102dj19jd19jd"
      },
      {
        "originDate":"2025-05-26T05:15:55.175Z",
        "originLoc": "Detroit, MI, USA",
        "originName": "00094156.docx",
        "mimeType": "docx",
        "size": 236748,
        "location": "cloudinary.com/buckets/13782/1892jd09102dj19jd19jd"
      }
    ],
    "attempts": [
      {
        "start":"2025-05-18T05:16:01.436Z",
        "log": [
          {
            "type":"stop",
            "addrIdx":[1, 0],
            "vehiclesPresent":[
              {
                "desc": "2020 Volkswagon Tiguan",
                "plateNo": "ESL 1949",
                "plateSt": "MI",
                "location":"parked out front"
              },
            ],
            "time": "2025-05-18T05:20:17.747Z",
            "leftAttyLetter":false
          },{
            "type": "img",
            "data": {
              "name": "carsInThedriveway-001.jpg",
              "originName": "00094745.jpg",
              "originLoc": "Detroit, MI, USA",
              "originDate": "2025-05-18T05:16:10.839Z",
              "mimeType": "jpg",
              "size": 236748,
              "res": "1040X920",
              "location": "cloudinary.com/buckets/13782/1892jd09102dj19jd19jd"
            },
            "createdOn": "2025-05-18T05:16:10.878Z"
          },{
            "type":"interview",
            "name": "Tiffany Knight",
            "rel": "associate",
            "ref": "lachrissa parker",
            "method": "in-person",
            "info": "Tiffany stated her vehicle was not invloved. She received a call from Detroit Police that her car was found abandoned after an accident and was available for pickup. She informed them that the car was sitting in her rdiveway and she was unaware of any accident. Call was received two prior from eithr the 2th, 5th or 7th precinct.",
            "time":"2025-05-18T05:20:17.747Z"
          },{
            "type":"stop",
            "addrIdx":[0, 0],
            "vehiclesPresent":[],
            "leftAttyLetter":true
          },{
            "type":"interview",
            "name": "LaChrissa Parker",
            "rel": "primary",
            "method": "in-person",
            "info": "Refused to speak. Left lettter from attorney",
            "time": "2025-05-18T05:36:07.747Z"
          },{
            "type":"interview",
            "name": "Tiffany Knight",
            "rel": "secondary",
            "phns": [
              "1-313-970-9871"
            ],
            "method": "phn",
            "info": "nlnxiwoixonwxbxowi xniwnxiwexninwe",
            "time": "2025-05-18T05:47:07.747Z"
          }
        ],
        "outcome": "LaChrissa refused to speak but took any letter. Tiffany stated her vehicle was not involved per police logistical error. Captured VIN number and plan to follow up with police.",
        "end":"2025-05-18T07:16:08.519Z",
        "meta": {
          "mileage": 24.8086325011391,
          "mileageAdj": 24.8086325011391,
          "elapsedTime": 7207083
        }
      },
      {
        "start": "2025-05-23T05:16:01.436Z",
        "log": [
          {
            "type": "interview",
            "name": "Detroit Police",
            "method": "phn",
            "info": "Calls made to 2nd, 5th and 7th precints.",
            "time": "2025-05-23T05:22:07.747Z"
          }
        ],
        "outcome": "police refused to provide any additional info or possible amended police report.",
        "end": "2025-05-23T05:46:01.558Z",
        "meta": {
          "mileage": 0,
          "mileageAdj": 0,
          "elapsedTime": 1800122
        }
      }
    ],
    "admin": {
      "name": "mia francis",
      "emails": [],
      "addrs": [
        {
          "streetAddr": "31115 Huntley Square East Apt 614",
          "city": "Beverly Hills",
          "state": "MI",
          "postal": "48025",
          "country": "USA",
          "info": "31114, Huntley Square East, Beverly Hills, Oakland County, Michigan, 48025, USA",
          "loc": {
            "type": "Point",
            "coordinates": [
              -83.225571,
              42.518633
            ]
          }
        }
      ],
      "phns": [
        "1-248-417-3211"
      ],
      "rateAmt": 30,
      "rateUnit": "hr",
      "mileageRate": 0.7
    },
    "findings": {
      "newFacts": "tiffany said the police called about her car being abandoned after an accident while her car was sitting in the driveway",
      "ownerOfCar": "tiffany knight",
      "premissionToDrive": false,
      "answers": [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f"
      ],
      "household": [],
      "insuranceInfo": []
    },
    "resolution": {
      "qnaCompleted": "2025-05-26T05:16:23.374Z"
    }
  }}
);
*/
//const f = db.getCollection('casepersons').findOne({name:{$regex:"kev",$options:"i"}});
console.log(g);

// Here we run an aggregation and open a cursor to the results.
// Use '.toArray()' to exhaust the cursor to return the whole result set.
// You can use '.hasNext()/.next()' to iterate through the cursor page by page.
/*
db.getCollection('sales').aggregate([
  // Find all of the sales that occurred in 2014.
  { $match: { date: { $gte: new Date('2014-01-01'), $lt: new Date('2015-01-01') } } },
  // Group the total sales for each product.
  { $group: { _id: '$item', totalSaleAmount: { $sum: { $multiply: [ '$price', '$quantity' ] } } } }
]);
*/

/*
{
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
  }
    */
