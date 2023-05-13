const {
  Client_Reminder,
  Client_Appointment,
  Client_Status,
  Appointment_Reminder,
  Client,
  Role,
  Team,
  Notification,
  Holiday,
  Attendance,
  Target,
  Task,
  Team_Leave,
  Checklist,
  Team_Point,
  Points,
} = require('../models')
const moment = require('moment')
const { Op, QueryTypes } = require('sequelize')
const {
  clientReminderHTML,
  forgottenClientHTML,
} = require('./email-template.util')
const {
  YYYY_MM_DD,
  HH_MM_SS,
  YYYY_MM_DDHHMM,
  YYYY_MM_DD_HH_MM,
} = require('./moment.util')
const io = require('../helpers/socket.helper')
// const redis = require('../database/redis')
const CronJob = require('cron').CronJob
// var exec = require('child_process').exec
const fs = require('fs')
const async = require('async')
const { updateTeamMemberPoint, sendMail } = require('./common.util')
const sequelize = require('../database/mysql')
const {
  ATTENDANCE,
  POINTS,
  TARGET,
  HOLIDAY,
  NOTIFICATION,
} = require('../constants')

new CronJob(
  '0 * * * *',
  async () => {
    // 0 * * * * for every hour
    // for every 15 minutes */15 * * * *
    const currentTime = HH_MM_SS()
    const currentDate = YYYY_MM_DD()

    const teamWithRole = await Team.findAll({
      attributes: ['id', 'name', 'companyId'],
      include: [
        { model: Role, attributes: ['id', 'name', 'clockIn', 'parentId'] },
      ],
    })

    async.each(
      teamWithRole,
      async function (item, callback) {
        if (
          item.role.clockIn &&
          item.role.parentId &&
          currentTime > item.role.clockIn
        ) {
          Promise.all([
            Attendance.findOne({
              where: { date: currentDate, teamId: item.id },
            }),
            Team_Leave.findOne({
              where: { date: currentDate, teamId: item.id },
              status: ATTENDANCE.LEAVE_TYPE.APPROVED,
            }),
            Holiday.findAll({
              where: { type: HOLIDAY.TYPE.REGULAR, companyId: item.companyId },
            }),
          ]).then(result => {
            const attendance = result[0]
            const teamLeave = result[1]
            const holidays = result[2]
            if (
              !holidays
                .map(e => e.occasion)
                .includes(new Date().getDay().toString())
            ) {
              if (attendance === null && teamLeave === null) {
                Attendance.create({
                  attendanceType: ATTENDANCE.TYPE.ABSENT,
                  companyId: item.companyId,
                  teamId: item.id,
                })
                updateTeamMemberPoint(item.id, POINTS.TYPE.ABSENT)
              } else if (teamLeave !== null && !attendance) {
                Attendance.create({
                  attendanceType: ATTENDANCE.TYPE.LEAVE,
                  companyId: item.companyId,
                  teamId: item.id,
                })
                updateTeamMemberPoint(item.id, POINTS.TYPE.LEAVE)
              }
            }
          })
        }
      },
      async function (err) {
        if (err) console.log(err)
      },
    )

    const allTasks = await Task.findAll({
      where: {
        due_date: {
          [Op.lt]: YYYY_MM_DD(),
        },
      },
      include: {
        model: Checklist,
        attributes: ['id', 'task', 'done'],
        where: { done: false },
      },
    })

    for (let i = 0; i < allTasks.length; i++) {
      // 3 for task not completed in due time
      // updateTeamMemberPoint(allTasks[i].teamId, POINTS.TYPE.TASK_NOT_COMPLETE_IN_DUEDATE)
    }
  },
  null,
  true,
  'Asia/Kolkata',
)

new CronJob(
  '*/1 * * * *',
  async () => {
    const now = YYYY_MM_DDHHMM()
    try {
      sendNotification(now, 'Appointemnt', Appointment_Reminder, [
        {
          model: Team,
          attributes: ['id', 'name', 'email'],
        },
      ])
      sendNotification(now, 'ClientReminder', Client_Reminder, [
        {
          model: Client,
          attributes: ['id', 'name'],
        },
        {
          model: Team,
          attributes: ['id', 'name', 'email'],
        },
      ])
      sendNotification(now, 'ClientAppointemnt', Client_Appointment, [
        {
          model: Client,
          attributes: ['id', 'name'],
        },
        {
          model: Team,
          attributes: ['id', 'name', 'email'],
        },
      ])
    } catch (error) {
      console.log(error)
    }
  },
  null,
  true,
  'Asia/Kolkata',
)

async function sendNotification(now, type, Model, include) {
  const notification = await Model.findAll({
    where: {
      date: now.split(' ')[0],
      time: {
        [Op.like]: `%${now.split(' ')[1]}%`, // Specify the date format you want to match here
      },
      isScheduled: false,
    },
    include: include,
  })

  if (notification.length > 0) {
    const savedNotifications = notification.map(element => {
      return {
        heading: `Reminder For ${
          type === 'Appointemnt' ? element.heading : element.client.name
        }`,
        description: element.description,
        type: NOTIFICATION.TYPE.INFORMATION,
        button:
          type !== 'Appointemnt'
            ? [
                {
                  name: 'View Profile',
                  path: `/clientprofile/${element.client.id}`,
                },
              ]
            : null,
        teamId: element.teamId,
      }
    })

    await Model.update(
      { isScheduled: true },
      { where: { id: notification.map(e => e.id) } },
    )
    await Notification.bulkCreate(savedNotifications)
  }
}

