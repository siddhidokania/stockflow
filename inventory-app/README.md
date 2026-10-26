# 📦 StockFlow — Inventory & Order Management System

A production-ready full-stack application for managing products, customers, and orders with real-time inventory tracking.

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  FastAPI Backend │────▶│   PostgreSQL DB │
│  (Nginx:80)     │     │  (Uvicorn:8000)  │     │  (Postgres:5432)│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## ✅ Features

- **Product Management**: CRUD with SKU uniqueness, price, stock tracking
- **Customer Management**: CRUD with unique email validation
- **Order Management**: Multi-item orders with automatic stock deduction
- **Business Rules**: Insufficient stock prevention, auto total calculation
- **Dashboard**: Live stats — total products, customers, orders, revenue, low-stock alerts
- **Fully Dockerized**: Backend + Frontend + PostgreSQL in one `docker-compose up`

---

## 🚀 Quick Start (Local with Docker)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/siddhidokania/stockflow.git
cd stockflow/inventory-app
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set a secure POSTGRES_PASSWORD
```

### 3. Start all services
```bash
docker compose up --build
```

### 4. Access the app
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

---

## 🛠️ Local Development (Without Docker)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

# Run
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:8000" > .env
npm start
```

---

## 🌐 Deployment Guide

### Backend → Render.com (Free Tier)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo → select the `backend` folder
4. Configure:
   - **Name**: `stockflow-api`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Port**: `8000`
5. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (use Render's free PostgreSQL)
   - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
6. Click **Create Web Service**

#### Get a free PostgreSQL on Render:
- **New** → **PostgreSQL** → free tier
- Copy the **External Database URL** → use as `DATABASE_URL`

---

### Frontend → Vercel (Free Tier)

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL`: `https://your-backend.onrender.com`
5. Click **Deploy**

---

### Alternative Backend Deployment: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

Set environment variables in Railway dashboard:
- `DATABASE_URL` (Railway provides free PostgreSQL)
- `ALLOWED_ORIGINS`

---

### Docker Hub (Push Backend Image)

```bash
# Build
docker build -t YOUR_DOCKERHUB_USERNAME/stockflow-backend:latest ./backend

# Login
docker login

# Push
docker push YOUR_DOCKERHUB_USERNAME/stockflow-backend:latest
```

---

## 📋 API Reference

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/` | List all products |
| POST | `/products/` | Create product |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/` | List all customers |
| POST | `/customers/` | Create customer |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/` | List all orders |
| POST | `/orders/` | Create order |
| GET | `/orders/{id}` | Get order by ID |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/` | Get summary stats |

---

## 🧪 Testing the API

With Swagger UI at `http://localhost:8000/docs`:

```bash
# 1. Create a product
curl -X POST http://localhost:8000/products/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Mouse","sku":"WM-001","price":29.99,"quantity":50}'

# 2. Create a customer
curl -X POST http://localhost:8000/customers/ \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","phone":"+1234567890"}'

# 3. Create an order
curl -X POST http://localhost:8000/orders/ \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"items":[{"product_id":1,"quantity":2}]}'
```

---

## 📁 Project Structure

```
stockflow/
├── backend/
│   ├── main.py              # FastAPI app + CORS + startup
│   ├── database.py          # SQLAlchemy engine + session
│   ├── models.py            # Product, Customer, Order, OrderItem
│   ├── schemas.py           # Pydantic request/response models
│   ├── routers/
│   │   ├── products.py      # Product CRUD endpoints
│   │   ├── customers.py     # Customer CRUD endpoints
│   │   ├── orders.py        # Order management + stock logic
│   │   └── dashboard.py     # Stats aggregation
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/
│   ├── src/
│   │   ├── App.js           # Router + layout
│   │   ├── index.css        # Full design system
│   │   ├── utils/api.js     # Axios API client
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   ├── Modal.js
│   │   │   └── ConfirmDialog.js
│   │   └── pages/
│   │       ├── Dashboard.js
│   │       ├── Products.js
│   │       ├── Customers.js
│   │       └── Orders.js
│   ├── public/index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔒 Business Rules Implemented

| Rule | Implementation |
|------|----------------|
| Unique SKU | DB unique constraint + API 400 error |
| Unique customer email | DB unique constraint + API 400 error |
| No negative stock | Pydantic validator + DB constraint |
| Insufficient stock check | Pre-order validation with row locking |
| Auto stock deduction | Atomic transaction on order creation |
| Auto total calculation | Backend computes sum of (price × qty) |
| Stock restore on cancel | Order DELETE restores each item's quantity |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Axios, react-hot-toast |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2, Pydantic v2 |
| Database | PostgreSQL 16 |
| Container | Docker, Docker Compose |
| Serving | Nginx (frontend), Uvicorn (backend) |
| Deployment | Vercel (frontend), Render/Railway (backend) |
