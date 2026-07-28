import json
import os

filepath = r'd:\Ervizhi\web\app\_data\heritage_foods.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_crops = [
    {
        "id": "f_new_1",
        "englishName": "Mudakathan Keerai (Balloon Vine)",
        "tamilName": "முடக்கத்தான் கீரை",
        "modernAlternative": "Painkillers / Supplements",
        "siddhaWisdom": "உணவே மருந்து: Removes uric acid from joints, cures severe arthritis and joint pains.",
        "nutrientScore": 92,
        "waterSavings": 5,
        "profitMargin": "+60%",
        "marketDemand": "High",
        "riskLevel": "Low",
        "seasonalSuitability": {
          "Jan-Mar": "Best",
          "Apr-Jun": "Moderate",
          "Jul-Sep": "Good",
          "Oct-Dec": "Best"
        },
        "comparison": {
          "giIndex": { "ancient": 30, "modern": 0 },
          "fiber": { "ancient": 8, "modern": 0 },
          "healthImpact": "Significantly improves joint mobility and reduces inflammation."
        },
        "healthBenefitTags": ["Joint Pain", "Arthritis", "Anti-inflammatory"]
    },
    {
        "id": "f_new_2",
        "englishName": "Thoothuvalai (Purple Fruited Pea Eggplant)",
        "tamilName": "தூதுவளை",
        "modernAlternative": "Cough Syrups",
        "siddhaWisdom": "உணவே மருந்து: Powerful remedy for chronic cold, asthma, and respiratory blockages.",
        "nutrientScore": 94,
        "waterSavings": 4,
        "profitMargin": "+55%",
        "marketDemand": "Medium",
        "riskLevel": "Low",
        "seasonalSuitability": {
          "Jan-Mar": "Best",
          "Apr-Jun": "Good",
          "Jul-Sep": "Moderate",
          "Oct-Dec": "Best"
        },
        "comparison": {
          "giIndex": { "ancient": 25, "modern": 0 },
          "fiber": { "ancient": 7, "modern": 0 },
          "healthImpact": "Clears lungs and enhances respiratory function."
        },
        "healthBenefitTags": ["Asthma", "Cold", "Respiratory"]
    },
    {
        "id": "f_new_3",
        "englishName": "Panam Kizhangu (Palmyra Sprout)",
        "tamilName": "பனங்கிழங்கு",
        "modernAlternative": "Processed Fiber Foods",
        "siddhaWisdom": "உணவே மருந்து: Extremely high in fiber, cools the body, strengthens uterus.",
        "nutrientScore": 90,
        "waterSavings": 5,
        "profitMargin": "+70%",
        "marketDemand": "Rare",
        "riskLevel": "High",
        "seasonalSuitability": {
          "Jan-Mar": "Best",
          "Apr-Jun": "Rare",
          "Jul-Sep": "Rare",
          "Oct-Dec": "Rare"
        },
        "comparison": {
          "giIndex": { "ancient": 45, "modern": 80 },
          "fiber": { "ancient": 15, "modern": 2 },
          "healthImpact": "Relieves constipation instantly, provides long-lasting energy."
        },
        "healthBenefitTags": ["Fiber", "Cooling", "Uterus Strength"]
    },
    {
        "id": "f_new_4",
        "englishName": "Pirandai (Adam's Wrapper / Veldt Grape)",
        "tamilName": "பிரண்டை",
        "modernAlternative": "Calcium Supplements",
        "siddhaWisdom": "உணவே மருந்து: Connects broken bones, cures indigestion and piles.",
        "nutrientScore": 95,
        "waterSavings": 5,
        "profitMargin": "+50%",
        "marketDemand": "Medium",
        "riskLevel": "Low",
        "seasonalSuitability": {
          "Jan-Mar": "Good",
          "Apr-Jun": "Best",
          "Jul-Sep": "Good",
          "Oct-Dec": "Good"
        },
        "comparison": {
          "giIndex": { "ancient": 20, "modern": 0 },
          "fiber": { "ancient": 6, "modern": 0 },
          "healthImpact": "Rich in natural calcium and bone-healing compounds."
        },
        "healthBenefitTags": ["Bone Healing", "Calcium", "Digestion"]
    },
    {
        "id": "f_new_5",
        "englishName": "Siru Kizhangu (Chinese Potato)",
        "tamilName": "சிறுகிழங்கு",
        "modernAlternative": "Regular Potatoes",
        "siddhaWisdom": "உணவே மருந்து: Superior traditional tuber, does not increase blood sugar like regular potatoes.",
        "nutrientScore": 86,
        "waterSavings": 4,
        "profitMargin": "+45%",
        "marketDemand": "Rare",
        "riskLevel": "Medium",
        "seasonalSuitability": {
          "Jan-Mar": "Best",
          "Apr-Jun": "Rare",
          "Jul-Sep": "Rare",
          "Oct-Dec": "Good"
        },
        "comparison": {
          "giIndex": { "ancient": 55, "modern": 85 },
          "fiber": { "ancient": 4.5, "modern": 1.5 },
          "healthImpact": "Better glycemic control compared to modern tubers."
        },
        "healthBenefitTags": ["Tuber", "Low Sugar Spike"]
    },
    {
        "id": "f_new_6",
        "englishName": "Kichili Samba Rice",
        "tamilName": "கிச்சிலி சம்பா",
        "modernAlternative": "Polished White Rice",
        "siddhaWisdom": "உணவே மருந்து: Gives a unique shine to the skin, builds immunity and muscle strength.",
        "nutrientScore": 88,
        "waterSavings": 3,
        "profitMargin": "+40%",
        "marketDemand": "High",
        "riskLevel": "Low",
        "seasonalSuitability": {
          "Jan-Mar": "Good",
          "Apr-Jun": "Moderate",
          "Jul-Sep": "Best",
          "Oct-Dec": "Recommended"
        },
        "comparison": {
          "giIndex": { "ancient": 50, "modern": 73 },
          "fiber": { "ancient": 5, "modern": 0.5 },
          "healthImpact": "Easily digestible, strengthens body, good for glowing skin."
        },
        "healthBenefitTags": ["Skin Health", "Immunity"]
    }
]

# Add new crops if not already in data
existing_names = {d['englishName'] for d in data}
for c in new_crops:
    if c['englishName'] not in existing_names:
        data.append(c)

# Sort by availability (Market Demand)
# Very High -> High -> Medium -> Rare -> Very Rare
demand_order = {
    "Very High": 1,
    "High": 2,
    "Medium": 3,
    "Rare": 4,
    "Very Rare": 5
}

def get_demand_score(item):
    return demand_order.get(item.get("marketDemand", "Medium"), 3)

data_sorted = sorted(data, key=lambda x: (get_demand_score(x), x.get('riskLevel', 'Low')))

# Rewrite file
with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data_sorted, f, indent=2, ensure_ascii=False)

print("Updated and sorted heritage_foods.json successfully.")
