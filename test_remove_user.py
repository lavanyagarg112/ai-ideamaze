import requests
username = "user123"
user_query_id = "8qvrjFsaWG"

url = "http://0.0.0.0:10000/remove-user"

message_request = {
    "username": username, 
}

ans = requests.post(url, json=message_request)

print(ans.status_code)
print(ans.json())