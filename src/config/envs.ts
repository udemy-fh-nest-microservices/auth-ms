import * as j from 'joi';
import 'dotenv/config';

interface EnvironmentVariables {
  PORT: number;
  NATS_SERVERS: string[];
}

const envSchema = j
  .object({
    PORT: j.number().required(),
    NATS_SERVERS: j.array().items(j.string().required()).required(),
  })
  .unknown();

const { error, value: variables } = envSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const envs = {
  ...(variables as EnvironmentVariables),
};
