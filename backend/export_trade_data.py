import openpyxl
import json

wb = openpyxl.load_workbook('Crop Demand and Trade Data.xlsx')
ws = wb.active

data = []
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[0]:
        data.append({
            "crop": str(row[0]).strip(),
            "seasonality": str(row[1]).strip() if row[1] else "",
            "demand": str(row[2]).strip() if row[2] else "",
            "country": str(row[3]).strip() if row[3] else "",
            "driver": str(row[4]).strip() if row[4] else ""
        })

# Write to a JSON file the React app can read
with open('../mobile/assets/trade_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Exported {len(data)} crop entries to ../mobile/assets/trade_data.json")
