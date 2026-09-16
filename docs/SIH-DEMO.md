# SIH demo flow

## Farmer journey
1. Login as the demo farmer.
2. Open **Find Centre** → click **Use my location**. Fasal Setu ranks seeded procurement centres by Haversine distance and shows the nearest centre first. Search also works by centre, district or state.
3. Open **Book Slot** → choose a crop → click **Find best slot near me** to get ranked slot recommendations using distance, queue, centre capacity and slot availability.
4. Book a slot. The backend creates a booking, gate pass, queue token and procurement record.
5. Open **Live Queue**. Queue data refreshes automatically; Socket.IO is used when available with a 15-second polling fallback.
6. Check the **Important notifications** panel. Booking, check-in, queue call, quality, weighment, procurement and payment events create in-app notifications.

## Operator journey
1. Login as the Centre Operator.
2. Use **Check-in** with the farmer token/QR.
3. Use **Today's Queue** to move the farmer through the queue.
4. Open **Quality Check** → pass/reject.
5. Open **Weighment** → record gross/tare weight.
6. Open **Procurement** → confirm procurement. This creates the demo payment record.
7. Click **Process demo payment** to move the payment through processing → paid. The farmer is notified at each important step.
8. **Centre Status** and **Reports** are backend-connected.

## Demo credentials
- Farmer: `farmer@fasalsetu.demo` / `Farmer@123`
- Centre Operator: `operator@fasalsetu.demo` / `Operator@123`
- Transport Operator: `logistics@fasalsetu.demo` / `Logistics@123`
- Admin / Officer: `admin@fasalsetu.demo` / `Admin@123`

## Important prototype boundaries
- The 30 procurement centres are **demonstration records** distributed across India; they are not claimed to be live government feeds.
- OTP is DEMO mode unless an authorised provider is configured.
- Payment is DEMO_PFMS workflow only; it does not move real money or claim a real bank credit.
- Browser geolocation requires the farmer to grant location permission. If permission is denied, centre search still works by text/state/district.
