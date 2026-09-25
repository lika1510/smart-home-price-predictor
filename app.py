import os
from flask import Flask, render_template, request, jsonify
from r_engine import run_all_4_algorithms

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    results = run_all_4_algorithms(data)
    return jsonify(results)

@app.route('/api/code')
def code():
    script_path = os.path.join(os.path.dirname(__file__), 'r_scripts', 'algorithms.R')
    with open(script_path, 'r') as f:
        r_code = f.read()
    return jsonify({'r_code': r_code})

if __name__ == '__main__':
    print("Starting Smart Home Price & Risk Predictor (Port 5050)...")
    app.run(host='0.0.0.0', port=5050, debug=True)
