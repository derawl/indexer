//@ts-ignore
import fetch from "node-fetch";
//@ts-ignore
import pg from "pg";
import { glob } from "glob";
import fs from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import util from "util";
import path from "path";
import { PG_CONFIG } from "./helpers";
import { HASURA_ADMIN_SECRET, HASURA_ENDPOINT } from "./helpers";
import { table } from "console";

const { Client } = pg;
const globP = promisify(glob);

const client = new Client({
  user: PG_CONFIG.POSTGRES_USER,
  host: PG_CONFIG.POSTGRES_HOST,
  database: PG_CONFIG.POSTGRES_DB,
  password: PG_CONFIG.POSTGRES_PASSWORD,
  port: PG_CONFIG.POSTGRES_PORT,
});

const headers = {
  "Content-Type": "application/json",
  "X-Hasura-Admin-Secret": HASURA_ADMIN_SECRET,
};

async function trackUntrackedItems() {
  try {
    await client.connect();
    await trackTablesAndViews();
    console.log("Tracking completed");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

async function trackTablesAndViews() {
  try {
    const res = await client.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       AND (table_type = 'BASE TABLE' OR table_type = 'VIEW');`
    );
    const tablesAndViews = res.rows.map((row: any) => row.table_name);

    for (const item of tablesAndViews) {
      try {
        const trackQuery = {
          type: "pg_track_table",
          args: {
            source: "default",
            table: {
              schema: "public",
              name: item,
            },
          },
        };

        const response = await fetch(HASURA_ENDPOINT, {
          method: "POST",
          headers,
          body: JSON.stringify(trackQuery),
        });

        if (response.ok) {
          console.log(`Tracked successfully: ${item}`);
        } else {
          const errorData = await response.json();
          if (errorData.code === "already-tracked") continue;
          console.error(`Error tracking ${item}:`, errorData);
        }
      } catch (err) {
        // console.error("Error:", err);
      }
    }
  } catch (err) {}
}

async function trackFunctions() {
  const functionRes = await client.query(
    `SELECT p.proname
     FROM pg_catalog.pg_namespace n
     JOIN pg_catalog.pg_proc p ON p.pronamespace = n.oid
     WHERE n.nspname = 'public'
       AND p.proretset
       AND NOT p.proname LIKE '%pgp_%';`
  );

  const functions = functionRes.rows.map((row: any) => row.proname);

  const alreadyTracked: any[] = [];

  for (const fn of functions) {
    if (alreadyTracked.includes(fn)) continue;

    const trackFunctionQuery = {
      type: "track_function",
      args: {
        schema: "public",
        name: fn,
      },
    };

    const response = await fetch(HASURA_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(trackFunctionQuery),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`Function tracked successfully: ${fn}`);
      alreadyTracked.push(fn);
    }
  }
}

console.log("Tracking tables and functions...");
const main = async () => {
  await trackUntrackedItems();
};

main();
