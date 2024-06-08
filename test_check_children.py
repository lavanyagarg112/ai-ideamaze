import requests
username = "user123"
user_query_id = "wfmaPuXSOA"

url = "http://0.0.0.0:10000/check-children"

message_request = {
    "username": username, 
    "id": user_query_id
}

ans = requests.post(url, json=message_request)

print(ans.status_code)
print(ans.json())