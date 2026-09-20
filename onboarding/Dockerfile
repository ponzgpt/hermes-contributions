# The public page is README.md rendered to HTML (page/build.mjs); nginx serves it.
FROM node:24-alpine AS page
WORKDIR /w
RUN npm init -y >/dev/null && npm i --silent marked@15
COPY README.md ./
COPY page/ page/
RUN node page/build.mjs 0th-hermes

FROM nginx:1.27-alpine
COPY --from=page /w/index.html /usr/share/nginx/html/index.html
COPY page/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
