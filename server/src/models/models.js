import mongoose from 'mongoose';
const {Schema,model}=mongoose;
const ref={type:Schema.Types.ObjectId};

export const User=model('User',new Schema({
  name:{type:String,required:true,trim:true}, phone:{type:String,unique:true,sparse:true}, email:{type:String,unique:true,sparse:true,lowercase:true,trim:true},
  passwordHash:{type:String,required:true}, role:{type:String,enum:['FARMER','OPERATOR','LOGISTICS','ADMIN'],default:'FARMER'}, isVerified:{type:Boolean,default:false},
  failedLoginAttempts:{type:Number,default:0}, lockedUntil:Date, centreId:{...ref,ref:'ProcurementCentre'}, region:String,
  transportProfile:{vehicleType:{type:String,default:'Tractor Trolley'},vehicleNo:String,capacityQtl:{type:Number,default:40},farePerTrip:{type:Number,default:0},serviceArea:String,isListed:{type:Boolean,default:false}}
},{timestamps:true}));

export const OTP=model('OTP',new Schema({phone:String,email:String,otpHash:{type:String,required:true},purpose:{type:String,enum:['REGISTER','RESET'],default:'REGISTER'},expiresAt:{type:Date,required:true},used:{type:Boolean,default:false}},{timestamps:true}));
export const Farmer=model('Farmer',new Schema({
  userId:{...ref,ref:'User',unique:true},dob:Date,address:{state:String,district:String,block:String,village:String,pincode:String,full:String},farmerId:{type:String,unique:true,sparse:true},
  land:[{ownership:String,surveyNo:String,area:Number}],crops:[{cropId:{...ref,ref:'Crop'},cropName:String,variety:String,season:String,cultivatedArea:Number,expectedQuantity:Number,qualityGrade:{type:String,default:'Grade A'},sowingDate:Date,harvestDate:Date,status:{type:String,default:'REGISTERED'},latestQualityCheck:{grade:String,result:String,confidence:Number,checkedAt:Date,observations:[String],recommendations:String,images:[String],imageCount:Number}}],
  bank:{bankName:String,maskedAccount:String,ifsc:String,verificationStatus:{type:String,default:'PENDING'}},
  verification:{identityStatus:{type:String,default:'PENDING'},landStatus:{type:String,default:'PENDING'},bankStatus:{type:String,default:'PENDING'}}
},{timestamps:true}));
export const Crop=model('Crop',new Schema({name:{type:String,unique:true,required:true},season:String,procurementRate:Number,marketReferenceRate:Number,active:{type:Boolean,default:true}}));
export const ProcurementCentre=model('ProcurementCentre',new Schema({
  centreCode:{type:String,unique:true,required:true},name:{type:String,required:true},agency:String,
  location:{state:String,district:String,block:String,village:String,address:String,pincode:String,lat:Number,lng:Number},
  capacity:{daily:Number,slots:Number,counters:{type:Number,default:1}},status:{type:String,enum:['ACTIVE','TEMPORARILY_CLOSED','PROCUREMENT_PAUSED','FULL_CAPACITY','OUT_OF_SEASON','INACTIVE'],default:'ACTIVE'},
  source:{system:{type:String},type:{type:String},lastSyncedAt:{type:Date}}
},{timestamps:true}));
export const CentreProcurement=model('CentreProcurement',new Schema({centreId:{...ref,ref:'ProcurementCentre'},cropId:{...ref,ref:'Crop'},season:String,scheme:String,procurementStart:Date,procurementEnd:Date,maxQuantity:Number,rate:Number,status:{type:String,default:'ACTIVE'}},{timestamps:true}));
export const Slot=model('Slot',new Schema({centreId:{...ref,ref:'ProcurementCentre'},date:Date,startTime:String,endTime:String,capacity:Number,booked:{type:Number,default:0},status:{type:String,default:'OPEN'}},{timestamps:true}));
export const Booking=model('Booking',new Schema({farmerId:{...ref,ref:'Farmer'},centreId:{...ref,ref:'ProcurementCentre'},cropId:{...ref,ref:'Crop'},slotId:{...ref,ref:'Slot'},quantity:{type:Number,min:.01},gatePassId:{type:String,unique:true},qrPayload:String,status:{type:String,default:'BOOKED'}},{timestamps:true}));
export const QueueEntry=model('QueueEntry',new Schema({farmerId:{...ref,ref:'Farmer'},centreId:{...ref,ref:'ProcurementCentre'},slotId:{...ref,ref:'Slot'},token:{type:String,unique:true},position:Number,status:{type:String,default:'WAITING'},estimatedWait:Number,expectedTurn:Date,checkedInAt:Date,calledAt:Date,completedAt:Date},{timestamps:true}));
export const Procurement=model('Procurement',new Schema({
  farmerId:{...ref,ref:'Farmer'},bookingId:{...ref,ref:'Booking'},cropId:{...ref,ref:'Crop'},acceptedQuantity:Number,rate:Number,
  status:{type:String,default:'SLOT_BOOKED'},billNo:String,quality:{grade:String,result:String,reason:String,checkedAt:Date,images:[String],confidence:Number,observations:[String],recommendations:String},weighment:{grossKg:Number,tareKg:Number,netKg:Number,acceptedQuantity:Number,recordedAt:Date},
  confirmedAt:Date
},{timestamps:true}));
export const Payment=model('Payment',new Schema({farmerId:{...ref,ref:'Farmer'},procurementId:{...ref,ref:'Procurement'},amount:Number,status:{type:String,default:'PENDING'},reference:String,initiatedAt:Date,processedAt:Date,paidAt:Date,mode:{type:String,default:'DEMO_PFMS'},timeline:[{status:String,label:String,at:Date,note:String}]},{timestamps:true}));
export const Notification=model('Notification',new Schema({userId:{...ref,ref:'User',required:true},channel:{type:String,default:'IN_APP'},event:String,priority:{type:String,default:'NORMAL'},title:String,message:String,read:{type:Boolean,default:false},readAt:Date,metadata:Schema.Types.Mixed},{timestamps:true}));
export const Grievance=model('Grievance',new Schema({farmerId:ref,category:String,subject:String,description:String,status:{type:String,default:'OPEN'},dueAt:Date,escalatedAt:Date},{timestamps:true}));
export const Trip=model('Trip',new Schema({tripId:{type:String,unique:true},operatorId:ref,fromCentreId:{...ref,ref:'ProcurementCentre'},destination:String,crop:String,quantity:Number,vehicleNo:String,status:{type:String,default:'PLANNED'}},{timestamps:true}));
export const TransportBooking=model('TransportBooking',new Schema({
  farmerId:{...ref,ref:'Farmer',required:true},bookingId:{...ref,ref:'Booking',required:true},transporterId:{...ref,ref:'User',required:true},centreId:{...ref,ref:'ProcurementCentre',required:true},pickupLocation:{type:String,required:true},pickupDate:{type:Date,required:true},quantity:{type:Number,min:.01,required:true},crop:String,fare:{type:Number,min:0,required:true},notes:String,
  status:{type:String,enum:['REQUESTED','ACCEPTED','REJECTED','DRIVER_EN_ROUTE','PICKED_UP','IN_TRANSIT','COMPLETED','CANCELLED'],default:'REQUESTED'},acceptedAt:Date,rejectedAt:Date,driverEnRouteAt:Date,pickedUpAt:Date,inTransitAt:Date,completedAt:Date
},{timestamps:true}));
export const Message=model('Message',new Schema({name:String,contact:String,message:String},{timestamps:true}));
export const AuditLog=model('AuditLog',new Schema({actorId:ref,action:String,entityType:String,entityId:String,reason:String,metadata:Schema.Types.Mixed},{timestamps:true}));
