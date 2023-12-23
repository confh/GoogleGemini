const { Events } = require('discord.js')
import CustomClient from "../classes/CustomClient"

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: CustomClient) {
        client.logInfo("Client loaded.")
    }
}