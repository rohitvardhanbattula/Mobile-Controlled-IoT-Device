from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import supabase
import uuid
from twilio.rest import Client
from fastapi.middleware.cors import CORSMiddleware
from predict import model, predict
from dotenv import load_dotenv
import os

app = FastAPI()

TEMP_THRESHOLD_UB = 35  # Celsius
TEMP_THRESHOLD_LB = 20  # Celsius
HUMIDITY_THRESHOLD_UB = 80  # Percentage
HUMIDITY_THRESHOLD_LB = 50  # Percentage

load_dotenv()

# Twilio configuration
TWILIO_ACCOUNT_SID = os.environ["TWILIO_ACCOUNT_SID"]
TWILIO_AUTH_TOKEN = os.environ["TWILIO_AUTH_TOKEN"]
TWILIO_FROM_NUMBER = os.environ["TWILIO_AUTH_TOKEN"]
TWILIO_TO_NUMBER = os.environ["TWILIO_TO_NUMBER"]

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
origins = ['*', 'http://localhost:5173']

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
supabase_url = os.environ["SUPABASE_URL"]
supabase_key = os.environ["SUPABASE_KEY"]
supabase_client = supabase.create_client(supabase_url, supabase_key)

endpoint = os.environ["ENDPOINT"]

async def initialize_camera():
    try:
        # Hit the specified API
        response = requests.get(endpoint + "control?var=framesize&val=11")
        response.raise_for_status()  # Raise an exception for any error status codes
    except Exception as e:
        # If an error occurs during initialization, raise an HTTPException
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    # Initialize the camera when the server starts
    await initialize_camera()

@app.get("/get_image")
async def get_image():
    try:
        image_url = endpoint + "/photo.jpg"
        response = requests.get(image_url, stream=True)
        if response.status_code == 200:
            with open("./Frontend/Major-Project/image.jpeg", "wb") as f:
                f.write(response.content)

            img_name = str(uuid.uuid4())
            resp = supabase_client.storage.from_("leaf-images").upload(f"images/{img_name}.jpeg", "./Frontend/Major-Project/image.jpeg", {"content-type": "image/jpeg"})


            pred_res = predict(supabase_client, "./Frontend/Major-Project/image.jpeg")
            insert_data = {
                "image_name": img_name,
                "prediction": pred_res['disease_name']
            }
            res = supabase_client.table("prediction_table").insert(insert_data).execute()
            return pred_res

        else:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch image from URL")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
        

class SensorData(BaseModel):
    temperature: float
    humidity: float

@app.post("/sensor_data")
def receive_sensor_data(sensor_data: SensorData):
    try:
        if sensor_data.temperature > TEMP_THRESHOLD_UB or sensor_data.temperature < TEMP_THRESHOLD_LB or sensor_data.humidity > HUMIDITY_THRESHOLD_UB or sensor_data.humidity < HUMIDITY_THRESHOLD_LB:
            send_sms_notification(sensor_data.temperature, sensor_data.humidity)
        # Insert sensor data into SupaBase
        sensor_data = {
            "temperature": sensor_data.temperature,
            "humidity": sensor_data.humidity
        }
        supabase_client.table("sensor_data").insert(sensor_data).execute()
        return {"success": True, "message": "Sensor data received successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def send_sms_notification(temperature: float, humidity: float):
    message = f"Alert: Temperature {temperature}°C and humidity {humidity}% exceeded thresholds"
    twilio_client.messages.create(
        body=message,
        from_=TWILIO_FROM_NUMBER,
        to=TWILIO_TO_NUMBER
    )