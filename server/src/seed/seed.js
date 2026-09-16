import {connectDB} from '../config/db.js';
import {Crop,ProcurementCentre,Slot,User,Farmer,Trip,TransportBooking,CentreProcurement,Booking,QueueEntry,Procurement,Payment,Notification,Grievance,AuditLog,OTP,Message} from '../models/models.js';
import bcrypt from 'bcryptjs';import mongoose from 'mongoose';
await connectDB();
// SAFE SEED: never delete users, farmers, bookings, queues, payments, or notifications.
// This script only inserts missing reference data so running it cannot wipe real farmer accounts.

const cropDefinitions=[
{name:'Wheat',season:'Rabi',procurementRate:2425,marketReferenceRate:2380},{name:'Mustard',season:'Rabi',procurementRate:5950,marketReferenceRate:5750},{name:'Paddy',season:'Kharif',procurementRate:2369,marketReferenceRate:2250},{name:'Gram',season:'Rabi',procurementRate:5875,marketReferenceRate:5750},{name:'Bajra',season:'Kharif',procurementRate:2775,marketReferenceRate:2680},{name:'Cotton',season:'Kharif',procurementRate:7710,marketReferenceRate:7480}];
const crops=[];
for(const def of cropDefinitions){crops.push(await Crop.findOneAndUpdate({name:def.name},def,{new:true,upsert:true,setDefaultsOnInsert:true}));}
const centreData=[
['HR-KNL-002','Karnal Mandi Yard 2','Haryana','Karnal','Nissing','Karnal','Mandi Yard 2','132001',29.6857,76.9905,150,84,3],
['HR-SNP-014','Sonepat APMC','Haryana','Sonepat','Sonepat','Sonepat','APMC Yard','131001',28.9931,77.0151,200,100,4],
['PB-LDH-003','Ludhiana Procurement Centre 3','Punjab','Ludhiana','Ludhiana','Ludhiana','Procurement Yard 3','141001',30.9010,75.8573,180,90,3],
['UP-LKO-011','Lucknow Grain Procurement Hub','Uttar Pradesh','Lucknow','Mohan','Lucknow','Mandi Samiti Road','226010',26.8467,80.9462,180,90,3],
['RJ-JPR-006','Jaipur Agro Procurement Yard','Rajasthan','Jaipur','Sanganer','Jaipur','Muhana Mandi Road','302029',26.8065,75.8760,220,110,4],
['MP-IND-009','Indore Krishi Upaj Yard','Madhya Pradesh','Indore','Indore','Indore','Dewas Naka Mandi','452010',22.7196,75.8577,200,100,4],
['MH-NGP-004','Nagpur Procurement Yard','Maharashtra','Nagpur','Hingna','Nagpur','Kalamna Market Road','440035',21.1458,79.0882,190,95,3],
['GJ-AHM-008','Ahmedabad Grain Centre','Gujarat','Ahmedabad','Daskroi','Ahmedabad','APMC Market','382405',23.0225,72.5714,210,105,4],
['BR-PAT-005','Patna Procurement Centre','Bihar','Patna','Phulwari','Patna','Mandi Road','801505',25.5941,85.1376,170,85,3],
['WB-KOL-007','Kolkata Paddy Procurement Hub','West Bengal','Kolkata','Rajarhat','Kolkata','New Town Agro Yard','700135',22.5726,88.3639,160,80,3],
['OD-BBS-010','Bhubaneswar Paddy Centre','Odisha','Khordha','Bhubaneswar','Bhubaneswar','Rasulgarh Agro Yard','751010',20.2961,85.8245,180,90,3],
['TS-HYD-012','Hyderabad Grain Procurement Yard','Telangana','Hyderabad','Medchal','Hyderabad','Bowenpally Market Road','500018',17.3850,78.4867,190,95,3],
['AP-VJA-013','Vijayawada Paddy Centre','Andhra Pradesh','Krishna','Vijayawada','Vijayawada','Gollapudi Market Yard','521225',16.5062,80.6480,210,105,4],
['KA-BLR-015','Bengaluru Agro Procurement Hub','Karnataka','Bengaluru Urban','Yelahanka','Bengaluru','APMC Yard','560064',13.0827,77.5877,170,85,3],
['TN-CHN-016','Chennai Grain Procurement Centre','Tamil Nadu','Chennai','Ambattur','Chennai','Koyambedu Agro Market','600107',13.0827,80.2707,160,80,3],
['KL-KOC-017','Kochi Agro Procurement Yard','Kerala','Ernakulam','Kochi','Kochi','Kaloor Market Road','682017',9.9312,76.2673,130,65,2],
['JH-RNC-018','Ranchi Grain Procurement Hub','Jharkhand','Ranchi','Kanke','Ranchi','Pandra Market Road','834005',23.3441,85.3096,150,75,3],
['CG-RPR-019','Raipur Dhan Procurement Centre','Chhattisgarh','Raipur','Raipur','Raipur','Bhatagaon Mandi Road','492001',21.2514,81.6296,200,100,4],
['UK-HLD-020','Haridwar Procurement Yard','Uttarakhand','Haridwar','Roorkee','Haridwar','Mandi Samiti Road','249401',29.9457,78.1642,130,65,2],
['HP-LDH-021','Una Grain Procurement Centre','Himachal Pradesh','Una','Una','Una','Mandi Yard','174303',31.4685,76.2708,110,55,2],
['JK-JMU-022','Jammu Procurement Hub','Jammu and Kashmir','Jammu','Jammu','Jammu','Narwal Mandi Road','180006',32.7266,74.8570,120,60,2],
['GO-PNJ-023','Panaji Agro Procurement Centre','Goa','North Goa','Tiswadi','Panaji','Agro Market Yard','403001',15.4909,73.8278,90,45,2],
['AS-GHY-024','Guwahati Paddy Procurement Yard','Assam','Kamrup Metropolitan','Guwahati','Guwahati','Betkuchi Market Road','781034',26.1445,91.7362,150,75,3],
['SK-GNG-025','Gangtok Agro Procurement Centre','Sikkim','East Sikkim','Gangtok','Gangtok','Deorali Market','737101',27.3389,88.6065,70,35,1],
['TR-AGT-026','Agartala Paddy Procurement Hub','Tripura','West Tripura','Agartala','Agartala','Battala Market Road','799001',23.8315,91.2868,100,50,2],
['MZ-AIZ-027','Aizawl Agro Procurement Centre','Mizoram','Aizawl','Aizawl','Aizawl','Treasury Square Agro Yard','796001',23.7271,92.7176,80,40,1],
['MN-IMF-028','Imphal Grain Procurement Yard','Manipur','Imphal West','Imphal','Imphal','Khwairamband Market Area','795001',24.8170,93.9368,90,45,2],
['ME-SHL-029','Shillong Agro Procurement Centre','Meghalaya','East Khasi Hills','Shillong','Shillong','Mawblei Market Road','793021',25.5788,91.8933,80,40,1],
['AR-ITN-030','Itanagar Grain Procurement Hub','Arunachal Pradesh','Papum Pare','Itanagar','Itanagar','Naharlagun Market Road','791110',27.0844,93.6053,80,40,1],
['DL-DEL-031','Delhi NCR Demonstration Procurement Centre','Delhi','North West Delhi','Narela','Delhi','Narela Agro Market','110040',28.8526,77.0929,140,70,2],
['UT-UDP-032','Pithoragarh Demonstration Centre','Uttarakhand','Pithoragarh','Pithoragarh','Pithoragarh','Mandi Yard','262521',29.5829,80.2182,75,38,1]
];
const centres=[];
for(const x of centreData){centres.push(await ProcurementCentre.findOneAndUpdate({centreCode:x[0]},{centreCode:x[0],name:x[1],agency:'Fasal Setu Prototype Procurement Network',location:{state:x[2],district:x[3],block:x[4],village:x[5],address:x[6],pincode:x[7],lat:x[8],lng:x[9]},capacity:{daily:x[10],slots:x[11],counters:x[12]},status:'ACTIVE',source:{system:'FASAL_SETU',type:'DEMO_DATA',lastSyncedAt:new Date()}},{new:true,upsert:true,setDefaultsOnInsert:true}));}
const now=new Date();
for(const c of centres){
  const existingSlots=await Slot.countDocuments({centreId:c._id});
  if(existingSlots===0){for(let d=0;d<14;d++)for(const [start,end] of [['09:00','10:00'],['10:30','11:30'],['12:00','13:00'],['14:00','15:00'],['15:30','16:30']])await Slot.create({centreId:c._id,date:new Date(now.getFullYear(),now.getMonth(),now.getDate()+d),startTime:start,endTime:end,capacity:Math.max(10,Math.round((c.capacity?.slots||50)/5)),booked:d===0&&start==='10:30'?Math.min(6,Math.round((c.capacity?.slots||50)/20)):0});}
  for(const crop of crops){const exists=await CentreProcurement.findOne({centreId:c._id,cropId:crop._id});if(!exists)await CentreProcurement.create({centreId:c._id,cropId:crop._id,season:crop.season,scheme:'FASAL_SETU_DEMO_PROCUREMENT',procurementStart:new Date(),procurementEnd:new Date(Date.now()+45*86400000),maxQuantity:100,rate:crop.procurementRate,status:'ACTIVE'});}
}
const makeUser=async(name,email,phone,password,role,centreId,extra={})=>{
  let u=await User.findOne({email});
  if(u) {
    if(centreId) { u.centreId = centreId; }
    u.role = role;
    await u.save();
    return u;
  }
  return User.create({name,email,phone,passwordHash:await bcrypt.hash(password,12),role,isVerified:true,centreId,...extra});
};
const admin=await makeUser('District Officer','admin@fasalsetu.demo','9000000000','Admin@123','ADMIN');
const op=await makeUser('Centre Operator','operator@fasalsetu.demo','9000000001','Operator@123','OPERATOR',centres[0]._id);
await User.updateOne({_id: op._id}, {$set: {centreId: centres[0]._id, role: 'OPERATOR'}});

