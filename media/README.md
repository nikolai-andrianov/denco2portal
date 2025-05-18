# README

Condensed setup for flask, based on [The Flask Mega-Tutorial](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world).

## Hello world

In `microblog`, create and activate a virtual environment called `venv`:
```
python -m venv venv
source venv/bin/activate
```
In `venv`, install `flask`
```
(venv) $ pip install flask
```

Create `app/__init__.py` with the following contents:
```
from flask import Flask

app = Flask(__name__)

from app import routes
```

Create `app/routes.py` with the following contents:
```
from app import app

@app.route('/')
@app.route('/index')
def index():
    return "Hello, World!"
```

Setting the `FLASK_APP` environment variable in `.flaskenv`:
```
export FLASK_APP=microblog.py
```

Set up a web server that is configured to forward requests to the Flask application instance in the module referenced by the `FLASK_APP` environment variable:
```
(venv) $ flask run
```

Open the web app at the address `http://127.0.0.1:5000` in the browser.

## Web forms

Install `Flask-WTF`:
```
(venv) $ pip install flask-wtf
```

## Databases 

Relational databases implement the relational query language SQL, and 

| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |

Install `Flask-WTF`:
```
(venv) $ pip install flask-sqlalchemy
```


