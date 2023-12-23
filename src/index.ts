import CustomClient from "./classes/CustomClient"

import { WebhookClient, EmbedBuilder } from 'discord.js'
import functions from "./functions"
const logger = require("./logger")
const client = new CustomClient()
const fs = require('node:fs');
const path = require('node:path');

client.config = require("./config.json")
const infowebhook = new WebhookClient({ url: client.config.infowebhookurl })
const errorswebhook = new WebhookClient({ url: client.config.errorswebhookURL })
const token = client.config.token;


client.config2 = {
    colors: { success: '#57F287', error: '#ED4245', normal: "#313338" }
}


client.logError = function (error: string = "Unknown error", advanced?: { enabled: boolean, id: string }) {
    logger.error(error)
    if (!client.user) return;
    const embed = new EmbedBuilder()
        .setColor('#ED4245')
        .setFooter({ text: (client.user?.username as string), iconURL: client.user?.avatarURL({ size: 1024 }) as string })
        .setTitle(`${client.user?.username} Error logs`)
        .setTimestamp()
        .setDescription(`${advanced?.enabled ? `Code: **${advanced.id}**` : ""}\`\`\`${error}\`\`\``)
    errorswebhook.send({
        username: `${client.user?.username} Error logs`,
        avatarURL: client.user?.avatarURL({ size: 1024 }) as string,
        embeds: [embed]
    })
}
client.logInfo = function (info: string = "Unknown info") {
    logger.info(info)
    if (!client.user) return;
    const embed = new EmbedBuilder()
        .setColor("#313338")
        .setFooter({ iconURL: client.user?.avatarURL({ size: 1024 }) as string, text: client.user?.username as string })
        .setTitle(`${client.user?.username} Info logs`)
        .setTimestamp()
        .setDescription(`[INFO] ${info}`)
    infowebhook.send({
        username: `${client.user?.username} Info logs`,
        avatarURL: client.user?.avatarURL({ size: 1024 }) as string,
        embeds: [embed]
    })
}

client.login(token)

client.deployCommands(token)
client.deployWebPage()

const pathToEvents = path.join(__dirname, "events")
const files = fs.readdirSync(pathToEvents)

files.forEach((file: string) => {
    const filePath = path.join(pathToEvents, file);
    const event = require(filePath)
    if (event.once) {
        client.once(event.name, async (...args) => event.execute(...args))
    } else {
        client.on(event.name, async (...args) => event.execute(...args, client))
    }
})

