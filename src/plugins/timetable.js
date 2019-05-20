import { parse, setDay, addDays, addHours } from 'date-fns/esm'

const MOD_SELECT = 'div[id^="win0divDERIVED_REGFRM1_DESCR20"]'
const ROW_SELECT = 'tr[id^="trCLASS_MTG_VW"]'
const MTG_SELECT = 'span[id^="MTG"]'

const PGD = 'PAGROUPDIVIDER'
const CLASS_NO = 'span[id^="DERIVED_CLS_DTL_CLASS_NBR"]'
const WEEKDAYS = { Mo: 1, Tu: 2, We: 3, Th: 4, Fr: 5 }

const counter = (c, v) => { c[v] = (c[v] || 0) + 1; return c }

const parseTime = (t, b) => {
  // There is an issue with the date-fns library that prevents proper parsing
  // of AM/PM (HH:mmA). This sansAA nonsense and manual addition of 12h is a stopgap fix.
  // Additionally, the .GBL file does not standardize between 12h and 24h formats, thus
  // we handle both.
  let d;
  if (t.endsWith('AM') || t.endsWith('PM')) {
    const sansAA = t.slice(0, t.length - 2);
    d = parse(sansAA, 'HH:mm', b)
    if (t.endsWith('PM')) d = addHours(d, 12);
  }
  else {
    d = parse(t, 'HH:mm', b)
  }

  if (!isNaN(d.getTime())) { return d }
  return parse(t, 'HH:mmaa', b)
}

export default function (soup) {
  let parsed = { sections: [], modules: [] }
  let schedules = {}
  let freshie = []
  let dates = []
  const base = new Date()
  const d = document.createElement('div')
  d.insertAdjacentHTML('beforeend', soup.replace(/<img[^>]*>/g, ''))
  d.querySelectorAll(MOD_SELECT).forEach((s) => {
    let sections = []
    let component = null
    let classNum = null
    let name = null
    let [code, title] = s.getElementsByClassName(PGD)[0].innerText.split(' - ')
    code = code.replace(' ', '')

    s.querySelectorAll(ROW_SELECT).forEach((r) => {
      let iz = {}
      r.querySelectorAll(MTG_SELECT).forEach((i) => {
        iz[i.id.split('$')[0]] = i.innerText
      })
      if (iz.MTG_COMP !== '\xa0') { component = iz.MTG_COMP }

      const cn = r.querySelector(CLASS_NO).innerText
      if (cn !== '\xa0') {
        classNum = parseInt(cn)
        sections.push(classNum)
        parsed.sections.push(classNum)
        if (iz.MTG_SECTION) { name = iz.MTG_SECTION }
        schedules[classNum] = { name, module: code, schedule: [] }
        if (code.startsWith('10.') && name.startsWith('SC')) {
          freshie.push(name.replace('SC', 'F'))
        }
      }

      const dts = iz.MTG_DATES.split(' - ').map((d) => parse(d, 'dd/MM/yyyy', base))
      let times = iz.MTG_SCHED.split(/ (.+)? - (.+)/, 3)
      let wd = times.shift()
      let dt = dts[0]
      if (dt.getDay() !== WEEKDAYS[wd]) { dt = setDay(dt, WEEKDAYS[wd]) }
      dates.push(dt)

      let l = { component, location: iz.MTG_LOC }
      do {
        let [start, end] = times.map((t) => parseTime(t, dt))
        const lesson = Object.assign({ start, end }, l)
        schedules[classNum].schedule.push(lesson)
        dt = addDays(dt, 7)
      } while (dt <= dts[1])
    })
    sections.sort()
    parsed.modules.push({ code, title, sections })
  })

  const fd = new Date(
    Math.min( ...dates.filter((d) => !isNaN(d)) )
  )
  parsed.term = fd.getFullYear() + '-' + fd.getMonth() / 4

  const f = Object.keys(freshie.reduce(counter, {}))
  parsed.freshmore = f.length === 1 ? f[0] : null

  // remove waitlisted modules
  const waitlistedCodes = Object.keys(schedules)
    .filter((code) => !schedules[code].schedule[0].start)
  parsed.sections = parsed.sections.filter((code) => !waitlistedCodes.includes(code))
  waitlistedCodes.forEach((code) => {
    delete schedules[code];
  })

  parsed.sections.sort()
  return Object.assign(parsed, { schedules, length: parsed.modules.length })
}
