/* eslint-disable no-undef */
require('dotenv').config()
const discord = require('discord.js')
const client = new discord.Client({ partials: ['MESSAGE', 'REACTION'] })
const { registerCommands, registerEvents } = require('./utils/registry');
(async () => {
  client.login('NzE1MzQ5ODk3NDM5ODcxMDc4.XuzHjQ.TAA_y7n7UjBoPs_197b0PKMAOXk')
  client.commands = new Map()
  client.cachedMessageReactions = new Map()
  await registerEvents(client, '../events')
  await registerCommands(client, '../commands')
})()
