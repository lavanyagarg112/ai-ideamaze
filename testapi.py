import requests

# Define the endpoint URL
url = "http://0.0.0.0:10000/send-message"

# Define the message request data
message_request_data = {
    "username": "user123",
    "old_id": "0",
    "query": "I want some ideas about making a maths learning app"
}

# Send the POST request
response = requests.post(url, json=message_request_data)

# Print the response
print(response.status_code)
print(response.json())
