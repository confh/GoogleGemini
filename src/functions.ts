import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ColorResolvable, User } from "discord.js"
import { EmbedBuilder } from "discord.js"
import CustomClient from "./classes/CustomClient"
interface embedPagesOptions {
    title: string,
    footer?: string,
    footerImage?: string,
    color?: ColorResolvable,
    perPage?: number,
    thumbnail?: string,
    header?: string,
    fields?: Array<any>,
    joinBy?: string,
    author?: string,
    authorImage?: string,
    timestamp?: boolean,
    user?: User,
    ephemeral?: boolean,
    url?: string,
    followUp?: boolean,
    page?: number,
    emojis?: {
        first_track: string,
        previous_track: string,
        next_track: string,
        last_track: string,
        delete: string,
        jump_to: string
    }
}

/** Splits array into embed pages
@param interaction - The interaction
@param array - The array to split
@param options - embedPagesOptions

@returns Embed
 **/
async function embedPages(client: CustomClient, interaction: any, array: Array<string>, options: embedPagesOptions): Promise<EmbedBuilder> {
    let footer = options.footer || '',
        title = options.title || '',
        pagee = options.page || 1,
        footerImage = options.footerImage || null,
        color = options.color || client.config2.colors.normal,
        perPage = options.perPage || 4,
        thumbnail = options.thumbnail || null,
        header = options.header || '',
        fields = options.fields || [],
        joinBy = options.joinBy || '\n',
        ephemeral = options.ephemeral || false,
        author = options.author || null,
        authorImage = options.authorImage || null,
        timestamp = options.timestamp || false,
        user = options.user || interaction.user,
        followUp = options.followUp || false,
        emojis = options.emojis || {
            first_track: '<:first_page:1094405588013817997>',
            previous_track: '<:previous_page:1094405958706397264>',
            next_track: '<:next_page:1094405709535395840>',
            last_track: '<:last_page:1094405473417048095>',
            delete: '🗑',
            jump_to: '↗️'
        },
        url = options.url || null

    let page = pagee;

    if (page > Math.ceil(array.length / perPage) || page < 1) page = 1

    let first = perPage * (parseInt(page.toString()) - 1)
    let second = perPage * parseInt(page.toString())
    let embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(color)
        .setThumbnail(thumbnail)
        .addFields(fields)
        .setDescription(`${header ? `${header}\n` : ""}${array.slice(first, second).join(joinBy)}`)

    if (author?.length) {
        embed.setAuthor({
            name: author,
            iconURL: authorImage || undefined
        })
    }

    if (footer.length) {
        embed.setFooter({
            text: `${footer} |`,
            iconURL: footerImage || undefined
        })
    }

    if (Math.ceil(array.length / perPage) > 1) embed.setFooter({
        text: `Page: ${page}/${Math.ceil(array.length / perPage)}`,
        iconURL: footerImage || undefined
    })


    if (timestamp) embed.setTimestamp()
    if (url) embed.setURL(url)

    let buttons = [
        new ButtonBuilder()
            .setCustomId('first_track')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.first_track),

        new ButtonBuilder()
            .setCustomId('previous_track')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.previous_track),
    ]

    await buttons.push(
        new ButtonBuilder()
            .setCustomId('next_track')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.next_track)
    )

    await buttons.push(
        new ButtonBuilder()
            .setCustomId('last_track')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.last_track))

    buttons.push(
        new ButtonBuilder()
            .setCustomId('delete')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emojis.delete))



    const row = new ActionRowBuilder()
        .addComponents(
            buttons
        )

    let msg;

    let comp = [row]

    if (array.length < perPage) comp = []

    if (!followUp) {
        msg = await interaction.reply({
            embeds: [embed],
            components: comp,
            ephemeral: ephemeral
        })
    } else {
        msg = await interaction.followUp({
            embeds: [embed],
            components: comp,
            ephemeral: ephemeral
        })
    }

    if (array.length < perPage) return embed

    const collector = msg.createMessageComponentCollector({
        time: 60000
    });

    collector.on('collect', async (i: ButtonInteraction) => {
        if (i.user.id != user.id) return i.reply({ content: `These buttons aren't for you. Use </${interaction.commandName} ${interaction.options._subcommand}:${interaction.commandId}> for your menu.`, ephemeral: true })
        collector.resetTimer()
        const reactionadd = array.slice(first + perPage, second + perPage).length;
        const reactionremove = array.slice(first - perPage, second - perPage).length;
        await i.deferUpdate()
        if (i.customId === "next_track" && reactionadd !== 0) {
            page++

            first += perPage;
            second += perPage;
            embed.setDescription(`${header ? `${header}\n` : ""}${array.slice(first, second).join(joinBy)}`);
            embed.setFooter({
                text: `${footer.length ? `${footer} |` : ''} Page: ${page}/${Math.ceil(array.length / perPage)}`,
                iconURL: footerImage || undefined
            });
            interaction.editReply({
                embeds: [embed],
                components: comp
            })
        } else if (i.customId === "previous_track" && reactionremove !== 0) {
            page--
            first -= perPage;
            second -= perPage;
            embed.setDescription(`${header ? `${header}\n` : ""}${array.slice(first, second).join(joinBy)}`);
            embed.setFooter({
                text: `${footer.length ? `${footer} |` : ''} Page: ${page}/${Math.ceil(array.length / perPage)}`,
                iconURL: footerImage || undefined
            });
            interaction.editReply({
                embeds: [embed],
                components: comp
            })
        } else if (i.customId === "first_track") {
            page = 1;
            first = 0;
            second = perPage;
            embed.setDescription(`${header ? `${header}\n` : ""}${array.slice(first, second).join(joinBy)}`);
            embed.setFooter({
                text: `${footer.length ? `${footer} |` : ''} Page: ${page}/${Math.ceil(array.length / perPage)}`,
                iconURL: footerImage || undefined
            });
            interaction.editReply({
                embeds: [embed],
                components: comp
            })
        } else if (i.customId === "last_track") {
            page = Math.ceil(array.length / perPage);
            first = (page * perPage) - perPage;
            second = page * perPage;
            embed.setDescription(`${header ? `${header}\n` : ""}${array.slice(first, second).join(joinBy)}`);
            embed.setFooter({
                text: `${footer.length ? `${footer} |` : ''} Page: ${page}/${Math.ceil(array.length / perPage)}`,
                iconURL: footerImage || undefined
            });
            interaction.editReply({
                embeds: [embed],
                components: comp
            })
        } else if (i.customId === "delete") {
            collector.stop()
        } else if (i.customId === "jump_to") {
            if (Math.ceil(array.length / perPage) > 3) {
                let mesg = await interaction.channel.send(`${interaction.user.toString()} Enter a page number`)
                let coll = await interaction.channel.awaitMessages((x: any) => x.author.id === interaction.user.id, {
                    time: 10000,
                    max: 1
                })
                if (!coll.size) mesg.delete()
                if (Number(coll.first().content) && !coll.first().content.includes('.') && Math.ceil(array.length / perPage) >= Number(coll.first().content)) {
                    mesg.delete()
                    page = Number(coll.first().content)
                    first = perPage * (parseInt(page.toString()) - 1)
                    second = perPage * parseInt(page.toString())
                    embed.setDescription(`${header ? `${header}\n` : ""}${array.slice(first, second).join(joinBy)}`);
                    embed.setFooter({
                        text: `${footer.length ? `${footer} |` : ''} Page: ${page}/${Math.ceil(array.length / perPage)}`,
                        iconURL: footerImage || undefined
                    });
                    interaction.editReply({
                        embeds: [embed],
                        components: comp
                    })
                    coll.first().delete()
                } else {
                    mesg.delete()
                    coll.first().delete()
                }
            }
        }
    })

    collector.on('end', async (_: any, reason: any) => {
        await row.components.forEach((component: any) => {
            component.setDisabled(true)
            component.setStyle(ButtonStyle.Secondary)
        })
        await interaction.editReply({
            components: [row]
        });
    })

    return embed;
}

/**
 * Generates a random cshort ode
 * @returns Random UID
 */
function uuidv4() {
    var dt = new Date().getTime();
    var uuid = 'xx4x-yxxx-xxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}



export default {
    embedPages: embedPages,
    uuid: uuidv4
}