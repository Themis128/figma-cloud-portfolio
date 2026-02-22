import json
from transformers import pipeline

generator = pipeline("text-generation", model="distilgpt2")

def lambda_handler(event, context):
    body = json.loads(event["body"])
    prompt = body.get("prompt", "")
    result = generator(prompt, max_length=128, num_return_sequences=1)
    return {
        "statusCode": 200,
        "body": json.dumps({"completion": result[0]["generated_text"]})
    }
