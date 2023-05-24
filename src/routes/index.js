const express = require('express')
const router = express.Router()

// ------------------------------- Login Router -------------------------------

router.use(require('./auth.router'))

// ------------------------------- Logic Routes -------------------------------

router.use(require('./role.router'))
router.use(require('./product.router'))
router.use(require('./team.router'))
router.use(require('./client.router'))
router.use(require('./notification.router'))
router.use(require('./company.router'))
router.use(require('./attendance.router'))
router.use(require('./leave.router'))
router.use(require('./holiday.router'))
router.use(require('./pjp.router'))
router.use(require('./order.router'))
router.use(require('./task.router'))
router.use(require('./target.router'))
router.use(require('./expense.router'))
router.use(require('./points.router'))
router.use(require('./dashboard.router'))
router.use(require('./report.router'))

module.exports = router
