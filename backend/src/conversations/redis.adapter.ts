import { IoAdapter } from "@nestjs/platform-socket.io";
import {createAdapter} from "@socket.io/redis-adapter"
import {createClient} from 'redis';

/* The RedisIoAdapter class creates an IO server that uses Redis as its adapter for handling real-time
communication. */
export class RedisIoAdapter extends IoAdapter {
    createIOServer(port: number, options?: any) {
        const server = super.createIOServer(port, { maxHttpBufferSize: 1e8, });

        //** this is a redis client that connects to the local redis server(redis://<redis-docker-container-name>:6379). the url will have to be a remote redis server on production. reference to "https://www.npmjs.com/package/redis"
        const pubClient = createClient({url: process.env.REDIS_SERVER_URL})

        const subClient = pubClient.duplicate()

        const adapter = createAdapter(pubClient, subClient)
        server.adapter(adapter)

        return server
    }
}