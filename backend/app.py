import os
import json
import uuid
from datetime import datetime

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash

try:
    from dotenv import load_dotenv

    # Picks up backend/.env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
    # or a full DATABASE_URL) so real MySQL credentials don't have to be
    # hardcoded or exported by hand every time the server starts.
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))
except ImportError:
    pass

from extensions import db
from models import (
    Employee,
    AttendanceRecord,
    LeaveRequest,
    PayrollRecord,
    PerformanceReview,
    ScheduledMeeting,
    SystemNotification,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Database configuration — real SQL database (MySQL) by default, matching the
# original project's `ems` database. Override any piece via environment
# variables (e.g. in a .env file loaded by your process manager), or set
# DATABASE_URL directly to point at Postgres/another MySQL host/etc.
#   DB_HOST=localhost  DB_PORT=3306  DB_USER=root  DB_PASSWORD=root  DB_NAME=ems
# If MySQL can't be reached at startup, falls back to a local SQLite file
# (ems.db) so the app still runs, and prints a clear warning either way.
# ---------------------------------------------------------------------------
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "3306")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "root")
DB_NAME = os.environ.get("DB_NAME", "ems")

MYSQL_URI = os.environ.get(
    "DATABASE_URL",
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}",
)
SQLITE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'ems.db')}"


