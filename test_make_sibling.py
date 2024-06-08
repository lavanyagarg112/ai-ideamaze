import requests
username = "user123"
user_query_id = "lA7pWhyUM"

url = "http://0.0.0.0:10000/make-sibling"

message_request = {
    "username": username, 
    "user_query_id": user_query_id
}

ans = requests.post(url, json=message_request)

print(ans.status_code)
print(ans.json())