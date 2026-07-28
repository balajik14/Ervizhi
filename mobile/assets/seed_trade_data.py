import json
import re

raw_data = """
*   **Agathi Keerai** (Hummingbird tree leaves) | Classification: Traditional Greens | Markets: Singapore, Malaysia, Sri Lanka | Demand: High
*   **Amaranthus** (Mulaikeerai, Sirukeerai, Thandukeerai) | Classification: Traditional Greens | Markets: Singapore, Malaysia, UAE | Demand: Very High
*   **Ash Gourd** (Sambal Poosanykai) | Classification: Gourds & Vines | Markets: UAE, Qatar, Saudi Arabia, USA (Frozen) | Demand: Moderate
*   **Beetroot** | Classification: Tubers & Root Vegetables | Markets: UAE, Kuwait, Singapore | Demand: Moderate
*   **Bitter Gourd** (Pavakkai) | Classification: Gourds & Vines | Markets: UAE, Oman, Qatar, USA (Frozen/Cut) | Demand: High
*   **Bottle Gourd** (Suraikai) | Classification: Gourds & Vines | Markets: UAE, Kuwait | Demand: Moderate
*   **Bok Choy / Pok Choy** | Classification: English Lettuces & Herbs | Markets: UAE, Singapore, Maldives | Demand: Moderate
*   **Broad Beans** (Avarakkai) | Classification: Bulb & Pod Vegetables | Markets: UAE, UK, Singapore | Demand: High
*   **Broccoli** | Classification: Cole & Exotic Crops | Markets: UAE, UK, Netherlands | Demand: Moderate
*   **Butterhead Lettuce** | Classification: English Lettuces & Herbs | Markets: UAE, Singapore, Germany | Demand: Low
*   **Cabbage** (Green & Red) | Classification: Cole & Exotic Crops | Markets: UAE, Qatar, Malaysia | Demand: High
*   **Capsicum / Bell Peppers** | Classification: Fruit Vegetables | Markets: UAE, Qatar, UK, Maldives | Demand: High
*   **Carrot** (Gajjara) | Classification: Tubers & Root Vegetables | Markets: UAE, Malaysia, Singapore | Demand: High
*   **Cauliflower** | Classification: Cole & Exotic Crops | Markets: UAE, Oman, Kuwait | Demand: High
*   **Celery Leaves** | Classification: English Lettuces & Herbs | Markets: UK, Netherlands, UAE | Demand: Low
*   **Chinese Cabbage** | Classification: English Lettuces & Herbs | Markets: Singapore, UAE | Demand: Low
*   **Chow Chow** (Chayote) | Classification: Cole & Exotic Crops | Markets: UAE, Malaysia | Demand: Moderate
*   **Cluster Beans** (Kothavarangai) | Classification: Bulb & Pod Vegetables | Markets: UAE, Saudi Arabia, UK | Demand: High
*   **Coriander** (Kothamalli) | Classification: Traditional Greens | Markets: UAE, Singapore, Malaysia, UK | Demand: Very High
*   **Cucumber** (Vellarikkai) | Classification: Gourds & Vines | Markets: UAE, Qatar, Oman | Demand: High
*   **Curry Leaves** (Karuveppilai) | Classification: Traditional Greens | Markets: UAE, Singapore, Malaysia, UK, Germany | Demand: Very High
*   **Drumstick / Annual Moringa** (Murungai) | Classification: Bulb & Pod Vegetables | Markets: UAE, Saudi Arabia, Singapore, Malaysia, USA | Demand: Very High
*   **Elephant Foot Yam** (Senai Kizhangu) | Classification: Tubers & Root Vegetables | Markets: USA, UK, Singapore, Malaysia | Demand: High
*   **Fenugreek Leaves** (Methi) | Classification: Traditional Greens | Markets: UAE, Qatar, Kuwait | Demand: Moderate
*   **French Beans** | Classification: Bulb & Pod Vegetables | Markets: UK, Netherlands, Germany, UAE | Demand: Very High
*   **Garlic** (Malai Poondu) | Classification: Bulb & Pod Vegetables | Markets: USA, Canada, UAE, Singapore | Demand: High
*   **Green Chilli** (Milagai) | Classification: Fruit Vegetables | Markets: UAE, Saudi Arabia, Qatar, UK, Germany | Demand: Very High
*   **Iceberg Lettuce** | Classification: English Lettuces & Herbs | Markets: UAE, Singapore, UK | Demand: High
*   **Ivy Gourd** (Kovakkai) | Classification: Gourds & Vines | Markets: UAE, Oman, Qatar | Demand: High
*   **Kale** | Classification: English Lettuces & Herbs | Markets: UK, Germany, Netherlands | Demand: Low
*   **Knol Khol** (Kohlrabi) | Classification: Cole & Exotic Crops | Markets: UAE, Kuwait | Demand: Low
*   **Leeks** | Classification: English Lettuces & Herbs | Markets: UK, UAE | Demand: Low
*   **Lollo Rosso** (Red leaf lettuce) | Classification: English Lettuces & Herbs | Markets: UAE, Singapore | Demand: Low
*   **Manathakkali Keerai** | Classification: Traditional Greens | Markets: Singapore, Malaysia | Demand: Moderate
*   **Okra / Bhendi** (Vendakkai) | Classification: Fruit Vegetables | Markets: UAE, Saudi Arabia, Qatar, UK, Germany | Demand: Very High
*   **Palak / Spinach** (Pasalaikeerai) | Classification: Traditional Greens | Markets: UAE, Kuwait, Oman | Demand: High
*   **Peas** | Classification: Bulb & Pod Vegetables | Markets: UK, Netherlands, UAE | Demand: High
*   **Ponnanganni Keerai** | Classification: Traditional Greens | Markets: Singapore, Malaysia | Demand: Moderate
*   **Potato** (Urulaikizhangu) | Classification: Tubers & Root Vegetables | Markets: UAE, Oman, Kuwait, Malaysia | Demand: Very High
*   **Radish** (Mullangi) | Classification: Tubers & Root Vegetables | Markets: UAE, Qatar | Demand: Moderate
*   **Ribbed Gourd** (Peerkangai) | Classification: Gourds & Vines | Markets: UAE, Qatar, Oman | Demand: High
*   **Romaine Lettuce** | Classification: English Lettuces & Herbs | Markets: UAE, Singapore, Maldives | Demand: Moderate
*   **Small Onion / Shallots** (Sambar Vengayam) | Classification: Bulb & Pod Vegetables | Markets: Malaysia, Singapore, Sri Lanka, UAE, Indonesia | Demand: Very High
*   **Large Onion** (Bellary Vengayam) | Classification: Bulb & Pod Vegetables | Markets: UAE, Saudi Arabia, Kuwait, Malaysia | Demand: Very High
*   **Snake Gourd** (Pudalangai) | Classification: Gourds & Vines | Markets: UAE, Oman, Qatar, Canada (Frozen) | Demand: High
*   **Sweet Potato** | Classification: Tubers & Root Vegetables | Markets: UAE, Canada | Demand: Moderate
*   **Tapioca** (Maravalli Kizhangu) | Classification: Tubers & Root Vegetables | Markets: Indonesia, Vietnam, USA, UAE | Demand: Very High
*   **Tomato** (Thakkali) | Classification: Fruit Vegetables | Markets: UAE, Saudi Arabia, Oman, Qatar, Maldives | Demand: Very High
*   **Water Clover** (Aaraikeerai) | Classification: Traditional Greens | Markets: Singapore | Demand: Low
*   **Zucchini** (Green & Yellow) | Classification: Cole & Exotic Crops | Markets: UAE, Maldives | Demand: Moderate
"""

