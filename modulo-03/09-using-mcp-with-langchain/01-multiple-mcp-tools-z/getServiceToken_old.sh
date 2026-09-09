# Get admin service token
ADMIN_TOKEN=$(curl -X POST http://localhost:9999/v1/auth/service-token \
  -H "Content-Type: application/json" \
  -d '{"username": "erickwendel", "password": "123123", "adminSuperSecret": "change-me-in-production"}' \
  | jq -r '.serviceToken')

echo "Admin Service Token: $ADMIN_TOKEN"

# Get member service token
MEMBER_TOKEN=$(curl --silent -X POST http://localhost:9999/v1/auth/service-token \
  -H "Content-Type: application/json" \
  -d '{"username": "ananeri", "password": "1234", "adminSuperSecret": "change-me-in-production"}' \
  | jq -r '.serviceToken')

echo "Member Service Token: $MEMBER_TOKEN"

# Test API access with admin token
curl http://localhost:9999/v1/customers \
  -H "Authorization: Bearer $ADMIN_TOKEN"
