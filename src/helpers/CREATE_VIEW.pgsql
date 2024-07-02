CREATE VIEW USDT_Balances AS
SELECT 
  address,
  SUM(CASE WHEN address_type = 'from' THEN value ELSE 0 END) AS total_value_sent,
  SUM(CASE WHEN address_type = 'to' THEN value ELSE 0 END) AS total_received,
  SUM(CASE WHEN address_type = 'to' THEN value ELSE 0 END) - SUM(CASE WHEN address_type = 'from' THEN value ELSE 0 END) AS balances
FROM    
  (
      SELECT 
          "from" AS address,
          value,
          'from' as address_type  -- Mark rows from the "from" column
      FROM 
          public."USDT_Transfer"
      UNION ALL
      SELECT 
          "to" AS address, 
          value,
          'to' as address_type    -- Mark rows from the "to" column
      FROM 
          public."USDT_Transfer"
  ) AS combined
GROUP BY 
  address;

-- make a view for usdc balances
CREATE VIEW USDC_Balances AS
SELECT 
  address,
  SUM(CASE WHEN address_type = 'from' THEN value ELSE 0 END) AS total_value_sent,
  SUM(CASE WHEN address_type = 'to' THEN value ELSE 0 END) AS total_received,
  SUM(CASE WHEN address_type = 'to' THEN value ELSE 0 END) - SUM(CASE WHEN address_type = 'from' THEN value ELSE 0 END) AS balances
FROM    
  (
      SELECT 
          "from" AS address,
          value,
          'from' as address_type  -- Mark rows from the "from" column
      FROM 
          public."USDC_Transfer"
      UNION ALL
      SELECT 
          "to" AS address, 
          value,
          'to' as address_type    -- Mark rows from the "to" column
      FROM 
          public."USDC_Transfer"
  ) AS combined
GROUP BY 
  address;

-- create dai balances view
CREATE VIEW DAI_Balances AS
SELECT 
  address,
  SUM(CASE WHEN address_type = 'from' THEN value ELSE 0 END) AS total_value_sent,
  SUM(CASE WHEN address_type = 'to' THEN value ELSE 0 END) AS total_received,
  SUM(CASE WHEN address_type = 'to' THEN value ELSE 0 END) - SUM(CASE WHEN address_type = 'from' THEN value ELSE 0 END) AS balances
FROM    
  (
      SELECT 
          "from" AS address,
          value,
          'from' as address_type  -- Mark rows from the "from" column
      FROM 
          public."DAI_Transfer"
      UNION ALL
      SELECT 
          "to" AS address, 
          value,
          'to' as address_type    -- Mark rows from the "to" column
      FROM 
          public."DAI_Transfer"
  ) AS combined
GROUP BY 
  address;