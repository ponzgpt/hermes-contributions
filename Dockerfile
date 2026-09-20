# Build the four parts into dist/, then serve dist/ with nginx. One image, one
# service, one host — the four repos this replaced had one of each, each.
FROM node:24-alpine AS build
WORKDIR /w
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY . .
RUN node scripts/build.mjs

FROM nginx:1.27-alpine
COPY --from=build /w/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
