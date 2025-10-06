# 🔐 Binance Smart Mail - Encrypted Messaging on BSC

A secure, end-to-end encrypted messaging application built on Binance Smart Chain (BSC). Send private messages using your BSC wallet address - no registration required!

## ✨ Features

- 🔗 Connect with MetaMask, Trust Wallet, and other BSC-compatible wallets
- 🔐 Web3 authentication with wallet signatures
- 🔒 End-to-end encryption using tweetnacl
- 📨 Send and receive encrypted messages
- 💾 Secure database storage
- 🎨 Modern, responsive UI
- ⚡ Fast transactions on Binance Smart Chain
- 💰 Low gas fees

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A BSC-compatible wallet (MetaMask, Trust Wallet, etc.)
- SQLite or PostgreSQL

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/binance-smart-mail.git
cd binance-smart-mail
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# WalletConnect Project ID (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id_here"

# Network (use "mainnet" for production)
NEXT_PUBLIC_NETWORK="testnet"
```

4. Initialize the database:
```bash
npm run db:generate
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application!

## 📱 Usage

### Connecting Your Wallet

1. Click "Start Messaging" to open the wallet connection modal
2. Select your preferred wallet (MetaMask, Trust Wallet, etc.)
3. Approve the connection in your wallet
4. Sign the authentication message

### Sending Messages

1. Click "Compose" in the sidebar
2. Enter the recipient's BSC wallet address (0x...)
3. Type your message
4. Click "Send Message"

Your message will be encrypted locally before being sent!

### Receiving Messages

1. Messages appear in your "Inbox"
2. Click "Decrypt" to read a message
3. Reply directly from the message view

## 🔧 Technology Stack

### Frontend

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **Wagmi** for wallet integration
- **Web3Modal** for wallet connections
- **Viem** for Ethereum interactions

### Backend

- **Next.js API Routes** for REST endpoints
- **Prisma ORM** for database access
- **SQLite/PostgreSQL** for data storage

### Encryption

- **tweetnacl** for NaCl encryption
- **Deterministic key derivation** from wallet addresses
- **Symmetric encryption** for messages

### Blockchain

- **Binance Smart Chain** (BSC)
- **MetaMask** and other Web3 wallets
- **Ethereum-compatible** addresses

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/route.ts          # Authentication API
│   │   └── messages/route.ts      # Messages API
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page
├── components/
│   ├── MessageList.tsx           # Inbox component
│   ├── SendMessage.tsx           # Compose component
│   ├── WalletButton.tsx          # Wallet connection
│   └── ContactBook.tsx           # Contacts management
├── contexts/
│   └── WalletContext.tsx         # Wallet state management
├── lib/
│   ├── encryption.ts             # Encryption utilities
│   ├── bsc-auth.ts              # BSC authentication
│   └── prisma.ts                # Database client
└── prisma/
    └── schema.prisma             # Database schema
```

## 🔒 Security

- **End-to-end encryption**: Only sender and recipient can read messages
- **Wallet-based authentication**: No passwords to steal
- **Deterministic encryption**: Consistent keys from wallet addresses
- **Address validation**: Ensures valid BSC addresses
- **Client-side encryption**: Messages encrypted before leaving your device

## 🌐 Deployment

### Environment Variables for Production

```env
DATABASE_URL="your_production_database_url"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"
NEXT_PUBLIC_NETWORK="mainnet"
```

### Deploy on Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy!

### Deploy on Other Platforms

The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## 💎 $BSM Token

Binance Smart Mail has its own utility token - $BSM!

**Token Address**: `0x0000000000000000000000000000000000000000` (Coming Soon)

### Use Cases

- Premium features access
- Enhanced message storage
- Priority support
- Community governance

## 🛣️ Roadmap

- [x] Basic messaging functionality
- [x] Wallet integration
- [x] End-to-end encryption
- [x] Contacts management
- [ ] Browser extension
- [ ] Mobile app
- [ ] Group messaging
- [ ] File attachments
- [ ] Message reactions
- [ ] Read receipts

## 🐛 Troubleshooting

### Common Issues

1. **"Wallet not found"**: Install MetaMask or another BSC-compatible wallet
2. **"Invalid address"**: Ensure you're using a valid BSC address (starts with 0x)
3. **"Network error"**: Check that you're connected to BSC network
4. **"Database error"**: Run `npm run db:generate` and `npm run db:migrate`

### Debug Mode

Enable detailed logs:
```bash
DEBUG=* npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Website**: https://binancesmartmail.com
- **Twitter**: [@BinanceSmartMail](https://twitter.com/BinanceSmartMail)
- **BSC Scan**: [View Contract](https://bscscan.com)
- **Documentation**: Coming Soon

## 💬 Community

Join our community to stay updated:

- Twitter: [@BinanceSmartMail](https://twitter.com/BinanceSmartMail)
- Telegram: Coming Soon
- Discord: Coming Soon

## 📞 Support

Need help? Open an issue on GitHub or reach out on Twitter!

---

Built with ❤️ for the BSC community
