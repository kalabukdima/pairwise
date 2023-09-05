import "dotenv/config";
import { Context, Telegraf, session, Markup, Scenes } from "telegraf"
import { createAddMembersScene, createMatchScene } from "./admin";
import { BotContext, RoundInfo } from "./types";
import { Matching, generateMatchings } from "./matching";

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
    console.log("Selected members: ", members);
    state.members = members;
    state.matchings = generateMatchings(members.length);
    state.currentRound = -1;
    const promises = state.members.map(member => bot.telegram.sendMessage(member, "You were added to the networking"));
    await Promise.all(promises);
}

async function nextRound(): Promise<RoundInfo> {
    state.currentRound++;
    if (state.currentRound >= state.matchings.length) {
        const promises = state.members.map(member => bot.telegram.sendMessage(member, "Time is up"));
        Promise.all(promises);
        return {
            currentRound: undefined,
            totalRounds: state.matchings.length,
        };
    }

    const promises = state.matchings[state.currentRound].flatMap((assignment, positionIndex) => {
        if (assignment[1] != null) {
            return assignment.map(memberIndex =>
                bot.telegram.sendMessage(state.members[memberIndex], `Go to position ${positionIndex}`),
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

const token = process.env.BOT_TOKEN ?? "";

const bot = new Telegraf<BotContext>(token);

bot.start((ctx) => ctx.reply("Welcome to the Startup House!"));

const addMembersScene = createAddMembersScene(setMemberList);
const matchScene = createMatchScene(nextRound);
const stage = new Scenes.Stage<BotContext>([addMembersScene, matchScene], {
    ttl: 600,
});
bot.use(session());
bot.use(stage.middleware());
bot.use((ctx, next) => {
    // we now have access to the the fields defined above
    ctx.scene.session.members ??= [];
    return next();
});
bot.command("new_networking", ctx => ctx.scene.enter("add_members"));
bot.on("message", ctx => {
    console.log(ctx.scene.session);
    ctx.reply("Try /new_networking", Markup.removeKeyboard());
});

bot.launch();
console.log("Bot is running...");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
