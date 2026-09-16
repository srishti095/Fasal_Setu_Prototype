import {Notification} from '../models/models.js';

export async function notify({userId, title, message, event, priority='NORMAL', metadata={}, channel='IN_APP'}) {
  if (!userId) return null;
  const n = await Notification.create({userId, channel, event, priority, title, message, metadata});
  const io = globalThis.__fasalSetuIO;
  if (io) {
    io.to(`farmer:${String(userId)}`).emit('notification', n);
  }
  return n;
}

export async function notifyMany(userIds, payload) {
  return Promise.all((userIds || []).filter(Boolean).map(userId => notify({...payload, userId})));
}
