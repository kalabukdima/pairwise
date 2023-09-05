import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { strict as assert } from "assert";
import { BotContext } from "./types";


export function createAddMembersScene(
    setMemberList: (members: number[]) => Promise<void>
): Scenes.BaseScene<BotContext> {
    const { enter, leave } = Scenes.Stage;

    const keyboard = Markup.keyboard([[
        Markup.button.userRequest("Select user", 0),
        Markup.button.groupRequest("Select group", 1),
        Markup.button.callback("Done", "done"),
    ]]).resize();

    const scene = new Scenes.BaseScene<BotContext>("add_members");

    scene.enter(async (ctx) => {
        await ctx.reply("Send me a contact", keyboard);
    });
    scene.leave(async (ctx) => {
        await setMemberList(ctx.scene.session.members);
        await ctx.reply(`Members list created: ${ctx.scene.session.members}`, Markup.removeKeyboard());
    });
    scene.hears("Done", leave<BotContext>());

    scene.on(message("user_shared"), ctx => {
        const user = ctx.message.user_shared;
        ctx.scene.session.members.push(user.user_id);
        console.log(user);
    });
    scene.on(message("chat_shared"), ctx => {
        const chat = ctx.message.chat_shared;
        ctx.scene.session.members.push(chat.chat_id);
        console.log(chat);
    });
    scene.on(message("contact"), async (ctx) => {
        const contact = ctx.message.contact;
        console.log(contact);
        assert(contact.user_id);
        ctx.scene.session.members.push(contact.user_id);
        await ctx.reply("Received contact", keyboard);
    });
    scene.on(message(), ctx => ctx.reply("Not a contact", keyboard));

    return scene;
}
