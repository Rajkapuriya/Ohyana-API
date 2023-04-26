const { SERVER_CONFIG } = require('../config/server.config')
const { URL_CONFIG } = require('../config/url.config')

function clientReminderHTML(element) {
  return `
    <html lang="en" xmlns="https://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>Reminder For ${element.description}</title>
</head>
<body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;">
<div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;">
    Time : <p>${element.time}</p> and Date : <p>${element.date}</p> 
</div>
</body>
</html>
    `
}

function forgotPasswordHTML(element) {
  return `
    <html lang="en" xmlns="https://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Forgot Password</title>
    </head>
        <body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;">
            <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;">
            Click this <a href="${URL_CONFIG.FRONTED_URL}?rstPwd=${element}">URL</a> to reset your password 
            </div>
            <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;">
            Copy Paste this url into browser if above link not works ${URL_CONFIG.FRONTED_URL}?rstPwd=${element}
            </div>
        </body>
    </html>
    `
}

function resetPasswordHTML(element) {
  return `
      <html lang="en" xmlns="https://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="x-apple-disable-message-reformatting">
      <title>Reset Password</title>
      </head>
          <body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;">
              <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;">
              Click this <a href="${URL_CONFIG.FRONTED_URL}?rstPwd=${element}">URL</a> to reset your password 
              </div>
              <div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;">
              Copy Paste this url into browser if above link not works ${URL_CONFIG.FRONTED_URL}?rstPwd=${element}
              </div>
          </body>
      </html>
      `
}

function forgottenClientHTML(element) {
  return `
    <html lang="en" xmlns="https://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>Forgotten Clients</title>
    </head>
        <body style="margin:0;padding:0;word-spacing:normal;background-color:#939297;">
            ${element.map(e => {
              return `<div role="article" aria-roledescription="email" lang="en" style="text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;background-color:#939297;">
                 Here Are The Not Procced Clients
                 <br>
                 <h3>Name</h3> : <h3>${e.name}</h3>
                 <h3>Email</h3> : <h4>${e.email}</h4>
                 <h3>Contact Number</h3> : <h4>${e.contact_number}</h4>
                </div>`
            })}
        </body>
    </html>
    `
}

module.exports = {
  clientReminderHTML,
  forgotPasswordHTML,
  forgottenClientHTML,
  resetPasswordHTML,
}
