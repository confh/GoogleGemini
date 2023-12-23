import { SlashCommandBuilder } from "discord.js";
import CustomClient from "./CustomClient";

export default class Command {
    public data: SlashCommandBuilder;
    public execute: (interaction: any, client: CustomClient) => any;

    constructor(options: Command) {
        Object.assign(this, options)
    }
}