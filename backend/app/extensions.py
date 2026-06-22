"""
Shared extension instances.
Initialized here (without an app) and bound to the app later in __init__.py
via .init_app(app). This avoids circular imports between models/routes.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
