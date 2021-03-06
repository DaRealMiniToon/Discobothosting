module.exports = {
  run: async (client, msg, args) => {
    const [userId, limit] = args.split(/\s+/)
    if (!userId && !limit) {
      const deletedMessages = await msg.channel.bulkDelete()
      msg.channel.send(`${deletedMessages.size} messages were deleted.`)
    }
    if (!userId || !limit) return msg.channel.send('Please provide the correct arguments.')
    const r = new RegExp(/^\d+$/)
    if (!r.test(userId)) return msg.channel.send('Please provide a valid user id.')
    if (isNaN(limit)) return msg.channel.send('Please provide a numeric value for limit')
    if (limit > 100) return msg.channel.send('Limit must be less than or equal to 100.')
    try {
      const fetchedMessages = await msg.channel.messages.fetch({ limit })
      const filteredMessages = fetchedMessages.filter(msg => msg.author.id === userId)
      const deletedMessages = await msg.channel.bulkDelete(filteredMessages)
      msg.channel.send(`${deletedMessages.size} messages were deleted.`)
    } catch (err) {
      console.log(err)
    }
  },
  aliases: ['purge'],
  description: 'Deletes a number of messages from a user in a channel.'
}
