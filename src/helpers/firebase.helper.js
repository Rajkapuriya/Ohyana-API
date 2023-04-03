const { initializeApp, cert } = require('firebase-admin/app')
const { getMessaging } = require('firebase-admin/messaging')

const serviceAccount = require('../../ohyana-3bd18-firebase-adminsdk-7aghy-bb11a4a783.json')

initializeApp({
  credential: cert(serviceAccount),
})

function send(payload) {
  return getMessaging().send(payload)
}

function sendMulticast(payload) {
  return getMessaging().sendMulticast(payload)
}

function sendAll(payload) {
  return getMessaging().sendAll(payload)
}

module.exports = { send, sendMulticast, sendAll }
