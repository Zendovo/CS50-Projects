import os
import re
import requests
import urllib.parse

from flask import redirect, render_template, flash, request, session
from functools import wraps


def apology(message, code=400):
    """Render message as an apology to user."""
    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
        for old, new in [("-", "--"), (" ", "-"), ("_", "__"), ("?", "~q"),
                         ("%", "~p"), ("#", "~h"), ("/", "~s"), ("\"", "''")]:
            s = s.replace(old, new)
        return s
    flash(message, "warning")
    return render_template("apology.html", top=code, bottom=escape(message)), code


def login_required(f):
    """
    Decorate routes to require login.

    http://flask.pocoo.org/docs/1.0/patterns/viewdecorators/
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function


def lookup(symbol):
    """Look up quote for symbol."""

    # Contact API
    try:
        api_key = os.environ.get("API_KEY")
        response = requests.get(f"https://cloud-sse.iexapis.com/stable/stock/{urllib.parse.quote_plus(symbol)}/quote?token={api_key}")
        response.raise_for_status()
    except requests.RequestException:
        return None

    # Parse response
    try:
        quote = response.json()
        for key, value in quote.items():
            if value is None:
                quote[key] = "-"

        return {
            "name": quote["companyName"],
            "price": float(quote["latestPrice"]),
            "symbol": quote["symbol"],
            "previousClose": float(quote["previousClose"]),
            "changePercent": float(quote["changePercent"]),
            "marketCap": int(quote["marketCap"]),
            "peRatio": float(quote["peRatio"]),
            "week52High": float(quote["week52High"]),
            "week52Low": float(quote["week52Low"])
        }
    except (KeyError, TypeError, ValueError):
        return None


def usd(value):
    """Format value as USD."""

    try:
        value > 1
    except TypeError:
        return value
    else:
        return f"${value:,.2f}"

def camelFormat(value):
    """Format camelCase to Camel Case"""

    # this code is from https://stackoverflow.com/a/37697078
    splitted = re.sub('([A-Z][a-z]+)', r' \1', re.sub('([A-Z]+)', r' \1', value)).split()

    return " ".join(splitted).title()