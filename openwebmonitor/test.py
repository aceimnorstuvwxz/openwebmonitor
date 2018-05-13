import requests

url = "https://codeahoy.com/"

headers = {
    'user-agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
    'accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    # 'cache-control': "no-cache"
    }

response = requests.request("GET", url, headers=headers)

print(response.text)
print response