const icalendar = require('icalendar')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

const db = admin.database()
const mref = db.ref('modules')
const sref = db.ref('sections')

exports.calendar = functions.https.onRequest(async (req, res) => {
  const q = req.query
  const s = (q.s || '').split(',')
  const mods = (await mref.once('value')).val()
  const term = (await sref.child(q.t || '-').once('value')).val() || {}
  const sections = Object.entries(term).filter((i) => s.includes(i[0]))

  const cal = new icalendar.iCalendar(true)
  cal.addProperty('VERSION', '2.0')
  cal.addProperty('CALSCALE', 'GREGORIAN')
  cal.addProperty('X-WR-CALNAME', 'Timetable')
  cal.addProperty('X-WR-CALDESC', `Schedule (${q.t})`)
  cal.addProperty('X-WR-TIMEZONE', 'Asia/Singapore')
  cal.addProperty('PRODID', '-//SUTD Timetable Calendar//randName//EN')

  sections.map((i) => i[1]).forEach((s) => {
    const m = s.module
    const title = `${m} - ${mods[m.replace('.', '-')].title}`
    s.schedule.forEach((l) => {
      let evt = cal.addComponent('VEVENT')
      evt.setSummary(title)
      evt.setLocation(l.location || 'TBC')
      evt.setDate(new Date(l.start), new Date(l.end))
      evt.setDescription(`${l.component} (${s.name})`)
    })
  })

  res.type('text/calendar')
  res.status(200).send(cal.toString())
})
