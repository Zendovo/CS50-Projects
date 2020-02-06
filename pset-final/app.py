import os
import re

from cs50 import SQL
from flask import Flask, flash, jsonify, redirect, render_template, request, session
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.exceptions import default_exceptions, HTTPException, InternalServerError
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, camelFormat
from schedule import mergeBounds, mergeSchedules, getFreeTimes

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
app.jinja_env.filters["camelFormat"] = camelFormat

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


# Just some variables
BRAND_NAME = "Zeduler"


@app.route("/", methods=["POST", "GET"])
def index():
    """Landing Page"""
    
    return render_template("landing.html", brandName=BRAND_NAME)


@app.route("/main", methods=["POST", "GET"])
def main():
    """Main page"""

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Putting in a try except to catch any error
        try:

            length = int(request.form.get('length'))
            duration = int(request.form.get('duration'))

            inputStrings = []

            i = 0
            while i < length:
                inputStrings.append(request.form.get('code-' + str(i)))
                print('code-' + str(i), ':', request.form.get('code-' + str(i)))
                i += 1

            data = []

            filledSlotsCount = 1
            for code in inputStrings:
                
                if code is None or code == '':
                    continue

                a = code.split('-')

                info = {
                    'schedule': eval(a[0]),
                    'bounds': eval(a[1])
                }
                data.append(info)

                filledSlotsCount += 1

            if filledSlotsCount < length:
                print('Form not filled!')
                return redirect('/main')

            sch = data[0]['schedule']
            bounds = data[0]['bounds']
            
            schNext = data[1]['schedule']
            boundsNext = data[1]['bounds']

            mergedBounds = mergeBounds(bounds, boundsNext)
            mergedSch = mergeSchedules(mergedBounds, sch, schNext)

            i = 0
            while i < len(data):
                
                if len(data) == 2:
                    break

                if i < 2:
                    i += 1
                    continue
                
                sch = data[i]['schedule']
                bounds = data[i]['bounds']

                mergedBounds = mergeBounds(bounds, mergedBounds)
                mergedSch = mergeSchedules(mergedBounds, sch, mergedSch)
                
                i += 1

            print(mergedSch)
            print(mergedBounds)

            freeTimings = getFreeTimes(mergedSch, duration, mergedBounds)

            mergedCode = str(mergedSch) + '-' + str(mergedBounds)

            return render_template("output.html", brandName=BRAND_NAME, timeSlots=freeTimings, duration=duration, mergedCode=mergedCode)
        
        except:

            # Flash 'Invalid code'
            flash("Invalid Code!", "danger")
            print('Bad request')
            return redirect('/main')

    else:
        
        return render_template("main.html", brandName=BRAND_NAME)


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