from flask import Flask, request, jsonify, render_template, send_file
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import json
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///notes.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "tu-clave-secreta-super-segura-2024"
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max-limit

# Crear directorio de uploads si no existe
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default="General")
    color = db.Column(db.String(7), default="#3498db")  # Código hex color
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_pinned = db.Column(db.Boolean, default=False)
    tags = db.Column(db.String(300), default="")  # Tags separados por coma

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/notes", methods=["POST"])
def create_note():
    try:
        data = request.json
        note = Note(
            title=data.get("title", ""),
            content=data.get("content", ""),
            category=data.get("category", "General"),
            color=data.get("color", "#3498db"),
            is_pinned=data.get("is_pinned", False),
            tags=",".join(data.get("tags", []))
        )
        db.session.add(note)
        db.session.commit()
        return jsonify({
            "message": "✅ Nota creada exitosamente",
            "note": {
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "category": note.category,
                "color": note.color,
                "is_pinned": note.is_pinned,
                "tags": note.tags.split(",") if note.tags else [],
                "created_at": note.created_at.isoformat()
            }
        }), 201
    except Exception as e:
        return jsonify({"error": f"❌ Error al crear nota: {str(e)}"}), 500

@app.route("/notes", methods=["GET"])
def get_notes():
    try:
        category_filter = request.args.get('category', '')
        search_query = request.args.get('search', '')
        
        query = Note.query
        
        if category_filter and category_filter != 'Todos':
            query = query.filter_by(category=category_filter)
        
        if search_query:
            query = query.filter(
                (Note.title.ilike(f'%{search_query}%')) | 
                (Note.content.ilike(f'%{search_query}%')) |
                (Note.tags.ilike(f'%{search_query}%'))
            )
        
        # Ordenar por pinned primero, luego por fecha de actualización
        notes = query.order_by(Note.is_pinned.desc(), Note.updated_at.desc()).all()
        
        return jsonify([{
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "category": n.category,
            "color": n.color,
            "is_pinned": n.is_pinned,
            "tags": n.tags.split(",") if n.tags else [],
            "created_at": n.created_at.strftime("%d/%m/%Y %H:%M"),
            "updated_at": n.updated_at.strftime("%d/%m/%Y %H:%M")
        } for n in notes])
    except Exception as e:
        return jsonify({"error": f"Error al obtener notas: {str(e)}"}), 500

@app.route("/notes/<int:note_id>", methods=["PUT"])
def update_note(note_id):
    try:
        data = request.json
        note = Note.query.get_or_404(note_id)
        
        note.title = data.get("title", note.title)
        note.content = data.get("content", note.content)
        note.category = data.get("category", note.category)
        note.color = data.get("color", note.color)
        note.is_pinned = data.get("is_pinned", note.is_pinned)
        note.tags = ",".join(data.get("tags", []))
        
        db.session.commit()
        
        return jsonify({
            "message": "✅ Nota actualizada exitosamente",
            "note": {
                "id": note.id,
                "title": note.title,
                "content": note.content,
                "category": note.category,
                "color": note.color,
                "is_pinned": note.is_pinned,
                "tags": note.tags.split(",") if note.tags else []
            }
        })
    except Exception as e:
        return jsonify({"error": f"❌ Error al actualizar nota: {str(e)}"}), 500

@app.route("/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    try:
        note = Note.query.get_or_404(note_id)
        db.session.delete(note)
        db.session.commit()
        return jsonify({"message": "🗑️ Nota eliminada exitosamente"})
    except Exception as e:
        return jsonify({"error": f"❌ Error al eliminar nota: {str(e)}"}), 500

@app.route("/notes/categories", methods=["GET"])
def get_categories():
    try:
        categories = db.session.query(Note.category).distinct().all()
        categories = [cat[0] for cat in categories if cat[0]]
        return jsonify(categories)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/stats")
def get_stats():
    try:
        total_notes = Note.query.count()
        categories_count = db.session.query(Note.category, db.func.count(Note.id)).group_by(Note.category).all()
        pinned_notes = Note.query.filter_by(is_pinned=True).count()
        
        return jsonify({
            "total_notes": total_notes,
            "categories": dict(categories_count),
            "pinned_notes": pinned_notes
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Función para crear tablas al inicio
def create_tables():
    with app.app_context():
        db.create_all()
        print("✅ Tablas de la base de datos creadas exitosamente")

if __name__ == "__main__":
    create_tables()
    app.run(debug=True)