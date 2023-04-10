const {
  joiValidationMiddleware,
} = require('../middleware/joi-validaton.middleware')
const { authTokenMiddleware } = require('../middleware/auth-token.middleware')
const { taskSchema } = require('../validators/task.validator')
const taskController = require('../controllers/task.controller')

const express = require('express')
const taskRouter = express.Router()

// ------------------------------- Tasks -------------------------------

taskRouter.post(
  '/task',
  joiValidationMiddleware(taskSchema.taskForm),
  authTokenMiddleware,
  taskController.createTask,
)

taskRouter.get(
  '/tasks',
  joiValidationMiddleware(taskSchema.taskList),
  authTokenMiddleware,
  taskController.getAllTask,
)

taskRouter.get(
  '/task/:id',
  authTokenMiddleware,
  taskController.getSingleTaskWithChecklist,
)

taskRouter.put(
  '/task/:taskId/:teamId',
  authTokenMiddleware,
  taskController.assignMember,
)

taskRouter.put(
  '/task',
  joiValidationMiddleware(taskSchema.updateTaskDetails),
  authTokenMiddleware,
  taskController.updateTaskDetails,
)

taskRouter.patch(
  '/due-date/task/:taskId',
  joiValidationMiddleware(taskSchema.updateDuedate),
  authTokenMiddleware,
  taskController.updateDuedate,
)

taskRouter.post(
  '/checklist/:taskId',
  joiValidationMiddleware(taskSchema.taskCheckListItemForm),
  authTokenMiddleware,
  taskController.addChecklistItems,
)

taskRouter.put(
  '/item/checklist/:id/:taskId',
  authTokenMiddleware,
  taskController.updateChecklistItemStatus,
)

taskRouter.delete(
  '/item/checklist/:id/:taskId',
  authTokenMiddleware,
  taskController.deleteChecklistItem,
)

taskRouter.delete('/task/:id', authTokenMiddleware, taskController.deleteTask)

module.exports = taskRouter
