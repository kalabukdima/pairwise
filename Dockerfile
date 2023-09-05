FROM node:lts

WORKDIR /app

COPY . .

RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive

RUN yarn build

CMD [ "yarn", "start" ]
