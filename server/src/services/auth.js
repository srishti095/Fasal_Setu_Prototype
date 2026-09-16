import bcrypt from 'bcryptjs';
import {User,OTP,Farmer,Crop} from '../models/models.js';
import {sign} from '../utils/auth.js';
import crypto from 'crypto';

const hash=s=>crypto.createHash('sha256').update(s).digest('hex');

const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IFSC_REGEX = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/;

export async function requestOtp({phone,email,purpose='REGISTER'}){
  const p = phone ? String(phone).trim() : undefined;
  const e = email ? String(email).trim().toLowerCase() : undefined;

  if(!p && !e) throw Object.assign(new Error('Mobile number or email address is required'),{status:400});
  if(p && !PHONE_REGEX.test(p)) throw Object.assign(new Error('Enter a valid 10-digit Indian mobile number'),{status:400});
  if(e && !EMAIL_REGEX.test(e)) throw Object.assign(new Error('Enter a valid email address'),{status:400});

  const otp=String(Math.floor(100000+Math.random()*900000));
  const queryOr = [];
  if(p) queryOr.push({phone: p});
  if(e) queryOr.push({email: e});

  await OTP.updateMany({$or: queryOr, purpose, used:false},{$set:{used:true}});
  await OTP.create({phone: p, email: e, purpose, otpHash:hash(otp), expiresAt:new Date(Date.now()+10*60*1000)});
  
  return {sent:true, demoOtp:process.env.OTP_MODE==='LIVE'?undefined:otp};
}

export async function verifyOtp({phone,email,otp,purpose='REGISTER'}){
  const p = phone ? String(phone).trim() : undefined;
  const e = email ? String(email).trim().toLowerCase() : undefined;
  const code = otp ? String(otp).trim() : '';

  if(!code || !/^\d{6}$/.test(code)) throw Object.assign(new Error('Enter a valid 6-digit OTP code'),{status:400});
  if(!p && !e) throw Object.assign(new Error('Mobile number or email is required for OTP verification'),{status:400});

  const queryOr = [];
  if(p) queryOr.push({phone: p});
  if(e) queryOr.push({email: e});

  const doc=await OTP.findOne({$or: queryOr, purpose, used:false, expiresAt:{$gt:new Date()}}).sort({createdAt:-1});
  if(!doc || doc.otpHash!==hash(code)) throw Object.assign(new Error('Invalid or expired OTP. Please request a new OTP.'),{status:400});
  
  doc.used=true;
  await doc.save();
  return {verified:true};
}

export async function register(x){
  if(!x || typeof x !== 'object') throw Object.assign(new Error('Registration data is required'),{status:400});
  if(!x.otpVerified) throw Object.assign(new Error('Phone or email OTP verification is required before creating account'),{status:400});
  
  const name = String(x.name||'').trim();
  const phone = String(x.phone||'').trim();
  const email = x.email ? String(x.email).trim().toLowerCase() : undefined;
  const password = String(x.password||'');
  
  if(!name || name.length < 2) throw Object.assign(new Error('Full name is required (at least 2 characters)'),{status:400});
  if(!phone || !PHONE_REGEX.test(phone)) throw Object.assign(new Error('Enter a valid 10-digit Indian mobile number'),{status:400});
  if(email && !EMAIL_REGEX.test(email)) throw Object.assign(new Error('Enter a valid email address'),{status:400});
  if(!password || password.length < 6) throw Object.assign(new Error('Password must be at least 6 characters long'),{status:400});

  const state = String(x.state||'').trim();
  const district = String(x.district||'').trim();
  const village = String(x.village||'').trim();
  const address = String(x.address||village||district);
  const farmerId = String(x.farmerId||'').trim() || `FS-FARM-${Date.now().toString().slice(-6)}`;
  
  const landArea = Number(x.landArea);
  if(!Number.isFinite(landArea) || landArea <= 0) throw Object.assign(new Error('Cultivated land area must be greater than 0'),{status:400});

  const expectedQty = Number(x.expectedQuantity);
  if(!Number.isFinite(expectedQty) || expectedQty <= 0) throw Object.assign(new Error('Expected quantity must be greater than 0'),{status:400});

  const bankName = String(x.bankName||'').trim();
  if(!bankName) throw Object.assign(new Error('Bank name is required'),{status:400});

  const accountLast4 = String(x.accountLast4||'').trim();
  if(!/^\d{4}$/.test(accountLast4)) throw Object.assign(new Error('Enter exactly the last 4 digits of your bank account'),{status:400});

  const ifsc = String(x.ifsc||'').trim().toUpperCase();
  if(!IFSC_REGEX.test(ifsc)) throw Object.assign(new Error('Enter a valid 11-character IFSC code (e.g. SBIN0001234)'),{status:400});

  // Check existing user
  const userCheckOr = [{phone}];
  if(email) userCheckOr.push({email});
  const existingUser = await User.findOne({$or: userCheckOr});
  if(existingUser) throw Object.assign(new Error('Phone or email is already registered. Please log in.'),{status:409});

  const passwordHash = await bcrypt.hash(password, 12);
  const u = await User.create({name, phone, email, passwordHash, role:'FARMER', isVerified:true});

  let cropObj = null;
  if(x.crop) {
    const foundCrop = await Crop.findOne({name: String(x.crop).trim()});
    if(foundCrop) {
      cropObj = {cropId: foundCrop._id, cropName: foundCrop.name, season: foundCrop.season||'Kharif', expectedQuantity: expectedQty, qualityGrade: 'Ungraded', latestQualityCheck: null, status:'REGISTERED'};
    }
  }

  const f = await Farmer.create({
    userId: u._id,
    dob: x.dob ? new Date(x.dob) : undefined,
    address: {state, district, block: String(x.block||'').trim(), village, pincode: String(x.pincode||'').trim(), full: address},
    farmerId,
    land: [{ownership: String(x.landOwnership||'Owner'), surveyNo: String(x.surveyNo||'').trim(), area: landArea}],
    crops: cropObj ? [cropObj] : [],
    bank: {bankName, maskedAccount: 'XXXX' + accountLast4, ifsc, verificationStatus: 'PENDING'},
    verification: {identityStatus: 'OTP_VERIFIED', landStatus: 'PENDING', bankStatus: 'PENDING'}
  });

  return {user: u, farmer: f, token: sign(u)};
}

export async function login(identifier, password){
  const id = identifier ? String(identifier).trim() : '';
  const pwd = password ? String(password) : '';

  if(!id || !pwd) throw Object.assign(new Error('Mobile number or email and password are required'),{status:400});

  const isEmail = EMAIL_REGEX.test(id.toLowerCase());
  const u = await User.findOne(isEmail ? {email: id.toLowerCase()} : {phone: id}).populate('centreId');
  if(!u) throw Object.assign(new Error('Invalid mobile/email or password'),{status:401});

  if(u.lockedUntil && u.lockedUntil > new Date()) throw Object.assign(new Error('Account temporarily locked due to failed attempts. Please try again in 10 minutes.'),{status:429});

  const ok = await bcrypt.compare(pwd, u.passwordHash);
  if(!ok){
    u.failedLoginAttempts = (u.failedLoginAttempts || 0) + 1;
    if(u.failedLoginAttempts >= 5){
      u.lockedUntil = new Date(Date.now() + 10 * 60 * 1000);
      u.failedLoginAttempts = 0;
    }
    await u.save();
    throw Object.assign(new Error('Invalid mobile/email or password'),{status:401});
  }

  u.failedLoginAttempts = 0;
  u.lockedUntil = null;
  await u.save();

  return {user: u, token: sign(u)};
}

