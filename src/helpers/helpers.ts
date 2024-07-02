const port = parseInt(process.env.POSTGRES_PORT_SELECTED!);
export const PG_CONFIG = {
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ?? "testing",
  POSTGRES_USER: process.env.POSTGRES_USER ?? "postgres",
  POSTGRES_DB: process.env.POSTGRES_DB ?? "envio-dev",
  POSTGRES_HOST: process.env.POSTGRES_HOST ?? "localhost",
  POSTGRES_PORT: Number.isNaN(port) ? 5433 : port,
};

export const HASURA_ENDPOINT =
  process.env.HASURA_METADATA_ENDPOINT ?? `http://localhost:8080/v1/metadata`;
export const HASURA_ADMIN_SECRET =
  process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? "testing";
