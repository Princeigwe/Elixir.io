# Docker image for elixir.io backend for development envoronment

FROM node:17-alpine As development

# setting the image working directory which the backend folder of the root directory
WORKDIR /usr/src/app/backend

# copy package.json and package-lock.json to the image working directory
COPY package*.json ./

# install tools for mongodump and mongorestore commands
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/main' >> /etc/apk/repositories
RUN echo 'http://dl-cdn.alpinelinux.org/alpine/v3.6/community' >> /etc/apk/repositories
RUN apk update
RUN apk add mongodb
RUN apk add mongodb-tools


# install development dependencies
RUN npm install --only=development --force


# copy the application code to the working directory of image
COPY . .

# EXPOSE 3000

#  build the application
RUN npm run build

# Docker image for elixir.io backend for testing envoronment
FROM node:18 As testing

# these RUN commands solves the docker-compose jest watchmode error
RUN apt-get update -qq 
RUN apt-get install -y build-essential
RUN apt-get install -y git



# setting the image working directory which the backend folder of the root directory
WORKDIR /usr/src/app/backend

# copy package.json and package-lock.json to the image working directory
COPY package*.json ./

# install development dependencies
RUN npm install --only=development --force

# copy the application code to the working directory of image
COPY . .

# EXPOSE 3000

#  build the application
RUN npm run build


# Docker image for elixir.io backend for production envoronment

FROM node:17-alpine As production

# defining a variable, NODE_ENV
ARG NODE_ENV=production

# setting node environment variable to production
ENV NODE_ENV=${NODE_ENV}

# setting the image working directory which the backend folder of the root directory
WORKDIR /usr/src/app/backend

# copy package.json and package-lock.json to the image working directory
COPY package*.json ./

#  so that Typescript isn't installed in the production image
RUN npm install --only=production --force

COPY . .


#  copy the compiled javascript code to out production image
COPY --from=development /usr/src/app/backend/dist ./dist

EXPOSE 3000

# run the application
CMD ["node", "dist/main"]