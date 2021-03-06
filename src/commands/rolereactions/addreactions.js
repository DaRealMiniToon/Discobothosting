const { MessageCollector } = require('discord.js')
const MessageModel = require('../../database/models/message')

const msgCollectorFilter = (newMsg, originalMsg) => newMsg.author.id === originalMsg.author.id
module.exports = {
  run: async (client, message, args) => {
    if (args.split(/\s+/).length !== 1) {
      const msg = await message.channel.send('Too many arguments. Must only provide 1 message id')
      await msg.delete({ timeout: 3500 }).catch(err => console.log(err))
    } else {
      try {
        const fetchedMessage = await message.channel.messages.fetch(args)
        if (fetchedMessage) {
          await message.channel.send('Please provide all of the emoji names with the role name, one by one, separated with a comma.\ne.g: snapchat, snapchat, where the emoji name comes first, role name comes second.')
          const collector = new MessageCollector(message.channel, msgCollectorFilter.bind(null, message))
          const emojiRoleMappings = new Map()
          collector.on('collect', msg => {
            const { cache } = msg.guild.emojis
            if (msg.content.toLowerCase() === '?done') {
              collector.stop('done command was issued.')
              return
            }
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
          })
          collector.on('end', async (collected, reason) => {
            const findMsgDocument = await MessageModel
              .findOne({ messageId: fetchedMessage.id })
              .catch(err => console.log(err))
            if (findMsgDocument) {
              console.log("The message exists.. Don't save...")
              message.channel.send('A role reaction set up exists for this message already...')
            } else {
              const dbMsgModel = new MessageModel({
                messageId: fetchedMessage.id,
                emojiRoleMappings: emojiRoleMappings
              })
              dbMsgModel.save()
                .then(m => console.log(m))
                .catch(err => console.log(err))
            }
          })
        }
      } catch (err) {
        console.log(err)
        const msg = await message.channel.send('Invalid id. Message was not found.')
        await msg.delete({ timeout: 3500 }).catch(err => console.log(err))
      }
    }
  },
  aliases: [],
  description: 'Enables a message to listen to reactions to give roles.'
}
