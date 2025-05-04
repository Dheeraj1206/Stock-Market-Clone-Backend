from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import traceback
from datetime import datetime
import pytz
import json

app = Flask(__name__)
# Enable CORS for all routes and all origins
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": "*", "methods": "*"}})

def convert_to_ist(gmt_time):
    """
    Convert a datetime object from GMT to IST (Indian Standard Time).
    
    :param gmt_time: Date in GMT datetime object.
    :return: Converted date in IST (datetime object).
    """
    # If datetime is aware (has tzinfo), make it naive by removing the timezone
    if gmt_time.tzinfo is not None:
        gmt_time = gmt_time.replace(tzinfo=None)
    
    # Localize to GMT first, then convert to IST
    gmt_timezone = pytz.timezone('GMT')
    ist_timezone = pytz.timezone('Asia/Kolkata')

    # Localize the naive datetime to GMT
    gmt_time = gmt_timezone.localize(gmt_time)
    
    # Convert from GMT to IST
    ist_time = gmt_time.astimezone(ist_timezone)

    return ist_time

@app.errorhandler(500)
def handle_500_error(error):
    return jsonify({
        'error': 'Internal Server Error',
        'message': str(error),
        'stack': traceback.format_exc()
    }), 500

@app.route('/stock_data', methods=['GET'])  # Explicitly specify GET method
def stock_data():
    try:
        ticker = request.args.get('ticker')
        if not ticker:
            return jsonify({"error": "Ticker symbol is required"}), 400

        period = request.args.get('period', '1d')
        interval = request.args.get('interval', '1d')

        print(f"Fetching data for {ticker} with period={period} and interval={interval}")  # Debug log

        # Validate period and interval
        valid_periods = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', 'ytd', 'max']
        valid_intervals = ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo']

        if period not in valid_periods:
            return jsonify({"error": f"Invalid period. Must be one of: {valid_periods}"}), 400
        if interval not in valid_intervals:
            return jsonify({"error": f"Invalid interval. Must be one of: {valid_intervals}"}), 400

        # Fetch stock data
        stock = yf.Ticker(ticker)
        data = stock.history(period=period, interval=interval)

        if data.empty:
            print(f"No data found for ticker: {ticker}")
            return jsonify({"error": f"No data found for ticker: {ticker}"}), 404

        print(f"Retrieved {len(data)} data points for {ticker}")

        # Convert data to desired format
        formatted_data = []
        for index, row in data.iterrows():
            entry = {
                'Date': index.strftime("%Y-%m-%d %H:%M:%S"),
                'Open': float(row['Open']),
                'High': float(row['High']),
                'Low': float(row['Low']),
                'Close': float(row['Close']),
                'Volume': int(row['Volume']),
                'Converted_Date': convert_to_ist(index).strftime("%Y-%m-%d %H:%M:%S")
            }
            formatted_data.append(entry)
            
        # Log the latest data point for debugging
        if formatted_data:
            latest = formatted_data[-1]
            print(f"Latest data for {ticker}: Close={latest['Close']}, Date={latest['Converted_Date']}")
        
        return jsonify(formatted_data)

    except Exception as e:
        print(f"Error fetching stock data: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "error": "Failed to fetch stock data",
            "message": str(e)
        }), 500

@app.route('/search', methods=['GET'])
def search_stocks():
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({"error": "Search query is required"}), 400
        
        print(f"Searching for stocks matching: {query}")
        
        # Simple implementation using yfinance's search functionality
        # This is a basic search that just looks up a few pre-defined Indian stocks
        indian_stocks = [
            {"symbol": "RELIANCE.NS", "name": "Reliance Industries Ltd"},
            {"symbol": "TCS.NS", "name": "Tata Consultancy Services Ltd"},
            {"symbol": "INFY.NS", "name": "Infosys Ltd"},
            {"symbol": "HDFCBANK.NS", "name": "HDFC Bank Ltd"},
            {"symbol": "ICICIBANK.NS", "name": "ICICI Bank Ltd"},
            {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever Ltd"},
            {"symbol": "BAJFINANCE.NS", "name": "Bajaj Finance Ltd"},
            {"symbol": "SBIN.NS", "name": "State Bank of India"},
            {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel Ltd"},
            {"symbol": "ITC.NS", "name": "ITC Ltd"}
        ]
        
        # Filter stocks based on query
        results = [stock for stock in indian_stocks if query.lower() in stock["name"].lower() or query.lower() in stock["symbol"].lower()]
        
        return jsonify({"result": results})
    
    except Exception as e:
        print(f"Error searching stocks: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "error": "Failed to search stocks",
            "message": str(e)
        }), 500

# Debug route to check stock data directly
@app.route('/debug/<symbol>', methods=['GET'])
def debug_stock(symbol):
    try:
        # Special handling for indices
        is_index = symbol.startswith('^')
        
        stock = yf.Ticker(symbol)
        info = stock.info
        
        # For indices, we need a different approach as they don't have all the same fields
        if is_index:
            # Get the latest price from history data
            data = stock.history(period='1d')
            if not data.empty:
                latest_price = float(data['Close'].iloc[-1])
                previous_close = info.get('previousClose', latest_price)
                
                # Calculate percent change
                percent_change = ((latest_price - previous_close) / previous_close * 100) if previous_close else 0
                
                essential_info = {
                    'symbol': symbol,
                    'currentPrice': latest_price,
                    'previousClose': previous_close,
                    'open': float(data['Open'].iloc[-1]) if 'Open' in data else None,
                    'dayHigh': float(data['High'].iloc[-1]) if 'High' in data else None,
                    'dayLow': float(data['Low'].iloc[-1]) if 'Low' in data else None,
                    'regularMarketPrice': latest_price,
                    'regularMarketDayHigh': float(data['High'].iloc[-1]) if 'High' in data else None,
                    'regularMarketDayLow': float(data['Low'].iloc[-1]) if 'Low' in data else None,
                    'regularMarketOpen': float(data['Open'].iloc[-1]) if 'Open' in data else None,
                    'regularMarketVolume': int(data['Volume'].iloc[-1]) if 'Volume' in data else None,
                    'marketCap': None,  # Indices don't have market cap
                    'percentChange': percent_change
                }
            else:
                return jsonify({"error": f"No data found for index: {symbol}"}), 404
        else:
            # Return only essential info to avoid large response
            essential_info = {
                'symbol': symbol,
                'currentPrice': info.get('currentPrice', None),
                'previousClose': info.get('previousClose', None),
                'open': info.get('open', None),
                'dayHigh': info.get('dayHigh', None),
                'dayLow': info.get('dayLow', None),
                'regularMarketPrice': info.get('regularMarketPrice', None),
                'regularMarketDayHigh': info.get('regularMarketDayHigh', None),
                'regularMarketDayLow': info.get('regularMarketDayLow', None),
                'regularMarketOpen': info.get('regularMarketOpen', None),
                'regularMarketVolume': info.get('regularMarketVolume', None),
                'marketCap': info.get('marketCap', None),
            }
        
        print(f"Debug info for {symbol}: {json.dumps(essential_info, indent=2)}")
        return jsonify(essential_info)
        
    except Exception as e:
        print(f"Error in debug route: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "error": "Failed to fetch debug data",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Flask server on http://localhost:5001")  # Debug log
    app.run(debug=True, port=5001)
