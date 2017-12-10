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

    const nextTitle = getNextTitle(issue.data.title)
    context.github.issues.create(Object.assign(repoRef, {
      title: nextTitle,
      body: TODO,
      labels: ['next-event']
    }))
  })
}

function getNextTitle (oldTitle) {
  const nodeschoolNumber = Number(oldTitle.match(numberRegex)[0].slice(1))
  const nextNodeschoolNumber = nodeschoolNumber + 1

  return `NodeSchool #${nextNodeschoolNumber}`
}
