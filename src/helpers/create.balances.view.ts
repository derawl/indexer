import pgPromise from "pg-promise";
import { PG_CONFIG } from "./helpers";

const pgp = pgPromise();

const db = pgp({
  user: PG_CONFIG.POSTGRES_USER,
  password: PG_CONFIG.POSTGRES_PASSWORD,
  host: PG_CONFIG.POSTGRES_HOST,
  port: PG_CONFIG.POSTGRES_PORT,
  database: PG_CONFIG.POSTGRES_DB,
});

const createOrReplaceTokenViews = `
  CREATE OR REPLACE PROCEDURE create_or_replace_token_views()
  LANGUAGE plpgsql
  AS $$
  DECLARE
      token_name TEXT;
      tokens TEXT[] := ARRAY['DAI', 'USDC', 'USDT', 'WETH', 'SETH', 'WBTC'];
  BEGIN
      FOREACH token_name IN ARRAY tokens
      LOOP
          IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = token_name || '_Transfer') THEN
              EXECUTE format('
              CREATE OR REPLACE VIEW %I AS
              SELECT 
              address,
              SUM(CASE WHEN address_type = ''from'' THEN value ELSE 0 END) AS total_value_sent,
              SUM(CASE WHEN address_type = ''to'' THEN value ELSE 0 END) AS total_received,
              SUM(CASE WHEN address_type = ''to'' THEN value ELSE 0 END) - SUM(CASE WHEN address_type = ''from'' THEN value ELSE 0 END) AS balances
              FROM    
              (
                  SELECT 
                      "from" AS address,
                      value,
                      ''from'' as address_type
                  FROM 
                      public.%I
                  UNION ALL
                  SELECT 
                      "to" AS address, 
                      value,
                      ''to'' as address_type
                  FROM 
                      public.%I
              ) AS combined
              GROUP BY 
              address
              ', token_name || '_balances', token_name || '_Transfer', token_name || '_Transfer');
          END IF;
      END LOOP;
  END;
  $$;
`;

const callProcedure = `
  CALL create_or_replace_token_views();
`;

db.tx(async (t) => {
  await t.none(createOrReplaceTokenViews);
  console.log("Procedure created");
  await t.none(callProcedure);
  console.log("Procedure executed");
})
  .then(() => {
    console.log("Success, create new views");
    pgp.end();
  })
  .catch((error) => {
    console.error("Error:", error);
    pgp.end();
  });
