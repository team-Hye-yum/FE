FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_URL=/api
ARG VITE_AI_URL=/ai
ARG VITE_KAKAO_MAP_APP_KEY=
ARG VITE_KAKAO_JAVASCRIPT_KEY=
ARG VITE_KAKAO_MAP_KEY=

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AI_URL=$VITE_AI_URL
ENV VITE_KAKAO_MAP_APP_KEY=$VITE_KAKAO_MAP_APP_KEY
ENV VITE_KAKAO_JAVASCRIPT_KEY=$VITE_KAKAO_JAVASCRIPT_KEY
ENV VITE_KAKAO_MAP_KEY=$VITE_KAKAO_MAP_KEY

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
