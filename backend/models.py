from extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash


class Employee(db.Model):
    __tablename__ = "employees"
    id = db.Column(db.String(64), primary_key=True)
    employeeId = db.Column(db.String(64), unique=True, nullable=False)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    phone = db.Column(db.String(40))
    role = db.Column(db.String(20), default="employee")  # admin | hr | manager | employee
    department = db.Column(db.String(60))
    designation = db.Column(db.String(120))
    joiningDate = db.Column(db.String(20))
    salary = db.Column(db.Float, default=0)
    bankAccount = db.Column(db.String(60))
    pfNumber = db.Column(db.String(60))
    photo = db.Column(db.String(500))
    status = db.Column(db.String(20), default="Active")
    performanceRating = db.Column(db.Float, default=0)
    manager = db.Column(db.String(150))
    location = db.Column(db.String(120))
    skills = db.Column(db.JSON, default=list)
    password_hash = db.Column(db.String(255), default="")

    def set_password(self, raw_password: str):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, raw_password)

    def to_dict(self):
        return {
            "id": self.id,
            "employeeId": self.employeeId,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "department": self.department,
            "designation": self.designation,
            "joiningDate": self.joiningDate,
            "salary": self.salary,
            "bankAccount": self.bankAccount,
            "pfNumber": self.pfNumber,
            "photo": self.photo,
            "status": self.status,
            "performanceRating": self.performanceRating,
            "manager": self.manager,
            "location": self.location,
            "skills": self.skills or [],
        }


class AttendanceRecord(db.Model):
    __tablename__ = "attendance"
    id = db.Column(db.String(64), primary_key=True)
    employeeId = db.Column(db.String(64), db.ForeignKey("employees.employeeId"), nullable=False)
    employeeName = db.Column(db.String(150))
    photo = db.Column(db.String(500))
    date = db.Column(db.String(20))
    checkIn = db.Column(db.String(20))
    checkOut = db.Column(db.String(20))
    status = db.Column(db.String(20))  # Present | Absent | Late | On Leave | Half Day
    totalHours = db.Column(db.Float, default=0)
    overtimeHours = db.Column(db.Float, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "employeeId": self.employeeId,
            "employeeName": self.employeeName,
            "photo": self.photo,
            "date": self.date,
            "checkIn": self.checkIn,
            "checkOut": self.checkOut,
            "status": self.status,
            "totalHours": self.totalHours,
            "overtimeHours": self.overtimeHours,
        }


class LeaveRequest(db.Model):
    __tablename__ = "leaves"
    id = db.Column(db.String(64), primary_key=True)
    employeeId = db.Column(db.String(64), db.ForeignKey("employees.employeeId"), nullable=False)
    employeeName = db.Column(db.String(150))
    employeePhoto = db.Column(db.String(500))
    department = db.Column(db.String(60))
    leaveType = db.Column(db.String(40))
    startDate = db.Column(db.String(20))
    endDate = db.Column(db.String(20))
    days = db.Column(db.Integer, default=1)
    reason = db.Column(db.Text)
    status = db.Column(db.String(20), default="Pending")  # Approved | Pending | Rejected
    appliedDate = db.Column(db.String(20))
    managerApproval = db.Column(db.String(150))
    managerComments = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "employeeId": self.employeeId,
            "employeeName": self.employeeName,
            "employeePhoto": self.employeePhoto,
            "department": self.department,
            "leaveType": self.leaveType,
            "startDate": self.startDate,
            "endDate": self.endDate,
            "days": self.days,
            "reason": self.reason,
            "status": self.status,
            "appliedDate": self.appliedDate,
            "managerApproval": self.managerApproval,
            "managerComments": self.managerComments,
        }


