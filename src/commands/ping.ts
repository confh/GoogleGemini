const { SlashCommandBuilder, Client, EmbedBuilder } = require("discord.js")
import Command from "../classes/Command"
import CustomClient from "../classes/CustomClient"

module.exports = new Command({
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows the ping of the bot."),
    async execute(interaction, client) {
        const date = interaction.createdTimestamp
        const message = await interaction.channel.send("Calculating latency")
        await message.delete()
        const embed = new EmbedBuilder()
            .setTimestamp()
            .setTitle("🏓 Pong!")
            .setFooter({ text: `${client.user?.username}`, iconURL: client.user?.avatarURL({ size: 1024 }) })
            .setDescription(`Latency: \`${Math.abs(message.createdTimestamp - date)}ms\`\nAPI Latency: \`${client.ws?.ping}ms\``)
            .setColor(client.config2.colors.normal)

        await interaction.reply({ embeds: [embed] })
    }
})