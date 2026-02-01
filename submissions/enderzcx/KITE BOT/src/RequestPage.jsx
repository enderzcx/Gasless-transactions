import { useState } from 'react';
import { ethers } from 'ethers';
import { GokiteAASDK } from './gokite-aa-sdk';

const productLinks = [
  'https://shop.example.com/product/airfryer-01',
  'https://shop.example.com/product/airfryer-02',
  'https://shop.example.com/product/airfryer-03'
];

function RequestPage({ onOpenTransfer }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const sdk = new GokiteAASDK({
    rpcUrl: import.meta.env.VITE_KITE_RPC_URL || 'https://rpc-testnet.gokite.ai',
    bundlerUrl: import.meta.env.VITE_BUNDLER_URL || 'https://bundler-service.staging.gokite.ai/rpc/',
    entryPointAddress: '0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108',
    proxyAddress: import.meta.env.VITE_AA_WALLET_ADDRESS || '0xca38E92a709a3bA0704Eb16609E6C89a0C9DF21F'
  });

  const privateKey = import.meta.env.VITE_USER_PRIVATE_KEY || '';
  const merchantAddress = import.meta.env.VITE_MERCHANT_ADDRESS || sdk.config.proxyAddress;

  const handleSubmit = async () => {
    if (loading) return;
    if (!query.trim()) {
      setError('请输入你的需求。');
      return;
    }
    if (!privateKey) {
      setError('缺少私钥配置，无法发起转账。');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const provider = new ethers.JsonRpcProvider(sdk.config.rpcUrl);
      const signer = new ethers.Wallet(privateKey, provider);

      const signFunction = async (userOpHash) => {
        return signer.signMessage(ethers.getBytes(userOpHash));
      };

      const transferResult = await sdk.sendUserOperationAndWait({
        target: merchantAddress,
        value: ethers.parseEther('0.05'),
        callData: '0x'
      }, signFunction);

      if (transferResult.status !== 'success') {
        throw new Error(transferResult.reason || '转账失败');
      }

      const randomLink = productLinks[Math.floor(Math.random() * productLinks.length)];

      setResult({
        txHash: transferResult.transactionHash,
        productUrl: randomLink
      });
    } catch (err) {
      setError(err.message || '发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="request-page">
      <div className="top-entry">
        <button className="link-btn" onClick={onOpenTransfer}>
          进入转账页面
        </button>
      </div>

      <div className="request-card">
        <h1>你想要什么？</h1>
        <div className="request-input">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例如：帮我买一个最好评的空气炸锅"
            disabled={loading}
          />
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? '发送中...' : '发送'}
          </button>
        </div>
        {error && <div className="request-error">{error}</div>}
      </div>

      {result && (
        <div className="result-card">
          <h2>已购买最好评的空气炸锅</h2>
          <div className="result-row">
            <span className="label">详情：</span>
            <span className="value">{result.productUrl}</span>
          </div>
          <div className="result-row">
            <span className="label">价格：</span>
            <span className="value">0.05kite</span>
          </div>
          <div className="result-row">
            <span className="label">物流编号：</span>
            <span className="value">88886666687</span>
          </div>
          <div className="result-row">
            <span className="label">链上交易哈希：</span>
            <span className="value hash">{result.txHash}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestPage;


