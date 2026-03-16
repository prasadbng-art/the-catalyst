import pandas as pd
import numpy as np

# Set seed for reproducibility
np.random.seed(42)
n_employees = 2500

# 1. Generate Locations
locations = ['New York', 'London', 'San Francisco', 'Austin', 'Remote']
emp_locations = np.random.choice(locations, n_employees)

# 2. Generate Base Metrics (with a "London" outlier)
# London gets a -1.0 penalty on engagement to simulate a local issue
loc_modifier = np.array([-1.0 if loc == 'London' else 0.0 for loc in emp_locations])

engagement = np.clip(np.random.uniform(2.0, 5.0, n_employees) + loc_modifier, 1.0, 5.0)
manager_eff = np.clip(engagement + np.random.normal(0, 0.4, n_employees), 1.0, 5.0)
sentiment = np.clip((engagement / 5.0) + np.random.normal(0, 0.05, n_employees), 0.0, 1.0)

# 3. Calculate Attrition Risk Score
# Formula: Risk = ((5 - Engagement) * 15) + ((5 - Manager_Eff) * 10) + Noise
# This ensures that low engagement is the primary driver of high risk
base_risk = (5.0 - engagement) * 15 + (5.0 - manager_eff) * 10
noise = np.random.normal(0, 5, n_employees)
attrition_risk_score = np.clip(base_risk + noise, 0, 100).astype(int)

# 4. Assign Categorical Labels
def get_attrition_flag(score):
    if score > 82: return 'Left'
    if score > 65: return 'At-Risk'
    return 'Stayed'

def get_sentiment_band(score):
    if score > 0.75: return 'Positive'
    if score > 0.45: return 'Neutral'
    return 'Negative'

attrition_flag = [get_attrition_flag(s) for s in attrition_risk_score]
sentiment_band = [get_sentiment_band(s) for s in sentiment]

# 5. Compile and Save
df = pd.DataFrame({
    'employee_id': [f'EMP{i:04d}' for i in range(1, n_employees + 1)],
    'location': emp_locations,
    'attrition_flag': attrition_flag,
    'attrition_risk_score': attrition_risk_score,
    'sentiment_score': np.round(sentiment, 2),
    'sentiment_band': sentiment_band,
    'engagement_score': np.round(engagement, 1),
    'manager_effectiveness': np.round(manager_eff, 1)
})

df.to_csv('correlated_employee_data.csv', index=False)
print("File 'correlated_employee_data.csv' has been generated with regional outliers.")