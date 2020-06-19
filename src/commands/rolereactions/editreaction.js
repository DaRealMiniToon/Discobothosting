/* eslint-disable no-unused-vars */
const MessageModel = require('../../database/models/message')
const { MessageCollector } = require('discord.js')
module.exports = {
  run: async (client, message, args) => {
    if (args.split(' ').length !== 1) return
    // Check if the message exists.
    const { channel, author } = message
    try {
      const fetchedMessage = channel.messages.cache.get(args) || await channel.messages.fetch(args)
      if (!fetchedMessage) { channel.send('Message not found.') } else {
        // Check if the message exists in the DB.
        const msgModel = await MessageModel.findOne({ messageId: args })
        if (msgModel) {
          client.emit('msgDocFetched', msgModel)
          // Prompt the user for configurations.
          const filter = m => m.author.id === author.id && (m.content.toLowerCase() === 'add' || m.content.toLowerCase() === 'remove')
          const tempMsg = channel.send('Do you want to add or remove from the reaction configuration? Type add or remove')
          try {
            const awaitMsgOps = { max: 1, time: 4000, errors: ['time'] }
            const choice = (await channel.awaitMessages(filter, awaitMsgOps)).first()
            if (choice.content === 'add') {
              const addMsgPrompt = await channel.send('Enter an emoji name followed by the corresponding role name, separated with a comma. e.g: some_emoji, some_role')
              const collectorResult = await handleCollector(fetchedMessage, author, channel, msgModel, args)
              console.log(collectorResult)
            } else {

            }
          } catch (err) {
            console.log(err)
          }
        } else {
          message.channel.send('There is no configuration for that message. Please use ?addreactions on a message to set up Role Reactions on that message.')
        }
      }
    } catch (err) {
      console.log(err)
    }
  },
  aliases: [],
  description: 'Edits the role reaction configuration'
}
function handleCollector (fetchedMessage, author, channel, msgModel, messageId) {
  return new Promise((resolve, reject) => {
    const collectorFilter = (m) => m.author.id === author.id
    const collector = new MessageCollector(channel, collectorFilter)
    const emojiRoleMappings = new Map(Object.entries(msgModel.emojiRoleMappings))
    collector.on('collect', msg => {
      if (msg.content.toLowerCase() === '?done') {
        collector.stop()
        resolve()
      } else {
        const { cache } = msg.guild.emojis
        const [emojiName, roleName] = msg.content.split(/,\s+/)
        if (!emojiName && !roleName) return
        const emoji = cache.find(emoji => emoji.name.toLowerCase() === emojiName.toLowerCase())
        if (!emoji) {
          msg.channel.send('Emoji does not exist. Try again.')
            .then(msg => msg.delete({ timeout: 2000 }))
            .catch(err => console.log(err))
          return
        }
        const role = msg.guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLowerCase())
        if (!role) {
          msg.channel.send('Role does not exist. Try again.')
            .then(msg => msg.delete({ timeout: 2000 }))
            .catch(err => console.log(err))
          return
        }
        fetchedMessage.react(emoji)
          .then(emoji => console.log('Reacted.'))
          .catch(err => console.log(err))
        emojiRoleMappings.set(emoji.id, role.id)
      }
    })
    collector.on('end', () => {
      console.log('Done...')
      resolve(emojiRoleMappings)
    })
  })
}