const log=await makeUser('Transport Operator','logistics@fasalsetu.demo','9000000002','Logistics@123','LOGISTICS',undefined,{region:'Karnal and nearby villages',transportProfile:{vehicleType:'Tractor Trolley',vehicleNo:'HR-DEMO-1234',capacityQtl:50,farePerTrip:1200,serviceArea:'Karnal and nearby villages',isListed:true}});
const farmerUser=await makeUser('Ramesh Kumar','farmer@fasalsetu.demo','9000000003','Farmer@123','FARMER');
let farmer=await Farmer.findOne({userId:farmerUser._id});
if(!farmer) farmer=await Farmer.create({userId:farmerUser._id,dob:new Date('1985-06-15'),farmerId:'FS-FARM-0001',address:{state:'Haryana',district:'Karnal',block:'Nissing',village:'Nissing',pincode:'132024',full:'Nissing, Karnal, Haryana'},crops:[{cropId:crops[0]._id,season:'Rabi',cultivatedArea:5,expectedQuantity:38}],verification:{identityStatus:'OTP_VERIFIED',landStatus:'DEMO_VERIFIED',bankStatus:'DEMO_VERIFIED'}});

if(!await Notification.findOne({userId:farmerUser._id,event:'WELCOME'}))await Notification.create({userId:farmerUser._id,event:'WELCOME',title:'Welcome to Fasal Setu',message:'Prototype account ready. Find a nearby procurement centre, book a slot and track your queue.',priority:'NORMAL'});
if(!await Trip.findOne({tripId:'TRIP-2048'}))await Trip.create({tripId:'TRIP-2048',operatorId:log._id,fromCentreId:centres[0]._id,destination:'Assigned depot',crop:'Wheat',quantity:42,vehicleNo:'HR-DEMO-1234',status:'IN_TRANSIT'});
if(!await Trip.findOne({tripId:'TRIP-2049'}))await Trip.create({tripId:'TRIP-2049',operatorId:log._id,fromCentreId:centres[0]._id,destination:'Assigned mill',crop:'Wheat',quantity:31,vehicleNo:'HR-DEMO-2311',status:'LOADED'});

