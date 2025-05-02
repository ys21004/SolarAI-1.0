# SolarAI

SolarAI is an intelligent solar energy prediction and analysis platform that helps users understand and optimize their solar energy systems. The platform combines machine learning with real-time data analysis to provide accurate predictions and insights about solar energy production.

## Features

- Real-time solar energy production monitoring
- Machine learning-based energy production predictions
- Historical data analysis and visualization
- Weather integration for accurate forecasting
- User-friendly dashboard interface

## Project Structure

The project consists of two main components:

- **Frontend**: React-based web application
- **Backend**: Python-based API server with machine learning capabilities

## Prerequisites

- Python 3.x
- Node.js and npm
- Virtual environment (recommended)

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Backend Server

1. Make sure you're in the backend directory and your virtual environment is activated
2. Start the backend server:
   ```bash
   python3 src/app.py
   ```
   The backend server will run on http://localhost:5000

### Frontend Development Server

1. In a new terminal, navigate to the frontend directory
2. Start the development server:
   ```bash
   npm start
   ```
   The frontend will be available at http://localhost:3000

## Usage

1. Open your web browser and navigate to http://localhost:3000
2. The dashboard will display your solar system's current status and predictions
3. Use the navigation menu to access different features and analytics



