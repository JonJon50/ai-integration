from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/scrape', methods=['GET'])
def scrape():
    user_query = request.args.get('url')

    # Search query via DuckDuckGo
    search_url = f'https://html.duckduckgo.com/html/?q={user_query}'
    headers = {'User-Agent': 'Mozilla/5.0'}

    response = requests.get(search_url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')

    # Grab first result snippet for more relevant answer
    snippet = soup.find('a', class_='result__a')
    content = snippet.get_text(strip=True) if snippet else "No relevant information found."

    return jsonify({"response": content})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

