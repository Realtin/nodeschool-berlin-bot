const numberRegex = /#\d+/

const TODO = `
- [ ] :calendar: Agree on a date:
- [ ] :memo: Create ti.to page
- [ ] :school: :bear: Post event on nodeschool.io
- [ ] :house: Update homepage
- [ ] :money_with_wings: Start ticket sale
- [ ] :bird: Tweet about the event
`

module.exports = robot => {
  robot.on('issues.closed', async context => {
    const issueRef = context.issue()
    const repoRef = context.repo()
    const issue = await context.github.issues.get(issueRef)

    const issueLabels = await context.github.issues.getIssueLabels(issueRef)
    const labels = issueLabels.data.map(label => label.name)
    if (!labels.includes('next-event')) return

    context.github.issues.removeLabel(Object.assign(issueRef, {name: 'next-event'}))
    context.github.issues.addLabels(Object.assign(issueRef, {labels: [{name: 'past-event'}]}))

    const oldTitle = issue.data.title
    const nodeschoolNumber = Number(oldTitle.match(numberRegex)[0].slice(1))
    const nextNodeschoolNumber = nodeschoolNumber + 1
    const nextTitle = `NodeSchool #${nextNodeschoolNumber}`

    const nextEventIssue = await context.github.issues.create(Object.assign(repoRef, {
      title: nextTitle,
      body: TODO,
      labels: ['next-event']
    }))
    removeEventFromWebsite(repoRef, nextEventIssue.data.number, nextNodeschoolNumber)

    async function removeEventFromWebsite (repoRef, issueNumber, nextNodeschoolNumber) {
      const path = 'website.json'
      const res = await context.github.repos.getContent(Object.assign(repoRef, {path}))
      const {sha, content} = res.data
      const config = JSON.parse((Buffer.from(content, 'base64')).toString())
      config.date = false
      config.number = nextNodeschoolNumber
      config.issueNumber = issueNumber
      const base64content = Buffer.from(JSON.stringify(config)).toString('base64')
      context.github.repos.updateFile(Object.assign(repoRef, {
        path,
        sha,
        content: base64content,
        message: 'remove event from website'
      }))
    }
  })
}
