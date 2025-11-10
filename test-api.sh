#!/bin/bash

echo "Waiting for server to start..."
sleep 8

echo "Testing User Registration..."
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Johnson","username":"alicejohn","email":"alice@example.com","password":"SecurePass123"}' \
  | jq '.'

echo -e "\n\nTesting Get All Users..."
curl -X GET http://localhost:5000/api/v1/users | jq '.'

echo -e "\n\nTesting Get All Posts..."
curl -X GET http://localhost:5000/api/v1/posts | jq '.'

echo -e "\n\nAll tests complete!"
