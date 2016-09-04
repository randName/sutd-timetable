from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.redis import FlaskRedis
from redis import StrictRedis


class DecodedRedis(StrictRedis):
    @classmethod
    def from_url(cls, url, db=None, **kwargs):
        kwargs['decode_responses'] = True
        return StrictRedis.from_url(url, db, **kwargs)


app = Flask(__name__)
app.config.from_object('config')
db = SQLAlchemy(app)
rd = FlaskRedis.from_custom_provider(DecodedRedis, app)

from app import views, models
