const fallbackKnowledgeBase = [
  // 1. Farmer Registration
  {
    id: 'farmer_reg_1',
    category: 'Farmer Registration',
    keywords: ['register', 'registration', 'farmer register', 'kisan register', 'kisan registration', 'registrer', 'rijistari', 'registration kaise', 'register kaise', 'register karein', 'register karun', 'register karna', 'farmer registration'],
    phrases: ['how to register', 'crop kaise register karun', 'farmer registration kaise', 'kisan registration kaise karein', 'farmer register kaise hote hain'],
    response: 'Farmer registration ke liye FasalSetu par "Register" par click karein. Apna naam, mobile number, Aadhaar aur bank details bharein. Ek baar verification hone par aap registration complete kar sakte hain.',
  },
  {
    id: 'farmer_reg_2',
    category: 'Farmer Registration',
    keywords: ['documents', 'document', 'document chahiye', 'documents required', 'documents ki zarurat', 'kya chahiye', 'kya documents', 'documents list', 'documents ki list', 'documents kya chahiye', 'kya chahiye registration ke liye'],
    phrases: ['what documents are required', 'documents ki list chahiye', 'registration ke liye kya documents chahiye', 'kya documents chahiye'],
    response: 'Registration ke liye aapko chahiye: Aadhaar card, bank passbook ki copy, land documents (khatauni / khasra), passport size photo, aur mobile number.',
  },
  {
    id: 'farmer_reg_3',
    category: 'Farmer Registration',
    keywords: ['already registered', 'pehle register', 'register ho gaya', 'registration done', 'registration complete', 'register kar diya', 'register ho chuka', 'already register'],
    phrases: ['main already register ho chuka hoon', 'mera registration ho gaya', 'already registered hoon'],
    response: 'Agar aap already registered hain, to apna mobile number daalkar login karein. Aapka farmer profile aur registered crops dikh jayenge.',
  },

  // 2. Login
  {
    id: 'login_1',
    category: 'Login',
    keywords: ['login', 'login kaise', 'login karein', 'login karun', 'login karna', 'login nahi', 'login problem', 'login error', 'login nahi ho raha', 'login nahi ho raha hai', 'login nahi ho pa raha', 'login nahi ho raha', 'login nahi ho raha hai', 'login nahi ho raha hai'],
    phrases: ['how to login', 'login kaise karein', 'login nahi ho raha', 'login karna nahi aa raha', 'login nahi ho raha hai'],
    response: 'Login ke liye apna registered mobile number daalkar OTP verify karein. Agar OTP nahi aaya, to thodi der wait karein aur "Resend OTP" par click karein.',
  },
  {
    id: 'login_2',
    category: 'Login',
    keywords: ['otp', 'otp nahi', 'otp nahi aaya', 'otp nahi aa raha', 'otp nahi aaya hai', 'otp problem', 'otp error', 'otp resend', 'resend otp', 'otp nahi mila', 'otp nahi mil raha', 'otp nahi mil raha hai'],
    phrases: ['otp nahi aaya', 'otp nahi aa raha', 'otp resend kaise karein', 'otp nahi aa raha hai'],
    response: 'Agar OTP nahi aaya, to network check karein aur "Resend OTP" par click karein. Agar 5 minute tak OTP nahi aaye, to FasalSetu helpline par contact karein.',
  },
  {
    id: 'login_3',
    category: 'Login',
    keywords: ['password', 'password bhul', 'password reset', 'password change', 'password nahi', 'password change karna', 'password bhul gaya', 'password bhul gaye', 'password bhul gaya hoon', 'password bhul gaye hain', 'password bhul gaya', 'password bhul gaya hoon'],
    phrases: ['password bhul gaya', 'password reset kaise karein', 'password change karna hai', 'password bhul gaya hoon'],
    response: 'Password reset ke liye login page par "Forgot Password" par click karein. Apna mobile number daalkar OTP verify karein aur naya password set karein.',
  },

  // 3. Farmer Profile
  {
    id: 'profile_1',
    category: 'Farmer Profile',
    keywords: ['profile', 'farmer profile', 'mera profile', 'profile kaise', 'profile dekho', 'profile dekhein', 'profile kahan', 'profile kahan hai', 'profile kahan dekhun', 'profile kahan dekhein', 'profile kahan dekhein', 'profile kahan dekhein'],
    phrases: ['mera profile kahan hai', 'profile kaise dekhun', 'farmer profile kahan dekhein', 'profile kahan dekhein'],
    response: 'Aapka farmer profile login karne ke baad "My Profile" ya "Farmer Profile" section mein milega. Yahan aap apni details aur registered crops dekh sakte hain.',
  },
  {
    id: 'profile_2',
    category: 'Farmer Profile',
    keywords: ['profile update', 'profile edit', 'profile change', 'profile update karna', 'profile edit karna', 'profile change karna', 'profile update karna hai', 'profile edit karna hai', 'profile change karna hai', 'profile update karna hai'],
    phrases: ['profile update kaise karein', 'profile edit karna hai', 'profile change karna hai', 'profile update karna hai'],
    response: 'Profile update ke liye "My Profile" mein jaakar "Edit" par click karein. Apni details update karke "Save" karein.',
  },
  {
    id: 'profile_3',
    category: 'Farmer Profile',
    keywords: ['bank details', 'bank account', 'bank update', 'bank change', 'bank details update', 'bank details change', 'bank account update', 'bank account change', 'bank details update karna', 'bank details change karna', 'bank account update karna', 'bank account change karna'],
    phrases: ['bank details kaise update karein', 'bank account change karna hai', 'bank details update karna hai', 'bank account update karna hai'],
    response: 'Bank details update ke liye "My Profile" mein jaakar "Bank Details" section mein "Edit" par click karein. Naya bank account number aur IFSC daalkar save karein.',
  },

  // 4. Crop Registration
  {
    id: 'crop_reg_1',
    category: 'Crop Registration',
    keywords: ['crop register', 'crop registration', 'fasal register', 'fasal registration', 'crop register kaise', 'crop registration kaise', 'fasal register kaise', 'fasal registration kaise', 'crop register karein', 'crop registration karein', 'fasal register karein', 'fasal registration karein', 'crop register karun', 'crop registration karun', 'fasal register karun', 'fasal registration karun', 'crop kaise register', 'fasal kaise register'],
    phrases: ['crop kaise register karun', 'fasal registration kaise karein', 'crop register karna hai', 'fasal register kaise karein'],
    response: 'Crop registration ke liye "Register Crop" section mein jaayein. Fasal ka naam, area (acre), aur expected production daalkar submit karein. Verification ke baad crop register ho jayegi.',
  },
  {
    id: 'crop_reg_2',
    category: 'Crop Registration',
    keywords: ['crops list', 'my crops', 'meri fasal', 'registered crops', 'meri fasal list', 'crops kahan', 'crops kahan dekhun', 'crops kahan dekhein', 'crops kahan dekhein', 'crops kahan dekhein', 'crops kahan dekhein', 'crops kahan dekhein'],
    phrases: ['meri fasal kahan dekhein', 'my crops kahan hain', 'registered crops list kahan hai', 'meri fasal list kahan dekhein'],
    response: 'Aapki registered fasal "My Crops" section mein dikhegi. Yahan aap sabhi registered crops, unka area aur status dekh sakte hain.',
    action: 'openMyCrops',
  },
  {
    id: 'crop_reg_3',
    category: 'Crop Registration',
    keywords: ['crop variety', 'fasal variety', 'crop type', 'fasal type', 'crop kaunsi', 'fasal kaunsi', 'crop kaunsi hai', 'fasal kaunsi hai', 'crop kaunsi register', 'fasal kaunsi register', 'crop kaunsi register karun', 'fasal kaunsi register karun'],
    phrases: ['crop kaunsi register karun', 'fasal variety kaise choose karein', 'crop type kaise select karein', 'fasal kaunsi register karein'],
    response: 'Fasal register karte waqt aap crop variety select kar sakte hain. FasalSetu par wheat, rice, mustard, maize, gram, lentil aadi varieties available hain.',
  },

  // 5. Procurement Center
  {
    id: 'proc_center_1',
    category: 'Procurement Center',
    keywords: ['procurement center', 'procurement center kahan', 'nearest procurement center', 'procurement center near', 'procurement center near me', 'procurement center kahan hai', 'procurement center kahan dekhun', 'procurement center kahan dekhein', 'procurement center kahan dekhein', 'procurement center kahan dekhein', 'procurement center kahan dekhein', 'procurement center kahan dekhein', 'procurement center kahan dekhein'],
    phrases: ['nearest procurement center kahan hai', 'procurement center kaise dhundun', 'mera procurement center kahan hai', 'procurement center near me kahan hai'],
    response: 'Aapka nearest procurement center "Procurement Center" section mein dikhega. Aap apna area ya pincode daalkar nearest center dhundh sakte hain.',
    action: 'openProcurementCenters',
  },
  {
    id: 'proc_center_2',
    category: 'Procurement Center',
    keywords: ['procurement center list', 'procurement centers list', 'procurement center ki list', 'procurement centers ki list', 'procurement center list kahan', 'procurement centers list kahan', 'procurement center list kahan hai', 'procurement centers list kahan hai', 'procurement center list kahan dekhun', 'procurement centers list kahan dekhein', 'procurement center list kahan dekhein', 'procurement centers list kahan dekhein'],
    phrases: ['procurement center list kahan dekhein', 'sabhi procurement centers kahan hain', 'procurement centers ki list kahan hai', 'procurement center list kahan dekhein'],
    response: 'Sabhi procurement centers ki list "Procurement Center" section mein available hai. Aap district ya area ke hisaab se filter kar sakte hain.',
    action: 'openProcurementCenters',
  },
  {
    id: 'proc_center_3',
    category: 'Procurement Center',
    keywords: ['procurement center address', 'procurement center location', 'procurement center address kahan', 'procurement center location kahan', 'procurement center address kahan hai', 'procurement center location kahan hai', 'procurement center address kahan dekhun', 'procurement center location kahan dekhein', 'procurement center address kahan dekhein', 'procurement center location kahan dekhein'],
    phrases: ['procurement center ka address kya hai', 'procurement center location kahan hai', 'procurement center address kahan dekhein', 'procurement center location kahan dekhein'],
    response: 'Aapke procurement center ka address "Procurement Center" section mein milega. Center select karke "View Details" par click karein.',
    action: 'openProcurementCenters',
  },

  // 6. Slot Booking
  {
    id: 'slot_1',
    category: 'Slot Booking',
    keywords: ['slot', 'slot book', 'slot booking', 'slot kaise book', 'slot booking kaise', 'slot book karein', 'slot booking karein', 'slot book karun', 'slot booking karun', 'slot book karna', 'slot booking karna', 'slot kaise book hoga', 'slot kaise book karein', 'slot booking kaise karein', 'slot booking kaise karna hai'],
    phrases: ['meri fasal ka slot kaise book hoga', 'slot kaise book karein', 'slot booking kaise karein', 'slot book karna hai', 'slot booking kaise karna hai'],
    response: 'Aap Slot Booking section mein jaakar available date aur time select kar sakte hain. Apni crop aur procurement center choose karke slot book karein.',
    action: 'openSlotBooking',
  },
  {
    id: 'slot_2',
    category: 'Slot Booking',
    keywords: ['slot available', 'slot availability', 'slot available hai', 'slot available kahan', 'slot availability kahan', 'slot available kahan dekhun', 'slot availability kahan dekhein', 'slot available kahan dekhein', 'slot availability kahan dekhein', 'slot available dates', 'slot available time', 'slot available date', 'slot available time kahan', 'slot available dates kahan', 'slot available time kahan dekhun', 'slot available dates kahan dekhein', 'slot available time kahan dekhein'],
    phrases: ['slot available kahan dekhun', 'slot availability kaise pata chale', 'slot available dates kahan dekhein', 'slot available time kahan dekhein'],
    response: 'Slot availability "Slot Booking" section mein dikhega. Apna procurement center select karke available dates aur times dekh sakte hain.',
    action: 'openSlotBooking',
  },
  {
    id: 'slot_3',
    category: 'Slot Booking',
    keywords: ['slot cancel', 'slot change', 'slot reschedule', 'slot cancel karna', 'slot change karna', 'slot reschedule karna', 'slot cancel karna hai', 'slot change karna hai', 'slot reschedule karna hai', 'slot cancel kaise', 'slot change kaise', 'slot reschedule kaise', 'slot cancel kaise karein', 'slot change kaise karein', 'slot reschedule kaise karein'],
    phrases: ['slot cancel kaise karein', 'slot change karna hai', 'slot reschedule kaise karein', 'slot cancel karna hai'],
    response: 'Slot cancel ya change karne ke liye "My Slot" section mein jaayein. Booked slot par "Cancel" ya "Reschedule" par click karein.',
    action: 'openSlotBooking',
  },

  // 7. Token
  {
    id: 'token_1',
    category: 'Token',
    keywords: ['token', 'token status', 'token number', 'token kahan', 'token kahan', 'token kahan dekhun', 'token kahan dekhein', 'token kahan dekhein', 'token kahan dekhein', 'token status batao', 'token status kahan', 'token status kahan dekhun', 'token status kahan dekhein', 'token status kahan dekhein', 'token number kahan', 'token number kahan dekhun', 'token number kahan dekhein', 'token number kahan dekhein'],
    phrases: ['token status batao', 'mera token kahan hai', 'token number kaise dekhun', 'token status kahan dekhein'],
    response: 'Aapka token "My Token" section mein dikhega. Token number aur current status yahan milega.',
    action: 'openTokenStatus',
  },
  {
    id: 'token_2',
    category: 'Token',
    keywords: ['token generate', 'token kaise banega', 'token generate karna', 'token generate karna hai', 'token kaise mila', 'token kaise milta hai', 'token generate kaise', 'token generate kaise karein', 'token kaise banega', 'token kaise mila hai', 'token kaise milta hai'],
    phrases: ['token kaise mila', 'token generate kaise karein', 'token kaise banega', 'token kaise milta hai'],
    response: 'Slot book karne ke baad token automatically generate hota hai. Aapko SMS aur app notification par token number mil jata hai. "My Token" section mein bhi dekh sakte hain.',
    action: 'openTokenStatus',
  },
  {
    id: 'token_3',
    category: 'Token',
    keywords: ['token valid', 'token expiry', 'token valid hai', 'token expiry kahan', 'token valid kahan', 'token valid kahan dekhun', 'token expiry kahan dekhein', 'token valid kahan dekhein', 'token expiry kahan dekhein', 'token valid kab tak', 'token expiry kab tak', 'token valid kab tak hai', 'token expiry kab tak hai'],
    phrases: ['token valid kab tak hai', 'token expiry kahan dekhein', 'token valid kahan dekhein', 'token expiry kab tak hai'],
    response: 'Token validity "My Token" section mein dikhegi. Token par date aur time likha hota hai. Us time ke baad token expire ho jata hai.',
    action: 'openTokenStatus',
  },

  // 8. Queue
  {
    id: 'queue_1',
    category: 'Queue',
    keywords: ['queue', 'queue status', 'queue kahan', 'queue kahan dekhun', 'queue kahan dekhein', 'queue kahan dekhein', 'queue status kahan', 'queue status kahan dekhun', 'queue status kahan dekhein', 'queue status kahan dekhein', 'queue lambi', 'queue lambi hai', 'queue kitni lambi', 'queue kitna lamba', 'queue lambi kahan', 'queue lambi kahan dekhun', 'queue lambi kahan dekhein'],
    phrases: ['queue status kahan dekhein', 'queue kitni lambi hai', 'queue lambi kahan dekhein', 'queue status batao'],
    response: 'Queue status "My Token" section mein dikhega. Aapka token number aur aapse pehle kitne farmers hain, yeh sab yahan dikhega.',
    action: 'openTokenStatus',
  },
  {
    id: 'queue_2',
    category: 'Queue',
    keywords: ['queue time', 'queue wait', 'queue wait time', 'queue time kahan', 'queue wait kahan', 'queue wait time kahan', 'queue time kahan dekhun', 'queue wait kahan dekhun', 'queue wait time kahan dekhein', 'queue time kahan dekhein', 'queue wait kahan dekhein', 'queue wait time kahan dekhein', 'queue time kitna', 'queue wait kitna', 'queue wait time kitna', 'queue time kitna hai', 'queue wait kitna hai', 'queue wait time kitna hai'],
    phrases: ['queue wait time kitna hai', 'queue time kahan dekhein', 'queue wait kahan dekhein', 'queue time kitna hai'],
    response: 'Queue ka estimated wait time "My Token" section mein dikhega. Token number ke hisaab se approximate time bataya jata hai.',
    action: 'openTokenStatus',
  },

  // 9. Procurement Process
  {
    id: 'proc_process_1',
    category: 'Procurement Process',
    keywords: ['procurement process', 'procurement kaise', 'procurement kaise hota', 'procurement process kaise', 'procurement process kaise hota', 'procurement kaise karein', 'procurement process kaise karein', 'procurement kaise hota hai', 'procurement process kaise hota hai', 'procurement kya hai', 'procurement process kya hai'],
    phrases: ['procurement process kaise hota hai', 'procurement kya hai', 'procurement kaise karein', 'procurement process kya hai'],
    response: 'Procurement process: 1) Crop register karein, 2) Slot book karein, 3) Token generate hoga, 4) Procurement center par jayein, 5) Crop quality check, 6) Weighment, 7) Receipt mil jayegi, 8) Payment processing.',
  },
  {
    id: 'proc_process_2',
    category: 'Procurement Process',
    keywords: ['procurement steps', 'procurement process steps', 'procurement steps kya', 'procurement process steps kya', 'procurement steps kya hain', 'procurement process steps kya hain', 'procurement steps kahan', 'procurement process steps kahan', 'procurement steps kahan dekhun', 'procurement process steps kahan dekhein', 'procurement steps kahan dekhein', 'procurement process steps kahan dekhein'],
    phrases: ['procurement steps kya hain', 'procurement process steps kya hain', 'procurement steps kahan dekhein', 'procurement process steps kahan dekhein'],
    response: 'Procurement ke steps: 1) Farmer registration, 2) Crop registration, 3) Slot booking, 4) Token, 5) Center par crop le jaayein, 6) Quality check, 7) Weighment, 8) Receipt, 9) Payment.',
  },
  {
    id: 'proc_process_3',
    category: 'Procurement Process',
    keywords: ['procurement eligibility', 'procurement eligible', 'procurement eligible kaise', 'procurement eligibility kaise', 'procurement eligible kaise hote', 'procurement eligibility kaise hote', 'procurement eligible kaise hote hain', 'procurement eligibility kaise hote hain', 'procurement eligible kya', 'procurement eligibility kya', 'procurement eligible kya hai', 'procurement eligibility kya hai'],
    phrases: ['procurement eligible kaise hote hain', 'procurement eligibility kya hai', 'procurement eligible kya hai', 'procurement eligibility kaise pata chale'],
    response: 'Procurement ke liye eligible hone ke liye: aap registered farmer hona chahiye, crop registered hona chahiye, aur slot booked hona chahiye. Crop quality MSP standards ko meet karni chahiye.',
  },

  // 10. Crop Quality
  {
    id: 'quality_1',
    category: 'Crop Quality',
    keywords: ['crop quality', 'fasal quality', 'quality check', 'quality check kaise', 'quality check kaise hota', 'quality check kaise hota hai', 'crop quality kaise', 'fasal quality kaise', 'crop quality kaise check', 'fasal quality kaise check', 'crop quality kaise check hota', 'fasal quality kaise check hota', 'crop quality kaise check hota hai', 'fasal quality kaise check hota hai'],
    phrases: ['crop quality kaise check hoti hai', 'quality check kaise hota hai', 'fasal quality kaise check karein', 'crop quality kaise check karein'],
    response: 'Crop quality procurement center par check hoti hai. Moisture content, foreign matter, aur grain quality test kiya jata hai. Fair Average Quality (FAQ) standards meet karne par crop accept hoti hai.',
  },
  {
    id: 'quality_2',
    category: 'Crop Quality',
    keywords: ['moisture', 'moisture content', 'moisture level', 'moisture kya', 'moisture content kya', 'moisture level kya', 'moisture kya hona chahiye', 'moisture content kya hona chahiye', 'moisture level kya hona chahiye', 'moisture kitna', 'moisture content kitna', 'moisture level kitna', 'moisture kitna hona chahiye', 'moisture content kitna hona chahiye', 'moisture level kitna hona chahiye'],
    phrases: ['moisture content kya hona chahiye', 'moisture kitna hona chahiye', 'moisture level kya hona chahiye', 'moisture content kitna hona chahiye'],
    response: 'Moisture content crop ke hisaab se alag hota hai. Wheat ke liye maximum 12% aur rice ke liye maximum 17% moisture acceptable hai. Zyada moisture hone par crop reject ya discount par accept ho sakti hai.',
  },
  {
    id: 'quality_3',
    category: 'Crop Quality',
    keywords: ['crop reject', 'crop rejected', 'fasal reject', 'fasal rejected', 'crop reject ho gaya', 'fasal reject ho gaya', 'crop reject kyun', 'fasal reject kyun', 'crop reject kyun hua', 'fasal reject kyun hua', 'crop reject kyun hua hai', 'fasal reject kyun hua hai', 'crop reject kar diya', 'fasal reject kar diya'],
    phrases: ['meri fasal reject kyun hui', 'crop reject kyun hua', 'fasal reject kyun hua hai', 'crop reject kyun hua hai'],
    response: 'Fasal reject isliye ho sakti hai kyunki: moisture zyada hai, foreign matter zyada hai, quality standards meet nahi ho rahi, ya damaged grains hain. Aap quality improve karke dobara slot book kar sakte hain.',
  },

  // 11. Weighment
  {
    id: 'weighment_1',
    category: 'Weighment',
    keywords: ['weighment', 'weighment kaise', 'weighment kaise hota', 'weighment kaise hota hai', 'weighment kahan', 'weighment kahan hota', 'weighment kahan hota hai', 'weighment kahan dekhun', 'weighment kahan dekhein', 'weighment kahan dekhein', 'weighment kahan dekhein', 'weighment process', 'weighment process kaise', 'weighment process kaise hota', 'weighment process kaise hota hai'],
    phrases: ['weighment kaise hota hai', 'weighment kahan hota hai', 'weighment process kaise hota hai', 'weighment kahan dekhein'],
    response: 'Weighment procurement center par hota hai. Aapki fasal ko electronic weighing machine par tol jaata hai. Weight receipt par print ho jata hai aur aapko diya jata hai.',
  },
  {
    id: 'weighment_2',
    category: 'Weighment',
    keywords: ['weight', 'weight kaise', 'weight kaise pata', 'weight kaise pata chale', 'weight kaise pata chalta hai', 'weight kahan', 'weight kahan dekhun', 'weight kahan dekhein', 'weight kahan dekhein', 'weight kahan dekhein', 'weight receipt', 'weight receipt kahan', 'weight receipt kahan dekhun', 'weight receipt kahan dekhein', 'weight receipt kahan dekhein', 'weight receipt kahan dekhein'],
    phrases: ['weight kaise pata chale', 'weight kahan dekhein', 'weight receipt kahan dekhein', 'weight kaise pata chalta hai'],
    response: 'Weight weighment ke baad receipt par print hota hai. Yeh receipt "My Receipt" ya "Receipt" section mein bhi dikhegi.',
  },
  {
    id: 'weighment_3',
    category: 'Weighment',
    keywords: ['weighment dispute', 'weighment complaint', 'weight dispute', 'weight complaint', 'weighment dispute kaise', 'weighment complaint kaise', 'weight dispute kaise', 'weight complaint kaise', 'weighment dispute kaise karein', 'weighment complaint kaise karein', 'weight dispute kaise karein', 'weight complaint kaise karein', 'weighment galat', 'weight galat', 'weighment galat hai', 'weight galat hai'],
    phrases: ['weighment dispute kaise karein', 'weight galat hai', 'weighment galat hai', 'weight complaint kaise karein'],
    response: 'Agar aapko weighment galat lage, to procurement center supervisor se baat karein. Agar resolve nahi ho, to FasalSetu helpline par complaint register karein.',
  },

  // 12. Receipt
  {
    id: 'receipt_1',
    category: 'Receipt',
    keywords: ['receipt', 'receipt kahan', 'receipt kahan dekhun', 'receipt kahan dekhein', 'receipt kahan dekhein', 'receipt kahan dekhein', 'receipt kaise', 'receipt kaise milti', 'receipt kaise milti hai', 'receipt kaise milta hai', 'receipt kaise milta', 'receipt kaise milti', 'receipt kahan milti', 'receipt kahan milti hai'],
    phrases: ['receipt kahan dekhein', 'receipt kaise milti hai', 'receipt kahan milti hai', 'receipt kaise milta hai'],
    response: 'Receipt weighment ke baad generate hoti hai. Aapko physical receipt milti hai aur digital receipt "My Receipt" section mein dikhegi.',
  },
  {
    id: 'receipt_2',
    category: 'Receipt',
    keywords: ['receipt download', 'receipt print', 'receipt download karna', 'receipt print karna', 'receipt download kaise', 'receipt print kaise', 'receipt download kaise karein', 'receipt print kaise karein', 'receipt download karna hai', 'receipt print karna hai', 'receipt download kahan', 'receipt print kahan', 'receipt download kahan se', 'receipt print kahan se'],
    phrases: ['receipt download kaise karein', 'receipt print kaise karein', 'receipt download kahan se', 'receipt print kahan se'],
    response: 'Receipt download ya print karne ke liye "My Receipt" section mein jaayein. Receipt par "Download" ya "Print" button par click karein.',
  },
  {
    id: 'receipt_3',
    category: 'Receipt',
    keywords: ['receipt details', 'receipt mein kya', 'receipt mein kya hota', 'receipt mein kya hota hai', 'receipt mein kya likha', 'receipt mein kya likha hota', 'receipt mein kya likha hota hai', 'receipt par kya', 'receipt par kya hota', 'receipt par kya hota hai', 'receipt par kya likha', 'receipt par kya likha hota', 'receipt par kya likha hota hai'],
    phrases: ['receipt mein kya hota hai', 'receipt par kya likha hota hai', 'receipt mein kya likha hota hai', 'receipt par kya hota hai'],
    response: 'Receipt par yeh details hote hain: farmer naam, crop naam, weight, quality grade, MSP rate, total amount, procurement center, date aur time, aur receipt number.',
  },

  // 13. Payment
  {
    id: 'payment_1',
    category: 'Payment',
    keywords: ['payment', 'payment nahi', 'payment nahi aaya', 'payment nahi aaya hai', 'payment nahi mila', 'payment nahi mila hai', 'payment nahi mil raha', 'payment nahi mil raha hai', 'payment status', 'payment status kahan', 'payment status kahan dekhun', 'payment status kahan dekhein', 'payment status kahan dekhein', 'payment status kahan dekhein', 'payment kaise', 'payment kaise milta', 'payment kaise milta hai', 'payment kab', 'payment kab milega', 'payment kab milega hai', 'payment kab tak', 'payment kab tak milega', 'payment kab tak milega hai', 'mera payment', 'mera payment nahi', 'mera payment nahi aaya', 'mera payment nahi aaya hai'],
    phrases: ['mera payment nahi aaya', 'payment status batao', 'payment kab milega', 'payment kaise milta hai', 'payment status kahan dekhein'],
    response: 'Payment ki current details dekhne ke liye Payment Status section open karein.',
    action: 'openPayments',
  },
  {
    id: 'payment_2',
    category: 'Payment',
    keywords: ['payment processing', 'payment processing hai', 'payment processing mein', 'payment processing mein hai', 'payment processing kya', 'payment processing kya hai', 'payment processing kya hota', 'payment processing kya hota hai', 'payment processing kahan', 'payment processing kahan dekhun', 'payment processing kahan dekhein', 'payment processing kahan dekhein', 'payment processing kahan dekhein', 'payment processing time', 'payment processing time kitna', 'payment processing time kitna hai'],
    phrases: ['payment processing kya hota hai', 'payment processing kahan dekhein', 'payment processing time kitna hai', 'payment processing kya hai'],
    response: 'Payment processing ka matlab hai ki aapka payment bank mein transfer hone ki process mein hai. Usually 24-48 ghante mein payment aa jata hai. "Payment Status" section mein status dekh sakte hain.',
    action: 'openPayments',
  },
  {
    id: 'payment_3',
    category: 'Payment',
    keywords: ['payment mode', 'payment bank', 'payment bank account', 'payment kahan aata', 'payment kahan aata hai', 'payment kahan milta', 'payment kahan milta hai', 'payment bank mein', 'payment bank mein aata', 'payment bank mein aata hai', 'payment bank mein milta', 'payment bank mein milta hai', 'payment account', 'payment account mein', 'payment account mein aata', 'payment account mein aata hai'],
    phrases: ['payment kahan aata hai', 'payment bank mein aata hai', 'payment kahan milta hai', 'payment account mein aata hai'],
    response: 'Payment aapke registered bank account mein aata hai. "My Profile" mein bank details check karein. Agar bank details galat hain, to profile update karein.',
  },
  {
    id: 'payment_4',
    category: 'Payment',
    keywords: ['payment amount', 'payment kitna', 'payment kitna hai', 'payment kitna milega', 'payment kitna milega hai', 'payment amount kya', 'payment amount kya hai', 'payment amount kahan', 'payment amount kahan dekhun', 'payment amount kahan dekhein', 'payment amount kahan dekhein', 'payment amount kahan dekhein', 'payment kitna hua', 'payment kitna hua hai'],
    phrases: ['payment kitna milega', 'payment amount kya hai', 'payment kitna hai', 'payment amount kahan dekhein'],
    response: 'Payment amount aapki fasal ke weight aur MSP rate par depend karta hai. Exact amount "Payment Status" section mein dikhega.',
    action: 'openPayments',
  },

  // 14. Transportation
  {
    id: 'transport_1',
    category: 'Transportation',
    keywords: ['transport', 'transportation', 'transport kaise', 'transportation kaise', 'transport kaise karein', 'transportation kaise karein', 'transport karna', 'transportation karna', 'transport karna hai', 'transportation karna hai', 'transport kahan', 'transportation kahan', 'transport kahan se', 'transportation kahan se', 'transport kahan se karein', 'transportation kahan se karein', 'fasal transport', 'fasal transportation', 'fasal transport kaise', 'fasal transportation kaise'],
    phrases: ['transport kaise karein', 'transportation kaise karein', 'fasal transport kaise karein', 'transport karna hai'],
    response: 'Fasal ka transport "Transport" section mein book kar sakte hain. FasalSetu transport partners ke through pickup arrange karta hai. Aap apna address aur crop quantity daalkar transport book karein.',
    action: 'openLogistics',
  },
  {
    id: 'transport_2',
    category: 'Transportation',
    keywords: ['transport cost', 'transport charge', 'transportation cost', 'transportation charge', 'transport cost kitna', 'transport charge kitna', 'transportation cost kitna', 'transportation charge kitna', 'transport cost kitna hai', 'transport charge kitna hai', 'transportation cost kitna hai', 'transportation charge kitna hai', 'transport cost kya', 'transport charge kya', 'transportation cost kya', 'transportation charge kya'],
    phrases: ['transport cost kitna hai', 'transportation charge kya hai', 'transport cost kya hai', 'transportation cost kitna hai'],
    response: 'Transport cost distance aur crop quantity par depend karta hai. Exact cost "Transport" section mein booking karte waqt dikhega.',
    action: 'openLogistics',
  },
  {
    id: 'transport_3',
    category: 'Transportation',
    keywords: ['transport status', 'transport tracking', 'transportation status', 'transportation tracking', 'transport status kahan', 'transport tracking kahan', 'transportation status kahan', 'transportation tracking kahan', 'transport status kahan dekhun', 'transport tracking kahan dekhein', 'transportation status kahan dekhein', 'transportation tracking kahan dekhein', 'transport status kahan dekhein', 'transport tracking kahan dekhein', 'transportation status kahan dekhein', 'transportation tracking kahan dekhein'],
    phrases: ['transport status kahan dekhein', 'transport tracking kahan dekhein', 'transportation status kahan dekhein', 'transportation tracking kahan dekhein'],
    response: 'Transport status "Transport" section mein dikhega. Booked transport par live tracking available hai. Driver details aur vehicle number bhi yahan milega.',
    action: 'openLogistics',
  },

  // 15. Documents
  {
    id: 'docs_1',
    category: 'Documents',
    keywords: ['documents', 'document', 'documents kya', 'document kya', 'documents kya chahiye', 'document kya chahiye', 'documents ki list', 'document ki list', 'documents list', 'document list', 'documents kahan', 'document kahan', 'documents kahan dekhun', 'document kahan dekhun', 'documents kahan dekhein', 'document kahan dekhein', 'documents kahan dekhein', 'document kahan dekhein'],
    phrases: ['documents kya chahiye', 'documents ki list kahan hai', 'documents kahan dekhein', 'document kya chahiye'],
    response: 'Procurement ke liye zaroori documents: Aadhaar card, bank passbook, land documents (khatauni/khasra), aur FasalSetu registration slip. Sabhi documents "My Documents" section mein upload hote hain.',
  },
  {
    id: 'docs_2',
    category: 'Documents',
    keywords: ['aadhaar', 'aadhaar card', 'aadhaar verification', 'aadhaar verify', 'aadhaar kaise', 'aadhaar card kaise', 'aadhaar verification kaise', 'aadhaar verify kaise', 'aadhaar kaise link', 'aadhaar card kaise link', 'aadhaar link karna', 'aadhaar card link karna', 'aadhaar link karna hai', 'aadhaar card link karna hai', 'aadhaar link kaise karein', 'aadhaar card link kaise karein'],
    phrases: ['aadhaar verification kaise hota hai', 'aadhaar kaise link karein', 'aadhaar card kaise link karein', 'aadhaar link karna hai'],
    response: 'Aadhaar registration ke waqt link hota hai. Aadhaar number daalkar OTP verify karein. Agar Aadhaar link nahi hai, to "My Profile" mein jaakar link kar sakte hain. Is information ke liye live FasalSetu data ki zarurat hai.',
  },
  {
    id: 'docs_3',
    category: 'Documents',
    keywords: ['land document', 'land documents', 'khatauni', 'khasra', 'land document kahan', 'land documents kahan', 'khatauni kahan', 'khasra kahan', 'land document kahan dekhun', 'land documents kahan dekhun', 'khatauni kahan dekhun', 'khasra kahan dekhun', 'land document kahan dekhein', 'land documents kahan dekhein', 'khatauni kahan dekhein', 'khasra kahan dekhein', 'land document kahan dekhein', 'land documents kahan dekhein', 'khatauni kahan dekhein', 'khasra kahan dekhein'],
    phrases: ['land document kahan dekhein', 'khatauni kahan dekhein', 'khasra kahan dekhein', 'land documents kahan dekhein'],
    response: 'Land documents (khatauni/khasra) registration ke waqt upload karne hote hain. Yeh documents aapki zameen ke ownership ka proof hain. "My Documents" section mein upload kar sakte hain.',
  },

  // 16. General Procurement
  {
    id: 'general_1',
    category: 'General Procurement',
    keywords: ['procurement', 'procurement kya', 'procurement kya hai', 'procurement kya hota', 'procurement kya hota hai', 'procurement matlab', 'procurement matlab kya', 'procurement matlab kya hai', 'procurement kaise', 'procurement kaise hota', 'procurement kaise hota hai', 'fasal procurement', 'fasal procurement kya', 'fasal procurement kya hai'],
    phrases: ['procurement kya hai', 'procurement matlab kya hai', 'procurement kya hota hai', 'fasal procurement kya hai'],
    response: 'Procurement ka matlab hai sarkar ya agency dwara fasal ko MSP (Minimum Support Price) par kharidna. FasalSetu is process ko online banata hai — registration se lekar payment tak.',
  },
  {
    id: 'general_2',
    category: 'General Procurement',
    keywords: ['fasalsetu', 'fasal setu', 'fasalsetu kya', 'fasal setu kya', 'fasalsetu kya hai', 'fasal setu kya hai', 'fasalsetu kaise', 'fasal setu kaise', 'fasalsetu kaise use', 'fasal setu kaise use', 'fasalsetu kaise use karein', 'fasal setu kaise use karein', 'fasalsetu app', 'fasal setu app', 'fasalsetu app kaise', 'fasal setu app kaise'],
    phrases: ['fasalsetu kya hai', 'fasal setu kaise use karein', 'fasalsetu kya hota hai', 'fasal setu app kya hai'],
    response: 'FasalSetu ek digital platform hai jo farmers ko fasal registration, slot booking, procurement, weighment, receipt, aur payment sab ek jagah karne deta hai. KETAN iska AI assistant hai.',
  },
  {
    id: 'general_3',
    category: 'General Procurement',
    keywords: ['help', 'madad', 'madad karo', 'madad karein', 'help me', 'help karo', 'help karein', 'madad chahiye', 'help chahiye', 'kya karun', 'kya karein', 'kya karoon', 'kya karein', 'kaise karein', 'kaise karun', 'kya karna hai', 'kaise karna hai'],
    phrases: ['mujhe madad chahiye', 'help karein', 'madad karein', 'kya karun', 'kaise karein'],
    response: 'Main aapki madad kar sakta hoon! Quick actions use karein ya apna sawal type karein ya bol kar poochhein. Main registration, slot booking, token, payment, transport — sab mein madad kar sakta hoon.',
  },

  // 17. MSP
  {
    id: 'msp_1',
    category: 'MSP',
    keywords: ['msp', 'minimum support price', 'msp kya', 'msp kya hai', 'minimum support price kya', 'minimum support price kya hai', 'msp kaise', 'msp kaise pata', 'msp kaise pata chale', 'msp kaise pata chalta hai', 'msp kahan', 'msp kahan dekhun', 'msp kahan dekhein', 'msp kahan dekhein', 'msp kahan dekhein', 'msp rate', 'msp rate kya', 'msp rate kya hai', 'msp rate kahan', 'msp rate kahan dekhun', 'msp rate kahan dekhein', 'msp rate kahan dekhein', 'msp rate kahan dekhein'],
    phrases: ['msp kya hai', 'msp kaise pata chale', 'msp kahan dekhein', 'msp rate kya hai', 'msp rate kahan dekhein'],
    response: 'MSP (Minimum Support Price) sarkar dwara fix kiya gaya rate hai jis par fasal kharidi jati hai. MSP crop ke hisaab se alag hota hai. Is information ke liye live FasalSetu data ki zarurat hai.',
  },
  {
    id: 'msp_2',
    category: 'MSP',
    keywords: ['msp wheat', 'msp rice', 'msp wheat kya', 'msp rice kya', 'msp wheat kitna', 'msp rice kitna', 'msp wheat kitna hai', 'msp rice kitna hai', 'wheat msp', 'rice msp', 'wheat msp kya', 'rice msp kya', 'wheat msp kitna', 'rice msp kitna', 'wheat msp kitna hai', 'rice msp kitna hai', 'wheat ka msp', 'rice ka msp', 'wheat ka msp kitna', 'rice ka msp kitna', 'wheat ka msp kitna hai', 'rice ka msp kitna hai'],
    phrases: ['wheat ka msp kitna hai', 'rice ka msp kitna hai', 'msp wheat kitna hai', 'msp rice kitna hai'],
    response: 'MSP wheat aur rice ke liye har season mein sarkar dwara announce hota hai. Exact MSP rate ke liye live FasalSetu data ki zarurat hai. "Procurement Center" section mein current MSP check kar sakte hain.',
  },
  {
    id: 'msp_3',
    category: 'MSP',
    keywords: ['msp change', 'msp update', 'msp change hua', 'msp update hua', 'msp change kyun', 'msp update kyun', 'msp change kyun hua', 'msp update kyun hua', 'msp change kyun hua hai', 'msp update kyun hua hai', 'msp kab change', 'msp kab update', 'msp kab change hota', 'msp kab update hota', 'msp kab change hota hai', 'msp kab update hota hai', 'msp kab announce', 'msp kab announce hota', 'msp kab announce hota hai'],
    phrases: ['msp kab change hota hai', 'msp kab announce hota hai', 'msp change kyun hua', 'msp kab update hota hai'],
    response: 'MSP har season (kharif aur rabi) mein sarkar dwara announce hota hai. Naya MSP season ke shuru mein declare hota hai. FasalSetu par latest MSP update mil jata hai.',
  },

  // 18. Notifications
  {
    id: 'notif_1',
    category: 'Notifications',
    keywords: ['notification', 'notifications', 'notification nahi', 'notifications nahi', 'notification nahi aa', 'notifications nahi aa', 'notification nahi aa raha', 'notifications nahi aa rahe', 'notification nahi aa raha hai', 'notifications nahi aa rahe hain', 'notification kahan', 'notifications kahan', 'notification kahan dekhun', 'notifications kahan dekhun', 'notification kahan dekhein', 'notifications kahan dekhein', 'notification kahan dekhein', 'notifications kahan dekhein'],
    phrases: ['notification nahi aa raha', 'notifications kahan dekhein', 'notification kahan dekhein', 'notifications nahi aa rahe hain'],
    response: 'Notifications "Notifications" section mein dikhega. Agar notification nahi aa raha, to phone settings mein FasalSetu app ke notifications enable karein.',
  },
  {
    id: 'notif_2',
    category: 'Notifications',
    keywords: ['sms', 'sms nahi', 'sms nahi aaya', 'sms nahi aa raha', 'sms nahi aaya hai', 'sms nahi aa raha hai', 'sms notification', 'sms notification nahi', 'sms notification nahi aaya', 'sms notification nahi aa raha', 'sms kahan', 'sms kahan dekhun', 'sms kahan dekhein', 'sms kahan dekhein', 'message nahi', 'message nahi aaya', 'message nahi aa raha', 'message nahi aaya hai', 'message nahi aa raha hai'],
    phrases: ['sms nahi aa raha', 'message nahi aaya', 'sms notification nahi aa raha', 'sms kahan dekhein'],
    response: 'Agar SMS nahi aa raha, to apna registered mobile number check karein. Network issue hone par SMS delay ho sakti hai. "My Profile" mein mobile number update kar sakte hain.',
  },
  {
    id: 'notif_3',
    category: 'Notifications',
    keywords: ['notification settings', 'notification enable', 'notification on', 'notification off', 'notification settings kahan', 'notification enable kaise', 'notification on kaise', 'notification off kaise', 'notification settings kahan dekhun', 'notification enable kaise karein', 'notification on kaise karein', 'notification off kaise karein', 'notification settings kahan dekhein', 'notification enable kaise karein', 'notification on kaise karein', 'notification off kaise karein'],
    phrases: ['notification settings kahan dekhein', 'notification enable kaise karein', 'notification on kaise karein', 'notification off kaise karein'],
    response: 'Notification settings app ke "Settings" section mein hain. Aap SMS, push, aur email notifications on/off kar sakte hain. Phone settings mein bhi FasalSetu notifications enable karein.',
  },

  // Greeting / fallback general
  {
    id: 'greeting_1',
    category: 'General Procurement',
    keywords: ['namaste', 'namaskar', 'hello', 'hi', 'hey', 'namaste ketan', 'hello ketan', 'hi ketan', 'hey ketan', 'pranam', 'ram ram', 'radhe radhe'],
    phrases: ['namaste ketan', 'hello', 'hi ketan', 'namaste'],
    response: 'Namaste! Main KETAN hoon, aapka AI Farmer Assistant. Main aapki fasal ki registration se lekar procurement aur payment tak madad kar sakta hoon. Kaise madad karun?',
  },
  {
    id: 'thanks_1',
    category: 'General Procurement',
    keywords: ['thank', 'thanks', 'thank you', 'dhanyawad', 'shukriya', 'thnx', 'thx', 'thanku', 'thank you ketan', 'thanks ketan', 'dhanyawad ketan', 'shukriya ketan'],
    phrases: ['thank you ketan', 'dhanyawad', 'shukriya', 'thanks ketan'],
    response: 'Aapka swagat hai! Aur koi sawal ho to zaroor poochhein. Main aapki madad ke liye yahan hoon.',
  },
  {
    id: 'bye_1',
    category: 'General Procurement',
    keywords: ['bye', 'goodbye', 'bye bye', 'tata', 'alvida', 'bye ketan', 'goodbye ketan', 'alvida ketan', 'chaltun', 'chalti hoon', 'chalta hoon', 'phir milenge'],
    phrases: ['bye ketan', 'alvida', 'tata', 'goodbye'],
    response: 'Alvida! Kisi bhi waqt FasalSetu par madad chahiye to main yahan hoon. Aapki fasal ka procurement successful ho!',
  },
];

const fallbackCategories = [
  'Farmer Registration',
  'Login',
  'Farmer Profile',
  'Crop Registration',
  'Procurement Center',
  'Slot Booking',
  'Token',
  'Queue',
  'Procurement Process',
  'Crop Quality',
  'Weighment',
  'Receipt',
  'Payment',
  'Transportation',
  'Documents',
  'General Procurement',
  'MSP',
  'Notifications',
];

window.KETAN_KB = fallbackKnowledgeBase;
window.KETAN_CATEGORIES = fallbackCategories;
