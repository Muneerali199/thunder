# Thunder Backend API — Quick Guide

This is a readable guide to the API. For the full machine-readable spec, see [`openapi.yaml`](./openapi.yaml).

> **Base URL**
>
> - Local: `http://localhost:3000/api/v1` (adjust port if different)
> - Prod: `https://api.thunder.example.com/api/v1` (replace with real host)

> **Auth**: Bearer JWT in the `Authorization` header:  
> `Authorization: Bearer <TOKEN>`

---

## Health

**GET** `/health`

```bash
curl -s http://localhost:3000/api/v1/health