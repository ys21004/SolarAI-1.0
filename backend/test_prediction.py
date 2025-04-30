import requests
import json

# Sample solar panel data
test_data = {
    "DC_POWER": 95,
    "AC_POWER": 90,
    "AMBIENT_TEMPERATURE": 28,
    "MODULE_TEMPERATURE": 35,
    "IRRADIATION": 800
}

# Make prediction request
response = requests.post(
    "http://localhost:5001/api/maintenance/predict",
    json=test_data
)

# Print response
print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2)) 