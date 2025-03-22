# Notes Application

A simple Flask application to create and manage notes using SQLite as the database. This project includes both backend and frontend components.

## Features

- **Create Notes**: Allows users to create notes with a title and content.
- **View Notes**: Displays a list of all the notes stored in the database.

## Requirements

- Python 3.x
- Flask
- Flask-SQLAlchemy

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
![image](https://github.com/user-attachments/assets/ed401d03-c385-4411-b975-e31a6c254741)
