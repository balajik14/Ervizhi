import pandas as pd
import json
import os

district_metadata = {
    "Ariyalur": {"tamilName": "அரியலூர்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "44%", "left": "72%"},
    "Chengalpattu": {"tamilName": "செங்கல்பட்டு", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "22%", "left": "80%"},
    "Chennai": {"tamilName": "சென்னை", "soil": "Sandy Soil", "soilTa": "மணல் மண்", "color": "#00897B", "hilly": False, "hillDetail": "", "top": "14%", "left": "84%"},
    "Coimbatore": {"tamilName": "கோயம்புத்தூர்", "soil": "Black Soil", "soilTa": "கரிசல் மண்", "color": "#2D2321", "hilly": True, "hillDetail": "Valparai / வால்பாறை", "top": "49%", "left": "29%"},
    "Cuddalore": {"tamilName": "கடலூர்", "soil": "Alluvial Soil", "soilTa": "வண்டல் மண்", "color": "#FFB300", "hilly": False, "hillDetail": "", "top": "38%", "left": "81%"},
    "Dharmapuri": {"tamilName": "தர்மபுரி", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "29%", "left": "49%"},
    "Dindigul": {"tamilName": "திண்டுக்கல்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": True, "hillDetail": "Kodaikanal / கொடைக்கானல்", "top": "56%", "left": "46%"},
    "Erode": {"tamilName": "ஈரோடு", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "39%", "left": "44%"},
    "Kallakurichi": {"tamilName": "கள்ளக்குறிச்சி", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "36%", "left": "67%"},
    "Kancheepuram": {"tamilName": "காஞ்சிபுரம்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "18%", "left": "74%"},
    "Kanniyakumari": {"tamilName": "கன்னியாகுமரி", "soil": "Alluvial Soil", "soilTa": "வண்டல் மண்", "color": "#FFB300", "hilly": False, "hillDetail": "", "top": "89%", "left": "38%"},
    "Karur": {"tamilName": "கரூர்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "48%", "left": "52%"},
    "Krishnagiri": {"tamilName": "கிருஷ்ணகிரி", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": True, "hillDetail": "Hosur & Thalli / ஓசூர் & தளி", "top": "22%", "left": "48%"},
    "Madurai": {"tamilName": "மதுரை", "soil": "Black Soil", "soilTa": "கரிசல் மண்", "color": "#2D2321", "hilly": False, "hillDetail": "", "top": "62%", "left": "51%"},
    "Mayiladuthurai": {"tamilName": "மயிலாடுதுறை", "soil": "Alluvial Soil", "soilTa": "வண்டல் மண்", "color": "#FFB300", "hilly": False, "hillDetail": "", "top": "44%", "left": "85%"},
    "Nagapattinam": {"tamilName": "நாகப்பட்டினம்", "soil": "Alluvial Soil", "soilTa": "வண்டல் மண்", "color": "#FFB300", "hilly": False, "hillDetail": "", "top": "49%", "left": "88%"},
    "Namakkal": {"tamilName": "நாமக்கல்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": True, "hillDetail": "Kolli Hills / கொல்லி மலை", "top": "45%", "left": "58%"},
    "Nilgiris": {"tamilName": "நீலகிரி", "soil": "Laterite Soil", "soilTa": "செம்பூரான் மண்", "color": "#D84315", "hilly": True, "hillDetail": "Ooty & Coonoor / ஊட்டி & குன்னூர்", "top": "39%", "left": "24%"},
    "Perambalur": {"tamilName": "பெரம்பலூர்", "soil": "Black Soil", "soilTa": "கரிசல் மண்", "color": "#2D2321", "hilly": False, "hillDetail": "", "top": "43%", "left": "66%"},
    "Pudukkottai": {"tamilName": "புதுக்கோட்டை", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "58%", "left": "69%"},
    "Ramanathapuram": {"tamilName": "இராமநாதபுரம்", "soil": "Sandy Soil", "soilTa": "மணல் மண்", "color": "#00897B", "hilly": False, "hillDetail": "", "top": "69%", "left": "71%"},
    "Ranipet": {"tamilName": "ராணிப்பேட்டை", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "16%", "left": "67%"},
    "Salem": {"tamilName": "சேலம்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": True, "hillDetail": "Yercaud / ஏற்காடு", "top": "38%", "left": "57%"},
    "Sivaganga": {"tamilName": "சிவகங்கை", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "62%", "left": "63%"},
    "Tenkasi": {"tamilName": "தென்காசி", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": True, "hillDetail": "Courtallam / குற்றாலம்", "top": "74%", "left": "37%"},
    "Thanjavur": {"tamilName": "தஞ்சாவூர்", "soil": "Alluvial Soil", "soilTa": "வண்டல் மண்", "color": "#FFB300", "hilly": False, "hillDetail": "", "top": "52%", "left": "76%"},
    "Theni": {"tamilName": "தேனி", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": True, "hillDetail": "Megamalai / மேகமலை", "top": "62%", "left": "36%"},
    "Thoothukudi": {"tamilName": "தூத்துக்குடி", "soil": "Black Soil", "soilTa": "கரிசல் மண்", "color": "#2D2321", "hilly": False, "hillDetail": "", "top": "77%", "left": "57%"},
    "Tiruchirappalli": {"tamilName": "திருச்சிராப்பள்ளி", "soil": "Alluvial Soil", "soilTa": "வண்டல் மண்", "color": "#FFB300", "hilly": False, "hillDetail": "", "top": "49%", "left": "64%"},
    "Tirunelveli": {"tamilName": "திருநெல்வேலி", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": True, "hillDetail": "Manjolai / மாஞ்சோலை", "top": "80%", "left": "42%"},
    "Tirupathur": {"tamilName": "திருப்பத்தூர்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": True, "hillDetail": "Yelagiri / ஏலகிரி", "top": "23%", "left": "58%"},
    "Tiruppur": {"tamilName": "திருப்பூர்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "48%", "left": "38%"},
    "Tiruvallur": {"tamilName": "திருவள்ளூர்", "soil": "Laterite Soil", "soilTa": "செம்பூரான் மண்", "color": "#D84315", "hilly": False, "hillDetail": "", "top": "12%", "left": "76%"},
    "Tiruvannamalai": {"tamilName": "திருவண்ணாமலை", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "26%", "left": "70%"},
    "Tiruvarur": {"tamilName": "திருவாரூர்", "soil": "Alluvial Soil", "soilTa": "வண்டல் மண்", "color": "#FFB300", "hilly": False, "hillDetail": "", "top": "53%", "left": "82%"},
    "Vellore": {"tamilName": "வேலூர்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "18%", "left": "60%"},
    "Villupuram": {"tamilName": "விழுப்புரம்", "soil": "Red Soil", "soilTa": "செம்மண்", "color": "#B71C1C", "hilly": False, "hillDetail": "", "top": "32%", "left": "76%"},
    "Virudhunagar": {"tamilName": "விருதுநகர்", "soil": "Black Soil", "soilTa": "கரிசல் மண்", "color": "#2D2321", "hilly": False, "hillDetail": "", "top": "68%", "left": "48%"},
}

try:
    df_soil = pd.read_excel('TN Soil Properties.xlsx')
    df_suggest = pd.read_excel('crop_suggestion.xlsx')
    df_merged = pd.merge(df_soil, df_suggest, left_on='Area', right_on='Constituency Name')
    
    # Aggregated stats per district
    district_groups = df_merged.groupby('District')
    
    districts_data = []
    
    for dist_name, group in district_groups:
        n_mean = float(group['N'].mean())
        p_mean = float(group['P'].mean())
        k_mean = float(group['K'].mean())
        
        # Get crops
        all_crops = []
        for c_col in ['Crop 1', 'Crop 2', 'Crop 3']:
            all_crops.extend(group[c_col].dropna().tolist())
            
        # Get top 3 unique crops in order of frequency
        crop_counts = pd.Series(all_crops).value_counts()
        top_crops = [str(c) for c in crop_counts.index if str(c).lower() != 'urban area'][:3]
        
        meta = district_metadata.get(dist_name, {
            "tamilName": dist_name,
            "soil": "Red Soil",
            "soilTa": "செம்மண்",
            "color": "#B71C1C",
            "hilly": False,
            "hillDetail": "",
            "top": "50%",
            "left": "50%"
        })
        
        districts_data.append({
            "id": dist_name.lower().replace(" ", "_").replace("(", "").replace(")", ""),
            "name": dist_name,
            "tamilName": meta["tamilName"],
            "soilType": meta["soil"],
            "soilTypeTamil": meta["soilTa"],
            "color": meta["color"],
            "isHillStation": meta["hilly"],
            "hillStationDetail": meta["hillDetail"],
            "N": round(n_mean, 1),
            "P": round(p_mean, 1),
            "K": round(k_mean, 1),
            "topCrops": top_crops,
            "top": meta["top"],
            "left": meta["left"]
        })
        
    # Write to soilData.ts
    os.makedirs('Ervizhi/constants', exist_ok=True)
    ts_content = f"""// This file is auto-generated by inspect_data.py
export interface DistrictSoilInfo {{
  id: string;
  name: string;
  tamilName: string;
  soilType: string;
  soilTypeTamil: string;
  color: string;
  isHillStation: boolean;
  hillStationDetail: string;
  N: number;
  P: number;
  K: number;
  topCrops: string[];
  top: string; // percentage string for map overlay
  left: string; // percentage string for map overlay
}}

export const DISTRICT_SOIL_DATA: DistrictSoilInfo[] = {json.dumps(districts_data, indent=2, ensure_ascii=False)};
"""
    with open('../mobile/constants/soilData.ts', 'w', encoding='utf-8') as f:
        f.write(ts_content)
    print("Generated soilData.ts successfully!")
except Exception as e:
    print(f"Error generating soilData.ts: {e}")






