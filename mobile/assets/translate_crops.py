import json
import os
import requests
import time

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "your_groq_api_key_here")

def translate_to_tamil(crop_names):
    prompt = f"""You are an expert translator. Translate the following English agricultural crop names into Tamil (written in Tamil script). Provide a simple JSON dictionary mapping the English name to its common Tamil name. If there is no exact Tamil name, write the transliteration.
Example: {{"Paddy": "நெல் (Nel)", "Carrot": "கேரட் (Carrot)"}}
DO NOT output anything other than valid JSON.

Crop names to translate:
{json.dumps(crop_names)}
"""
    try:
        res = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "temperature": 0.1
            },
            timeout=30
        )
        content = res.json()['choices'][0]['message']['content']
        return json.loads(content)
    except Exception as e:
        print(f"Error during translation: {e}")
        return {}

def main():
    json_path = "d:/Ervizhi/Ervizhi/assets/trade_data.json"
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Find items that need translation
    to_translate = []
    for item in data:
        if not item.get("tamil_name") and "(" not in item["crop"]:
            to_translate.append(item["crop"])
            
    # Remove duplicates
    to_translate = list(set(to_translate))
    print(f"Total unique crops to translate: {len(to_translate)}")
    
    # Translate in batches
    translations = {}
    batch_size = 50
    for i in range(0, len(to_translate), batch_size):
        batch = to_translate[i:i+batch_size]
        print(f"Translating batch {i//batch_size + 1}...")
        trans = translate_to_tamil(batch)
        translations.update(trans)
        time.sleep(2)
        
    print(f"Received {len(translations)} translations.")
    
    # Apply translations
    for item in data:
        if not item.get("tamil_name") and "(" not in item["crop"]:
            crop = item["crop"]
            if crop in translations:
                item["tamil_name"] = translations[crop]
                
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print("Done!")

if __name__ == "__main__":
    main()
