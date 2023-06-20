# ELIXIR.IO

![Elixir.io](download.png)

Elixir is an API targeting the healthcare industry, built with a focus on enhancing patient engagement and optimizing communication between patients and healthcare providers. This repository contains the source code and documentation for Elixir.

## Features

- Real-time messaging: Seamlessly communicate with healthcare providers within a secure and private environment.
- Appointment management: Schedule, reschedule, cancel, or confirm appointments with ease.
- Automated notifications: Receive timely and relevant updates regarding appointments and healthcare updates.
- Stream call: Enable virtual consultations and face-to-face interactions regardless of geographical locations.
- Patient record management: Securely manage and encrypt medical records, prescriptions, and progress notes.
- Access control: Grant read access to specific healthcare providers, facilitating collaboration and comprehensive medical decision-making.

For comprehensive details about each feature, please refer to the [Elixir.io documentation](https://the-bubble.gitbook.io/elixir.io-documentation/) site, where you'll find in-depth explanations. You can also explore the Swagger documentation directly at the [<base_url>/api](base_url/api).

## Technologies Utilized

- **Nest.js**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Docker**: A tool that allows you to build, package, and distribute your applications as containers, ensuring consistency across different environments.
- **CircleCI**: A continuous integration and delivery platform that automates the build, test, and deployment processes of your application.
- **MongoDB**: A popular NoSQL database that provides a flexible and scalable data storage solution for your application.
- **Socket.io**: A library that enables real-time, bidirectional communication between the client and the server, allowing for instant updates and notifications. [events used: "message", "error"].
- **Redis**: An in-memory data structure store that can be used as a cache or a message broker, enhancing the performance and scalability of your application.
- **Vonage**: A communication platform that provides APIs for sending SMS, making voice and video calls, and handling other communication functionalities in your application.
- **Daily**: A service that offers real-time video and audio communication capabilities through WebRTC, allowing for seamless video conferencing and collaboration.
- **Auth0**: A flexible and secure authentication and authorization platform that simplifies the implementation of user authentication and access control in your application.




## Getting Started

To get started with the Elixir project, please follow these steps:

1. Clone the repository: `git clone https://github.com/Princeigwe/Elixir.io.git`
2. Install the required dependencies: `npm install`
3. Configure the environment variables for your specific setup (e.g., database connection details, API keys).
4. Build and run the application: `npm run build && npm start`

For Docker users, an available Docker image and a Docker Compose file are provided to simplify the setup process. You can use the following commands:

1. Clone the repository: `git clone https://github.com/Princeigwe/Elixir.io.git`
2. Configure the environment variables using a `.env` file or directly in the Docker Compose file.
3. Start the application and necessary services using Docker Compose: `docker-compose up`

By running the Docker Compose command, the Elixir project along with its required services will be started automatically, ensuring a seamless and hassle-free setup.



## Environment Variables

The following environment variables need to be set in the `.env` file:

### JWT Configuration
- JWT_CONSTANT_SECRET

### AWS S3 Configuration
- S3_ADMINISTRATOR_ACCESS_KEY_ID
- S3_ADMINISTRATOR_SECRET_ACCESS_KEY
- S3_BUCKET

### Application Configuration
- NODE_ENV
- ENCRYPTION_KEY

### Elastic Email Configuration
- ELASTIC_EMAIL_USERNAME
- ELASTIC_EMAIL_PASSWORD
- ELASTIC_EMAIL_SERVER_HOST
- ELASTIC_EMAIL_PORT
- ELASTIC_EMAIL_FROM_EMAIL

### Auth0 Configuration
- AUTH0_DOMAIN
- AUTH0_CLIENT_ID
- AUTH0_CLIENT_SECRET

### Redis Configuration
- REDIS_SERVER_URL
- REDIS_HOST
- REDIS_PORT

### Vonage Configuration
- VONAGE_API_KEY
- VONAGE_API_SECRET

### Daily Configuration
- DAILY_API_KEY

### MongoDB Configuration
- MONGO_INITDB_DATABASE
- MONGO_INITDB_ROOT_USERNAME
- MONGO_INITDB_ROOT_PASSWORD

## Demo Video: 
[Demo](https://vimeo.com/835237320?share=copy)

## Medium Article(as promised in the demo):
[Article](https://princeigwe.medium.com/empowering-care-through-technology-unveiling-the-story-behind-my-health-tech-project-b1e6d7be61ea)


*...built with love, from the heart of the Alchemist :atom_symbol:.*
