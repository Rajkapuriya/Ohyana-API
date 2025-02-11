const { Team, Task, Checklist } = require('../models')
const { Sequelize, Op } = require('sequelize')
const {
  successResponse,
  notFoundError,
  unProcessableEntityRequestError,
} = require('../utils/response.util')
const { MESSAGE } = require('../constants')
const { YYYY_MM_DDHHMM } = require('../utils/moment.util')

exports.createTask = async (req, res) => {
  if (YYYY_MM_DDHHMM(req.body.due_date) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.COMMON.INVALID_TIME)
  }

  await Task.create({
    ...req.body,
    companyId: req.user.companyId,
    createdBy: req.user.name,
  })
  return successResponse(res, MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY)
}

exports.assignMember = async (req, res) => {
  const { taskId, teamId } = req.params

  await Task.update({ teamId }, { where: { id: taskId } })
  return successResponse(res, 'Member Assigned Successfully')
}

exports.getAllTask = async (req, res) => {
  const { searchQuery, due_date, teamId } = req.query
  const currentPage = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 20

  const filterCondition = {}

  if (searchQuery) filterCondition.title = { [Op.like]: `%${searchQuery}%` }

  if (due_date) filterCondition.due_date = due_date

  if (teamId) filterCondition.teamId = teamId

  const { count: totalPage, rows: tasks } = await Task.findAndCountAll({
    attributes: ['id', 'title', 'description', 'createdAt'],
    where: { companyId: req.user.companyId, ...filterCondition },
    include: [
      {
        model: Team,
        attributes: ['email'],
      },
    ],
    offset: (currentPage - 1) * size,
    limit: size,
  })

  if (tasks.length === 0) return notFoundError(res)

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, {
    totalPage,
    tasks,
  })
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

  return successResponse(res, MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY, task)
}

exports.updateTaskDetails = async (req, res) => {
  const { title, description, taskId } = req.body

  const updatedTask = await Task.updateTask({ title, description }, taskId)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    updatedTask,
  )
}

exports.updateDuedate = async (req, res) => {
  const { due_date } = req.body

  if (YYYY_MM_DDHHMM(due_date) <= YYYY_MM_DDHHMM()) {
    return unProcessableEntityRequestError(res, MESSAGE.COMMON.INVALID_TIME)
  }

  const updatedTask = await Task.updateTask({ due_date }, req.params.taskId)

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_FOUND_SUCCESSFULLY,
    updatedTask,
  )
}

exports.addChecklistItems = async (req, res) => {
  // const [, checklists] = await Promise.all([

  // ])
  await Checklist.create({ ...req.body, taskId: req.params.taskId })
  const checklists = await Checklist.findAll({
    where: { taskId: req.params.taskId },
  })
  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_CREATED_SUCCESSFULLY,
    checklists,
  )
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

  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_UPDATED_SUCCESSFULLY,
    checklists,
  )
}

exports.deleteChecklistItem = async (req, res) => {
  // const [, checklists] = await Promise.all([

  // ])
  await Checklist.destroy({ where: { id: req.params.id }, force: true })
  const checklists = await Checklist.findAll({
    where: { taskId: req.params.taskId },
  })
  return successResponse(
    res,
    MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY,
    checklists,
  )
}

exports.deleteTask = async (req, res) => {
  await Task.destroy({ where: { id: req.params.id } })
  return successResponse(res, MESSAGE.COMMON.RECORD_DELETED_SUCCESSFULLY)
}
