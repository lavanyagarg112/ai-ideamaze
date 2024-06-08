import requests
id = '9w8zk7oE'
username = 'user123'

url = "http://0.0.0.0:10000/get-history"

message_request = {
    "username": username, 
    "id": id
}

ans = requests.post(url, json=message_request)

print(ans.status_code)
print(ans.json())