def _mysql_reachable(uri: str) -> bool:
    try:
        import pymysql

        # Connect without selecting a database first, then create it if missing
        # (mirrors what `ems_admin.sql` used to do by hand).
        conn = pymysql.connect(host=DB_HOST, port=int(DB_PORT), user=DB_USER, password=DB_PASSWORD, connect_timeout=2)
        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}`")
        conn.close()
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"[db] Could not reach MySQL at {DB_HOST}:{DB_PORT} ({exc}).")
        return False


if MYSQL_URI.startswith("mysql") and _mysql_reachable(MYSQL_URI):
    app.config["SQLALCHEMY_DATABASE_URI"] = MYSQL_URI
    print(f"[db] Using MySQL database '{DB_NAME}' at {DB_HOST}:{DB_PORT}")
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = SQLITE_URI
    print(f"[db] Falling back to local SQLite database at {SQLITE_URI}")

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB

CORS(app, resources={r"/api/*": {"origins": "*"}})
db.init_app(app)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def new_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:10]}"


# ---------------------------------------------------------------------------
# Generic helpers to keep each resource's CRUD block short
# ---------------------------------------------------------------------------

def register_crud(model, resource_name, id_prefix, before_save=None):
    """Registers GET(list)/POST(create)/PUT(bulk upsert-sync)/GET(one)/PUT|PATCH(update)/DELETE(one).

    `before_save(row_dict, is_new)` may mutate the incoming dict in place
    (e.g. to hash a plaintext password into a `password_hash` field, or
    default a password for brand-new rows) before it's applied to the model.
    It is called for creates AND updates.
    """

    list_endpoint = f"{resource_name}_list"
    item_endpoint = f"{resource_name}_item"

    def list_or_create():
        if request.method == "GET":
            q = model.query
            for key, value in request.args.items():
                if hasattr(model, key) and value != "":
                    q = q.filter(getattr(model, key) == value)
            items = q.all()
            return jsonify([i.to_dict() for i in items])

        if request.method == "POST":
            payload = dict(request.get_json(force=True) or {})
            if before_save:
                before_save(payload, True)
            if not payload.get("id"):
                payload["id"] = new_id(id_prefix)
            obj = model(**{k: v for k, v in payload.items() if hasattr(model, k)})
            db.session.add(obj)
            db.session.commit()
            return jsonify(obj.to_dict()), 201

        if request.method == "PUT":
            # Bulk sync: given the frontend's full in-memory array, upsert
            # every row by id (updating only the fields present in the
            # payload, so columns the frontend doesn't know about — like a
            # password hash — are left untouched) and delete any row that's
            # no longer present, so deletions made in the UI persist too.
            payload = request.get_json(force=True)
            if not isinstance(payload, list):
                return jsonify({"error": "Expected a JSON array for bulk sync"}), 400

            existing = {obj.id: obj for obj in model.query.all()}
            incoming_ids = set()

            for row in payload:
                row = dict(row)
                row_id = row.get("id") or new_id(id_prefix)
                row["id"] = row_id
                is_new = row_id not in existing
                if before_save:
                    before_save(row, is_new)
                incoming_ids.add(row_id)

                if not is_new:
                    obj = existing[row_id]
                    for k, v in row.items():
                        if hasattr(obj, k) and k != "id":
                            setattr(obj, k, v)
                else:
                    obj = model(**{k: v for k, v in row.items() if hasattr(model, k)})
                    db.session.add(obj)

            for old_id, obj in existing.items():
                if old_id not in incoming_ids:
                    db.session.delete(obj)

            db.session.commit()
            items = model.query.all()
            return jsonify([i.to_dict() for i in items])

    list_or_create.__name__ = list_endpoint
    app.add_url_rule(f"/api/{resource_name}", view_func=list_or_create, methods=["GET", "POST", "PUT"])

    def item(item_id):
        obj = model.query.get(item_id)
        if request.method == "GET":
            if not obj:
                return jsonify({"error": "Not found"}), 404
            return jsonify(obj.to_dict())

        if request.method == "PUT" or request.method == "PATCH":
            if not obj:
                return jsonify({"error": "Not found"}), 404
            payload = dict(request.get_json(force=True) or {})
            if before_save:
                before_save(payload, False)
            for k, v in payload.items():
                if hasattr(obj, k) and k != "id":
                    setattr(obj, k, v)
            db.session.commit()
            return jsonify(obj.to_dict())

        if request.method == "DELETE":
            if not obj:
                return jsonify({"error": "Not found"}), 404
            db.session.delete(obj)
            db.session.commit()
            return jsonify({"success": True})

    item.__name__ = item_endpoint
    app.add_url_rule(
        f"/api/{resource_name}/<string:item_id>",
        view_func=item,
        methods=["GET", "PUT", "PATCH", "DELETE"],
    )


def _employee_before_save(row: dict, is_new: bool):
    """Hash a plaintext `password` field into `password_hash` if provided.
    Brand-new employees created without an explicit password get a default
    one (`welcome123`) so they can still sign in; an admin/HR user can change
    it later via PATCH /api/employees/<id> with {"password": "..."}.
    """
    if "password" in row:
        raw = row.pop("password")
        if raw:
            row["password_hash"] = generate_password_hash(raw)
    elif is_new:
        row["password_hash"] = generate_password_hash("welcome123")


register_crud(Employee, "employees", "emp", before_save=_employee_before_save)
register_crud(AttendanceRecord, "attendance", "att")
register_crud(LeaveRequest, "leaves", "lv")
register_crud(PayrollRecord, "payroll", "pay")
register_crud(PerformanceReview, "performance", "perf")
register_crud(ScheduledMeeting, "meetings", "mtg")
register_crud(SystemNotification, "notifications", "ntf")


# ---------------------------------------------------------------------------
# Check-in / check-out — dedicated single-record endpoints (rather than
# routing through the bulk attendance "sync") so one employee punching in
# can never race with, or get overwritten by, another employee's or the
# admin's full-array sync landing at the same moment.
# ---------------------------------------------------------------------------

LATE_CUTOFF = "09:15 AM"


def _today_str():
    return datetime.now().strftime("%Y-%m-%d")


def _now_12h():
    return datetime.now().strftime("%I:%M %p")


@app.route("/api/attendance/check-in", methods=["POST"])
def attendance_check_in():
    payload = request.get_json(force=True) or {}
    employee_id = payload.get("employeeId")
    if not employee_id:
        return jsonify({"error": "employeeId is required"}), 400

    employee = Employee.query.filter_by(employeeId=employee_id).first()
    if not employee:
        return jsonify({"error": "Unknown employeeId"}), 404

    today = _today_str()
    record = AttendanceRecord.query.filter_by(employeeId=employee_id, date=today).first()
    now_time = _now_12h()
    status = "Late" if now_time > LATE_CUTOFF else "Present"

    if record:
        record.checkIn = now_time
        record.checkOut = None
        record.status = status
        record.totalHours = 0
    else:
        record = AttendanceRecord(
            id=new_id("att"),
            employeeId=employee_id,
            employeeName=employee.name,
            photo=employee.photo,
            date=today,
            checkIn=now_time,
            checkOut=None,
            status=status,
            totalHours=0,
            overtimeHours=0,
        )
        db.session.add(record)

    db.session.commit()
    return jsonify(record.to_dict())


@app.route("/api/attendance/check-out", methods=["POST"])
def attendance_check_out():
    payload = request.get_json(force=True) or {}
    employee_id = payload.get("employeeId")
    if not employee_id:
        return jsonify({"error": "employeeId is required"}), 400

    today = _today_str()
    record = AttendanceRecord.query.filter_by(employeeId=employee_id, date=today).first()
    if not record or not record.checkIn:
        return jsonify({"error": "No active check-in found for today"}), 400

    now_time = _now_12h()
    record.checkOut = now_time

    try:
        fmt = "%I:%M %p"
        started = datetime.strptime(record.checkIn, fmt)
        ended = datetime.strptime(now_time, fmt)
        hours = (ended - started).seconds / 3600
        record.totalHours = round(hours, 2)
        record.overtimeHours = round(max(0, hours - 8), 2)
    except ValueError:
        pass

    db.session.commit()
    return jsonify(record.to_dict())


# ---------------------------------------------------------------------------
# Auth (demo / role based, matches the frontend's role-switch login page)
# ---------------------------------------------------------------------------

@app.route("/api/auth/login", methods=["POST"])
def login():
    payload = request.get_json(force=True) or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    employee = Employee.query.filter(db.func.lower(Employee.email) == email).first()
    if not employee or not employee.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    if employee.status != "Active":
        return jsonify({"error": f"This account is {employee.status.lower()} and cannot sign in"}), 403

    return jsonify(
        {
            "token": uuid.uuid4().hex,
            "user": {
                "id": employee.id,
                "employeeId": employee.employeeId,
                "name": employee.name,
                "email": employee.email,
                "photo": employee.photo,
                "role": employee.role,
                "department": employee.department,
                "designation": employee.designation,
            },
        }
    )


@app.route("/api/auth/change-password", methods=["POST"])
def change_password():
    """Self-service password change, used by the Settings page. Requires the
    account's current password so one signed-in employee can't silently
    reset another's credentials just by knowing their employeeId."""
    payload = request.get_json(force=True) or {}
    employee_id = payload.get("employeeId")
    current_password = payload.get("currentPassword") or ""
    new_password = payload.get("newPassword") or ""

    if not employee_id or not current_password or not new_password:
        return jsonify({"error": "employeeId, currentPassword and newPassword are required"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    employee = Employee.query.filter_by(employeeId=employee_id).first()
    if not employee or not employee.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    employee.set_password(new_password)
    db.session.commit()
    return jsonify({"success": True})


@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    """Self-service password reset for a signed-out user on the Login page.

    There's no outbound email/SMTP set up in this project, so this doesn't
    send a reset link. Instead it verifies the account by email + employeeId
    and lets the user set a new password directly in one step. Errors are
    intentionally specific here (unlike a "we emailed you a link either way"
    flow) since this app has no email step to hide behind.
    """
    payload = request.get_json(force=True) or {}
    email = (payload.get("email") or "").strip().lower()
    employee_id = (payload.get("employeeId") or "").strip()
    new_password = payload.get("newPassword") or ""

    if not email or not employee_id or not new_password:
        return jsonify({"error": "email, employeeId and newPassword are required"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters"}), 400

    employee = Employee.query.filter_by(employeeId=employee_id).first()
    if not employee or (employee.email or "").strip().lower() != email:
        return jsonify({"error": "No account found matching that Employee ID and email"}), 404

    employee.set_password(new_password)
    db.session.commit()
    return jsonify({"success": True})


# ---------------------------------------------------------------------------
# Notification convenience endpoints
# ---------------------------------------------------------------------------

@app.route("/api/notifications/mark-all-read", methods=["POST"])
def mark_all_read():
    SystemNotification.query.update({SystemNotification.read: True})
    db.session.commit()
    return jsonify([n.to_dict() for n in SystemNotification.query.all()])


@app.route("/api/notifications/clear-all", methods=["POST", "DELETE"])
def clear_all_notifications():
    SystemNotification.query.delete()
    db.session.commit()
    return jsonify([])


# ---------------------------------------------------------------------------
# Leave approve / reject convenience endpoints
# ---------------------------------------------------------------------------

@app.route("/api/leaves/<string:leave_id>/approve", methods=["POST"])
def approve_leave(leave_id):
    leave = LeaveRequest.query.get_or_404(leave_id)
    leave.status = "Approved"
    payload = request.get_json(silent=True) or {}
    leave.managerApproval = payload.get("managerApproval", leave.managerApproval)
    leave.managerComments = payload.get("managerComments", leave.managerComments)
    db.session.commit()
    return jsonify(leave.to_dict())


@app.route("/api/leaves/<string:leave_id>/reject", methods=["POST"])
def reject_leave(leave_id):
    leave = LeaveRequest.query.get_or_404(leave_id)
    leave.status = "Rejected"
    payload = request.get_json(silent=True) or {}
    leave.managerApproval = payload.get("managerApproval", leave.managerApproval)
    leave.managerComments = payload.get("managerComments", leave.managerComments)
    db.session.commit()
    return jsonify(leave.to_dict())


# ---------------------------------------------------------------------------
# Payroll: mark as paid / process
# ---------------------------------------------------------------------------

@app.route("/api/payroll/<string:payroll_id>/mark-paid", methods=["POST"])
def mark_payroll_paid(payroll_id):
    record = PayrollRecord.query.get_or_404(payroll_id)
    record.paymentStatus = "Paid"
    payload = request.get_json(silent=True) or {}
    record.paymentDate = payload.get("paymentDate") or datetime.now().strftime("%Y-%m-%d")
    db.session.commit()
    return jsonify(record.to_dict())


# ---------------------------------------------------------------------------
# Photo upload (used by Add/Edit Employee and Settings pages)
# ---------------------------------------------------------------------------

@app.route("/api/upload", methods=["POST"])
def upload_photo():
    if "photo" not in request.files:
        return jsonify({"error": "No file part named 'photo'"}), 400
    file = request.files["photo"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid or missing file"}), 400
    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = secure_filename(f"{uuid.uuid4().hex}.{ext}")
    file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
    url = f"/uploads/{filename}"
    return jsonify({"url": url})


@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


# ---------------------------------------------------------------------------
# Dashboard aggregate stats (used by AdminDashboard)
# ---------------------------------------------------------------------------

@app.route("/api/dashboard/stats", methods=["GET"])
def dashboard_stats():
    total_employees = Employee.query.count()
    active_employees = Employee.query.filter_by(status="Active").count()
    on_leave = Employee.query.filter_by(status="On Leave").count()
    pending_leaves = LeaveRequest.query.filter_by(status="Pending").count()
    today = datetime.now().strftime("%Y-%m-%d")
    present_today = AttendanceRecord.query.filter_by(date=today, status="Present").count()
    upcoming_meetings = ScheduledMeeting.query.filter(ScheduledMeeting.status.in_(["Scheduled", "Live"])).count()
    department_counts = {}
    for emp in Employee.query.all():
        department_counts[emp.department] = department_counts.get(emp.department, 0) + 1

    return jsonify(
        {
            "totalEmployees": total_employees,
            "activeEmployees": active_employees,
            "onLeave": on_leave,
            "pendingLeaves": pending_leaves,
            "presentToday": present_today,
            "upcomingMeetings": upcoming_meetings,
            "departmentCounts": department_counts,
        }
    )


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


# ---------------------------------------------------------------------------
# DB bootstrap + demo seed data (idempotent)
# ---------------------------------------------------------------------------

DEMO_LOGIN_ACCOUNTS = [
    {
        "id": "emp-admin-demo",
        "employeeId": "ABC-ADMIN",
        "name": "Admin User",
        "email": "admin@admin.com",
        "phone": "+91 90000 00001",
        "role": "admin",
        "department": "Engineering",
        "designation": "System Administrator",
        "joiningDate": "2022-01-01",
        "salary": 250000,
        "bankAccount": "DEMO0000001",
        "pfNumber": "PF/DEMO/001",
        "photo": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250",
        "status": "Active",
        "performanceRating": 5.0,
        "manager": "Board of Directors",
        "location": "Mumbai HQ",
        "skills": ["Administration"],
        "password": "admin123",
    },
    {
        "id": "emp-hr-demo",
        "employeeId": "ABC-HR",
        "name": "HR User",
        "email": "hr@hr.com",
        "phone": "+91 90000 00002",
        "role": "hr",
        "department": "Human Resources",
        "designation": "HR Executive",
        "joiningDate": "2022-01-01",
        "salary": 150000,
        "bankAccount": "DEMO0000002",
        "pfNumber": "PF/DEMO/002",
        "photo": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250",
        "status": "Active",
        "performanceRating": 4.5,
        "manager": "Admin User",
        "location": "Mumbai HQ",
        "skills": ["Recruitment", "Employee Relations"],
        "password": "hr123",
    },
    {
        "id": "emp-manager-demo",
        "employeeId": "ABC-MANAGER",
        "name": "Manager User",
        "email": "manager@manager.com",
        "phone": "+91 90000 00003",
        "role": "manager",
        "department": "Engineering",
        "designation": "Team Manager",
        "joiningDate": "2022-01-01",
        "salary": 180000,
        "bankAccount": "DEMO0000003",
        "pfNumber": "PF/DEMO/003",
        "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
        "status": "Active",
        "performanceRating": 4.6,
        "manager": "Admin User",
        "location": "Bengaluru R&D",
        "skills": ["Team Leadership"],
        "password": "manager123",
    },
    {
        "id": "emp-employee-demo",
        "employeeId": "ABC-EMPLOYEE",
        "name": "Employee User",
        "email": "employee@employee.com",
        "phone": "+91 90000 00004",
        "role": "employee",
        "department": "Engineering",
        "designation": "Software Engineer",
        "joiningDate": "2023-01-01",
        "salary": 90000,
        "bankAccount": "DEMO0000004",
        "pfNumber": "PF/DEMO/004",
        "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
        "status": "Active",
        "performanceRating": 4.2,
        "manager": "Manager User",
        "location": "Bengaluru R&D",
        "skills": ["React", "Python"],
        "password": "employee123",
    },
]


def seed_database():
    if Employee.query.first():
        return  # already seeded

    seed_path = os.path.join(BASE_DIR, "mockdata.json")
    if os.path.exists(seed_path):
        with open(seed_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for row in data.get("INITIAL_EMPLOYEES", []):
            row = dict(row)
            raw_password = row.pop("password", "welcome123")
            emp = Employee(**{k: v for k, v in row.items() if hasattr(Employee, k)})
            emp.set_password(raw_password)
            db.session.add(emp)
        db.session.commit()  # employees must exist before dependent FK rows below

        for row in data.get("INITIAL_ATTENDANCE", []):
            db.session.add(AttendanceRecord(**{k: v for k, v in row.items() if hasattr(AttendanceRecord, k)}))
        for row in data.get("INITIAL_LEAVES", []):
            db.session.add(LeaveRequest(**{k: v for k, v in row.items() if hasattr(LeaveRequest, k)}))
        for row in data.get("INITIAL_PAYROLLS", []):
            db.session.add(PayrollRecord(**{k: v for k, v in row.items() if hasattr(PayrollRecord, k)}))
        for row in data.get("INITIAL_PERFORMANCE", []):
            db.session.add(PerformanceReview(**{k: v for k, v in row.items() if hasattr(PerformanceReview, k)}))
        for row in data.get("INITIAL_MEETINGS", []):
            db.session.add(ScheduledMeeting(**{k: v for k, v in row.items() if hasattr(ScheduledMeeting, k)}))
        for row in data.get("INITIAL_NOTIFICATIONS", []):
            db.session.add(SystemNotification(**{k: v for k, v in row.items() if hasattr(SystemNotification, k)}))

    # The four requested demo login accounts (one per role), always seeded
    # regardless of whether mockdata.json was found.
    for row in DEMO_LOGIN_ACCOUNTS:
        row = dict(row)
        raw_password = row.pop("password")
        emp = Employee(**{k: v for k, v in row.items() if hasattr(Employee, k)})
        emp.set_password(raw_password)
        db.session.add(emp)
    db.session.commit()


with app.app_context():
    db.create_all()
    seed_database()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
