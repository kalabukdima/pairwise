import "dotenv/config";
import { Context, Telegraf, session, Markup, Scenes } from "telegraf"
import { createAddMembersScene } from "./admin";
import { BotContext } from "./types";

const token = process.env.BOT_TOKEN ?? "";

const bot = new Telegraf<BotContext>(token);

bot.start((ctx) => ctx.reply("Welcome to the Startup House!"));

export async function setMemberList(members: number[]): Promise<void> {
    for (const member of members) {
        await bot.telegram.sendMessage(member, "You were added to the networking");
    }
}

const addMembersScene = createAddMembersScene(setMemberList);
const stage = new Scenes.Stage<BotContext>([addMembersScene], {
    ttl: 60,
});
bot.use(session());
bot.use(stage.middleware());
bot.use((ctx, next) => {
    // we now have access to the the fields defined above
    ctx.scene.session.members ??= [];
    return next();
});
bot.command("new_networking", ctx => ctx.scene.enter("add_members"));
bot.command("echo", ctx => ctx.scene.enter("echo"));
bot.on("message", ctx => {
    console.log(ctx.scene.session);
    ctx.reply("Try /new_networking", Markup.removeKeyboard());
});

bot.launch();
console.log("Bot is running...");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
