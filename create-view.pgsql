CREATE OR REPLACE PROCEDURE create_or_replace_token_views()
LANGUAGE plpgsql
AS $$
DECLARE
    token_name TEXT;
    tokens TEXT[] := ARRAY['DAI', 'USDC', 'USDT'];
BEGIN
    FOREACH token_name IN ARRAY tokens
    LOOP
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
    END LOOP;
END;
$$;

-- To run the procedure
CALL create_or_replace_token_views();
