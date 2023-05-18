const db = {}

db.Client = require('./client.model').Client
db.Product = require('./product.model').Product
db.Role = require('./role.model').Role
db.Team = require('./team.model').Team
db.Notification = require('./notification.model').Notification
db.Client_Status = require('./client-status.model').Client_Status
db.Client_Appointment = require('./client-appointment.model').Client_Appointment
db.Client_Reminder = require('./client-reminder.model').Client_Reminder
db.Client_Appointed_Member =
  require('./client-appointed-member.model').Client_Appointed_Member
db.Client_Product = require('./client-product.model').Client_Product
db.Appointment_Reminder =
  require('./appointment-reminder.model').Appointment_Reminder
db.Permission = require('./permission.model').Permission
db.Company = require('./company.model').Company
db.Attendance = require('./attendance.model').Attendance
db.Leave = require('./leave.model').Leave
db.Team_Leave = require('./team-leave.model').Team_Leave
db.Holiday = require('./holiday.model').Holiday
db.Pjp = require('./pjp.model').Pjp
db.Cart = require('./cart.model').Cart
db.Order = require('./order.model').Order
db.Order_Item = require('./order-item.model').Order_Item
db.Task = require('./task.model').Task
db.Checklist = require('./checklist.model').Checklist
db.Target = require('./target.model').Target
db.Team_Expense = require('./team-expense.model').Team_Expense
db.Points = require('./points.model').Points
db.Team_Point = require('./team-points.model').Team_Point
db.Client_Stage_History =
  require('./client-stage-history.model').Client_Stage_History
db.Expense = require('./expense.model').Expense
db.Role_Expense_Permissions =
  require('./role-expense-permissions.model').Role_Expense_Permissions
db.Team_Location_History =
  require('./team-location-history.model').Team_Location_History
db.Role_Permissions = require('./role-permission.model').Role_Permissions

// -------- DB Relationships --------

db.Team.hasMany(db.Client)
db.Client.belongsTo(db.Team)

// Client Status
db.Client.hasMany(db.Client_Status)
db.Team.hasMany(db.Client_Status)
db.Client_Status.belongsTo(db.Team)

// Client Reminder
db.Client.hasMany(db.Client_Reminder)
db.Client_Reminder.belongsTo(db.Client)

db.Team.hasMany(db.Client_Reminder)
db.Client_Reminder.belongsTo(db.Team)

// Client Appointment
db.Client.hasMany(db.Client_Appointment)
db.Client_Appointment.belongsTo(db.Client)

// For appointed member only
db.Client_Appointment.belongsToMany(db.Team, {
  through: db.Client_Appointed_Member,
})
db.Team.belongsToMany(db.Client_Appointment, {
  through: db.Client_Appointed_Member,
})

// Client Have Many queries for Product and Product related to many clients
db.Client.belongsToMany(db.Product, { through: db.Client_Product })
db.Product.belongsToMany(db.Client, { through: db.Client_Product })

db.Role.hasMany(db.Team)
db.Team.belongsTo(db.Role)

// Notification as per User
db.Team.hasMany(db.Notification)
db.Notification.belongsTo(db.Team)

// Appointment as per User
db.Team.hasMany(db.Appointment_Reminder)
db.Appointment_Reminder.belongsTo(db.Team)

// Attendance as per Team Member
db.Team.hasMany(db.Attendance)
db.Attendance.belongsTo(db.Team)

// Leave Records of Team Member
// eslint-disable-next-line
// db.Leave.belongsToMany(db.Team, { through: db.Team_Leave });
// eslint-disable-next-line
// db.Team.belongsToMany(db.Leave, { through: db.Team_Leave });
db.Team_Leave.belongsTo(db.Leave)

// PJP As per Team Member
db.Team.hasMany(db.Pjp)
db.Pjp.belongsTo(db.Team)

// Client Connected to PJP
db.Client.hasMany(db.Pjp)
db.Pjp.belongsTo(db.Client)

// Product Stored In Cart
db.Product.hasMany(db.Cart)
db.Cart.belongsTo(db.Product)
db.Team.hasMany(db.Cart)

// Client Order Added By Team Member
db.Client.hasMany(db.Order)
db.Order.belongsTo(db.Client)
db.Client.hasMany(db.Cart)
db.Cart.belongsTo(db.Client)
db.Team.hasMany(db.Order)
db.Order.belongsTo(db.Team)

// Product as Per Order
db.Order.hasMany(db.Order_Item)
db.Product.hasMany(db.Order_Item)
db.Order_Item.belongsTo(db.Product)

// Task Assign to Team Members
db.Team.hasMany(db.Task)
db.Task.belongsTo(db.Team)
db.Task.hasMany(db.Checklist)

// Target As Per Team
db.Team.hasMany(db.Target)
db.Target.belongsTo(db.Team)

// // Expense of Team Members
// db.Team.hasMany(db.Team_Expense)
// db.Team_Expense.belongsTo(db.Team)

// // Expense of Team Members
// db.Team_Expense.hasMany(db.Expense)
// db.Expense.belongsTo(db.Team_Expense)

// db.Team.belongsToMany(db.Expense, { through: db.Team_Expense })
// db.Expense.belongsToMany(db.Team, { through: db.Team_Expense })

// Points of team members
db.Points.hasMany(db.Team_Point)
db.Team_Point.belongsTo(db.Points)

// Points of team members
db.Team.hasMany(db.Team_Point)
db.Team_Point.belongsTo(db.Team)

// Stage history of client
db.Client.hasMany(db.Client_Stage_History)
db.Client_Stage_History.belongsTo(db.Client)

// Stage history of team members
db.Team.hasMany(db.Client_Stage_History)
db.Client_Stage_History.belongsTo(db.Team)

/*
 * Implemented only this logic for update Role_Expense_Permissions policy reason
 * Role Expense Policy
 */
db.Role.belongsToMany(db.Expense, { through: db.Role_Expense_Permissions })
db.Expense.belongsToMany(db.Role, { through: db.Role_Expense_Permissions })

// Role Permissions
db.Role.hasOne(db.Role_Permissions)

// Team Member Location History
db.Team.hasMany(db.Team_Location_History)

// To Manage Role Hierarchy
db.Role.hasMany(db.Role, { foreignKey: 'parentId' })

// Saperated By Company
db.Company.hasMany(db.Client)
db.Client.belongsTo(db.Company)

db.Company.hasMany(db.Team)
db.Team.belongsTo(db.Company)

db.Company.hasMany(db.Appointment_Reminder)
db.Appointment_Reminder.belongsTo(db.Company)

db.Company.hasMany(db.Role)
db.Role.belongsTo(db.Company)

db.Company.hasMany(db.Product)
db.Product.belongsTo(db.Company)

db.Company.hasMany(db.Notification)
db.Notification.belongsTo(db.Company)

db.Company.hasMany(db.Leave)
db.Leave.belongsTo(db.Company)

db.Company.hasMany(db.Holiday)
db.Holiday.belongsTo(db.Company)

db.Company.hasMany(db.Pjp)
db.Pjp.belongsTo(db.Company)

db.Company.hasMany(db.Cart)
db.Cart.belongsTo(db.Company)

db.Company.hasMany(db.Order)
db.Order.belongsTo(db.Company)

db.Company.hasMany(db.Task)
db.Task.belongsTo(db.Company)

db.Company.hasMany(db.Points)
db.Points.belongsTo(db.Company)

module.exports = db
