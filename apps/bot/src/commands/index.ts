import { Collection, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";
import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

import * as link from "./link";
import * as status from "./status";
import * as done from "./done";
import * as blocked from "./blocked";
import * as submitCap from "./submit-cap";
import * as summary from "./summary";
import * as ask from "./ask";

const commandModules: Command[] = [
  link,
  status,
  done,
  blocked,
  submitCap,
  summary,
  ask,
];

export const commands = new Collection<string, Command>();

for (const mod of commandModules) {
  commands.set(mod.data.name, mod);
}

export const commandBuilders = commandModules.map((m) => m.data);
