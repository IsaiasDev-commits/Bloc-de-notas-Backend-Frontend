# Notes Application

A simple Flask application to create and manage notes using SQLite as the database. This project includes both backend and frontend components.

## Features

- **Create Notes**: Allows users to create notes with a title and content.
- **View Notes**: Displays a list of all the notes stored in the database.

## Requirements
Flask==2.3.3
Flask-SQLAlchemy==3.0.5
Werkzeug==2.3.7

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/IsaiasDev-commits/Bloc-de-notas-Backend-Frontend.git
Navigate to the project folder: If you're working from your local machine
make sure to navigate to the directory where the project is located:
Create and activate a virtual environment
For Windows:
python -m venv venv
venv\Scripts\activate
For macOS/Linux:
python3 -m venv venv
source venv/bin/activate
Instalar las dependencias necesarias :
pip install -r requirements.txt
Running the Application
Run the Flask application:
python app.py
Access the application: Open your browser and go to http://127.0.0.1:5000 to view the application.
Endpoints
GET /notes: Retrieve all notes.

POST /notes: Create a new note. Requires JSON data with title and content
Screenshots:
<img width="1329" height="584" alt="image" src="https://github.com/user-attachments/assets/1f058b5c-1e85-440b-9803-9da9cf8fad77" />

