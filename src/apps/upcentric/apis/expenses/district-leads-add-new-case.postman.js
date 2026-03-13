const encryptedData = utils.encrypt({
    reqNo:utils.padNumber(pm.collectionVariables.get("caseNumber"),6),
    rush:true,
    objective:"full",
    dueOn:"2025-05-16T05:00:00.000Z",
    client:pm.collectionVariables.get("selectedClient"),
    vendor:pm.collectionVariables.get("selectedVendor"),
    subjects:[
        {
            name:"LaChrissa Parker",
            phns:["1-313-850-7755","1-313-744-8801"],
            emails:["alachrissa.parke225@yahoo.com","lachrissa.parker@yahoo.com"],
            addrs:[
                {
                    streetAddr:"9566 Cheyenne St",
                    city:"Detroit",
                    state:"MI",
                    postal:"",
                    country:"USA",
                }
            ],
            type:"primary",
            dob:"1984-07-29T05:00:00.000Z",
        }
    ],
    details:{
        dateOfAccident:"2024-06-23T05:00:00.000Z",
        vehicleDesc:"2020 Volkswagon Tiguan",
        specialNotes:[
            "39 years old.",
            "Citizens assigned by MACP.",
            "Refusing to appear for EVO.",
            "Establish no auto insurance and permisson from owner to use the car",
        ],
        isQNAReq:true,
    }
});
pm.environment.set("requestBody",JSON.stringify({
    data:encryptedData
}));