# Pairwise — telegram bot for running [round-robin tournaments](https://en.wikipedia.org/wiki/Round-robin_tournament)

## Running
Run the latest version locally:
- Obtain [the token](https://core.telegram.org/bots/api#making-requests) for your bot
- Run `docker run -it -e BOT_TOKEN=<token> ghcr.io/kalabukdima/pairwise:latest`

Run from the source code:
- Install dependencies:\
  `yarn install`
- Create `.env` file with your token:\
  `sed 's/<token>/0123456789:AA...Z/' < .env.example > .env`
- Run in watch mode:\
  `yarn dev`
