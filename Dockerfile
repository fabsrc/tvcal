FROM node:onbuild
RUN npm run build
EXPOSE 5000
