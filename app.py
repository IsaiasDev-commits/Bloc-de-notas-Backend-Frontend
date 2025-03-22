from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///notes.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/notes", methods=["POST"])
def create_note():
    data = request.json
    note = Note(title=data["title"], content=data["content"])
    db.session.add(note)
    db.session.commit()
    return jsonify({"message": "Nota creada"}), 201

@app.route("/notes", methods=["GET"])
def get_notes():
    notes = Note.query.all()
    return jsonify([{"id": n.id, "title": n.title, "content": n.content} for n in notes])

if __name__ == "__main__":
    with app.app_context():  # Asegura el contexto antes de crear la base de datos
        db.create_all()
    app.run(debug=True)
