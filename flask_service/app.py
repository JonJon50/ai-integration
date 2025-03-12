from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/scrape', methods=['GET'])
def scrape():
    user_query = request.args.get('url')
    
    # ✅ Handle Greetings Directly (No Scraping Required)
    greetings = ["hi", "hello", "hey"]
    if user_query.lower() in greetings:
        return jsonify({"response": "Hello! How can I assist you today?"})

    # ✅ Use DuckDuckGo for Search Query
    search_url = f'https://html.duckduckgo.com/html/?q={user_query}'
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')

        # ✅ Grab first meaningful result
        snippet = soup.find('a', class_='result__a')
        content = snippet.get_text(strip=True) if snippet else "No relevant information found."
        
        return jsonify({"response": content})
    
    except Exception as e:
        return jsonify({"error": "Failed to fetch results", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
