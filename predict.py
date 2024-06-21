import tensorflow as tf
import numpy as np
from PIL import Image
import pandas as pd
import matplotlib.pyplot as plt
import supabase

model_path = 'save_model 2'
model=tf.keras.models.load_model(model_path)

infer = model.signatures["serving_default"]


def _preprocess_image(image_path):
    image = Image.open(image_path)
    image = image.resize((224, 224)) 
    image_array = np.array(image)
    image_array = image_array / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

def predict(supabase_client, img_location: str):
    input_image = _preprocess_image(img_location)
    input_tensor = tf.convert_to_tensor(input_image, dtype=tf.float32)
    output = infer(input_tensor)
    predictions = output['output_0']

    a=predictions[0]
    ind=np.argmax(a)
            
    return supabase_client.table("all_39").select("*").eq("id", ind - 1).execute().data[0]

if __name__ == '__main__':
    print(predict('image1.jpeg'))
    print(predict('image2.jpeg'))