// Ensure demo bookings exist for Karnal Mandi Yard 2 for today
const todaySlots = await Slot.find({centreId: centres[0]._id}).sort({startTime:1}).limit(2);
if(todaySlots.length >= 2) {
  const existingB1 = await Booking.findOne({gatePassId: 'FS-GP-4821'});
  if(!existingB1) {
    const b1 = await Booking.create({
      farmerId: farmer._id, centreId: centres[0]._id, cropId: crops[0]._id, slotId: todaySlots[0]._id,
      quantity: 35, gatePassId: 'FS-GP-4821', qrPayload: 'FS-GP-4821', status: 'BOOKED'
    });
    await QueueEntry.create({
      farmerId: farmer._id, centreId: centres[0]._id, slotId: todaySlots[0]._id,
      token: 'FS-GP-4821', position: 1, status: 'WAITING', estimatedWait: 10, expectedTurn: new Date(Date.now() + 10 * 60000)
    });
    await Procurement.create({
      farmerId: farmer._id, bookingId: b1._id, cropId: crops[0]._id, rate: crops[0].procurementRate, status: 'SLOT_BOOKED'
    });
  }
  const existingB2 = await Booking.findOne({gatePassId: 'FS-GP-4822'});
  if(!existingB2) {
    const b2 = await Booking.create({
      farmerId: farmer._id, centreId: centres[0]._id, cropId: crops[1]._id, slotId: todaySlots[1]._id,
      quantity: 20, gatePassId: 'FS-GP-4822', qrPayload: 'FS-GP-4822', status: 'BOOKED'
    });
    await QueueEntry.create({
      farmerId: farmer._id, centreId: centres[0]._id, slotId: todaySlots[1]._id,
      token: 'FS-GP-4822', position: 2, status: 'WAITING', estimatedWait: 20, expectedTurn: new Date(Date.now() + 20 * 60000)
    });
    await Procurement.create({
      farmerId: farmer._id, bookingId: b2._id, cropId: crops[1]._id, rate: crops[1].procurementRate, status: 'SLOT_BOOKED'
    });
  }
}

console.log(`Seed complete: ${centres.length} India-wide demonstration procurement centres created.`);await mongoose.disconnect();
