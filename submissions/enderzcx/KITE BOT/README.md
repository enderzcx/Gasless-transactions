# KITE BOT

KITE BOT 是一个演示 Agent 无感支付的前端 Demo。

## 本地运行

```bash
npm install
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env`，填写配置：

```
VITE_KITE_RPC_URL=https://rpc-testnet.gokite.ai
VITE_BUNDLER_URL=https://bundler-service.staging.gokite.ai/rpc/
VITE_USER_PRIVATE_KEY=你的私钥
VITE_AA_WALLET_ADDRESS=你的 AA 钱包地址
# 可选：收款地址（默认回退为 AA 钱包）
VITE_MERCHANT_ADDRESS=收款地址
```

## 说明

- 登录后输入需求，系统会模拟购买并发起一次链上转账。
- 转账哈希会显示在结果卡片中。

