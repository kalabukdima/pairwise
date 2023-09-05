import "dotenv/config";
import d from "debug";
import { Telegraf, session, Markup, Scenes } from "telegraf"
import { message } from "telegraf/filters";
import { createAddMembersScene, createMatchScene } from "./admin";
import { BotContext, RoundInfo } from "./types";
import { Matching, generateMatchings } from "./matching";

const positionFiles = [1, 2, 3, 4, 5, 6, 7, 8].map(x => `https://raw.githubusercontent.com/kalabukdima/pairwise/master/static/${x}.jpg`);

const debug = d("pairwise:main");
let bot: Telegraf<BotContext>;

const state: {
    members: number[];
    matchings: Matching[];
    currentRound: number;
} = {
    members: [],
    matchings: [],
    currentRound: -1,
}

async function setMemberList(members: number[]): Promise<void> {
    debug("Selected members: ", members);
    state.members = members;
    state.matchings = generateMatchings(members.length);
    state.currentRound = -1;
    const promises = state.members.map(member => bot.telegram.sendMessage(member, "You were added to the networking"));
    await Promise.all(promises);
}

async function nextRound(): Promise<RoundInfo> {
    state.currentRound++;
    if (state.currentRound >= state.matchings.length) {
        state.members.map(member => bot.telegram.sendMessage(member, "Time is up"));
        return {
            currentRound: undefined,
            totalRounds: state.matchings.length,
        };
    }

    const promises = state.matchings[state.currentRound].flatMap((assignment, positionIndex) => {
        if (assignment[1] != null) {
            return assignment.map(memberIndex =>
                bot.telegram.sendPhoto(
                    state.members[memberIndex!],
                    positionFiles[positionIndex],
                    { caption: `Go to position ${positionIndex + 1}` }
                ) as Promise<unknown>,
            );
        } else {
            return [
                bot.telegram.sendMessage(state.members[assignment[0]], "You skip this round")
            ];
        }
    });
    await Promise.all(promises);
    return {
        currentRound: state.currentRound,
        totalRounds: state.matchings.length,
    }
}

async function startBot() {
    const token = process.env.BOT_TOKEN ?? "";
    const adminCommand = process.env.ADMIN_COMMAND ?? "new_networking";
    bot = new Telegraf<BotContext>(token);

    bot.start((ctx: BotContext) => ctx.reply("Welcome to the Startup House!"));

    const addMembersScene = createAddMembersScene(setMemberList);
    const matchScene = createMatchScene(nextRound);
    const stage = new Scenes.Stage<BotContext>([addMembersScene, matchScene], {
        ttl: 600,
    });
    bot.use(session());
    bot.use(stage.middleware());
    bot.use((ctx, next) => {
        ctx.scene.session.members ??= [];
        return next();
    });
    bot.command(adminCommand, (ctx: BotContext) => ctx.scene.enter("add_members"));
    bot.on(message(), (ctx: BotContext) => {
        return ctx.reply("Unknown", Markup.removeKeyboard());
    });

    await bot.telegram.getMe();
    bot.launch();
    debug(`Bot is running. Access to admin interface: /${adminCommand}`);

    // Enable graceful stop
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
}

startBot();
