import {verify} from '../utils/auth.js';
import {User, ProcurementCentre} from '../models/models.js';

export async function auth(req,res,next){
  try{
    const h=req.headers.authorization||'';
    if(!h.startsWith('Bearer '))return res.status(401).json({message:'Authentication required'});
    const payload = verify(h.slice(7));
    const user = await User.findById(payload.id).select('name email phone role centreId region');
    if(!user) return res.status(401).json({message:'User account not found'});
    
    let cId = user.centreId ? user.centreId.toString() : null;
    if(!cId && user.role === 'OPERATOR') {
      const defaultCentre = await ProcurementCentre.findOne().sort({createdAt:1});
      if(defaultCentre) {
        cId = defaultCentre._id.toString();
        user.centreId = defaultCentre._id;
        await user.save().catch(()=>{});
      }
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      centreId: cId
    };
    next();
  }catch(err){
    return res.status(401).json({message:'Invalid or expired session'});
  }
}

export const role=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'You are not authorised for this area'});
