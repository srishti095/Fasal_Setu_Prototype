import http from 'http';import {Server} from 'socket.io';import {app} from './app.js';import {connectDB} from './config/db.js';import {env} from './config/env.js';
const server=http.createServer(app);const io=new Server(server,{cors:{origin:'*',methods:['GET','POST','PATCH']}});
globalThis.__fasalSetuIO=io;
io.on('connection',socket=>{socket.on('joinCentre',id=>{if(id)socket.join(`centre:${id}`)});socket.on('joinFarmer',id=>{if(id)socket.join(`farmer:${id}`)});});
await connectDB();server.listen(env.PORT,()=>console.log(`Fasal Setu API on ${env.PORT}`));
