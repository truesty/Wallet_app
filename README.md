# Personal Wallet Application

A modern, full-stack web application for managing personal finances, tracking expenses, and monitoring budgets.

## 🌟 Live Demo

- Frontend: [https://wallet-truest.netlify.app](https://wallet-truest.netlify.app)
- Backend: [https://wallet-server-13x5.onrender.com](https://wallet-server-13x5.onrender.com)

## ✨ Features

- 📊 **Dashboard**: Visual overview of your financial status
- 💰 **Transaction Management**: Track income and expenses
- 📁 **Category Management**: Organize transactions with categories and subcategories
- 🏦 **Account Management**: Manage multiple accounts (cash, bank, credit cards)
- 📅 **Budget Planning**: Set and monitor spending limits
- 📈 **Financial Reports**: Generate detailed financial reports and analytics
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5 for UI components
- Chart.js for data visualization
- Netlify for hosting

### Backend
- Node.js
- Express.js
- RESTful API architecture
- Render.com for hosting

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm (comes with Node.js)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/truesty/Wallet_app.git
cd wallet_app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create a new transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create a new account

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create a new budget

### Reports
- `GET /api/reports` - Generate financial reports

## 🔒 Environment Variables

The application uses the following environment variables:

```env
PORT=3000
NODE_ENV=development
```

## 📦 Deployment

### Frontend (Netlify)
- Connected to GitHub repository
- Auto-deploys on push to main branch
- Custom domain configuration available

### Backend (Render.com)
- Connected to GitHub repository
- Auto-deploys on push to main branch
- Environment variables configured in Render dashboard

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Truesty** - *Initial work* - [truesty](https://github.com/truesty)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries 