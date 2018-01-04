from flask import Flask, Blueprint
from flask_redis import FlaskRedis
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
rd = FlaskRedis(app, decode_responses=True)
api = Blueprint('api', 'app.v2')

from . import views, models # noqa
from . import v2 # noqa

app.register_blueprint(api, url_prefix='/v2')
