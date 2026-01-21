# n8n-nodes-aave

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for the **Aave Protocol**, the leading decentralized lending and borrowing platform. Automate DeFi operations across 12+ blockchain networks with support for Aave V2 and V3.

![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Aave](https://img.shields.io/badge/Aave-V2%20%26%20V3-purple)

## Features

- **Multi-Chain Support**: 12+ blockchain networks including Ethereum, Polygon, Arbitrum, Optimism, Base, and more
- **Aave V2 & V3**: Full support for both protocol versions
- **22 Resource Types**: Comprehensive coverage of all Aave operations
- **Real-Time Triggers**: Monitor blockchain events for Supply, Borrow, Liquidation, and more
- **DeFi Calculations**: Built-in utilities for health factor, APY, and unit conversions
- **Flash Loans**: Calculate fees and premiums for flash loan operations
- **GHO Stablecoin**: Native support for Aave's decentralized stablecoin
- **Governance**: Vote on Aave DAO proposals
- **Safety Module**: Stake AAVE and manage stkAAVE rewards

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** → **Community Nodes**
3. Search for `n8n-nodes-aave`
4. Click **Install**

### Manual Installation

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-aave
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-aave.zip
cd n8n-nodes-aave

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-aave

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-aave %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### Aave Network Credentials

| Field | Description | Required |
|-------|-------------|----------|
| **Network** | Blockchain network (ethereum, polygon, etc.) | Yes |
| **Aave Version** | Protocol version (v2 or v3) | Yes |
| **RPC URL** | Your RPC endpoint (Infura, Alchemy, etc.) | Yes |
| **Private Key** | Wallet private key for write operations | No* |
| **Chain ID** | Auto-populated based on network | Auto |

*Required only for write operations (supply, borrow, repay, etc.)

> ⚠️ **Security**: Never share your private key. Use a dedicated wallet for automation.

## Resources & Operations

| Resource | Description | Operations |
|----------|-------------|------------|
| **Account** | User position data | Get health factor, collateral, debt, LTV |
| **Supply** | Deposit operations | Supply, withdraw, set as collateral |
| **Borrow** | Loan operations | Borrow, repay, swap rate mode |
| **Flash Loan** | Single-block loans | Get premium, calculate fees |
| **Liquidation** | Position liquidation | Monitor at-risk positions, execute |
| **Reserve** | Market data | Interest rates, caps, configuration |
| **Interest Rate** | APY calculations | Variable, stable, liquidity rates |
| **aToken** | Supply token ops | Balance, total supply, scaled balance |
| **Variable Debt Token** | Variable debt | Balance, scaled balance |
| **Stable Debt Token** | Stable debt | Balance, average rate |
| **E-Mode** | Efficiency mode | Set/get category, LTV boost |
| **Isolation Mode** | Risk containment | Status, debt ceiling |
| **GHO** | Native stablecoin | Borrow/repay GHO (Ethereum) |
| **Safety Module** | Staking stkAAVE | Stake, cooldown, claim rewards |
| **Governance** | DAO voting | Proposals, voting power, vote |
| **Rewards** | Incentives | Claim rewards, distribution info |
| **Price Oracle** | Asset prices | USD prices, batch queries |
| **Pool** | Pool config | Reserves list, flash loan premium |
| **Portal** | Cross-chain | Bridge protocol fee (V3 only) |
| **Credit Delegation** | Delegate borrowing | Approve, revoke, borrow with delegation |
| **Permit** | Gasless approvals | EIP-2612 support check |
| **Utility** | Helper functions | Unit conversions, health factor calc |

## Trigger Node

The **Aave Trigger** node monitors blockchain events in real-time:

| Event Type | Description |
|------------|-------------|
| Supply | Deposits to the protocol |
| Withdraw | Withdrawals from the protocol |
| Borrow | New loans taken |
| Repay | Loan repayments |
| Liquidation | Position liquidations |
| Flash Loan | Flash loan executions |

Configure polling intervals and address filters for targeted monitoring.

## Usage Examples

### Get User Health Factor

```javascript
// Node: Aave
// Resource: Account
// Operation: Get User Account Data
// User Address: 0x...

// Returns:
{
  "healthFactor": "1.85",
  "totalCollateralUSD": "10000",
  "totalDebtUSD": "5000",
  "availableBorrowsUSD": "2500"
}
```

### Calculate Flash Loan Fee

```javascript
// Node: Aave
// Resource: Flash Loan
// Operation: Calculate Flash Loan Fee
// Amount: 1000000000000000000000 (1000 tokens)

// Returns:
{
  "amount": "1000000000000000000000",
  "fee": "500000000000000000",
  "totalRequired": "1000500000000000000000"
}
```

### Monitor Health Factor Changes

```javascript
// Node: Aave Trigger
// Event: Supply or Withdraw
// Address Filter: Your wallet address
// Polling Interval: 1 minute
```

## Aave Protocol Concepts

### Health Factor
Ratio of collateral value to debt value. A health factor below 1.0 means the position can be liquidated.

```
Health Factor = (Total Collateral × Liquidation Threshold) / Total Debt
```

### LTV (Loan-to-Value)
Maximum borrowing power per unit of collateral. Each asset has a different LTV.

### Liquidation Threshold
The point at which a position becomes liquidatable. Higher than LTV to provide a buffer.

### Ray
Aave's precision format using 27 decimals (10^27). Used for interest rates.

### E-Mode (Efficiency Mode)
Allows higher LTV when borrowing correlated assets (e.g., stablecoins or ETH derivatives).

## Networks

| Network | Chain ID | V2 | V3 |
|---------|----------|----|----|
| Ethereum | 1 | ✅ | ✅ |
| Polygon | 137 | ✅ | ✅ |
| Avalanche | 43114 | ✅ | ✅ |
| Arbitrum | 42161 | ❌ | ✅ |
| Optimism | 10 | ❌ | ✅ |
| Base | 8453 | ❌ | ✅ |
| Fantom | 250 | ❌ | ✅ |
| Metis | 1088 | ❌ | ✅ |
| BNB Chain | 56 | ❌ | ✅ |
| Gnosis | 100 | ❌ | ✅ |
| Scroll | 534352 | ❌ | ✅ |
| zkSync Era | 324 | ❌ | ✅ |

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Network not supported" | Invalid network for Aave version | V2 only supports Ethereum, Polygon, Avalanche |
| "Insufficient funds" | Not enough balance | Check wallet balance and gas fees |
| "Health factor too low" | Position at risk | Supply more collateral or repay debt |
| "Private key required" | Missing credentials | Add private key for write operations |

## Security Best Practices

1. **Use dedicated wallets** for automation
2. **Never expose private keys** in workflows
3. **Set spending limits** on your automation wallet
4. **Monitor health factors** with trigger nodes
5. **Test on testnets** before production use

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Development mode (watch)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Aave Protocol Docs](https://docs.aave.com)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-aave/issues)
- **Licensing**: [licensing@velobpa.com](mailto:licensing@velobpa.com)

## Acknowledgments

- [Aave Protocol](https://aave.com) for the pioneering DeFi lending platform
- [n8n](https://n8n.io) for the workflow automation framework
- The Aave community for documentation and support
