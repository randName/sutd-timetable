from flask import Flask
from flask_redis import FlaskRedis
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
rd = FlaskRedis(app, decode_responses=True)

from . import views, models # noqa
