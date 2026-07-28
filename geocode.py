import json
import time
import urllib.request
import urllib.parse
import os

crop_file = r'd:\Ervizhi\mobile\assets\crop_suggestion.json'
with open(crop_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

coords_file = r'd:\Ervizhi\mobile\assets\constituency_coords.json'
if os.path.exists(coords_file):
    with open(coords_file, 'r', encoding='utf-8') as f:
        existing = json.load(f)
else:
    existing = {}

print(f"Total constituencies: {len(data)}")

for item in data:
    name = item.get('Constituency Name')
    if not name or name in existing:
        continue
    
    query = f"{name}, Tamil Nadu, India"
    url = "https://nominatim.openstreetmap.org/search?format=json&q=" + urllib.parse.quote(query)
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            if res:
                existing[name] = {
                    'lat': float(res[0]['lat']),
                    'lon': float(res[0]['lon'])
                }
                print(f"Found {name}: {existing[name]}")
            else:
                # Fallback to district if constituency not found
                district = item.get('District', '')
                d_query = f"{district}, Tamil Nadu, India"
                d_url = "https://nominatim.openstreetmap.org/search?format=json&q=" + urllib.parse.quote(d_query)
                d_req = urllib.request.Request(d_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                with urllib.request.urlopen(d_req) as d_response:
                    d_res = json.loads(d_response.read().decode())
                    if d_res:
                        existing[name] = {
                            'lat': float(d_res[0]['lat']),
                            'lon': float(d_res[0]['lon'])
                        }
                        print(f"Fallback {name} to {district}: {existing[name]}")
                    else:
                        print(f"Failed {name}")
    except Exception as e:
        print(f"Error {name}: {e}")
    
    # Save incrementally
    with open(coords_file, 'w', encoding='utf-8') as f:
        json.dump(existing, f, indent=2)
        
    time.sleep(1.1) # Respect Nominatim rate limit

print("Done geocoding.")
