import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def model_fn(model_dir):
    """Load model from SageMaker model directory"""
    model_path = os.path.join(model_dir, 'model.joblib')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    return joblib.load(model_path)

def input_fn(input_data, content_type):
    """Parse input data payload"""
    if content_type == 'application/json':
        data = json.loads(input_data)
        df = pd.DataFrame([{
            'study_hours': float(data['studyHours']),
            'attendance': float(data['attendance']),
            'previous_grade': float(data['previousGrade']),
            'project_score': float(data['projectScore']),
            'quiz_average': float(data['quizAverage']),
            'study_group_hours': float(data['studyGroupHours']),
            'tutorial_attendance': float(data['tutorialAttendance']),
            'sleep_hours': float(data['sleepHours']),
            'stress_level': float(data['stressLevel']),
            'extracurricular_hours': float(data['extracurricularHours'])
        }])
        return df
    raise ValueError(f"Unsupported content type: {content_type}")

def predict_fn(data, model):
    """Make prediction with the model"""
    prediction = model.predict(data)
    return prediction.tolist()

if __name__ == '__main__':
    # Load training data
    training_path = '/opt/ml/input/data/training/training_data.csv'
    print(f"Loading data from {training_path}")
    
    df = pd.read_csv(training_path)
    print("Data loaded successfully")
    
    # Prepare features and target
    features = ['study_hours', 'attendance', 'previous_grade', 'project_score', 
                'quiz_average', 'study_group_hours', 'tutorial_attendance', 
                'sleep_hours', 'stress_level', 'extracurricular_hours']
    
    X = df[features]
    y = df['final_grade']
    
    print("Training model...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    print("Model training completed")
    
    # Save the model
    model_path = os.path.join('/opt/ml/model', 'model.joblib')
    print(f"Saving model to {model_path}")
    
    os.makedirs('/opt/ml/model', exist_ok=True)
    joblib.dump(model, model_path)
    print("Model saved successfully")