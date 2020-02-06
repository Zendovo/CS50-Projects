import os
import re

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd, camelFormat

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# Custom filter
app.jinja_env.filters["usd"] = usd
app.jinja_env.filters["camelFormat"] = camelFormat

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")

# Create history table if it does not exist
db.execute("""CREATE TABLE IF NOT EXISTS "history" (
        "id"    INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "timestamp" DATETIME DEFAULT CURRENT_TIMESTAMP,
        "username"      TEXT NOT NULL,
        "amount"        INTEGER,
        "symbol"        TEXT,
        "price" INTEGER,
        FOREIGN KEY("username") REFERENCES "users"("username")
);""")

# Make sure API key is set
if not os.environ.get("API_KEY"):
    raise RuntimeError("API_KEY not set")


@app.route("/", methods=["POST", "GET"])
@login_required
def index():
    """Show portfolio of stocks"""

    db = SQL("sqlite:///finance.db")

    user_id = session["user_id"]

    # Get username and current cash
    rows = db.execute("SELECT username, cash FROM users WHERE id=:userid", userid=user_id)

    if request.method == "POST":

        action = request.form.get("action")
        symbol = request.form.get("symbol")

        if action == "add":
            
            info = lookup(symbol)
            if info is None:
                flash("An error occured (INFO_NONE). Did you provide a valid symbol?", "danger")
                return redirect("/")
            
            stocks = db.execute("SELECT * FROM :username WHERE symbol=:symbol",
                             username=rows[0]["username"], symbol=symbol)

            # Check if the stock already exists
            if len(stocks) == 0:

                # If stock was not bought insert a new row
                db.execute("INSERT INTO ? (symbol, star) VALUES (?, ?)",
                            rows[0]["username"], symbol, 1)
            
            else:

                # If stock already existed update it
                db.execute("UPDATE :username SET star=1 WHERE symbol=:symbol", username=rows[0]["username"], symbol=symbol)

            return redirect("/")

        else:
            db.execute("UPDATE :username SET star=0 WHERE symbol=:symbol", username=rows[0]["username"], symbol=symbol)
            return redirect("/")

    else:
        
        # Get all stocks
        all_stocks = db.execute("SELECT symbol, count, star FROM :username", username=rows[0]["username"])

        total = 0 + rows[0]["cash"]

        stocks = []
        starred_stocks = []

        for stock in all_stocks:

            info = lookup(stock["symbol"])
            if info is None:
                flash("An error occured (INFO_NONE).", "danger")
                return redirect('/')

            if stock["count"] > 0:

                for key in ["name", "price", "previousClose", "changePercent"]:
                    stock[key] = info[key]
                stocks.append(stock)
                total += stock["price"] * stock["count"]

            if stock["star"] == 1:
                for key in ["name", "price", "previousClose", "changePercent"]:
                    stock[key] = info[key]
                starred_stocks.append(stock)

        return render_template("index.html", stocks=stocks, cash=rows[0]["cash"], total=total, starred_stocks=starred_stocks, str_stck_len=len(starred_stocks))


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock"""

    db = SQL("sqlite:///finance.db")

    if request.method == "POST":

        user_id = session["user_id"]
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        # Ensure symbol was submitted
        if not symbol:
            return apology("must provide symbol", 403)

        # Ensure shares was submitted
        elif not shares:
            return apology("must provide shares", 403)

        shares = int(shares)

        info = lookup(symbol)
        if info is None:
            flash("An error occured (INFO_NONE).", "danger")
            return redirect('/')

        # Check if symbol is invalid
        if info == None:
            return apology ("invalid symbol", 403)

        # Get current stock price
        price = info["price"]

        # Get cash, username from users table
        rows = db.execute("SELECT cash, username FROM users WHERE id=?", user_id)

        # Check if user has enough cash
        if (rows[0]["cash"] - (price * shares)) < 0:
            return apology("cash not found", 404)
        
        # Update the user cash
        db.execute("UPDATE users SET cash=? WHERE id=?",
                    rows[0]["cash"] - (price * shares),
                    user_id)

        # Insert the transaction into the history table
        db.execute("INSERT INTO history (username, amount, symbol, price) VALUES (?, ?, ?, ?)",
                    rows[0]["username"], shares, symbol, price)

        # Get users' current stocks
        stocks = db.execute("SELECT * FROM :username WHERE symbol=:symbol",
                             username=rows[0]["username"], symbol=symbol)

        # Check if the stock already exists
        if len(stocks) == 0:

            # If stock was not bought insert a new row
            db.execute("INSERT INTO ? (symbol, count) VALUES (?, ?)",
                        rows[0]["username"], symbol, shares)
        
        else:

            # If stock already existed update the amount
            db.execute("UPDATE ? SET count=? WHERE symbol=?",
                        rows[0]["username"], stocks[0]["count"] + shares, symbol)

        # Go back to homepage
        s = "s"
        if shares < 2:
            s = ""
        flash(f"Successfully bought {shares} {symbol} stock{s} worth {usd(price)} each.", "success")
        return redirect("/")

    else:
        return render_template("buy.html")


@app.route("/history")
@login_required
def history():
    """Show history of transactions"""

    db = SQL("sqlite:///finance.db")

    user_id = session["user_id"]

    rows = db.execute("SELECT username FROM users WHERE id=?", user_id)

    history = db.execute("SELECT * FROM history WHERE username=?", rows[0]["username"])

    return render_template("history.html", history=history)   


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    db = SQL("sqlite:///finance.db")

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        flash("Successfully logged in!", "success")
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    db = SQL("sqlite:///finance.db")

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    """Get stock quote."""

    db = SQL("sqlite:///finance.db")

    if request.method == "POST":

        symbol = request.form.get("symbol")

        # Ensure symbol was submitted
        if not symbol:
            return apology("must provide symbol", 403)

        info = lookup(symbol)
        if info is None:
            flash("An error occured (INFO_NONE). Did you provide a valid symbol?", "danger")
            return redirect('/')

        return render_template("quoted.html", 
                                info=info)

    else:
        return render_template("quote.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""

    db = SQL("sqlite:///finance.db")

    # User reached route via POST (that is by sumbitting the form)
    if request.method == "POST":

        username = request.form.get("username")
        password = request.form.get("password")

        # Ensure username was submitted
        if not username:
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not password:
            return apology("must provide password", 403)

        # Ensure passwords match
        elif password != request.form.get("cpassword"):
            return apology("passwords do not match", 403)

        if not check_complexity(password):
            flash("Password must contain at least 8 letters, numbers and symbols.", "warning")
            return render_template("register.html")

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=username)

        # Ensure username does not exist
        if len(rows) != 0:
            return apology("username already exists", 403)

        # Add user to the database
        db.execute("INSERT INTO users (username, hash) VALUES (:username, :hash)",
                    username=username, hash=generate_password_hash(password))

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = :username",
                          username=request.form.get("username"))

        # Create database for the user
        db.execute("""CREATE TABLE IF NOT EXISTS :username (
            "symbol"	TEXT NOT NULL UNIQUE,
            "count"	    INTEGER NOT NULL DEFAULT 0,
            "star"      INTEGER NOT NULL DEFAULT 0
            )""", username=rows[0]["username"])

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        flash("Successfully registered!", "success")
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("register.html")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""

    db = SQL("sqlite:///finance.db")

    user_id = session["user_id"]

    # Get cash, username from users table
    rows = db.execute("SELECT cash, username FROM users WHERE id=?", user_id)

    # Get users' current stocks
    stocks = db.execute("SELECT * FROM :username",
                        username=rows[0]["username"])

    if request.method == "POST":

        symbol = request.form.get("symbol")
        shares = int(request.form.get("shares"))

        # Ensure shares was submitted
        if not symbol:
            return apology("missing symbol", 403)

        # Ensure shares was submitted
        if not shares:
            return apology("must provide shares", 403)

        symbol_count = db.execute("SELECT count FROM :username WHERE symbol=:symbol",
                                    username=rows[0]["username"], symbol=symbol)

        if shares > (symbol_count[0]["count"]):
            return apology("not enough shares", 403)

        # Get stock info
        info = lookup(symbol)
        if info is None:
            flash("An error occured (INFO_NONE).", "danger")
            return redirect('/')

        # Check if symbol is invalid
        if info == None:
            return apology ("invalid symbol", 403)

        # Get current stock price
        price = info["price"]

        # Check if user has enough cash
        if (rows[0]["cash"] - (price * shares)) < 0:
            return apology("cash not found", 404)
        
        # Update the user cash
        db.execute("UPDATE users SET cash=? WHERE id=?",
                    rows[0]["cash"] + (price * shares),
                    user_id)

        # Insert the transaction into the history table
        db.execute("INSERT INTO history (username, amount, symbol, price) VALUES (?, ?, ?, ?)",
                    rows[0]["username"], -shares, symbol, price)

        # Update the current stock count
        db.execute("UPDATE ? SET count=? WHERE symbol=?",
                    rows[0]["username"], stocks[0]["count"] - shares, symbol)

        # Go back to homepage
        s = "s"
        if shares < 2:
            s = ""
        flash(f"Successfully sold {shares} {symbol} stock{s} worth {usd(price)} each.", "success")
        return redirect("/")

    else:
        return render_template("sell.html", stocks=stocks)


@app.route("/change_pass", methods=["GET", "POST"])
@login_required
def change_pass():
    """ Changes User's Password """

    db = SQL("sqlite:///finance.db")

    if request.method == "POST":

        password = request.form.get("password")
        new_pass = request.form.get("new_pass")
        cnew_pass = request.form.get("cnew_pass")

        # Ensure password was submitted
        if not password:
            return apology("missing symbol", 403)

        # Ensure new password was submitted
        if not new_pass:
            return apology("must provide shares", 403)

         # Ensure passwords match
        elif new_pass != cnew_pass:
            return apology("passwords do not match", 403)

        if not check_complexity(new_pass):
            flash("Password must contain at least 8 letters, numbers and symbols.", "warning")
            return render_template("change_pass.html")

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE id = :userid",
                          userid=session["user_id"])

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        db.execute("UPDATE users SET hash=:hash WHERE id=:userid",
                    hash=generate_password_hash(new_pass), userid=session["user_id"])
        
        flash("Successfully changed password", "success")
        return redirect("/")

    else:
        return render_template("change_pass.html")


def check_complexity(password):
    
    n = 0

    while True:
        if len(password) < 8:
            n = -1
            break
        elif not re.search("[a-z]", password):
            n = -1
            break
        elif not re.search("[A-Z]", password):
            n = -1
            break
        elif not re.search("[0-9]", password):
            n = -1
            break
        elif not re.search(r"[ !#$%&'()*+,-./[\\\]^_`{|}~"+r'"]', password):
            n = -1
            break
        else:
            n = 0
            return True
    
    if n == -1:
        return False
            


def errorhandler(e):
    """Handle error"""
    if not isinstance(e, HTTPException):
        e = InternalServerError()
    return apology(e.name, e.code)


# Listen for errors
for code in default_exceptions:
    app.errorhandler(code)(errorhandler)

if __name__ == "__main__":
    app.run(debug=True, threaded=True)