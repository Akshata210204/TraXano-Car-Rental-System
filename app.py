from flask import Flask, request, session, jsonify, render_template
from flask_cors import CORS  # Import CORS
import random
import smtplib
import os  # Import the os module

app = Flask(__name__)

# Generate a strong secret key
secret_key = os.urandom(24).hex()
app.secret_key = secret_key  # Set the generated secret key

# Enable CORS for the entire app, specifically allowing requests from http://localhost
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost"}})

# Email credentials
EMAIL_USER = "abc@gmail.com"  # Replace with your actual email address
EMAIL_PASS = ""  # Replace with your actual app password

# Utility: Send OTP to email
def send_email_otp(email):
    otp = str(random.randint(100000, 999999))
    session['email_otp'] = otp
    session['email'] = email

    subject = "Traxano Email OTP"
    body = f"Your OTP is: {otp}. It is valid for 5 minutes."
    message = f"Subject: {subject}\n\n{body}"

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.sendmail(EMAIL_USER, email, message)
        server.quit()
        print(f"OTP sent to {email}")
        return True
    except smtplib.SMTPAuthenticationError:
        print("❌ SMTP Authentication Error. Check your email and app password.")
    except smtplib.SMTPException as e:
        print(f"❌ SMTP Error: {e}")
    except Exception as e:
        print(f"❌ Failed to send OTP: {e}")
    return False

# Route: Serve register page
@app.route("/register")
def register():
    return render_template("register.html")

# Route: Send email OTP
@app.route("/send-email-otp", methods=["POST"])
def send_email_otp_route():
    data = request.get_json()
    email = data.get("email")
    if send_email_otp(email):
        print(f"✅ OTP generated: {session.get('email_otp')} for email: {session.get('email')}")
        print(f"Session after sending: {session}")
        return jsonify({"success": True, "message": "OTP sent to your email!"})
    else:
        return jsonify({"success": False, "message": "Failed to send OTP."})

@app.route("/verify-email-otp", methods=["POST"])
def verify_email_otp():
    print(f"➡️ Verification request received. Session: {session}")
    data = request.get_json()
    user_otp = data.get("otp")
    stored_otp = session.get("email_otp")
    print(f"➡️ User OTP: '{user_otp}' (Type: {type(user_otp)})")
    print(f"➡️ Stored OTP: '{stored_otp}' (Type: {type(stored_otp)})")

    if stored_otp is None:
        print("⚠️ Error: 'email_otp' NOT FOUND in session during verification!")
        return jsonify({"success": False, "message": "No OTP found for verification."})

    if user_otp == stored_otp:
        session["email_verified"] = True
        print("✅ OTP VERIFIED successfully!")
        return jsonify({"success": True, "message": "OTP verified successfully!"})
    else:
        print("❌ OTP MISMATCH!")
        return jsonify({"success": False, "message": "Invalid OTP."})
    
if __name__ == "__main__":
    app.run(debug=True)
