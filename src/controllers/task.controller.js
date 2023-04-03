const { Team, Task, Checklist } = require('../models')
const { Sequelize } = require('sequelize')
const { successResponse, notFoundError } = require('../utils/response.util')
const { MESSAGE } = require('../constants/message.contant')

exports.createTask = async (req, res) => {
  await Task.create({
    ...req.body,
    companyId: req.user.companyId,
    createdBy: req.user.name,
  })
  return successResponse(res, MESSAGE.RECORD_CREATED_SUCCESSFULLY)
}

exports.assignMember = async (req, res) => {
  const { taskId, teamId } = req.params

  await Task.update({ teamId }, { where: { id: taskId } })
  return successResponse(res, 'Member Assigned Successfully')
}

exports.getAllTask = async (req, res) => {
  const tasks = await Task.findAll({
    attributes: ['id', 'title', 'description', 'createdAt'],
    where: { companyId: req.user.companyId },
    include: [
      {
        model: Team,
        attributes: ['email'],
      },
    ],
  })

  if (tasks.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, tasks)
}

exports.getSingleTaskWithChecklist = async (req, res) => {
  const task = await Task.findOne({
    attributes: ['id', 'title', 'due_date', 'description', 'createdBy'],
    where: { id: req.params.id },
    include: [
      {
        model: Checklist,
        attributes: ['id', 'task', 'done'],
      },
      {
        model: Team,
        attributes: ['email'],
      },
    ],
  })

  if (!task) return notFoundError(res)

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, task)
}

exports.updateDescription = async (req, res) => {
  const { description } = req.body

  const updatedTask = await Task.updateTask({ description }, req.params.taskId)
  return successResponse(res, MESSAGE.RECORD_UPDATED_SUCCESSFULLY, updatedTask)
}

exports.updateTitle = async (req, res) => {
  const { title } = req.body

  const updatedTask = await Task.updateTask({ title }, req.params.taskId)

  return successResponse(res, MESSAGE.RECORD_FOUND_SUCCESSFULLY, updatedTask)
}

exports.addChecklistItems = async (req, res) => {
  const [, checklists] = await Promise.all([
    Checklist.create({ ...req.body, taskId: req.params.taskId }),
    Checklist.findAll({ where: { taskId: req.params.taskId } }),
  ])

  return successResponse(res, MESSAGE.RECORD_CREATED_SUCCESSFULLY, checklists)
}

exports.updateChecklistItemStatus = async (req, res) => {
  await Checklist.update(
    { done: Sequelize.literal('case when done = 0 then 1 else 0 end') },
    {
      where: { id: req.params.id },
    },
  )

  const checklists = await Checklist.findAll({
    where: { taskId: req.params.taskId },
  })

  return successResponse(res, MESSAGE.RECORD_UPDATED_SUCCESSFULLY, checklists)
}

exports.deleteChecklistItem = async (req, res) => {
  const [, checklists] = await Promise.all([
    Checklist.destroy({ where: { id: req.params.id } }),
    Checklist.findAll({ where: { taskId: req.params.taskId } }),
  ])
  return successResponse(res, MESSAGE.RECORD_DELETED_SUCCESSFULLY, checklists)
}

exports.deleteTask = async (req, res) => {
  await Task.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.RECORD_DELETED_SUCCESSFULLY)
}
