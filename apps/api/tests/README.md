# API tests

This directory contains contract and integration tests for the social music group feed API.

Restart durability integration coverage uses a real PostgreSQL connection and is enabled when `DATABASE_URL` is set.
Other tests explicitly use an in-memory adapter for fast local execution.
