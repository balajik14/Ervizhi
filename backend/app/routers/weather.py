from fastapi import APIRouter, HTTPException, Query
import httpx
from app.core.config import settings

router = APIRouter()

@router.get("/alerts")
async def get_weather_alerts(district: str = Query(..., description="Tamil Nadu district name")):
    # In a real scenario, you'd map the district to lat/lon.
    # For now, we just pass the district as the city query parameter to OpenWeatherMap
    if not settings.OPENWEATHER_API_KEY or settings.OPENWEATHER_API_KEY == "your_openweather_key_here":
        # Mock response if API key is not set
        return {
            "district": district,
            "weather": "Rainy",
            "alert": "மழை 3 மணி நேரத்தில் எதிர்பார்க்கப்படுகிறது — நீர்ப்பாசனம் தவிர்க்கவும்",
            "english_alert": "Rain expected in 3 hours — avoid irrigation"
        }
        
    url = f"http://api.openweathermap.org/data/2.5/weather?q={district},IN&appid={settings.OPENWEATHER_API_KEY}&units=metric"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch weather data")
            
        data = response.json()
        weather_main = data.get("weather", [{}])[0].get("main", "")
        wind_speed = data.get("wind", {}).get("speed", 0)
        
        # Simple rule-based alerts based on live data
        alert = "Normal conditions. You can proceed with regular irrigation."
        if "Rain" in weather_main:
             alert = "மழை எதிர்பார்க்கப்படுகிறது — நீர்ப்பாசனம் தவிர்க்கவும் (Rain expected — avoid irrigation)"
        elif wind_speed > 10:
             alert = "High wind today — avoid foliar spray (அதிக காற்று — தெளிப்புகளை தவிர்க்கவும்)"
             
        return {
            "district": district,
            "temp": data.get("main", {}).get("temp"),
            "weather": weather_main,
            "alert": alert
        }
