import json
import urllib.request
import urllib.parse
import time
import os

filepath = r'd:\Ervizhi\web\app\_data\heritage_foods.json'

def translate_to_tamil(text):
    if not text:
        return text
    # Basic cleanup
    if text.startswith("உணவே மருந்து: "):
        text = text.replace("உணவே மருந்து: ", "")
    
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=" + urllib.parse.quote(text)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            translated_text = "".join([t[0] for t in result[0]])
            return translated_text
    except Exception as e:
        print(f"Error translating '{text}': {e}")
        return text

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    # Handle siddhaWisdom
    sw = item.get('siddhaWisdom', '')
    if "உணவே மருந்து: " in sw:
        en_sw = sw.replace("உணவே மருந்து: ", "").strip()
    else:
        en_sw = sw.strip()
    
    # Don't translate if already done
    if 'siddhaWisdomTamil' not in item:
        item['siddhaWisdomEnglish'] = en_sw
        ta_sw = translate_to_tamil(en_sw)
        item['siddhaWisdomTamil'] = "உணவே மருந்து: " + ta_sw
        time.sleep(0.5) # prevent rate limit
    
    # Handle healthImpact
    hi = item.get('comparison', {}).get('healthImpact', '')
    if hi and 'healthImpactTamil' not in item['comparison']:
        item['comparison']['healthImpactEnglish'] = hi
        item['comparison']['healthImpactTamil'] = translate_to_tamil(hi)
        time.sleep(0.5)
        
    # Handle modernAlternative
    ma = item.get('modernAlternative', '')
    if ma and 'modernAlternativeTamil' not in item:
        item['modernAlternativeEnglish'] = ma
        item['modernAlternativeTamil'] = translate_to_tamil(ma)
        time.sleep(0.5)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Translation completed successfully.")
