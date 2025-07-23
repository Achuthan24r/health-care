# Health Track App - Deployment Guide

## Quick Deploy Options

### 1. Railway (Recommended - Free Tier Available)
1. Visit [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production
4. Deploy automatically

### 2. Render (Free Tier Available)
1. Visit [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables (same as above)

### 3. Vercel (Serverless)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

### 4. Heroku
1. Install Heroku CLI
2. Run:
   ```bash
   heroku create your-app-name
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set NODE_ENV=production
   git push heroku main
   ```

### 5. Docker Deployment
```bash
# Build image
docker build -t health-track .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=your_mongodb_uri \
  -e JWT_SECRET=your_jwt_secret \
  -e NODE_ENV=production \
  health-track
```

## Environment Variables Required

- `MONGODB_URI`: MongoDB connection string (get from MongoDB Atlas)
- `JWT_SECRET`: Random secure string for JWT tokens
- `NODE_ENV`: Set to "production"
- `PORT`: Will be set automatically by most platforms

## MongoDB Setup (Required)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Get connection string
5. Replace `<password>` with your user password
6. Use this as your `MONGODB_URI`

## Testing Your Deployment

Once deployed, test these endpoints:
- `GET /health` - Should return server status
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
# Start development server
npm run dev
```

Your app will be available at the provided URL after deployment!