season_map = {
    "Traditional Greens": "Year-round",
    "Gourds & Vines": "Summer/Kharif",
    "Tubers & Root Vegetables": "Winter/Rabi",
    "English Lettuces & Herbs": "Winter",
    "Cole & Exotic Crops": "Winter/Rabi",
    "Bulb & Pod Vegetables": "Rabi/Year-round",
    "Fruit Vegetables": "Kharif/Rabi"
}

lines = raw_data.strip().split('\n')
new_items = []

for line in lines:
    if not line.strip().startswith('*'): continue
    
    # Extract parts
    match = re.match(r'\*\s+\*\*(.*?)\*\*(?:\s+\((.*?)\))?\s+\|\s+Classification:\s+(.*?)\s+\|\s+Markets:\s+(.*?)\s+\|\s+Demand:\s+(.*)', line)
    if not match:
        continue
    
    crop_main = match.group(1).strip()
    regional_name = match.group(2).strip() if match.group(2) else ""
    classification = match.group(3).strip()
    markets = match.group(4).strip()
    demand = match.group(5).strip()
    
    # determine season
    season = season_map.get(classification, "Year-round")
    
    # form crop name with regional attached
    full_crop = f"{crop_main} ({regional_name})" if regional_name else crop_main
    
    item = {
        "crop": full_crop,
        "seasonality": season,
        "demand": demand,
        "country": markets,
        "driver": f"Export demand from {markets}. Classification: {classification}",
        "classification": classification,
        "tamil_name": regional_name
    }
    new_items.append(item)

# Read existing JSON
json_path = "d:/Ervizhi/Ervizhi/assets/trade_data.json"
with open(json_path, 'r', encoding='utf-8') as f:
    existing_data = json.load(f)

# Keep track of existing crop names
existing_crops = [x['crop'].lower() for x in existing_data]

added = 0
for ni in new_items:
    crop_lower = ni['crop'].split('(')[0].strip().lower()
    # Check if already exists in some form
    found = any(crop_lower in ec for ec in existing_crops)
    if not found:
        existing_data.append(ni)
        added += 1

print(f"Added {added} new crops to trade_data.json")

# Add the structure fields (classification, tamil_name) to existing items if not present
for item in existing_data:
    if "classification" not in item:
        item["classification"] = "General"
    if "tamil_name" not in item:
        item["tamil_name"] = ""

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(existing_data, f, indent=2, ensure_ascii=False)

