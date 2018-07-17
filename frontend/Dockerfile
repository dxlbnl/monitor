FROM node:alpine

ADD . /home/node/app
RUN chown -R node:node /home/node
RUN apk add --no-cache git

USER node

WORKDIR /home/node/app

RUN yarn config set  "@fortawesome:registry" https://npm.fontawesome.com/$FONTAWESOME_TOKEN
RUN yarn --non-interactive --force

CMD ["yarn", "start"]