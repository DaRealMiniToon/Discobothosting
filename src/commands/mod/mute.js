/* eslint-disable no-unused-vars */
module.exports = {
  run: async (client, message, args) => {
    if (!message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) { message.channel.send("You don't have permissions to use that command.") } else {
      const memberId = message.content.substring(message.content.indexOf(' ') + 1)
      const member = message.guild.members.cache.get(args)
      if (member) {
        if (member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS']) && !message.member.hasPermission('ADMINISTRATOR')) { message.channel.send('You cannot mute that person!') } else {
          const mutedRole = message.guild.roles.cache.find('Muted')
          if (mutedRole) {
            member.roles.add(mutedRole)
            message.channel.send('User was muted.')
          } else { message.channel.send('Muted role not found, please make a role called Muted....') }
        }
      } else { message.channel.send('Member not found.') }
    }
  },
  aliases: [],
  description: 'Mutes a user'
}
