/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
const cachedMessageReactions = new Map()
const MessageModel = require('../../database/models/message')

module.exports = async (client, reaction, user) => {
  const removeMemberRole = (emojiRoleMappings) => {
    if (emojiRoleMappings.hasOwnProperty(reaction.emoji.id)) {
      const roleId = emojiRoleMappings[reaction.emoji.id]
      const role = reaction.message.guild.roles.cache.get(roleId)
      const member = reaction.message.guild.members.cache.get(user.id)
      if (role && member) {
        member.roles.remove(role)
      }
    }
  }
  if (reaction.message.partial) {
    await reaction.message.fetch()
    const { id } = reaction.message
    try {
      const msgDocument = await MessageModel.findOne({ messageId: id })
      if (msgDocument) {
        client.cachedMessageReactions.set(id, msgDocument.emojiRoleMappings)
        const { emojiRoleMappings } = msgDocument
        removeMemberRole(emojiRoleMappings)
      }
    } catch (err) {
      console.log(err)
    }
  } else {
    const emojiRoleMappings = client.cachedMessageReactions.get(reaction.message.id)
    removeMemberRole(emojiRoleMappings)
  }
}
