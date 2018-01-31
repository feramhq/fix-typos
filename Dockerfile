FROM ebekebe/ferambase:v1-11-gdf132ae_2017-11-02 AS builder
WORKDIR /var/app

ARG SSH_KEY
RUN configure-ssh "$SSH_KEY"

COPY package.json package.json
COPY yarn.lock yarn.lock

RUN yarn install


# ---------------------------------------------------------------------------- #
FROM node:8.4
WORKDIR /var/app

COPY --from=builder /var/app/node_modules node_modules

COPY yarn.lock yarn.lock
COPY package.json package.json
COPY tests tests
COPY source source
COPY .gitignore .gitignore

RUN yarn test

ENTRYPOINT ["yarn", "start", "--"]
