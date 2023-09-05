import { Scenes } from "telegraf";

export interface AddMembersSession extends Scenes.SceneSessionData {
    members: number[];
}

export type BotContext = Scenes.SceneContext<AddMembersSession>;

export interface RoundInfo {
    currentRound: number | undefined;
    totalRounds: number;
};
