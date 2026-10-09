export interface Place {
  id: string;
  nameEn: string;
  nameTa: string;
  districtId: string;
  districtEn: string;
  districtTa: string;
  lat: number;
  lng: number;
  type: 'City' | 'Town' | 'Village';
}

export interface District {
  id: string;
  nameEn: string;
  nameTa: string;
  headquarters: string;
  lat: number;
  lng: number;
}

export const TN_DISTRICTS: District[] = [
  { id: 'chennai', nameEn: 'Chennai', nameTa: 'சென்னை', headquarters: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { id: 'coimbatore', nameEn: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', headquarters: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { id: 'madurai', nameEn: 'Madurai', nameTa: 'மதுரை', headquarters: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { id: 'tiruchirappalli', nameEn: 'Tiruchirappalli', nameTa: 'திருச்சிராப்பள்ளி', headquarters: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  { id: 'salem', nameEn: 'Salem', nameTa: 'சேலம்', headquarters: 'Salem', lat: 11.6643, lng: 78.1460 },
  { id: 'tirunelveli', nameEn: 'Tirunelveli', nameTa: 'திருநெல்வேலி', headquarters: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { id: 'erode', nameEn: 'Erode', nameTa: 'ஈரோடு', headquarters: 'Erode', lat: 11.3410, lng: 77.7172 },
  { id: 'vellore', nameEn: 'Vellore', nameTa: 'வேலூர்', headquarters: 'Vellore', lat: 12.9165, lng: 79.1325 },
  { id: 'thanjavur', nameEn: 'Thanjavur', nameTa: 'தஞ்சாவூர்', headquarters: 'Thanjavur', lat: 10.7870, lng: 79.1378 },
  { id: 'tiruppur', nameEn: 'Tiruppur', nameTa: 'திருப்பூர்', headquarters: 'Tiruppur', lat: 11.1085, lng: 77.3411 },
  { id: 'dindigul', nameEn: 'Dindigul', nameTa: 'திண்டுக்கல்', headquarters: 'Dindigul', lat: 10.3673, lng: 77.9803 },
  { id: 'thoothukudi', nameEn: 'Thoothukudi', nameTa: 'தூத்துக்குடி', headquarters: 'Thoothukudi', lat: 8.7642, lng: 78.1348 },
  { id: 'kanyakumari', nameEn: 'Kanyakumari', nameTa: 'கன்னியாகுமரி', headquarters: 'Nagercoil', lat: 8.1833, lng: 77.4119 },
  { id: 'karur', nameEn: 'Karur', nameTa: 'கரூர்', headquarters: 'Karur', lat: 10.9601, lng: 78.0766 },
  { id: 'krishnagiri', nameEn: 'Krishnagiri', nameTa: 'கிருஷ்ணகிரி', headquarters: 'Krishnagiri', lat: 12.5186, lng: 78.2137 },
  { id: 'nilgiris', nameEn: 'The Nilgiris', nameTa: 'நீலகிரி', headquarters: 'Udhagamandalam (Ooty)', lat: 11.4102, lng: 76.6950 },
  { id: 'kanchipuram', nameEn: 'Kanchipuram', nameTa: 'காஞ்சிபுரம்', headquarters: 'Kanchipuram', lat: 12.8342, lng: 79.7036 },
  { id: 'chengalpattu', nameEn: 'Chengalpattu', nameTa: 'செங்கல்பட்டு', headquarters: 'Chengalpattu', lat: 12.6841, lng: 79.9836 },
  { id: 'tiruvallur', nameEn: 'Tiruvallur', nameTa: 'திருவள்ளூர்', headquarters: 'Tiruvallur', lat: 13.1432, lng: 79.9083 },
  { id: 'ranipet', nameEn: 'Ranipet', nameTa: 'ராணிப்பேட்டை', headquarters: 'Ranipet', lat: 12.9224, lng: 79.3328 },
  { id: 'tirupattur', nameEn: 'Tirupattur', nameTa: 'திருப்பத்தூர்', headquarters: 'Tirupattur', lat: 12.4963, lng: 78.5739 },
  { id: 'tiruvannamalai', nameEn: 'Tiruvannamalai', nameTa: 'திருவண்ணாமலை', headquarters: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747 },
  { id: 'dharmapuri', nameEn: 'Dharmapuri', nameTa: 'தர்மபுரி', headquarters: 'Dharmapuri', lat: 12.1211, lng: 78.1582 },
  { id: 'namakkal', nameEn: 'Namakkal', nameTa: 'நாமக்கல்', headquarters: 'Namakkal', lat: 11.2189, lng: 78.1674 },
  { id: 'cuddalore', nameEn: 'Cuddalore', nameTa: 'கடலூர்', headquarters: 'Cuddalore', lat: 11.7480, lng: 79.7714 },
  { id: 'villupuram', nameEn: 'Villupuram', nameTa: 'விழுப்புரம்', headquarters: 'Villupuram', lat: 11.9401, lng: 79.4861 },
  { id: 'kallakurichi', nameEn: 'Kallakurichi', nameTa: 'கள்ளக்குறிச்சி', headquarters: 'Kallakurichi', lat: 11.7383, lng: 78.9639 },
  { id: 'perambalur', nameEn: 'Perambalur', nameTa: 'பெரம்பலூர்', headquarters: 'Perambalur', lat: 11.2342, lng: 78.8818 },
  { id: 'ariyalur', nameEn: 'Ariyalur', nameTa: 'அரியலூர்', headquarters: 'Ariyalur', lat: 11.1401, lng: 79.0786 },
  { id: 'mayiladuthurai', nameEn: 'Mayiladuthurai', nameTa: 'மயிலாடுதுறை', headquarters: 'Mayiladuthurai', lat: 11.1018, lng: 79.6522 },
  { id: 'nagapattinam', nameEn: 'Nagapattinam', nameTa: 'நாகப்பட்டினம்', headquarters: 'Nagapattinam', lat: 10.7656, lng: 79.8424 },
  { id: 'tiruvarur', nameEn: 'Tiruvarur', nameTa: 'திருவாரூர்', headquarters: 'Tiruvarur', lat: 10.7725, lng: 79.6368 },
  { id: 'pudukkottai', nameEn: 'Pudukkottai', nameTa: 'புதுக்கோட்டை', headquarters: 'Pudukkottai', lat: 10.3833, lng: 78.8001 },
  { id: 'sivaganga', nameEn: 'Sivaganga', nameTa: 'சிவகங்கை', headquarters: 'Sivaganga', lat: 9.8433, lng: 78.4809 },
  { id: 'ramanathapuram', nameEn: 'Ramanathapuram', nameTa: 'ராமநாதபுரம்', headquarters: 'Ramanathapuram', lat: 9.3639, lng: 78.8395 },
  { id: 'virudhunagar', nameEn: 'Virudhunagar', nameTa: 'விருதுநகர்', headquarters: 'Virudhunagar', lat: 9.5680, lng: 77.9624 },
  { id: 'theni', nameEn: 'Theni', nameTa: 'தேனி', headquarters: 'Theni', lat: 10.0104, lng: 77.4768 },
  { id: 'tenkasi', nameEn: 'Tenkasi', nameTa: 'தென்காசி', headquarters: 'Tenkasi', lat: 8.9594, lng: 77.3150 },
];

export const TN_PLACES: Place[] = [
  // Chennai District
  { id: 'ch-tnagar', nameEn: 'T. Nagar', nameTa: 'தி. நகர்', districtId: 'chennai', districtEn: 'Chennai', districtTa: 'சென்னை', lat: 13.0418, lng: 80.2341, type: 'Town' },
  { id: 'ch-adyar', nameEn: 'Adyar', nameTa: 'அடையாறு', districtId: 'chennai', districtEn: 'Chennai', districtTa: 'சென்னை', lat: 13.0012, lng: 80.2565, type: 'Town' },
  { id: 'ch-annanagar', nameEn: 'Anna Nagar', nameTa: 'அண்ணா நகர்', districtId: 'chennai', districtEn: 'Chennai', districtTa: 'சென்னை', lat: 13.0850, lng: 80.2101, type: 'Town' },
  { id: 'ch-mylapore', nameEn: 'Mylapore', nameTa: 'மயிலாப்பூர்', districtId: 'chennai', districtEn: 'Chennai', districtTa: 'சென்னை', lat: 13.0368, lng: 80.2676, type: 'Town' },
  { id: 'ch-velachery', nameEn: 'Velachery', nameTa: 'வேளச்சேரி', districtId: 'chennai', districtEn: 'Chennai', districtTa: 'சென்னை', lat: 12.9791, lng: 80.2212, type: 'Town' },
  { id: 'ch-guindy', nameEn: 'Guindy', nameTa: 'கிண்டி', districtId: 'chennai', districtEn: 'Chennai', districtTa: 'சென்னை', lat: 13.0067, lng: 80.2025, type: 'Town' },
  { id: 'ch-royapettah', nameEn: 'Royapettah', nameTa: 'ராயப்பேட்டை', districtId: 'chennai', districtEn: 'Chennai', districtTa: 'சென்னை', lat: 13.0536, lng: 80.2642, type: 'Town' },

  // Coimbatore District
  { id: 'cbe-city', nameEn: 'Gandhipuram', nameTa: 'காந்திபுரம்', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 11.0168, lng: 76.9675, type: 'City' },
  { id: 'cbe-rspuram', nameEn: 'R.S. Puram', nameTa: 'ஆர்.எஸ். புரம்', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 11.0086, lng: 76.9482, type: 'Town' },
  { id: 'cbe-peelamedu', nameEn: 'Peelamedu', nameTa: 'பீளமேடு', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 11.0287, lng: 77.0042, type: 'Town' },
  { id: 'cbe-singanallur', nameEn: 'Singanallur', nameTa: 'சிங்கநல்லூர்', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 10.9995, lng: 77.0267, type: 'Town' },
  { id: 'cbe-saravanampatti', nameEn: 'Saravanampatti', nameTa: 'சரவணம்பட்டி', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 11.0805, lng: 76.9962, type: 'Town' },
  { id: 'cbe-pollachi', nameEn: 'Pollachi', nameTa: 'பொள்ளாச்சி', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 10.6609, lng: 77.0048, type: 'City' },
  { id: 'cbe-mettupalayam', nameEn: 'Mettupalayam', nameTa: 'மேட்டுப்பாளையம்', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 11.2994, lng: 76.9427, type: 'City' },
  { id: 'cbe-kinathukadavu', nameEn: 'Kinathukadavu', nameTa: 'கிணத்துக்கடவு', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 10.8213, lng: 77.0195, type: 'Town' },
  { id: 'cbe-annur', nameEn: 'Annur', nameTa: 'அன்னூர்', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 11.2333, lng: 77.1333, type: 'Town' },
  { id: 'cbe-thondamuthur', nameEn: 'Thondamuthur', nameTa: 'தொண்டாமுத்தூர்', districtId: 'coimbatore', districtEn: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', lat: 10.9984, lng: 76.8324, type: 'Village' },

  // Madurai District
  { id: 'mdu-goripalayam', nameEn: 'Goripalayam', nameTa: 'கோரிப்பாளையம்', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 9.9288, lng: 78.1312, type: 'Town' },
  { id: 'mdu-annanagar', nameEn: 'Anna Nagar', nameTa: 'அண்ணா நகர்', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 9.9192, lng: 78.1481, type: 'Town' },
  { id: 'mdu-mattuthavani', nameEn: 'Mattuthavani', nameTa: 'மாட்டுத்தாவணி', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 9.9472, lng: 78.1568, type: 'Town' },
  { id: 'mdu-teppakulam', nameEn: 'Teppakulam', nameTa: 'தெப்பக்குளம்', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 9.9095, lng: 78.1465, type: 'Town' },
  { id: 'mdu-thirunagar', nameEn: 'Thirunagar', nameTa: 'திருநகர்', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 9.8735, lng: 78.0664, type: 'Town' },
  { id: 'mdu-alanganallur', nameEn: 'Alanganallur', nameTa: 'அலங்காநல்லூர்', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 10.0435, lng: 78.0967, type: 'Village' },
  { id: 'mdu-usilampatti', nameEn: 'Usilampatti', nameTa: 'உசிலம்பட்டி', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 9.9678, lng: 77.7942, type: 'Town' },
  { id: 'mdu-melur', nameEn: 'Melur', nameTa: 'மேலூர்', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 10.0381, lng: 78.3361, type: 'Town' },
  { id: 'mdu-thirumangalam', nameEn: 'Thirumangalam', nameTa: 'திருமங்கலம்', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 9.8242, lng: 77.9897, type: 'Town' },
  { id: 'mdu-vadipatti', nameEn: 'Vadipatti', nameTa: 'வாடிப்பட்டி', districtId: 'madurai', districtEn: 'Madurai', districtTa: 'மதுரை', lat: 10.0882, lng: 78.0322, type: 'Town' },

  // Tiruchirappalli District
  { id: 'try-thillai', nameEn: 'Thillai Nagar', nameTa: 'தில்லை நகர்', districtId: 'tiruchirappalli', districtEn: 'Tiruchirappalli', districtTa: 'திருச்சிராப்பள்ளி', lat: 10.8258, lng: 78.6865, type: 'Town' },
  { id: 'try-srirangam', nameEn: 'Srirangam', nameTa: 'ஸ்ரீரங்கம்', districtId: 'tiruchirappalli', districtEn: 'Tiruchirappalli', districtTa: 'திருச்சிராப்பள்ளி', lat: 10.8624, lng: 78.6908, type: 'City' },
  { id: 'try-cantonment', nameEn: 'Cantonment', nameTa: 'கண்டோன்மென்ட்', districtId: 'tiruchirappalli', districtEn: 'Tiruchirappalli', districtTa: 'திருச்சிராப்பள்ளி', lat: 10.8035, lng: 78.6854, type: 'Town' },
  { id: 'try-kknagar', nameEn: 'K.K. Nagar', nameTa: 'கே.கே. நகர்', districtId: 'tiruchirappalli', districtEn: 'Tiruchirappalli', districtTa: 'திருச்சிராப்பள்ளி', lat: 10.7745, lng: 78.7123, type: 'Town' },
  { id: 'try-lalgudi', nameEn: 'Lalgudi', nameTa: 'லால்குடி', districtId: 'tiruchirappalli', districtEn: 'Tiruchirappalli', districtTa: 'திருச்சிராப்பள்ளி', lat: 10.8715, lng: 78.8142, type: 'Town' },
  { id: 'try-manapparai', nameEn: 'Manapparai', nameTa: 'மணப்பாறை', districtId: 'tiruchirappalli', districtEn: 'Tiruchirappalli', districtTa: 'திருச்சிராப்பள்ளி', lat: 10.6074, lng: 78.4182, type: 'Town' },
  { id: 'try-thuvakudi', nameEn: 'Thuvakudi', nameTa: 'துவாக்குடி', districtId: 'tiruchirappalli', districtEn: 'Tiruchirappalli', districtTa: 'திருச்சிராப்பள்ளி', lat: 10.7511, lng: 78.7997, type: 'Town' },
  { id: 'try-musiri', nameEn: 'Musiri', nameTa: 'முசிறி', districtId: 'tiruchirappalli', districtEn: 'Tiruchirappalli', districtTa: 'திருச்சிராப்பள்ளி', lat: 10.9416, lng: 78.4552, type: 'Town' },

  // Salem District
  { id: 'slm-hasthampatti', nameEn: 'Hasthampatti', nameTa: 'அஸ்தம்பட்டி', districtId: 'salem', districtEn: 'Salem', districtTa: 'சேலம்', lat: 11.6775, lng: 78.1633, type: 'Town' },
  { id: 'slm-suramangalam', nameEn: 'Suramangalam', nameTa: 'சூரமங்கலம்', districtId: 'salem', districtEn: 'Salem', districtTa: 'சேலம்', lat: 11.6750, lng: 78.1215, type: 'Town' },
  { id: 'slm-attur', nameEn: 'Attur', nameTa: 'ஆத்தூர்', districtId: 'salem', districtEn: 'Salem', districtTa: 'சேலம்', lat: 11.5975, lng: 78.6015, type: 'City' },
  { id: 'slm-mettur', nameEn: 'Mettur', nameTa: 'மேட்டூர்', districtId: 'salem', districtEn: 'Salem', districtTa: 'சேலம்', lat: 11.7963, lng: 77.8012, type: 'City' },
  { id: 'slm-omalur', nameEn: 'Omalur', nameTa: 'ஓமலூர்', districtId: 'salem', districtEn: 'Salem', districtTa: 'சேலம்', lat: 11.7431, lng: 78.0435, type: 'Town' },
  { id: 'slm-sankari', nameEn: 'Sankari', nameTa: 'சங்ககிரி', districtId: 'salem', districtEn: 'Salem', districtTa: 'சேலம்', lat: 11.4824, lng: 77.8687, type: 'Town' },
  { id: 'slm-edappadi', nameEn: 'Edappadi', nameTa: 'எடப்பாடி', districtId: 'salem', districtEn: 'Salem', districtTa: 'சேலம்', lat: 11.5831, lng: 77.8504, type: 'Town' },
  { id: 'slm-yercaud', nameEn: 'Yercaud', nameTa: 'ஏற்காடு', districtId: 'salem', districtEn: 'Salem', districtTa: 'சேலம்', lat: 11.7753, lng: 78.2093, type: 'Town' },

  // Erode District
  { id: 'erd-central', nameEn: 'Erode Central', nameTa: 'ஈரோடு மையம்', districtId: 'erode', districtEn: 'Erode', districtTa: 'ஈரோடு', lat: 11.3410, lng: 77.7172, type: 'City' },
  { id: 'erd-perundurai', nameEn: 'Perundurai', nameTa: 'பெருந்துறை', districtId: 'erode', districtEn: 'Erode', districtTa: 'ஈரோடு', lat: 11.2754, lng: 77.5834, type: 'Town' },
  { id: 'erd-bhavani', nameEn: 'Bhavani', nameTa: 'பவானி', districtId: 'erode', districtEn: 'Erode', districtTa: 'ஈரோடு', lat: 11.4503, lng: 77.6834, type: 'City' },
  { id: 'erd-gobi', nameEn: 'Gobichettipalayam', nameTa: 'கோபிசெட்டிபாளையம்', districtId: 'erode', districtEn: 'Erode', districtTa: 'ஈரோடு', lat: 11.4552, lng: 77.4332, type: 'City' },
  { id: 'erd-sathyamangalam', nameEn: 'Sathyamangalam', nameTa: 'சத்தியமங்கலம்', districtId: 'erode', districtEn: 'Erode', districtTa: 'ஈரோடு', lat: 11.5034, lng: 77.2341, type: 'Town' },
  { id: 'erd-anthiyur', nameEn: 'Anthiyur', nameTa: 'அந்தியூர்', districtId: 'erode', districtEn: 'Erode', districtTa: 'ஈரோடு', lat: 11.5834, lng: 77.5834, type: 'Town' },
  { id: 'erd-kodumudi', nameEn: 'Kodumudi', nameTa: 'கொடுமுடி', districtId: 'erode', districtEn: 'Erode', districtTa: 'ஈரோடு', lat: 11.0834, lng: 77.8834, type: 'Town' },

  // Tirunelveli District
  { id: 'tnv-palayamkottai', nameEn: 'Palayamkottai', nameTa: 'பாளையங்கோட்டை', districtId: 'tirunelveli', districtEn: 'Tirunelveli', districtTa: 'திருநெல்வேலி', lat: 8.7183, lng: 77.7423, type: 'Town' },
  { id: 'tnv-junction', nameEn: 'Tirunelveli Junction', nameTa: 'திருநெல்வேலி சந்திப்பு', districtId: 'tirunelveli', districtEn: 'Tirunelveli', districtTa: 'திருநெல்வேலி', lat: 8.7295, lng: 77.7124, type: 'Town' },
  { id: 'tnv-ambasamudram', nameEn: 'Ambasamudram', nameTa: 'அம்பாசமுத்திரம்', districtId: 'tirunelveli', districtEn: 'Tirunelveli', districtTa: 'திருநெல்வேலி', lat: 8.7065, lng: 77.4528, type: 'Town' },
  { id: 'tnv-cheranmahadevi', nameEn: 'Cheranmahadevi', nameTa: 'சேரன்மகாதேவி', districtId: 'tirunelveli', districtEn: 'Tirunelveli', districtTa: 'திருநெல்வேலி', lat: 8.6835, lng: 77.5674, type: 'Town' },
  { id: 'tnv-nanguneri', nameEn: 'Nanguneri', nameTa: 'நாங்குநேரி', districtId: 'tirunelveli', districtEn: 'Tirunelveli', districtTa: 'திருநெல்வேலி', lat: 8.4895, lng: 77.6582, type: 'Town' },
  { id: 'tnv-radhapuram', nameEn: 'Radhapuram', nameTa: 'ராதாபுரம்', districtId: 'tirunelveli', districtEn: 'Tirunelveli', districtTa: 'திருநெல்வேலி', lat: 8.3125, lng: 77.6834, type: 'Village' },

  // Vellore District
  { id: 'vel-katpadi', nameEn: 'Katpadi', nameTa: 'காட்பாடி', districtId: 'vellore', districtEn: 'Vellore', districtTa: 'வேலூர்', lat: 12.9818, lng: 79.1365, type: 'Town' },
  { id: 'vel-sathuvachari', nameEn: 'Sathuvachari', nameTa: 'சத்துவாச்சாரி', districtId: 'vellore', districtEn: 'Vellore', districtTa: 'வேலூர்', lat: 12.9234, lng: 79.1623, type: 'Town' },
  { id: 'vel-gudiyatham', nameEn: 'Gudiyatham', nameTa: 'குடியாத்தம்', districtId: 'vellore', districtEn: 'Vellore', districtTa: 'வேலூர்', lat: 12.9465, lng: 78.8724, type: 'City' },
  { id: 'vel-anaicut', nameEn: 'Anaicut', nameTa: 'அணைக்கட்டு', districtId: 'vellore', districtEn: 'Vellore', districtTa: 'வேலூர்', lat: 12.8712, lng: 78.9834, type: 'Town' },

  // Thanjavur District
  { id: 'thj-central', nameEn: 'Thanjavur Old Town', nameTa: 'தஞ்சாவூர் பழைய நகரம்', districtId: 'thanjavur', districtEn: 'Thanjavur', districtTa: 'தஞ்சாவூர்', lat: 10.7870, lng: 79.1378, type: 'City' },
  { id: 'thj-kumbakonam', nameEn: 'Kumbakonam', nameTa: 'கும்பகோணம்', districtId: 'thanjavur', districtEn: 'Thanjavur', districtTa: 'தஞ்சாவூர்', lat: 10.9602, lng: 79.3845, type: 'City' },
  { id: 'thj-pattukkottai', nameEn: 'Pattukkottai', nameTa: 'பட்டுக்கோட்டை', districtId: 'thanjavur', districtEn: 'Thanjavur', districtTa: 'தஞ்சாவூர்', lat: 10.4285, lng: 79.3175, type: 'City' },
  { id: 'thj-thiruvaiyaru', nameEn: 'Thiruvaiyaru', nameTa: 'திருவையாறு', districtId: 'thanjavur', districtEn: 'Thanjavur', districtTa: 'தஞ்சாவூர்', lat: 10.8845, lng: 79.1034, type: 'Town' },
  { id: 'thj-papanasam', nameEn: 'Papanasam', nameTa: 'பாபநாசம்', districtId: 'thanjavur', districtEn: 'Thanjavur', districtTa: 'தஞ்சாவூர்', lat: 10.9234, lng: 79.2834, type: 'Town' },

  // Tiruppur District
  { id: 'tpr-central', nameEn: 'Tiruppur Kumaran Road', nameTa: 'திருப்பூர் குமரன் சாலை', districtId: 'tiruppur', districtEn: 'Tiruppur', districtTa: 'திருப்பூர்', lat: 11.1085, lng: 77.3411, type: 'City' },
  { id: 'tpr-avinashi', nameEn: 'Avinashi', nameTa: 'அவிநாசி', districtId: 'tiruppur', districtEn: 'Tiruppur', districtTa: 'திருப்பூர்', lat: 11.1925, lng: 77.2684, type: 'Town' },
  { id: 'tpr-palladam', nameEn: 'Palladam', nameTa: 'பல்லடம்', districtId: 'tiruppur', districtEn: 'Tiruppur', districtTa: 'திருப்பூர்', lat: 11.0045, lng: 77.2845, type: 'Town' },
  { id: 'tpr-dharapuram', nameEn: 'Dharapuram', nameTa: 'தாராபுரம்', districtId: 'tiruppur', districtEn: 'Tiruppur', districtTa: 'திருப்பூர்', lat: 10.7325, lng: 77.5245, type: 'City' },
  { id: 'tpr-kangeyam', nameEn: 'Kangeyam', nameTa: 'காங்கேயம்', districtId: 'tiruppur', districtEn: 'Tiruppur', districtTa: 'திருப்பூர்', lat: 11.0034, lng: 77.5623, type: 'Town' },
  { id: 'tpr-udumalaipettai', nameEn: 'Udumalaipettai', nameTa: 'உடுமலைப்பேட்டை', districtId: 'tiruppur', districtEn: 'Tiruppur', districtTa: 'திருப்பூர்', lat: 10.5845, lng: 77.2485, type: 'City' },

  // Dindigul District
  { id: 'dgl-central', nameEn: 'Dindigul Town', nameTa: 'திண்டுக்கல் நகரம்', districtId: 'dindigul', districtEn: 'Dindigul', districtTa: 'திண்டுக்கல்', lat: 10.3673, lng: 77.9803, type: 'City' },
  { id: 'dgl-palani', nameEn: 'Palani', nameTa: 'பழனி', districtId: 'dindigul', districtEn: 'Dindigul', districtTa: 'திண்டுக்கல்', lat: 10.4503, lng: 77.5184, type: 'City' },
  { id: 'dgl-kodaikanal', nameEn: 'Kodaikanal', nameTa: 'கொடைக்கானல்', districtId: 'dindigul', districtEn: 'Dindigul', districtTa: 'திண்டுக்கல்', lat: 10.2381, lng: 77.4892, type: 'City' },
  { id: 'dgl-oddanchatram', nameEn: 'Oddanchatram', nameTa: 'ஒட்டன்சத்திரம்', districtId: 'dindigul', districtEn: 'Dindigul', districtTa: 'திண்டுக்கல்', lat: 10.4854, lng: 77.7472, type: 'Town' },
  { id: 'dgl-nilakottai', nameEn: 'Nilakottai', nameTa: 'நிலக்கோட்டை', districtId: 'dindigul', districtEn: 'Dindigul', districtTa: 'திண்டுக்கல்', lat: 10.1623, lng: 77.8624, type: 'Town' },
  { id: 'dgl-natham', nameEn: 'Natham', nameTa: 'நத்தம்', districtId: 'dindigul', districtEn: 'Dindigul', districtTa: 'திண்டுக்கல்', lat: 10.2312, lng: 78.2341, type: 'Town' },

  // Thoothukudi District
  { id: 'thk-central', nameEn: 'Thoothukudi Port Area', nameTa: 'தூத்துக்குடி துறைமுக பகுதி', districtId: 'thoothukudi', districtEn: 'Thoothukudi', districtTa: 'தூத்துக்குடி', lat: 8.7642, lng: 78.1348, type: 'City' },
  { id: 'thk-kovilpatti', nameEn: 'Kovilpatti', nameTa: 'கோவில்பட்டி', districtId: 'thoothukudi', districtEn: 'Thoothukudi', districtTa: 'தூத்துக்குடி', lat: 9.1724, lng: 77.8685, type: 'City' },
  { id: 'thk-tiruchendur', nameEn: 'Tiruchendur', nameTa: 'திருச்செந்தூர்', districtId: 'thoothukudi', districtEn: 'Thoothukudi', districtTa: 'தூத்துக்குடி', lat: 8.4945, lng: 78.1215, type: 'City' },
  { id: 'thk-srivaikuntam', nameEn: 'Srivaikuntam', nameTa: 'ஸ்ரீவைகுண்டம்', districtId: 'thoothukudi', districtEn: 'Thoothukudi', districtTa: 'தூத்துக்குடி', lat: 8.6254, lng: 77.9095, type: 'Town' },

  // Kanyakumari District
  { id: 'kny-nagercoil', nameEn: 'Nagercoil', nameTa: 'நாகர்கோவில்', districtId: 'kanyakumari', districtEn: 'Kanyakumari', districtTa: 'கன்னியாகுமரி', lat: 8.1833, lng: 77.4119, type: 'City' },
  { id: 'kny-cape', nameEn: 'Kanyakumari Beach', nameTa: 'கன்னியாகுமரி கடற்கரை', districtId: 'kanyakumari', districtEn: 'Kanyakumari', districtTa: 'கன்னியாகுமரி', lat: 8.0883, lng: 77.5385, type: 'Town' },
  { id: 'kny-thuckalay', nameEn: 'Thuckalay', nameTa: 'தக்கலை', districtId: 'kanyakumari', districtEn: 'Kanyakumari', districtTa: 'கன்னியாகுமரி', lat: 8.2435, lng: 77.3184, type: 'Town' },
  { id: 'kny-marthandam', nameEn: 'Marthandam', nameTa: 'மார்த்தாண்டம்', districtId: 'kanyakumari', districtEn: 'Kanyakumari', districtTa: 'கன்னியாகுமரி', lat: 8.3045, lng: 77.2285, type: 'Town' },

  // Karur District
  { id: 'kar-central', nameEn: 'Karur Bus Stand', nameTa: 'கரூர் பேருந்து நிலையம்', districtId: 'karur', districtEn: 'Karur', districtTa: 'கரூர்', lat: 10.9601, lng: 78.0766, type: 'City' },
  { id: 'kar-kulithalai', nameEn: 'Kulithalai', nameTa: 'குளித்தலை', districtId: 'karur', districtEn: 'Karur', districtTa: 'கரூர்', lat: 10.9325, lng: 78.4125, type: 'Town' },
  { id: 'kar-pugalur', nameEn: 'Pugalur', nameTa: 'புகழூர்', districtId: 'karur', districtEn: 'Karur', districtTa: 'கரூர்', lat: 11.0824, lng: 78.0045, type: 'Town' },

  // Krishnagiri District
  { id: 'kri-hosur', nameEn: 'Hosur', nameTa: 'ஓசூர்', districtId: 'krishnagiri', districtEn: 'Krishnagiri', districtTa: 'கிருஷ்ணகிரி', lat: 12.7409, lng: 77.8253, type: 'City' },
  { id: 'kri-central', nameEn: 'Krishnagiri Town', nameTa: 'கிருஷ்ணகிரி நகரம்', districtId: 'krishnagiri', districtEn: 'Krishnagiri', districtTa: 'கிருஷ்ணகிரி', lat: 12.5186, lng: 78.2137, type: 'City' },
  { id: 'kri-denkanikottai', nameEn: 'Denkanikottai', nameTa: 'தேன்கனிக்கோட்டை', districtId: 'krishnagiri', districtEn: 'Krishnagiri', districtTa: 'கிருஷ்ணகிரி', lat: 12.5284, lng: 77.7845, type: 'Town' },

  // The Nilgiris District
  { id: 'nil-ooty', nameEn: 'Udhagamandalam (Ooty)', nameTa: 'ஊட்டி', districtId: 'nilgiris', districtEn: 'The Nilgiris', districtTa: 'நீலகிரி', lat: 11.4102, lng: 76.6950, type: 'City' },
  { id: 'nil-coonoor', nameEn: 'Coonoor', nameTa: 'குன்னூர்', districtId: 'nilgiris', districtEn: 'The Nilgiris', districtTa: 'நீலகிரி', lat: 11.3530, lng: 76.7959, type: 'City' },
  { id: 'nil-kotagiri', nameEn: 'Kotagiri', nameTa: 'கோத்தகிரி', districtId: 'nilgiris', districtEn: 'The Nilgiris', districtTa: 'நீலகிரி', lat: 11.4325, lng: 76.8624, type: 'Town' },

  // Kanchipuram District
  { id: 'kpm-central', nameEn: 'Kanchipuram Silk Town', nameTa: 'காஞ்சிபுரம் பட்டு நகரம்', districtId: 'kanchipuram', districtEn: 'Kanchipuram', districtTa: 'காஞ்சிபுரம்', lat: 12.8342, lng: 79.7036, type: 'City' },
  { id: 'kpm-sriperumbudur', nameEn: 'Sriperumbudur', nameTa: 'ஸ்ரீபெரும்புதூர்', districtId: 'kanchipuram', districtEn: 'Kanchipuram', districtTa: 'காஞ்சிபுரம்', lat: 12.9684, lng: 79.9485, type: 'Town' },
  { id: 'kpm-walajabad', nameEn: 'Walajabad', nameTa: 'வாலாஜாபாத்', districtId: 'kanchipuram', districtEn: 'Kanchipuram', districtTa: 'காஞ்சிபுரம்', lat: 12.8024, lng: 79.8245, type: 'Town' },

  // Chengalpattu District
  { id: 'cpt-central', nameEn: 'Chengalpattu Town', nameTa: 'செங்கல்பட்டு நகரம்', districtId: 'chengalpattu', districtEn: 'Chengalpattu', districtTa: 'செங்கல்பட்டு', lat: 12.6841, lng: 79.9836, type: 'City' },
  { id: 'cpt-tambaram', nameEn: 'Tambaram', nameTa: 'தாம்பரம்', districtId: 'chengalpattu', districtEn: 'Chengalpattu', districtTa: 'செங்கல்பட்டு', lat: 12.9249, lng: 80.1000, type: 'City' },
  { id: 'cpt-mamallapuram', nameEn: 'Mamallapuram', nameTa: 'மாமல்லபுரம்', districtId: 'chengalpattu', districtEn: 'Chengalpattu', districtTa: 'செங்கல்பட்டு', lat: 12.6269, lng: 80.1927, type: 'Town' },

  // Ramanathapuram District
  { id: 'rmd-rameswaram', nameEn: 'Rameswaram', nameTa: 'ராமேஸ்வரம்', districtId: 'ramanathapuram', districtEn: 'Ramanathapuram', districtTa: 'ராமநாதபுரம்', lat: 9.2876, lng: 79.3129, type: 'City' },
  { id: 'rmd-central', nameEn: 'Ramanathapuram Town', nameTa: 'ராமநாதபுரம் நகரம்', districtId: 'ramanathapuram', districtEn: 'Ramanathapuram', districtTa: 'ராமநாதபுரம்', lat: 9.3639, lng: 78.8395, type: 'City' },
  { id: 'rmd-paramakudi', nameEn: 'Paramakudi', nameTa: 'பரமக்குடி', districtId: 'ramanathapuram', districtEn: 'Ramanathapuram', districtTa: 'ராமநாதபுரம்', lat: 9.5442, lng: 78.5874, type: 'City' },
  { id: 'rmd-dhanushkodi', nameEn: 'Dhanushkodi Village', nameTa: 'தனுஷ்கோடி கிராமம்', districtId: 'ramanathapuram', districtEn: 'Ramanathapuram', districtTa: 'ராமநாதபுரம்', lat: 9.1783, lng: 79.4184, type: 'Village' },

  // Remote Village in Tirunelveli/Tenkasi border (Used for "Too far" demo case)
  { id: 'rem-sundarapandiapuram', nameEn: 'Sundarapandiapuram Remote Village', nameTa: 'சுந்தரபாண்டியபுரம் கிராமம்', districtId: 'tenkasi', districtEn: 'Tenkasi', districtTa: 'தென்காசி', lat: 8.9834, lng: 77.2184, type: 'Village' },

  // Cuddalore & Others
  { id: 'cud-chidambaram', nameEn: 'Chidambaram', nameTa: 'சிதம்பரம்', districtId: 'cuddalore', districtEn: 'Cuddalore', districtTa: 'கடலூர்', lat: 11.3995, lng: 79.6934, type: 'City' },
  { id: 'cud-neyveli', nameEn: 'Neyveli', nameTa: 'நெய்வேலி', districtId: 'cuddalore', districtEn: 'Cuddalore', districtTa: 'கடலூர்', lat: 11.5934, lng: 79.4834, type: 'City' },
  { id: 'tvm-central', nameEn: 'Tiruvannamalai Girivalam', nameTa: 'திருவண்ணாமலை கிரிவலம்', districtId: 'tiruvannamalai', districtEn: 'Tiruvannamalai', districtTa: 'திருவண்ணாமலை', lat: 12.2253, lng: 79.0747, type: 'City' },
  { id: 'dharmapuri-central', nameEn: 'Dharmapuri Town', nameTa: 'தர்மபுரி நகரம்', districtId: 'dharmapuri', districtEn: 'Dharmapuri', districtTa: 'தர்மபுரி', lat: 12.1211, lng: 78.1582, type: 'City' },
  { id: 'namakkal-central', nameEn: 'Namakkal Fort', nameTa: 'நாமக்கல் கோட்டை', districtId: 'namakkal', districtEn: 'Namakkal', districtTa: 'நாமக்கல்', lat: 11.2189, lng: 78.1674, type: 'City' },
  { id: 'virudhunagar-sivakasi', nameEn: 'Sivakasi', nameTa: 'சிவகாசி', districtId: 'virudhunagar', districtEn: 'Virudhunagar', districtTa: 'விருதுநகர்', lat: 9.4534, lng: 77.7984, type: 'City' },
  { id: 'theni-bodinayakanur', nameEn: 'Bodinayakanur', nameTa: 'போடிநாயக்கனூர்', districtId: 'theni', districtEn: 'Theni', districtTa: 'தேனி', lat: 10.0125, lng: 77.3485, type: 'Town' },
];

/**
 * Calculates distance between two points in km
 */
function distKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the nearest known Tamil Nadu place to given coordinates
 */
export function findNearestPlace(lat: number, lng: number): Place {
  let best = TN_PLACES[0];
  let minD = Infinity;
  for (const place of TN_PLACES) {
    const d = distKm(lat, lng, place.lat, place.lng);
    if (d < minD) {
      minD = d;
      best = place;
    }
  }
  return best;
}

/**
 * Searches places by name or district
 */
export function searchPlaces(query: string, lang: 'en' | 'ta' = 'en'): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return TN_PLACES.slice(0, 20);
  return TN_PLACES.filter(
    (p) =>
      p.nameEn.toLowerCase().includes(q) ||
      p.nameTa.includes(q) ||
      p.districtEn.toLowerCase().includes(q) ||
      p.districtTa.includes(q)
  );
}