new CronJob(
  '0 20 * * *',
  async () => {
    // 0 20 * * *
    const yesterday = YYYY_MM_DD(moment().subtract(1, 'day'))

    const teamWithTarget = await Team.findAll({
      attributes: ['id', 'name', 'companyId'],
      where: {
        endDate: yesterday,
      },
      include: [
        {
          model: Target,
          attributes: { exclude: ['createdAt', 'updatedAt', 'teamId'] },
          where: {
            state: { [Op.not]: TARGET.STATE.PAST },
          },
        },
      ],
    })

    async.each(
      teamWithTarget,
      async function (item, callback) {
        Target.update(
          { state: TARGET.STATE.PAST },
          { where: { teamId: item.id, state: TARGET.STATE.CURRENT } },
        )

        const achievedTarget = item.targets.achieve
        const assignedTarget = item.targets.target
        if (achievedTarget < assignedTarget) {
          // 5 for target not achieved
          await updateTeamMemberPoint(item.id, POINTS.TYPE.TARGET_NOT_ACHEIVE)
        } else if (achievedTarget > assignedTarget) {
          // 8 for extra target achieved
          await updateTeamMemberPoint(item.id, POINTS.TYPE.EXTRA_TARGET_ACHEIVE)
        } else if (achievedTarget === assignedTarget) {
          // 9 for target achieved
          await updateTeamMemberPoint(item.id, POINTS.TYPE.TARGET_ACHEIVE)
        }
      },
      async function (err) {
        if (err) console.log(err)
      },
    )
  },
  null,
  true,
  'Asia/Kolkata',
)

new CronJob(
  '0 0 28-31 * *',
  async () => {
    // 0 0 28-31 * *
    // const targets = await Target.findAll({
    //   where: {
    //     state: { [Op.not]: TARGET.STATE.UPCOMING },
    //     [Op.and]: [
    //       // { date: date },
    //       sequelize.where(
    //         sequelize.fn('month', sequelize.col('endDate')),
    //         moment().month() + 1, // Add 1 since month() returns a zero-based index
    //       ),
    //     ],
    //   },
    // })

    // for (let i = 0; i < targets.length; i++) {
    //   const achievedTarget = targets[i].achieve || 0
    //   if (achievedTarget < targets[i].target) {
    //     // 5 for target not achieved
    //     await updateTeamMemberPoint(
    //       targets[i].teamId,
    //       POINTS.TYPE.TARGET_NOT_ACHEIVE,
    //     )
    //   } else if (achievedTarget > targets[i].target) {
    //     // 8 for extra target achieved
    //     await updateTeamMemberPoint(
    //       targets[i].teamId,
    //       POINTS.TYPE.EXTRA_TARGET_ACHEIVE,
    //     )
    //   } else if (achievedTarget === targets[i].target) {
    //     // 9 for target achieved
    //     await updateTeamMemberPoint(
    //       targets[i].teamId,
    //       POINTS.TYPE.TARGET_ACHEIVE,
    //     )
    //   }
    // }

    const teamWithPoint = await Team.findAll({
      attributes: ['id', 'points', 'roleId'],
      where: {
        points: {
          // [Op.notLike]: '-%',
          [Op.gte]: 1,
        },
      },
      include: {
        model: Role,
        attributes: ['id'],
        where: { parentId: { [Op.ne]: null } },
      },
    })

    const groupByRole = teamWithPoint.reduce((acc, el) => {
      if (!acc[el.roleId]) {
        acc[el.roleId] = []
      }
      acc[el.roleId].push(el)
      return acc
    }, {})

    const maxPointsByGroup = Object.values(groupByRole).map(group => {
      const maxPoints = Math.max(...group.map(el => el.points))
      return { roleId: group[0].roleId, maxPoints }
    })

    const teamIds = []
    maxPointsByGroup.map(group => {
      const teamObject = groupByRole[group.roleId].find(
        e => e.points == group.maxPoints,
      )
      if (teamObject) {
        teamIds.push(teamObject.id)
      }
    })

    await sequelize.query(
      `
    UPDATE
      teams
    SET
      isCurrentMonthStarPerformer = (
        CASE
          WHEN id IN (:teamIds) 
        THEN
          1
        ELSE
          0
        END
      )
    `,
      { type: QueryTypes.UPDATE, replacements: { teamIds } },
    )
  },
  null,
  true,
  'Asia/Kolkata',
)

new CronJob(
  '0 0 1 * *',
  async () => {
    // 0 0 1 * *
    Team.update({ points: '0' }, { where: {} })
  },
  null,
  true,
  'Asia/Kolkata',
)
// new CronJob('*/5 * * * *', async () => {
//     console.log('backup taken')
//     const now = moment().format('YYYY-MM-DD_HH_mm')
//     const dbName = 'ohyana';
//     const dbUser = 'root';
//     const dbPass = ' ';
//     const backupFile = `F:\\_Project\\Ohyana\\Backup\\ohyana_db_backup_${now}.sql`;
//     // const command = `mysqldump -u ${dbUser} -p${dbPass} ${dbName} > ${backupFile}`;
//     const command = `mysqldump -u ${dbUser} ${dbName} > ${backupFile}`; // for root user only
//     console.log(command)
//     exec(command, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`exec error: ${error}`);
//             return;
//         }

//         console.log(`stdout: ${stdout}`);
//         console.error(`stderr: ${stderr}`);
//     });
// }, null, true, 'Asia/Kolkata')
