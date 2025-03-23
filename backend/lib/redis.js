import Redis from "ioredis"
import dotenv from "dotenv"
dotenv.config()

//  export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
// await client.set('foo', 'bar');

// import Redis from "ioredis"

 export const redis = new Redis("rediss://default:AUEeAAIjcDEyZWY3MjJjMTc3MjY0ZTM2OGNjMDE4NjJmNGUxNDg5ZXAxMA@hardy-crayfish-16670.upstash.io:6379");
// await client.set('foo', 'bar');