module.exports = robot => {
  robot.on('issues.closed', async context => {
    const params = context.issue()
    // if label next-event
    const issueLabels = await context.github.issues.getIssueLabels(params)
    const labels = issueLabels.data.map(label => label.name)
    if (labels.includes('next-event')) {
      // replace label with 'past-event'
      context.github.issues.removeLabel(Object.assign(params, {name: 'next-event'}))
      context.github.issues.addLabels(Object.assign(params, {labels: [{name: 'past-event'}]}))
      // ToDo: create new issue with label 'next-event' and ToDo list
    }
    console.log('done')
  })
}

/*
- [ ] :calendar: Agree on a date
- [ ] :memo: Create ti.to page
- [ ] :school: :bear: Post event on nodeschool.io
- [ ] :house: Update homepage
- [ ] :money_with_wings: Start ticket sale
- [ ] :bird: Tweet about the event

*/
