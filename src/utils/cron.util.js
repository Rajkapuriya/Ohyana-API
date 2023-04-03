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
} = require('../models')
const moment = require('moment')
const { Op } = require('sequelize')
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
const { updateTeamMemberPoint } = require('./common.util')
const sequelize = require('../database/mysql')
const { mailHelper } = require('../helpers/mail.helper')

new CronJob(
  '1 * * * *',
  async () => {
    // 0 22 * * *
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
              status: 'APPROVED',
            }),
            Holiday.findAll({
              where: { type: 'REGULAR', companyId: item.companyId },
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
                  attendanceType: 'A',
                  companyId: item.companyId,
                  teamId: item.id,
                })
                updateTeamMemberPoint(item.id, 4)
              } else if (teamLeave !== null && !attendance) {
                Attendance.create({
                  attendanceType: 'L',
                  companyId: item.companyId,
                  teamId: item.id,
                })
                updateTeamMemberPoint(item.id, 1)
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
      where: { due_date: YYYY_MM_DD() },
      include: {
        model: Checklist,
        attributes: ['id', 'task', 'done'],
        where: { done: false },
      },
    })

    for (let i = 0; i < allTasks.length; i++) {
      // 3 for task not completed in due time
      updateTeamMemberPoint(allTasks[i].teamId, 5)
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
  // notification.forEach(element => {
  //   let toEmail
  //   if (element.teams && element.teams.length > 0) {
  //     toEmail = element.teams.map(e => e.email)
  //   } else {
  //     toEmail = element.team.email
  //   }
  //   io.getIO()
  //     .to(toEmail)
  //     .emit('notification', {
  //       type: type,
  //       data: {
  //         heading: `Reminder For ${
  //           type === 'Appointemnt' ? element.heading : element.client.name
  //         }`,
  //         description: element.description,
  //       },
  //     })
  // })

  // mailHelper.sendMail({
  //   from: 'jenishshekhaliya@gmail.com',
  //   to: 'rajkapuriya03@gmail.com',
  //   subject: 'Auto Generated Message From Admin',
  //   html: forgottenClientHTML(requestedClient),
  // })

  if (notification.length > 0) {
    const savedNotifications = notification.map(element => {
      return {
        heading: `Reminder For ${
          type === 'Appointemnt' ? element.heading : element.client.name
        }`,
        description: element.description,
        type: 'APPOINTMENT',
        button:
          type !== 'Appointemnt'
            ? [
                {
                  name: 'View Profile',
                  functionName: `handleView('/clientprofile/${element.client.id}')`,
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
  '1 * * * *',
  async () => {
    // 0 20 * * *
    const currentTime = HH_MM_SS()
    const currentDate = YYYY_MM_DD()
    const yesterday = YYYY_MM_DD(moment().subtract(1, 'day'))

    const teamWithTarget = await Team.findAll({
      attributes: ['id', 'name', 'companyId'],
      include: [
        {
          model: Target,
          attributes: { exclude: ['createdAt', 'updatedAt', 'teamId'] },
          where: {
            state: { [Op.not]: 'PAST' },
          },
        },
      ],
    })

    async.each(
      teamWithTarget,
      async function (item, callback) {
        const upcomingTarget = {
          type: item.targets.find(e => e.state === 'UPCOMING').type,
          period: item.targets.find(e => e.state === 'UPCOMING').period,
          target: item.targets.find(e => e.state === 'UPCOMING').target,
        }

        if (
          item.targets.find(e => e.state === 'CURRENT').endDate === yesterday
        ) {
          Target.update(
            { state: 'PAST' },
            { where: { teamId: item.id, state: 'CURRENT' } },
          )
            .then(() => {
              Target.create({
                type: upcomingTarget.type,
                period: upcomingTarget.period,
                target: upcomingTarget.target,
                startDate: moment(),
                endDate: moment().add(upcomingTarget.period, 'days'),
                state: 'CURRENT',
                teamId: item.id,
              })
            })
            .catch(e => {
              console.log(e)
            })
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
  '1 * * * *',
  async () => {
    // 0 0 28-31 * *
    const targets = await Target.findAll({
      where: {
        state: { [Op.not]: 'UPCOMING' },
        [Op.and]: [
          // { date: date },
          sequelize.where(
            sequelize.fn('month', sequelize.col('endDate')),
            moment().month() + 1, // Add 1 since month() returns a zero-based index
          ),
        ],
      },
    })

    for (let i = 0; i < targets.length; i++) {
      const achievedTarget = targets[i].achieve || 0
      if (achievedTarget < targets[i].target) {
        // 5 for target not achieved
        updateTeamMemberPoint(targets[i].teamId, 5)
      } else if (achievedTarget > targets[i].target) {
        // 8 for extra target achieved
        updateTeamMemberPoint(targets[i].teamId, 8)
      } else if (achievedTarget === targets[i].target) {
        // 9 for target achieved
        updateTeamMemberPoint(targets[i].teamId, 9)
      }
    }
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
