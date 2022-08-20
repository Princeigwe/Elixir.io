# Docker image for elixir.io backend for development envoronment

FROM node:17-alpine As development

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

# setting the working directory of image
WORKDIR /usr/src/app

# copy package.json and package-lock.json to the image working directory
COPY package*.json ./

#  so that Typescript isn't installed in the production image
RUN npm install --only=production --force

COPY . .


#  copy the compiled javascript code to out production image
COPY --from=development /usr/src/app/dist ./dist

# EXPOSE 3000

# run the application
CMD ["node", "dist/main"]