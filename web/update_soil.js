const fs = require('fs');
const file = 'd:/Ervizhi/web/constants/soilData.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{\s*"id":.*?"latitude":\s*[\d\.]+,\s*"longitude":\s*[\d\.]+\s*\}/gs, (match) => {
  if (match.includes('uniqueness')) return match;
  
  const distMatch = match.match(/"name":\s*"(.*?)"/);
  const dist = distMatch ? distMatch[1] : 'this region';
  const tMatch = match.match(/"tamilName":\s*"(.*?)"/);
  const tDist = tMatch ? tMatch[1] : 'இப்பகுதி';
  
  return match.slice(0, -1) + ',\n    "uniqueness": "Fertile agricultural zone in ' + dist + ' with immense potential for modern precision farming and traditional crop varieties.",\n    "uniquenessTamil": "' + tDist + 'யின் வளமான விவசாய பூமி, பாரம்பரிய மற்றும் நவீன வேளாண்மைக்கு உகந்தது.",\n    "heritage": "Rich agrarian history deeply connected to local farming communities and native soil wisdom.",\n    "heritageTamil": "உள்ளூர் உழவர் சமூகங்களுடனான ஆழமான பாரம்பரிய விவசாய தொடர்பு மற்றும் மண் சார்ந்த அறிவு."\n  }';
});

fs.writeFileSync(file, content);
console.log('Done!');
