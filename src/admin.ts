import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { BotContext, RoundInfo } from "./types";


export function createAddMembersScene(
    setMemberList: (members: number[]) => Promise<void>
): Scenes.BaseScene<BotContext> {
    const { enter, leave } = Scenes.Stage;

    const keyboard = Markup.keyboard([[
        Markup.button.userRequest("Select user", 0),
        Markup.button.groupRequest("Select group", 1),
        Markup.button.callback("Start", "start"),
        Markup.button.callback("Cancel", "cancel"),
    ]]).resize();

    const scene = new Scenes.BaseScene<BotContext>("add_members");

    scene.enter(async (ctx: BotContext) => {
        await ctx.reply("Send me a contact", keyboard);
    });
    scene.leave(async (ctx: BotContext) => {
        await ctx.reply(`Member list: ${ctx.scene.session.members}`, Markup.removeKeyboard());
    });
    scene.hears("Start", async (ctx: BotContext) => {
        await setMemberList(ctx.scene.session.members);
        return await enter<BotContext>("match")(ctx);
    });
    scene.hears("Cancel", leave<BotContext>());

    scene.on(message("user_shared"), (ctx) => {
        const user = ctx.message.user_shared;
        ctx.scene.session.members.push(user.user_id);
    });
    scene.on(message("chat_shared"), (ctx) => {
        const chat = ctx.message.chat_shared;
        ctx.scene.session.members.push(chat.chat_id);
    });
    scene.on(message("contact"), async (ctx) => {
        const contact = ctx.message.contact;
        ctx.scene.session.members.push(contact.user_id!);
        await ctx.reply("Received contact", keyboard);
    });
    scene.on(message(), (ctx: BotContext) => ctx.reply("Not a contact", keyboard));

    return scene;
}

export function createMatchScene(
    nextRound: () => Promise<RoundInfo>,
): Scenes.BaseScene<BotContext> {
    const { enter, leave } = Scenes.Stage;

    const scene = new Scenes.BaseScene<BotContext>("match");

    const keyboard = Markup.inlineKeyboard([
        Markup.button.callback("Next pair", "next"),
        Markup.button.callback("Finish", "finish"),
    ]);

    const startNextRound = async (ctx: BotContext) => {
        const info = await nextRound();
        if (info.currentRound != undefined) {
            await ctx.reply(`Starting round ${info.currentRound + 1}/${info.totalRounds}`, keyboard);
        } else {
            return leave<BotContext>()(ctx);
        }
    };

    scene.enter(startNextRound);
    scene.leave(async (ctx: BotContext) => {
        await ctx.reply("Networking finished", Markup.removeKeyboard());
    });
    scene.action("next", async (ctx: BotContext) => {
        await ctx.answerCbQuery();
        return startNextRound(ctx);
    });
    scene.action("finish", async (ctx: BotContext) => {
        await ctx.answerCbQuery();
        return leave<BotContext>()(ctx);
    });

    scene.on(message(), (ctx: BotContext) => ctx.reply("Couldn't parse", keyboard));

    return scene;
}