class PayrollRecord(db.Model):
    __tablename__ = "payrolls"
    id = db.Column(db.String(64), primary_key=True)
    employeeId = db.Column(db.String(64), db.ForeignKey("employees.employeeId"), nullable=False)
    employeeName = db.Column(db.String(150))
    employeePhoto = db.Column(db.String(500))
    designation = db.Column(db.String(120))
    department = db.Column(db.String(60))
    month = db.Column(db.String(20))
    year = db.Column(db.Integer)
    baseSalary = db.Column(db.Float, default=0)
    allowances = db.Column(db.JSON, default=dict)
    deductions = db.Column(db.JSON, default=dict)
    bonus = db.Column(db.Float, default=0)
    netSalary = db.Column(db.Float, default=0)
    paymentStatus = db.Column(db.String(20), default="Pending")  # Paid | Processing | Pending
    paymentDate = db.Column(db.String(20))
    bankName = db.Column(db.String(80))
    accountNumber = db.Column(db.String(60))

    def to_dict(self):
        return {
            "id": self.id,
            "employeeId": self.employeeId,
            "employeeName": self.employeeName,
            "employeePhoto": self.employeePhoto,
            "designation": self.designation,
            "department": self.department,
            "month": self.month,
            "year": self.year,
            "baseSalary": self.baseSalary,
            "allowances": self.allowances or {},
            "deductions": self.deductions or {},
            "bonus": self.bonus,
            "netSalary": self.netSalary,
            "paymentStatus": self.paymentStatus,
            "paymentDate": self.paymentDate,
            "bankName": self.bankName,
            "accountNumber": self.accountNumber,
        }


class PerformanceReview(db.Model):
    __tablename__ = "performance_reviews"
    id = db.Column(db.String(64), primary_key=True)
    employeeId = db.Column(db.String(64), db.ForeignKey("employees.employeeId"), nullable=False)
    employeeName = db.Column(db.String(150))
    employeePhoto = db.Column(db.String(500))
    department = db.Column(db.String(60))
    designation = db.Column(db.String(120))
    reviewPeriod = db.Column(db.String(60))
    overallRating = db.Column(db.Float, default=0)
    kpiScore = db.Column(db.Float, default=0)
    goalsCompleted = db.Column(db.Integer, default=0)
    totalGoals = db.Column(db.Integer, default=0)
    strengths = db.Column(db.JSON, default=list)
    improvements = db.Column(db.JSON, default=list)
    managerFeedback = db.Column(db.Text)
    lastReviewDate = db.Column(db.String(20))
    status = db.Column(db.String(20), default="Pending Review")  # Completed | Pending Review | Draft

    def to_dict(self):
        return {
            "id": self.id,
            "employeeId": self.employeeId,
            "employeeName": self.employeeName,
            "employeePhoto": self.employeePhoto,
            "department": self.department,
            "designation": self.designation,
            "reviewPeriod": self.reviewPeriod,
            "overallRating": self.overallRating,
            "kpiScore": self.kpiScore,
            "goalsCompleted": self.goalsCompleted,
            "totalGoals": self.totalGoals,
            "strengths": self.strengths or [],
            "improvements": self.improvements or [],
            "managerFeedback": self.managerFeedback,
            "lastReviewDate": self.lastReviewDate,
            "status": self.status,
        }


class ScheduledMeeting(db.Model):
    __tablename__ = "meetings"
    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(200))
    date = db.Column(db.String(20))
    time = db.Column(db.String(20))
    durationMinutes = db.Column(db.Integer, default=30)
    meetingLink = db.Column(db.String(300))
    organizerName = db.Column(db.String(150))
    organizerPhoto = db.Column(db.String(500))
    participants = db.Column(db.JSON, default=list)
    status = db.Column(db.String(20), default="Scheduled")  # Scheduled | Live | Completed | Cancelled
    category = db.Column(db.String(60))
    description = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "date": self.date,
            "time": self.time,
            "durationMinutes": self.durationMinutes,
            "meetingLink": self.meetingLink,
            "organizerName": self.organizerName,
            "organizerPhoto": self.organizerPhoto,
            "participants": self.participants or [],
            "status": self.status,
            "category": self.category,
            "description": self.description,
        }


class SystemNotification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.String(64), primary_key=True)
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    timestamp = db.Column(db.String(40), default=lambda: datetime.now().isoformat())
    read = db.Column(db.Boolean, default=False)
    category = db.Column(db.String(30))  # leave | payroll | meeting | system | performance
    linkToPage = db.Column(db.String(40))
    # Who this notification is for. If recipientEmployeeId is set, it's a
    # personal notification meant only for that one employee. Otherwise
    # `audience` decides who else sees it: 'management' = admin/HR/manager
    # only (e.g. "new leave request received"), 'all' = every signed-in
    # employee (company-wide announcements). Defaults to 'all' so existing
    # rows without this field stay visible everywhere, matching prior
    # behavior.
    recipientEmployeeId = db.Column(db.String(64), nullable=True)
    audience = db.Column(db.String(20), default="all")  # all | management

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "timestamp": self.timestamp,
            "read": self.read,
            "category": self.category,
            "linkToPage": self.linkToPage,
            "recipientEmployeeId": self.recipientEmployeeId,
            "audience": self.audience or "all",
        }
