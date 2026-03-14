#!/bin/bash

SUPABASE_URL="https://app-supabase.intelligenc-ia.tech"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRza2loZ2J4c3hrd3ZmbW9pZmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTIxNzU5MiwiZXhwIjoyMDg0NzkzNTkyfQ.9h_pd2esgv6onHvbIpPtORS6HQPycnCO3NNRVSayA1A"

# Aplicar campo cost
echo "Aplicando campo cost..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/query" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"query":"ALTER TABLE products ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2) DEFAULT 0"}' 2>&1

echo -e "\n\nAplicando campo commission_base..."
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/query" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"query":"ALTER TABLE products ADD COLUMN IF NOT EXISTS commission_base TEXT"}' 2>&1

echo -e "\n\nVerificando campos..."
curl -X GET "${SUPABASE_URL}/rest/v1/products?select=cost,commission_base&limit=1" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" 2>&1
