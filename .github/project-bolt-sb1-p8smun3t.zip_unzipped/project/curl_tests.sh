#!/usr/bin/env bash
BASE=http://localhost:8001/api

echo "Health:"
curl -s $BASE/health | jq '.'

echo "Register test user:"
curl -s -X POST $BASE/auth/register -H "Content-Type: application/json" -d '{"email":"tester@example.com","password":"testpass"}' | jq '.'

echo "Login as tester:"
TOKEN=$(curl -s -X POST $BASE/auth/login -H "Content-Type: application/json" -d '{"email":"tester@example.com","password":"testpass"}' | jq -r '.access_token')
echo "Token: $TOKEN"

echo "Get me:"
curl -s -H "Authorization: Bearer $TOKEN" $BASE/auth/me | jq '.'

echo "Create project:"
curl -s -X POST $BASE/projects -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"name":"My Test Project","description":"Created by curl_tests.sh"}' | jq '.'

echo "List projects:"
curl -s -H "Authorization: Bearer $TOKEN" $BASE/projects | jq '.'
